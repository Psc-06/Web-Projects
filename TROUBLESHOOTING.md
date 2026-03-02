# Troubleshooting Guide

## Common Issues & Solutions

### 1. Installation Issues

#### Problem: `npm install` fails with timeout
```bash
# Solution: Increase timeout
npm install --network-timeout 300000

# Or use yarn instead
yarn install
```

#### Problem: `Cannot find module 'xyz'`
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### 2. Database Issues

#### Problem: Can't connect to MongoDB
```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Start MongoDB
sudo systemctl start mongodb

# Enable on boot
sudo systemctl enable mongodb
```

#### Problem: Database connection errors
```bash
# MongoDB creates database automatically on first connection
# Just ensure MongoDB is running and DATABASE_URL is correct

# Local MongoDB (default)
DATABASE_URL="mongodb://localhost:27017/zenith"

# MongoDB Atlas (cloud)
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/zenith"
```

#### Problem: Authentication failed
```bash
# For local MongoDB with auth enabled
DATABASE_URL="mongodb://username:password@localhost:27017/zenith"

# For MongoDB Atlas, get connection string from Atlas dashboard
```

#### Problem: Prisma schema errors
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Push schema changes
npx prisma db push
```

---

### 3. OAuth / Authentication Issues

#### Problem: "OAuth Error: redirect_uri_mismatch"
**Cause**: Redirect URI in provider console doesn't match your app

**Solution**:
1. Check exact URL in error message
2. Go to provider console (Spotify/Google)
3. Add exact redirect URI:
   - Local: `http://localhost:3000/api/auth/callback/[provider]`
   - Production: `https://yourdomain.com/api/auth/callback/[provider]`
4. Save and wait 1-2 minutes for propagation

#### Problem: "Invalid client" or "Unauthorized"
**Cause**: Wrong Client ID or Secret in `.env`

**Solution**:
1. Double-check `.env` file
2. Ensure no extra spaces or quotes
3. Regenerate client secret if needed
4. Restart dev server after changing `.env`

#### Problem: Token expired errors
**Cause**: Access token expired, refresh failed

**Solution**:
- Usually auto-handled by NextAuth
- If persists, sign out and sign in again
- Check refresh token is being stored in database

#### Problem: "Access blocked: This app's request is invalid"
**Cause**: OAuth consent screen not configured properly (Google)

**Solution**:
1. Go to Google Cloud Console
2. OAuth Consent Screen → Edit App
3. Ensure all required fields filled
4. Add your email to test users
5. Set to "External" if personal use

---

### 4. API Issues

#### Problem: Spotify returns 204/No content
**Cause**: Not currently playing music

**Solution**: This is normal! Widget shows "Not currently playing"

#### Problem: Spotify returns 401 Unauthorized
**Cause**: Scopes not granted or token expired

**Solution**:
1. Sign out and sign in again
2. Ensure all scopes are requested in `lib/auth.ts`
3. Check Spotify Developer Dashboard for API status

#### Problem: Google Calendar returns 403 Forbidden
**Cause**: Calendar API not enabled

**Solution**:
1. Go to Google Cloud Console
2. APIs & Services → Library
3. Search "Google Calendar API"
4. Click "Enable"
5. Wait 1-2 minutes

#### Problem: Weather API returns 401
**Cause**: Invalid API key

**Solution**:
1. Check `.env` file has correct key
2. Verify key at https://home.openweathermap.org/api_keys
3. Wait 10 minutes for new key to activate
4. Ensure you're within free tier limits (60 calls/min)

#### Problem: Google Fit returns no data
**Cause**: No fitness data available or API not enabled

**Solution**:
1. Enable Fitness API in Google Cloud Console
2. Add fitness scope to OAuth consent screen
3. Ensure Google Fit app has data
4. Re-authenticate to grant fitness permissions

---

### 5. UI/UX Issues

#### Problem: Widgets not loading / showing errors
**Cause**: Network request failing or not authenticated

**Solution**:
1. Open browser DevTools (F12) → Console
2. Check for error messages
3. Verify you're signed in
4. Check Network tab for failed requests
5. Ensure API routes are accessible

#### Problem: Images not loading (album art)
**Cause**: Next.js Image component domain not configured

**Solution**:
In `next.config.mjs`, ensure:
```javascript
images: {
  domains: ['i.scdn.co', 'mosaic.scdn.co'],
},
```

#### Problem: Styles not applying
**Cause**: Tailwind not compiled or CSS not loaded

**Solution**:
```bash
# Restart dev server
npm run dev

# If that doesn't work, rebuild
rm -rf .next
npm run dev
```

---

### 6. Development Issues

#### Problem: Port 3000 already in use
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

#### Problem: Hot reload not working
```bash
# Restart dev server
# Or check if you're in WSL2 (needs special config)
```

#### Problem: TypeScript errors
```bash
# Check tsconfig.json is present
# Ensure @types packages are installed
npm install --save-dev @types/node @types/react @types/react-dom

# Restart VS Code TypeScript server
# CMD/CTRL + Shift + P → "TypeScript: Restart TS Server"
```

#### Problem: ESLint errors
```bash
# Fix auto-fixable issues
npm run lint -- --fix

# Or disable ESLint temporarily
# Add "// eslint-disable-next-line" above the line
```

---

### 7. Production Issues

#### Problem: Build fails
```bash
# Check for TypeScript errors
npm run build

# Common fixes:
# - Fix all TS errors
# - Ensure all env vars are set
# - Check Next.js version compatibility
```

#### Problem: Environment variables not working in production
**Cause**: Not configured in hosting platform

**Solution**:
- Vercel: Project Settings → Environment Variables
- Railway: Project → Variables
- Netlify: Site Settings → Build & Deploy → Environment
- Ensure you're using `process.env.VARIABLE_NAME`
- Client-side vars need `NEXT_PUBLIC_` prefix

#### Problem: Database connection fails in production
**Cause**: Connection string or pooling issues

**Solution**:
1. Use connection pooling (Prisma handles this)
2. Ensure DATABASE_URL is set in production
3. For serverless, consider PlanetScale or Neon
4. Check firewall allows connections from hosting platform

---

### 8. Session & Cookie Issues

#### Problem: "Session callback in NextAuth requires a secret"
**Cause**: NEXTAUTH_SECRET not set

**Solution**:
```bash
# Generate secret
openssl rand -base64 32

# Add to .env
NEXTAUTH_SECRET=your-generated-secret
```

#### Problem: Can't stay signed in
**Cause**: Cookie issues or session expiry

**Solution**:
1. Clear browser cookies
2. Check NEXTAUTH_URL matches your domain
3. In production, ensure cookies are secure (HTTPS)
4. Check session strategy in `lib/auth.ts`

---

### 9. Performance Issues

#### Problem: Dashboard loads slowly
**Cause**: Too many API calls or large data

**Solution**:
1. Check Network tab in DevTools
2. Increase SWR refresh intervals
3. Implement data pagination
4. Add loading skeletons
5. Optimize images

#### Problem: High memory usage
**Cause**: Too many Prisma clients or connections

**Solution**:
- Ensure singleton Prisma client (already implemented in `lib/prisma.ts`)
- Don't create multiple Prisma instances
- Use connection pooling

---

### 10. Debugging Tips

#### Enable verbose logging
```typescript
// In API routes
console.log('Request:', request.url);
console.log('Data:', data);

// In components
console.log('State:', state);
```

#### Check API responses
```bash
# Test API routes directly
curl http://localhost:3000/api/spotify
curl http://localhost:3000/api/calendar
curl -H "Cookie: next-auth.session-token=..." http://localhost:3000/api/tasks
```

#### Prisma Studio (browse database)
```bash
npx prisma studio
# Opens at http://localhost:5555
```

#### Check logs
```bash
# Development logs appear in terminal
# Check browser console (F12) for client-side errors
# Check Network tab for failed requests
```

---

## Still Having Issues?

### Quick Checks
- [ ] All dependencies installed (`npm install`)
- [ ] `.env` file exists with all variables
- [ ] MongoDB is running (or using MongoDB Atlas)
- [ ] OAuth apps configured correctly
- [ ] Redirect URIs match exactly
- [ ] APIs enabled in provider consoles
- [ ] Dev server restarted after `.env` changes
- [ ] No TypeScript errors (`npm run build`)

### Get Help
1. Check documentation in this repo
2. Review API provider documentation
3. Check browser console for errors
4. Look at terminal logs
5. Google the specific error message

### Common Error Messages Decoded

| Error | Meaning | Fix |
|-------|---------|-----|
| \`ECONNREFUSED\` | Can't connect to DB | Start MongoDB |
| `MODULE_NOT_FOUND` | Missing dependency | Run `npm install` |
| `UNAUTHORIZED` | Auth failed | Check tokens/credentials |
| `FORBIDDEN` | No permission | Check API enabled/scopes |
| `TOO_MANY_REQUESTS` | Rate limited | Reduce polling frequency |
| `INVALID_CLIENT` | Wrong OAuth creds | Check Client ID/Secret |
| `REDIRECT_URI_MISMATCH` | Wrong redirect URI | Update in provider console |

---

## Preventive Measures

### Best Practices
1. ✅ Always use `.env` for secrets (never commit)
2. ✅ Keep dependencies updated
3. ✅ Test auth flow after changes
4. ✅ Monitor API rate limits
5. ✅ Use TypeScript for type safety
6. ✅ Handle errors gracefully in UI
7. ✅ Log important events
8. ✅ Test on multiple devices/browsers

### Before Deployment
- [ ] Test all widgets work
- [ ] Check mobile responsiveness
- [ ] Verify all env vars set
- [ ] Test OAuth flow
- [ ] Check database connection
- [ ] Review security settings
- [ ] Test error states
- [ ] Check loading states

---

## Emergency Reset

If all else fails:

```bash
# 1. Backup .env
cp .env .env.backup

# 2. Clean everything
rm -rf node_modules .next
rm package-lock.json

# 3. Reset database
npx prisma migrate reset

# 4. Fresh install
npm install
npx prisma generate
npx prisma db push

# 5. Restart
npm run dev
```

---

**Remember**: Most issues are environment/configuration related, not code bugs. Double-check your setup first! 🔍
