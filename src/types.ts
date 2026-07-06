export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  profilePic?: string;
  favourites: string[]; // movie IDs
  createdAt: string;
}

export interface Screen {
  id: string;
  name: string;
  rows: number;
  cols: number;
  tierPrices: {
    vip?: number;
    platinum?: number;
    gold?: number;
    silver?: number;
  };
}

export interface Theatre {
  id: string;
  name: string;
  city: string;
  address: string;
  screens: Screen[];
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  poster: string;
  banner: string;
  trailer: string;
  duration: number; // in minutes
  releaseDate: string;
  genre: string[];
  language: string[];
  director: string;
  cast: string[];
  rating: number; // Average rating out of 5
  ratingsCount: number;
  isComingSoon?: boolean;
}

export interface Show {
  id: string;
  movieId: string;
  theatreId: string;
  screenId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  ticketPrice: number;
  bookedSeats: string[]; // e.g. ["A1", "A2"]
  totalSeats: number;
}

export interface Booking {
  id: string;
  userId: string;
  showId: string;
  movieId: string;
  theatreId: string;
  screenId: string;
  seats: string[];
  totalAmount: number;
  discountAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  bookingStatus: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userPic?: string;
  movieId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  value: number;
  minPurchase: number;
  isActive: boolean;
}
