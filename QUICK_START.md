# Quick Start Guide - Project Zenith

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

\`\`\`bash
cd /home/kali/code/project-zenith
npm install
\`\`\`

If you encounter network issues, try:
\`\`\`bash
npm install --network-timeout 300000
\`\`\`

### Step 2: Setup Environment Variables

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and add your credentials (see API Setup below).

### Step 3: Generate Prisma Client

\`\`\`bash
npx prisma generate
\`\`\`

### Step 4: Setup Database

Make sure MongoDB is running, then:

\`\`\`bash
# Update DATABASE_URL in .env first
npx prisma db push
\`\`\`

If you don't have MongoDB, install it:
\`\`\`bash
# Install MongoDB
sudo apt install mongodb
sudo systemctl start mongodb

# Or use MongoDB Atlas (free cloud database)
# Sign up at https://www.mongodb.com/cloud/atlas
\`\`\`

### Step 5: Run the App

\`\`\`bash
npm run dev
\`\`\`

Visit: http://localhost:3000

---

## 🔑 Quick API Setup

### Spotify (2 minutes)
1. Visit: https://developer.spotify.com/dashboard
2. Create app → Add redirect: \`http://localhost:3000/api/auth/callback/spotify\`
3. Copy ID + Secret to `.env`

### Google (3 minutes)
1. Visit: https://console.cloud.google.com
2. Create project → Enable Calendar & Fitness APIs
3. OAuth consent → External → Add scopes
4. Credentials → OAuth 2.0 → Add redirect: \`http://localhost:3000/api/auth/callback/google\`
5. Copy ID + Secret to `.env`

### Weather (30 seconds)
1. Visit: https://openweathermap.org/api
2. Sign up → Copy API key to `.env`

### Generate NextAuth Secret

\`\`\`bash
openssl rand -base64 32
\`\`\`

Copy to \`NEXTAUTH_SECRET\` in `.env`

---

## 📝 Minimum .env Template

\`\`\`env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret

DATABASE_URL=mongodb://localhost:27017/zenith
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/zenith

SPOTIFY_CLIENT_ID=your-id
SPOTIFY_CLIENT_SECRET=your-secret

GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret

WEATHER_API_KEY=your-key
\`\`\`

---

## 🐛 Troubleshooting

### "Can't connect to database"
- Check MongoDB is running: `sudo systemctl status mongodb`
- Verify DATABASE_URL in `.env`
- MongoDB creates database automatically on first connection

### "OAuth error"
- Check redirect URIs match exactly
- Ensure APIs are enabled in Google Console
- Verify client IDs/secrets in `.env`

### "Module not found"
- Run: \`npm install\` again
- Delete \`node_modules\` and \`package-lock.json\`, then \`npm install\`

### Port 3000 already in use
- Kill process: \`lsof -ti:3000 | xargs kill -9\`
- Or use different port: \`PORT=3001 npm run dev\`

---

## ✅ Verification Checklist

- [ ] Dependencies installed (\`npm install\`)
- [ ] `.env` file created with all keys
- [ ] MongoDB running (or using MongoDB Atlas)
- [ ] Database initialized (\`npx prisma db push\`)
- [ ] OAuth apps created (Spotify + Google)
- [ ] Redirect URIs configured
- [ ] Dev server running (\`npm run dev\`)
- [ ] Can access http://localhost:3000
- [ ] Can sign in with Google/Spotify

---

**Ready to go!** 🎉

For detailed setup instructions, see [README.md](README.md)
