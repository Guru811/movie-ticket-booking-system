# CineTicket: Production-Ready Full-Stack Movie Ticket Booking System

A premium, full-stack, end-to-end **Movie Ticket Booking System** (similar to BookMyShow or Fandango) built using the **MERN Stack** (MongoDB, Express, React, Node) with **TypeScript**, styled using a sleek glassmorphic dark-mode **Tailwind CSS v4** layout, and animated with **Framer Motion**.

---

## 🚀 Key Features

### 👤 User Capabilities
- **Trending & Coming Soon Carousels**: Beautiful, immersive interactive displays featuring movie details, trailer embeds, genre tags, and rapid ticket bookings.
- **Advanced Navigation & Search**: Filter films by city, genre, or written queries. Toggle between showing and upcoming titles.
- **Visual Seat Selector**: Highly precise, interactive seat planner indicating VIP, Platinum, Gold, and Silver seat tiers with corresponding prices.
- **Real-Time Booking Logic**: Automatic seat locks and collision guards that prevent seat double-booking.
- **Promotional Coupon Engine**: Instantly validate and apply percentages or flat cash deductions (e.g., `WELCOME10`, `FLAT5`, `SUPER30`).
- **Interactive Reviews & Ratings**: Submit 5-star ratings and written reviews; movie average rating and total counts update automatically.
- **Personal Booking History**: Keep track of past reservations, print digital tickets with simulated barcodes and QR codes, or cancel and receive instant refunds.

### 🛡️ Premium Admin Dashboard
- **Executive Console**: Comprehensive real-time graphs displaying total earnings, bookings count, and active users.
- **Recharts Data Visualization**: Interactive Area and Line graphs tracking sales trajectories, monthly earnings, and movie-by-movie revenue.
- **Interactive Movie Scheduler**: Publish new films, customize genres, duration, release dates, and embed trailers.
- **Theater Seating Designer**: Build customized screen geometries by setting rows, columns, and specific pricing profiles.
- **Schedule Planner**: Create and schedule screening slots for any movie, screen, date, and base ticket price.
- **Real-time Transaction Roster**: View all system transactions with complete user details, seats, and direct "Cancel & Refund" action buttons.

---

## 🛠️ Folder Structure

```
├── server.ts               # Full-Stack Express Server (integrates Vite in Dev mode)
├── db.json                 # High-fidelity persistent JSON database fallback
├── server/
│   ├── db.ts               # Modular database CRUD operations & rich seed data
│   └── auth.ts             # JWT signing, authorization, & role checks
├── src/
│   ├── App.tsx             # Page coordinator, central layout, and Auth modal
│   ├── main.tsx            # DOM mounting entry point
│   ├── index.css           # Custom Inter / JetBrains Mono font declarations & scrollbars
│   ├── types.ts            # Absolute shared types for frontend & backend
│   ├── context/
│   │   └── AppContext.tsx  # Central State Engine (auth, caches, API fetches)
│   ├── components/
│   │   ├── Navbar.tsx      # Responsive navigation header & city selector
│   │   ├── Hero.tsx        # Trending movie slider with transitions
│   │   ├── MovieGrid.tsx   # Catalog filters (genre, language, search)
│   │   ├── SeatSelector.tsx# Booking & coupon breakout
│   │   ├── TicketPDF.tsx   # Perforated print stub with barcode/QR simulation
│   │   └── ReviewsList.tsx # Interactive rating and review poster
│   └── pages/
│       ├── MovieDetails.tsx# Trailed presentation and scheduled slot picker
│       ├── AdminDashboard.tsx# Business metrics, tables, and management forms
│       └── ProfileHistory.tsx# Settings editor, bookmarks, and past tickets log
```

---

## ⚙️ Environment Variables

Copy `.env.example` into `.env` and fill in your custom keys:
```env
# Server Ingress Port
PORT=3000

# Authentication Signing Secret
JWT_SECRET="your-durable-production-jwt-secret"

# MongoDB Database Connection
MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/cineticket"

# Stripe Payments Configuration
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email Configurations
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="smtp-username"
SMTP_PASS="smtp-password"
```

---

## 🗄️ Hybrid Database Engine (MongoDB Atlas Fallback)

To provide an optimal developer experience, CineTicket features a **Hybrid Database Adapter** inside `server/db.ts`:
- **Out of the Box (Live Preview)**: If no `MONGODB_URI` environment variable is defined, the server seamlessly falls back to a high-fidelity local file database (`db.json`). This engine supports full CRUD, query operations, and pre-seeds the catalog with 5 films, theatres, screen designs, scheduled shows, and active users.
- **Production Mode**: As soon as you add a `MONGODB_URI` inside your secrets panel, the engine automatically routes commands to your remote cluster.

---

## 🚀 Execution & Commands

### 1. Installation
Install all client and server dependencies:
```bash
npm install
```

### 2. Run in Development
Launches the custom Express server with Vite assets compiled on-the-fly via TypeScript:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the live app.

### 3. Production Build
Compiles frontend static assets to `dist/` and bundles the entire Express server into a self-contained CommonJS (`dist/server.cjs`) file using high-speed Esbuild:
```bash
npm run build
```

### 4. Run in Production
Spins up the bundled server instantly:
```bash
npm run start
```

---

## 🔑 Testing Credentials

Use these pre-seeded accounts during live auditing to test permissions out-of-the-box:

- **Executive/Admin Login**
  - **Email**: `admin@movies.com`
  - **Password**: `admin123`
  - *Unlocks: Movie creator, scheduling panels, transactional rosters, coupon makers, and Recharts analytics.*

- **Standard User Login**
  - **Email**: `user@movies.com`
  - **Password**: `admin123`
  - *Unlocks: Visual seat selector, checkout panels, coupon applications, history logs, review posting, and print/PDF stubs.*
