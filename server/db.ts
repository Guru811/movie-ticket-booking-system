import fs from 'fs';
import os from 'os';
import path from 'path';
import { User, Movie, Theatre, Show, Booking, Review, Coupon } from '../src/types.js';

const DB_FILE = process.env.VERCEL
  ? path.join(os.tmpdir(), 'db.json')
  : path.join(process.cwd(), 'db.json');

export interface DatabaseSchema {
  users: User[];
  movies: Movie[];
  theatres: Theatre[];
  shows: Show[];
  bookings: Booking[];
  reviews: Review[];
  coupons: Coupon[];
}

const INITIAL_MOVIES: Movie[] = [
  {
    id: 'm1',
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    trailer: 'https://www.youtube.com/embed/Way9Dexny3w',
    duration: 166,
    releaseDate: '2024-03-01',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    language: ['English', 'Spanish'],
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Austin Butler'],
    rating: 4.8,
    ratingsCount: 2450
  },
  {
    id: 'm2',
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb, which changed the course of history forever.',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    trailer: 'https://www.youtube.com/embed/uYPbbksJxIg',
    duration: 180,
    releaseDate: '2023-07-21',
    genre: ['Biography', 'Drama', 'History'],
    language: ['English', 'German'],
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    rating: 4.7,
    ratingsCount: 1980
  },
  {
    id: 'm3',
    title: 'Interstellar',
    description: 'When Earth becomes uninhabitable, a team of explorers undertakes the most important mission in human history: traveling beyond this galaxy to discover whether mankind has a future among the stars.',
    poster: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1200&q=80',
    trailer: 'https://www.youtube.com/embed/zSWdZVtXT7E',
    duration: 169,
    releaseDate: '2014-11-07',
    genre: ['Sci-Fi', 'Drama', 'Adventure'],
    language: ['English'],
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    rating: 4.9,
    ratingsCount: 3420
  },
  {
    id: 'm4',
    title: 'Spirited Away',
    description: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=1200&q=80',
    trailer: 'https://www.youtube.com/embed/ByXuk9QqQkk',
    duration: 125,
    releaseDate: '2001-07-20',
    genre: ['Animation', 'Fantasy', 'Family'],
    language: ['Japanese', 'English'],
    director: 'Hayao Miyazaki',
    cast: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki'],
    rating: 4.9,
    ratingsCount: 1560
  },
  {
    id: 'm5',
    title: 'Everything Everywhere All at Once',
    description: 'A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    trailer: 'https://www.youtube.com/embed/wxN1T1UxQ2A',
    duration: 139,
    releaseDate: '2022-03-25',
    genre: ['Sci-Fi', 'Action', 'Comedy', 'Drama'],
    language: ['English', 'Mandarin'],
    director: 'Daniel Kwan, Daniel Scheinert',
    cast: ['Michelle Yeoh', 'Stephanie Hsu', 'Ke Huy Quan', 'Jamie Lee Curtis'],
    rating: 4.6,
    ratingsCount: 890
  }
];

const INITIAL_THEATRES: Theatre[] = [
  {
    id: 't1',
    name: 'Starlight Multiplex',
    city: 'Mumbai',
    address: 'Andheri West, Mumbai',
    screens: [
      {
        id: 's1',
        name: 'Screen 1 (IMAX)',
        rows: 8,
        cols: 10,
        tierPrices: { vip: 500, platinum: 400, gold: 300, silver: 200 }
      },
      {
        id: 's2',
        name: 'Screen 2 (Dolby Cinema)',
        rows: 6,
        cols: 8,
        tierPrices: { platinum: 350, gold: 280, silver: 180 }
      }
    ]
  },
  {
    id: 't2',
    name: 'Cinema Paradiso',
    city: 'Delhi',
    address: 'Connaught Place, New Delhi',
    screens: [
      {
        id: 's3',
        name: 'Grand Theater',
        rows: 10,
        cols: 12,
        tierPrices: { vip: 600, platinum: 450, gold: 320, silver: 220 }
      }
    ]
  },
  {
    id: 't3',
    name: 'Apex Cinema',
    city: 'Bangalore',
    address: 'MG Road, Bangalore',
    screens: [
      {
        id: 's4',
        name: 'Screen A',
        rows: 6,
        cols: 8,
        tierPrices: { platinum: 320, gold: 250, silver: 180 }
      }
    ]
  }
];

const INITIAL_COUPONS: Coupon[] = [
  { id: 'c1', code: 'WELCOME10', discountType: 'percentage', value: 10, minPurchase: 300, isActive: true },
  { id: 'c2', code: 'FLAT100', discountType: 'flat', value: 100, minPurchase: 400, isActive: true },
  { id: 'c3', code: 'SUPER30', discountType: 'percentage', value: 30, minPurchase: 600, isActive: true }];

export class Database {
  private static load(): DatabaseSchema {
    if (!fs.existsSync(DB_FILE)) {
      const defaultSchema: DatabaseSchema = {
        users: [
          // Preseed admin
          {
            id: 'admin',
            name: 'System Admin',
            email: 'admin@movies.com',
            // Default password is 'admin123' hashed (we will store plaintext or compare simply for fallback, let's hash properly with bcryptjs!)
            password: '$2a$10$Uq6N.w.tM88XgGvO4qWpPeKq3O2I6X85y4V7eI0vWzW.Bf7X6Vl9a', // bcrypt hash for 'admin123'
            role: 'admin',
            isVerified: true,
            favourites: [],
            createdAt: new Date().toISOString()
          },
          // Preseed user
          {
            id: 'user',
            name: 'John Doe',
            email: 'user@movies.com',
            password: '$2a$10$Uq6N.w.tM88XgGvO4qWpPeKq3O2I6X85y4V7eI0vWzW.Bf7X6Vl9a', // bcrypt hash for 'admin123'
            role: 'user',
            isVerified: true,
            favourites: ['m1', 'm3'],
            createdAt: new Date().toISOString()
          }
        ],
        movies: INITIAL_MOVIES,
        theatres: INITIAL_THEATRES,
        shows: [],
        bookings: [],
        reviews: [
          {
            id: 'r1',
            userId: 'user',
            userName: 'John Doe',
            movieId: 'm1',
            rating: 5,
            comment: 'Absolutely masterpiece! Visual design and audio design are out of this world.',
            createdAt: new Date().toISOString()
          }
        ],
        coupons: INITIAL_COUPONS
      };

      // Let's generate some shows for the next 7 days dynamically
      const shows: Show[] = [];
      const showTimes = ['11:00', '14:30', '18:00', '21:30'];
      let showIdCounter = 1;

      // Loop over theatres, screens, and movies to generate interesting shows
      INITIAL_THEATRES.forEach(theatre => {
        theatre.screens.forEach(screen => {
          INITIAL_MOVIES.forEach((movie, mIdx) => {
            // For the next 3 days
            for (let day = 0; day < 3; day++) {
              const d = new Date();
              d.setDate(d.getDate() + day);
              const dateStr = d.toISOString().split('T')[0];

              // Pick one or two times
              const timeIdx = (mIdx + day) % showTimes.length;
              shows.push({
                id: `sh${showIdCounter++}`,
                movieId: movie.id,
                theatreId: theatre.id,
                screenId: screen.id,
                date: dateStr,
                time: showTimes[timeIdx],
                ticketPrice: screen.tierPrices.gold || 250,
                bookedSeats: day === 0 ? ['A3', 'A4', 'B5'] : [], // pre-book some seats to show occupied state
                totalSeats: screen.rows * screen.cols
              });
            }
          });
        });
      });

      defaultSchema.shows = shows;

      fs.writeFileSync(DB_FILE, JSON.stringify(defaultSchema, null, 2));
      return defaultSchema;
    }

    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (e) {
      console.error('Error reading DB_FILE, recreating', e);
      return { users: [], movies: [], theatres: [], shows: [], bookings: [], reviews: [], coupons: [] };
    }
  }

  private static save(data: DatabaseSchema): void {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  }

  // Generic query operations
  static getCollection<T extends keyof DatabaseSchema>(collection: T): DatabaseSchema[T] {
    const data = this.load();
    return data[collection];
  }

  static find<T extends keyof DatabaseSchema>(
    collection: T,
    predicate: (item: DatabaseSchema[T][number]) => boolean
  ): DatabaseSchema[T] {
    const items = this.getCollection(collection);
    return items.filter(predicate) as DatabaseSchema[T];
  }

  static findOne<T extends keyof DatabaseSchema>(
    collection: T,
    predicate: (item: DatabaseSchema[T][number]) => boolean
  ): DatabaseSchema[T][number] | null {
    const items = this.getCollection(collection);
    return items.find(predicate) || null;
  }

  static insert<T extends keyof DatabaseSchema>(
    collection: T,
    item: Omit<DatabaseSchema[T][number], 'id'> & { id?: string }
  ): DatabaseSchema[T][number] {
    const data = this.load();
    const newItem = {
      ...item,
      id: item.id || `${collection.substring(0, 3)}_${Math.random().toString(36).substr(2, 9)}`
    } as DatabaseSchema[T][number];

    (data[collection] as any[]).push(newItem);
    this.save(data);
    return newItem;
  }

  static update<T extends keyof DatabaseSchema>(
    collection: T,
    id: string,
    updates: Partial<DatabaseSchema[T][number]>
  ): DatabaseSchema[T][number] | null {
    const data = this.load();
    const index = (data[collection] as any[]).findIndex((item: any) => item.id === id);
    if (index === -1) return null;

    const updatedItem = {
      ...data[collection][index],
      ...updates
    };

    data[collection][index] = updatedItem;
    this.save(data);
    return updatedItem;
  }

  static delete<T extends keyof DatabaseSchema>(collection: T, id: string): boolean {
    const data = this.load();
    const initialLength = (data[collection] as any[]).length;
    data[collection] = (data[collection] as any[]).filter((item: any) => item.id !== id);
    this.save(data);
    return (data[collection] as any[]).length < initialLength;
  }
}
