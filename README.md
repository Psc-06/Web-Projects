# Project Zenith 🚀

A modern, secure, and beautiful personal life dashboard that aggregates data from multiple services into one central hub.

![Project Zenith](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- 🎵 **Spotify Integration** - Real-time "Now Playing" display with recently played tracks
- 📅 **Google Calendar** - View your next 3 upcoming events
- ✅ **Task Management** - Organize tasks by energy level (Low, Medium, High)
- 🏃 **Fitness Tracking** - Daily step count and activity stats from Google Fit
- 🌤️ **Dynamic Weather** - Current conditions and 3-day forecast
- 🔐 **Secure Authentication** - OAuth 2.0 with Google and Spotify
- 🎨 **Glassmorphism UI** - Beautiful dark mode with premium aesthetics
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism design
- **Authentication**: NextAuth.js with OAuth providers
- **Database**: MongoDB with Prisma ORM
- **Data Fetching**: SWR for real-time updates
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or MongoDB Atlas)
- API keys for:
  - Spotify Developer Account
  - Google Cloud Console (Calendar & Fit APIs)
  - OpenWeatherMap

### Setup Steps

1. **Clone and install dependencies**

\`\`\`bash
cd /home/kali/code/project-zenith
npm install
\`\`\`

2. **Configure environment variables**

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and fill in your credentials:

\`\`\`env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Database (MongoDB)
DATABASE_URL=mongodb://localhost:27017/zenith
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/zenith

# Spotify API (https://developer.spotify.com/dashboard)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret

# Google OAuth (https://console.cloud.google.com)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Weather API (https://openweathermap.org/api)
WEATHER_API_KEY=your_api_key
\`\`\`

3. **Setup Database**

\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

4. **Run the development server**

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 API Configuration

### Spotify Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: \`http://localhost:3000/api/auth/callback/spotify\`
4. Copy Client ID and Client Secret to `.env`

### Google Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable APIs:
   - Google Calendar API
   - Fitness API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: \`http://localhost:3000/api/auth/callback/google\`
6. Copy Client ID and Client Secret to `.env`

### Weather Setup

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Add to `.env`

## 📱 Usage

1. **Sign In**: Click "Continue with Google" or "Continue with Spotify"
2. **Authorize**: Grant permissions to the required services
3. **Enjoy**: Your personalized dashboard will load with real-time data

### Task Management

- Add tasks with energy level tags (Low, Medium, High)
- Pick tasks based on how you feel
- Check off completed tasks
- Delete tasks you no longer need

## 🎨 Design Philosophy

Project Zenith uses a **glassmorphism** design system with:

- Deep dark background (#0a0a0f)
- Frosted glass cards with backdrop blur
- Neon accents (Spotify green, soft blues)
- Smooth transitions and hover effects
- Responsive grid layout

## 🔒 Security Features

- JWT-based session management
- Secure token storage in database
- Protected API routes with middleware
- OAuth 2.0 refresh token handling
- Environment-based configuration

## 📊 Database Schema
\`\`\`
User (Authentication)
├── id, email, name, image
├── accounts[] (OAuth connections)
├── sessions[] (Active sessions)
├── tasks[] (User tasks)
└── preferences (User settings)

Task (Todo items)
├── id, title, description
├── completed, energyLevel, priority
└── userId (Foreign key)

Account (OAuth tokens)
├── provider, providerAccountId
├── access_token, refresh_token
└── expires_at
\`\`\`

## 🚀 Production Deployment

### Recommended: Vercel

\`\`\`bash
npm run build
vercel --prod
\`\`\`

### Environment Variables

Make sure to set all environment variables in your hosting platform:
- Update \`NEXTAUTH_URL\` to your production domain
- Generate a new \`NEXTAUTH_SECRET\`
- Update OAuth redirect URIs in Spotify/Google consoles

## 🔧 Development

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database management
npm run db:push    # Push schema changes
npm run db:studio  # Open Prisma Studio
\`\`\`

## 📝 Project Structure

\`\`\`
project-zenith/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth endpoints
│   │   ├── spotify/      # Spotify API proxy
│   │   ├── calendar/     # Google Calendar API
│   │   ├── tasks/        # Task CRUD operations
│   │   ├── fitness/      # Fitness data
│   │   └── weather/      # Weather API
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main dashboard
├── components/           # React components
│   ├── SpotifyWidget.tsx
│   ├── CalendarWidget.tsx
│   ├── TaskWidget.tsx
│   ├── FitnessWidget.tsx
│   ├── WeatherWidget.tsx
│   └── Providers.tsx
├── lib/
│   ├── auth.ts          # NextAuth config
│   └── prisma.ts        # Prisma client
├── prisma/
│   └── schema.prisma    # Database schema
├── types/
│   ├── index.ts         # TypeScript types
│   └── next-auth.d.ts   # NextAuth types
└── public/              # Static assets
\`\`\`

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your own use!

## 📄 License

MIT License - feel free to use this for your own personal dashboard.

## 🙏 Acknowledgments

- Spotify Web API
- Google Calendar & Fit APIs
- OpenWeatherMap API
- Next.js & Vercel team
- Tailwind CSS community

---

Built with ❤️ for personal productivity
