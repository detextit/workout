# Workout Management Application

A modern, accessible workout management application built with Next.js 15, TypeScript, and PostgreSQL. This application allows users to manage workout routines, track exercises, and provides an admin interface for uploading and managing workout data from Excel files.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (local or cloud)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/detextit/workout.git
   cd workout/ironedit-plan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your database URL:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/workout_db"
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
## 📁 Project Structure

```
workout/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── admin/         # Admin API endpoints
│   │   │   └── workouts/      # Workout data endpoints
│   │   ├── admin/             # Admin interface
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── ui/               # ShadCN UI components
│   │   └── workout-app.tsx    # Main workout component
│   ├── db/                    # Database configuration
│   │   ├── config.ts         # Database connection
│   │   ├── schema.ts         # Drizzle schema definitions
│   │   └── schema.sql        # SQL schema
│   ├── lib/                   # Utilities and types
│   │   ├── types.ts          # TypeScript type definitions
│   │   └── utils.ts          # Utility functions
│   └── scripts/              # Data processing scripts
│       └── extract-excel.ts  # Excel data extraction
├── public/                    # Static assets
├── drizzle.config.ts         # Drizzle ORM configuration
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

---

Built with ❤️ in SF and Seattle.
