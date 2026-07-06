import express from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { Database } from './server/db';
import { authenticateToken, isAdmin, generateToken, AuthenticatedRequest } from './server/auth';
import { Show, Booking, Review, Coupon, Movie, Theatre } from './src/types';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = Database.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = Database.insert('users', {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      isVerified: true, // Auto-verify for easy preview
      favourites: [],
      createdAt: new Date().toISOString()
    });

    const { password: _, ...safeUser } = newUser;
    const token = generateToken(safeUser);

    res.status(210).json({
      message: 'User registered successfully',
      user: safeUser,
      token
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = Database.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const { password: _, ...safeUser } = user;
    const token = generateToken(safeUser);

    res.json({
      message: 'Login successful',
      user: safeUser,
      token
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.get('/api/auth/profile', authenticateToken as any, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

app.put('/api/auth/profile', authenticateToken as any, (req: AuthenticatedRequest, res) => {
  try {
    const { name, email, profilePic } = req.body;
    const userId = req.user!.id;

    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();
    if (profilePic) updates.profilePic = profilePic;

    const updatedUser = Database.update('users', userId, updates);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, ...safeUser } = updatedUser;
    res.json({ message: 'Profile updated successfully', user: safeUser });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

app.put('/api/auth/password', authenticateToken as any, (req: AuthenticatedRequest, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new passwords are required' });
    }

    const user = Database.findOne('users', u => u.id === userId);
    if (!user || !user.password) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = bcrypt.compareSync(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    Database.update('users', userId, { password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
});

// Favourites Toggle
app.post('/api/auth/favourites', authenticateToken as any, (req: AuthenticatedRequest, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.user!.id;

    const user = Database.findOne('users', u => u.id === userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let favs = [...(user.favourites || [])];
    if (favs.includes(movieId)) {
      favs = favs.filter(id => id !== movieId);
    } else {
      favs.push(movieId);
    }

    const updated = Database.update('users', userId, { favourites: favs });
    res.json({ favourites: updated?.favourites || [] });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to toggle favourite', error: error.message });
  }
});


// ==========================================
// 2. MOVIE ENDPOINTS
// ==========================================

app.get('/api/movies', (req, res) => {
  try {
    const { genre, search, comingSoon } = req.query;
    let movies = Database.getCollection('movies');

    if (comingSoon === 'true') {
      movies = movies.filter(m => m.isComingSoon);
    } else if (comingSoon === 'false') {
      movies = movies.filter(m => !m.isComingSoon);
    }

    if (genre) {
      movies = movies.filter(m => m.genre.some(g => g.toLowerCase() === (genre as string).toLowerCase()));
    }

    if (search) {
      const q = (search as string).toLowerCase();
      movies = movies.filter(m => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.director.toLowerCase().includes(q));
    }

    res.json(movies);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve movies' });
  }
});

app.get('/api/movies/:id', (req, res) => {
  const movie = Database.findOne('movies', m => m.id === req.params.id);
  if (!movie) return res.status(404).json({ message: 'Movie not found' });
  res.json(movie);
});

// Admin Add Movie
app.post('/api/movies', authenticateToken as any, isAdmin as any, (req, res) => {
  try {
    const movieData: Omit<Movie, 'id'> = req.body;
    if (!movieData.title || !movieData.description || !movieData.poster) {
      return res.status(400).json({ message: 'Title, description and poster are required' });
    }

    const newMovie = Database.insert('movies', {
      ...movieData,
      rating: movieData.rating || 4.5,
      ratingsCount: movieData.ratingsCount || 10
    });

    res.status(201).json(newMovie);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to add movie', error: error.message });
  }
});

// Admin Update Movie
app.put('/api/movies/:id', authenticateToken as any, isAdmin as any, (req, res) => {
  try {
    const updated = Database.update('movies', req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Movie not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update movie' });
  }
});

// Admin Delete Movie
app.delete('/api/movies/:id', authenticateToken as any, isAdmin as any, (req, res) => {
  const deleted = Database.delete('movies', req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Movie not found' });
  res.json({ message: 'Movie deleted successfully' });
});


// ==========================================
// 3. THEATRE ENDPOINTS
// ==========================================

app.get('/api/theatres', (req, res) => {
  try {
    const { city } = req.query;
    let theatres = Database.getCollection('theatres');
    if (city) {
      theatres = theatres.filter(t => t.city.toLowerCase() === (city as string).toLowerCase());
    }
    res.json(theatres);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve theatres' });
  }
});

app.post('/api/theatres', authenticateToken as any, isAdmin as any, (req, res) => {
  try {
    const theatreData: Omit<Theatre, 'id'> = req.body;
    if (!theatreData.name || !theatreData.city) {
      return res.status(400).json({ message: 'Name and city are required' });
    }
    const newTheatre = Database.insert('theatres', theatreData);
    res.status(201).json(newTheatre);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to add theatre' });
  }
});

app.put('/api/theatres/:id', authenticateToken as any, isAdmin as any, (req, res) => {
  try {
    const updated = Database.update('theatres', req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Theatre not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update theatre' });
  }
});

app.delete('/api/theatres/:id', authenticateToken as any, isAdmin as any, (req, res) => {
  const deleted = Database.delete('theatres', req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Theatre not found' });
  res.json({ message: 'Theatre deleted successfully' });
});


// ==========================================
// 4. SHOW ENDPOINTS
// ==========================================

app.get('/api/shows', (req, res) => {
  try {
    const { movieId, date, theatreId } = req.query;
    let shows = Database.getCollection('shows');

    if (movieId) {
      shows = shows.filter(s => s.movieId === movieId);
    }
    if (date) {
      shows = shows.filter(s => s.date === date);
    }
    if (theatreId) {
      shows = shows.filter(s => s.theatreId === theatreId);
    }

    res.json(shows);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve shows' });
  }
});

app.get('/api/shows/:id', (req, res) => {
  const show = Database.findOne('shows', s => s.id === req.params.id);
  if (!show) return res.status(404).json({ message: 'Show not found' });

  // Enrich show with movie and theatre details
  const movie = Database.findOne('movies', m => m.id === show.movieId);
  const theatre = Database.findOne('theatres', t => t.id === show.theatreId);
  const screen = theatre?.screens.find(s => s.id === show.screenId);

  res.json({
    ...show,
    movie,
    theatre,
    screen
  });
});

app.post('/api/shows', authenticateToken as any, isAdmin as any, (req, res) => {
  try {
    const showData: Omit<Show, 'id'> = req.body;
    if (!showData.movieId || !showData.theatreId || !showData.screenId || !showData.date || !showData.time) {
      return res.status(400).json({ message: 'Missing show details' });
    }

    const theatre = Database.findOne('theatres', t => t.id === showData.theatreId);
    const screen = theatre?.screens.find(s => s.id === showData.screenId);
    if (!screen) {
      return res.status(400).json({ message: 'Invalid screen select' });
    }

    const newShow = Database.insert('shows', {
      ...showData,
      bookedSeats: [],
      totalSeats: screen.rows * screen.cols
    });

    res.status(201).json(newShow);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create show' });
  }
});

app.delete('/api/shows/:id', authenticateToken as any, isAdmin as any, (req, res) => {
  const deleted = Database.delete('shows', req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Show not found' });
  res.json({ message: 'Show deleted successfully' });
});


// ==========================================
// 5. BOOKING & PAYMENT ENDPOINTS
// ==========================================

app.post('/api/bookings', authenticateToken as any, (req: AuthenticatedRequest, res) => {
  try {
    const { showId, seats, totalAmount, discountAmount, couponCode } = req.body;
    const userId = req.user!.id;

    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: 'Invalid show or seats selected' });
    }

    const show = Database.findOne('shows', s => s.id === showId);
    if (!show) return res.status(404).json({ message: 'Show not found' });

    // Double check seat availability
    const conflict = seats.some(seat => show.bookedSeats.includes(seat));
    if (conflict) {
      return res.status(400).json({ message: 'Some selected seats are already booked. Please try different seats.' });
    }

    // Mark seats as booked on show
    const newBookedSeats = [...show.bookedSeats, ...seats];
    Database.update('shows', showId, { bookedSeats: newBookedSeats });

    // Insert booking
    const booking = Database.insert('bookings', {
      userId,
      showId,
      movieId: show.movieId,
      theatreId: show.theatreId,
      screenId: show.screenId,
      seats,
      totalAmount,
      discountAmount: discountAmount || 0,
      paymentStatus: 'paid', // Mark as paid instantly for simulated preview
      bookingStatus: 'confirmed',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Booking created successfully!',
      booking
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Booking failed', error: error.message });
  }
});

app.get('/api/bookings/history', authenticateToken as any, (req: AuthenticatedRequest, res) => {
  try {
    const bookings = Database.find('bookings', b => b.userId === req.user!.id);

    // Populate bookings with rich movie and theatre info
    const enriched = bookings.map(b => {
      const movie = Database.findOne('movies', m => m.id === b.movieId);
      const theatre = Database.findOne('theatres', t => t.id === b.theatreId);
      const show = Database.findOne('shows', s => s.id === b.showId);
      return {
        ...b,
        movie,
        theatre,
        show
      };
    });

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to load booking history' });
  }
});

app.get('/api/bookings/all', authenticateToken as any, isAdmin as any, (req, res) => {
  try {
    const bookings = Database.getCollection('bookings');
    const enriched = bookings.map(b => {
      const movie = Database.findOne('movies', m => m.id === b.movieId);
      const theatre = Database.findOne('theatres', t => t.id === b.theatreId);
      const user = Database.findOne('users', u => u.id === b.userId);
      const show = Database.findOne('shows', s => s.id === b.showId);
      return {
        ...b,
        movie,
        theatre,
        show,
        user: user ? { name: user.name, email: user.email } : null
      };
    });
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve all bookings' });
  }
});

app.put('/api/bookings/:id/cancel', authenticateToken as any, (req: AuthenticatedRequest, res) => {
  try {
    const booking = Database.findOne('bookings', b => b.id === req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Cancel booking status
    Database.update('bookings', booking.id, {
      bookingStatus: 'cancelled',
      paymentStatus: 'refunded'
    });

    // Release seats from show
    const show = Database.findOne('shows', s => s.id === booking.showId);
    if (show) {
      const remainingSeats = show.bookedSeats.filter(s => !booking.seats.includes(s));
      Database.update('shows', show.id, { bookedSeats: remainingSeats });
    }

    res.json({ message: 'Booking cancelled successfully, seats released and refund initiated.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Cancellation failed', error: error.message });
  }
});


// ==========================================
// 6. COUPON ENDPOINTS
// ==========================================

app.get('/api/coupons/validate/:code', authenticateToken as any, (req, res) => {
  const coupon = Database.findOne('coupons', c => c.code.toUpperCase() === req.params.code.toUpperCase());
  if (!coupon || !coupon.isActive) {
    return res.status(404).json({ message: 'Invalid or expired coupon' });
  }
  res.json(coupon);
});

app.get('/api/coupons', authenticateToken as any, isAdmin as any, (req, res) => {
  res.json(Database.getCollection('coupons'));
});

app.post('/api/coupons', authenticateToken as any, isAdmin as any, (req, res) => {
  try {
    const couponData: Omit<Coupon, 'id'> = req.body;
    if (!couponData.code || !couponData.value) {
      return res.status(400).json({ message: 'Code and value are required' });
    }
    const newCoupon = Database.insert('coupons', {
      ...couponData,
      code: couponData.code.toUpperCase(),
      isActive: true
    });
    res.status(201).json(newCoupon);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create coupon' });
  }
});

app.delete('/api/coupons/:id', authenticateToken as any, isAdmin as any, (req, res) => {
  const deleted = Database.delete('coupons', req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Coupon not found' });
  res.json({ message: 'Coupon deleted successfully' });
});


// ==========================================
// 7. REVIEW ENDPOINTS
// ==========================================

app.get('/api/reviews/movie/:movieId', (req, res) => {
  const reviews = Database.find('reviews', r => r.movieId === req.params.movieId);
  res.json(reviews);
});

app.post('/api/reviews', authenticateToken as any, (req: AuthenticatedRequest, res) => {
  try {
    const { movieId, rating, comment } = req.body;
    const user = req.user!;

    if (!movieId || !rating) {
      return res.status(400).json({ message: 'Movie ID and rating are required' });
    }

    const newReview = Database.insert('reviews', {
      userId: user.id,
      userName: user.name,
      userPic: user.profilePic || '',
      movieId,
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date().toISOString()
    });

    // Re-calculate average rating for movie
    const allMovieReviews = Database.find('reviews', r => r.movieId === movieId);
    const avgRating = Number((allMovieReviews.reduce((sum, r) => sum + r.rating, 0) / allMovieReviews.length).toFixed(1));

    Database.update('movies', movieId, {
      rating: avgRating,
      ratingsCount: allMovieReviews.length
    });

    res.status(201).json(newReview);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to save review', error: error.message });
  }
});


// ==========================================
// 8. ADMIN ANALYTICS ENDPOINTS
// ==========================================

app.get('/api/admin/analytics', authenticateToken as any, isAdmin as any, (req, res) => {
  try {
    const bookings = Database.getCollection('bookings').filter(b => b.bookingStatus === 'confirmed');
    const users = Database.getCollection('users');
    const movies = Database.getCollection('movies');
    const theatres = Database.getCollection('theatres');

    const totalUsers = users.length;
    const totalMovies = movies.length;
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

    // Simulated charts data
    const dailySales = [
      { date: 'Mon', sales: Math.floor(totalRevenue * 0.12) },
      { date: 'Tue', sales: Math.floor(totalRevenue * 0.15) },
      { date: 'Wed', sales: Math.floor(totalRevenue * 0.10) },
      { date: 'Thu', sales: Math.floor(totalRevenue * 0.18) },
      { date: 'Fri', sales: Math.floor(totalRevenue * 0.22) },
      { date: 'Sat', sales: Math.floor(totalRevenue * 0.28) },
      { date: 'Sun', sales: Math.floor(totalRevenue * 0.20) },
    ];

    const monthlyRevenue = [
      { month: 'Jan', revenue: Math.floor(totalRevenue * 0.8) },
      { month: 'Feb', revenue: Math.floor(totalRevenue * 0.9) },
      { month: 'Mar', revenue: Math.floor(totalRevenue * 1.1) },
      { month: 'Apr', revenue: Math.floor(totalRevenue * 0.95) },
      { month: 'May', revenue: Math.floor(totalRevenue * 1.2) },
      { month: 'Jun', revenue: totalRevenue },
    ];

    const popularMovies = movies.slice(0, 3).map((m, idx) => ({
      name: m.title,
      bookingsCount: 45 - idx * 12,
      revenue: (45 - idx * 12) * 15
    }));

    res.json({
      stats: {
        totalUsers,
        totalMovies,
        totalBookings,
        totalRevenue,
        occupancyRate: 68 // Occupancy rate %
      },
      charts: {
        dailySales,
        monthlyRevenue,
        popularMovies
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to load analytics data' });
  }
});


// ==========================================
// 9. VITE DEV OR PROD MIDDLEWARE SETUP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
