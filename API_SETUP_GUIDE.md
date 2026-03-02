# API Integration Guide

## Table of Contents
- [Spotify Integration](#spotify-integration)
- [Google Calendar Integration](#google-calendar-integration)
- [Google Fit Integration](#google-fit-integration)
- [Weather API Integration](#weather-api-integration)
- [OAuth Flow Explanation](#oauth-flow-explanation)

---

## Spotify Integration

### Setup (Detailed)

1. **Create Spotify Developer Account**
   - Go to https://developer.spotify.com/dashboard
   - Log in with your Spotify account
   - Accept Terms of Service

2. **Create an App**
   - Click "Create App"
   - Fill in details:
     - App name: "Project Zenith"
     - App description: "Personal life dashboard"
     - Redirect URI: \`http://localhost:3000/api/auth/callback/spotify\`
     - Check "Web API"
   - Accept Terms → Create

3. **Get Credentials**
   - Click "Settings"
   - Copy "Client ID" → Add to \`.env\` as \`SPOTIFY_CLIENT_ID\`
   - Click "View client secret" → Copy → Add to \`.env\` as \`SPOTIFY_CLIENT_SECRET\`

4. **Required Scopes** (automatically requested)
   - \`user-read-email\`
   - \`user-read-private\`
   - \`user-read-currently-playing\`
   - \`user-read-recently-played\`
   - \`user-top-read\`

### API Endpoints Used

- **Now Playing**: \`GET /v1/me/player/currently-playing\`
  - Returns current track, artist, album, progress
  - Polled every 5 seconds

- **Recently Played**: \`GET /v1/me/player/recently-played?limit=5\`
  - Returns last 5 played tracks
  - Updated every 30 seconds

### Rate Limits
- **Standard**: 180 requests per minute
- **Extended**: 30,000 requests per day per user

### Common Issues
- **401 Unauthorized**: Token expired, NextAuth handles refresh automatically
- **204 No Content**: No track currently playing (expected)
- **429 Too Many Requests**: Reduce polling interval

---

## Google Calendar Integration

### Setup (Detailed)

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com
   - Click "Select a project" → "New Project"
   - Name: "Project Zenith"
   - Click "Create"

2. **Enable Calendar API**
   - In project, go to "APIs & Services" → "Library"
   - Search "Google Calendar API"
   - Click → "Enable"

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" → "Create"
   - Fill in:
     - App name: "Project Zenith"
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - **Scopes**: Add these manually:
     - \`https://www.googleapis.com/auth/calendar.readonly\`
   - Click "Save and Continue"
   - **Test users**: Add your Google email
   - Click "Save and Continue"

4. **Create OAuth Credentials**
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Project Zenith Web"
   - Authorized redirect URIs: \`http://localhost:3000/api/auth/callback/google\`
   - Click "Create"
   - Copy Client ID and Secret to \`.env\`

### API Endpoints Used

- **List Events**: \`GET /calendar/v3/calendars/primary/events\`
  - Parameters: \`timeMin\`, \`maxResults=3\`, \`orderBy=startTime\`, \`singleEvents=true\`
  - Returns next 3 upcoming events

### Rate Limits
- **Queries**: 1,000,000 per day (free tier)
- **Per second**: 10 requests

---

## Google Fit Integration

### Setup (Detailed)

1. **Enable Fitness API** (in same Google Cloud project)
   - Go to "APIs & Services" → "Library"
   - Search "Fitness API"
   - Click → "Enable"

2. **Add Scopes to OAuth Consent**
   - Go to "OAuth consent screen" → "Edit App"
   - Under "Scopes", add:
     - \`https://www.googleapis.com/auth/fitness.activity.read\`
   - Save

3. **Update OAuth Scopes** (already configured in code)
   - The app automatically requests fitness scopes during login

### API Endpoints Used

- **Aggregate Data**: \`POST /fitness/v1/users/me/dataset:aggregate\`
  - Data types:
    - \`com.google.step_count.delta\` (steps)
    - \`com.google.distance.delta\` (distance in meters)
    - \`com.google.calories.expended\` (calories)
  - Time range: Start of day to now

### Data Sources
- Google Fit app on Android
- Apple Health (via Google Fit sync)
- Fitbit (via Google Fit integration)
- Manual entry in Google Fit

### Rate Limits
- **Queries**: 5,000 per day (free tier)
- **Per second**: 5 requests

---

## Weather API Integration

### Setup (Detailed)

1. **Sign Up**
   - Go to https://openweathermap.org/api
   - Click "Sign Up" (top right)
   - Fill in details and verify email

2. **Get API Key**
   - Log in → "API keys" tab
   - Copy default key (or create new one)
   - Add to \`.env\` as \`WEATHER_API_KEY\`

3. **API Plan**
   - Free tier: 1,000 calls/day
   - Upgrade to paid if needed

### API Endpoints Used

- **Current Weather**: \`GET /data/2.5/weather?lat={lat}&lon={lon}&appid={key}&units=imperial\`
  - Returns: temp, condition, icon

- **Forecast**: \`GET /data/2.5/forecast?lat={lat}&lon={lon}&appid={key}&units=imperial\`
  - Returns: 5-day forecast (3-hour intervals)
  - We process to get daily high/low for 3 days

### Geolocation
- Default: New York City (40.7128, -74.0060)
- Future: Can add browser geolocation or user preferences

### Rate Limits
- **Free tier**: 60 calls/minute, 1,000 calls/day
- **Paid**: Higher limits available

---

## OAuth Flow Explanation

### How it Works

1. **User clicks "Sign in"**
   - Redirects to provider (Google/Spotify)

2. **User authorizes**
   - Grants permissions to requested scopes

3. **Provider redirects back**
   - Includes authorization code
   - NextAuth receives at \`/api/auth/callback/[provider]\`

4. **NextAuth exchanges code for tokens**
   - Gets \`access_token\` and \`refresh_token\`
   - Stores in database (encrypted)

5. **Access token used for API calls**
   - Attached to requests as \`Authorization: Bearer {token}\`

6. **Token refresh (automatic)**
   - When access token expires, NextAuth uses refresh token
   - Gets new access token
   - User stays logged in

### Security Features

- **JWT sessions**: Stateless, secure
- **Token encryption**: Stored encrypted in database
- **HTTPS only**: Required in production
- **CSRF protection**: Built into NextAuth
- **Scope limitation**: Request minimal permissions

### Session Management

- **Session duration**: 30 days (default)
- **Refresh**: Automatic when needed
- **Logout**: Revokes tokens and clears session

---

## Testing Without API Keys

For development without all APIs set up:

1. **Mock Data**: API routes include fallback mock data
2. **Conditional Rendering**: Widgets gracefully handle missing data
3. **Error States**: UI shows friendly messages when APIs unavailable

### Example: Testing Spotify Widget

\`\`\`typescript
// In /api/spotify/route.ts
if (!accessToken) {
  // Returns mock data instead of 401
  return NextResponse.json({
    isPlaying: true,
    name: "Test Song",
    artist: "Test Artist",
    // ... mock data
  });
}
\`\`\`

---

## Production Considerations

### Environment Variables
- Use production URLs for \`NEXTAUTH_URL\`
- Generate new \`NEXTAUTH_SECRET\` for production
- Use environment variables in hosting platform (Vercel, Railway, etc.)

### OAuth Redirect URIs
- Add production URLs to all OAuth apps:
  - \`https://yourdomain.com/api/auth/callback/spotify\`
  - \`https://yourdomain.com/api/auth/callback/google\`

### Rate Limit Handling
- Implement exponential backoff
- Cache responses when appropriate
- Monitor API usage in dashboards

### Error Monitoring
- Set up Sentry or similar
- Log API errors
- Alert on auth failures

---

## Helpful Resources

- [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api)
- [Google Calendar API Docs](https://developers.google.com/calendar/api)
- [Google Fit APIs](https://developers.google.com/fit)
- [OpenWeatherMap API Docs](https://openweathermap.org/api)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Prisma Docs](https://www.prisma.io/docs)

---

## Support

If you encounter issues:
1. Check API credentials in \`.env\`
2. Verify redirect URIs match exactly
3. Check API is enabled in provider console
4. Review browser console for errors
5. Check API provider status pages
