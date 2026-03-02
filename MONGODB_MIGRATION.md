# MongoDB Migration Summary

## ✅ Changes Made

The database has been migrated from PostgreSQL to MongoDB. Here's what was updated:

### 1. **Prisma Schema** (`prisma/schema.prisma`)
- Changed datasource provider from `postgresql` to `mongodb`
- Updated all model IDs to use MongoDB's format:
  - `@id @default(auto()) @map("_id") @db.ObjectId`
- Updated foreign key fields to use `@db.ObjectId`
- Removed PostgreSQL-specific field attributes (`@db.Text`)
- Added ID field to `VerificationToken` model (required for MongoDB)

### 2. **Environment Configuration** (`.env.example`)
- Updated `DATABASE_URL` format:
  - **Local MongoDB**: `mongodb://localhost:27017/zenith`
  - **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/zenith`

### 3. **Package Dependencies** (`package.json`)
- Updated Prisma versions to `~5.19.0` (prevents auto-upgrade to v7)
- Prisma 5.x is compatible with the current schema format

### 4. **Documentation Updates**
Updated all references from PostgreSQL to MongoDB in:
- `README.md` - Tech stack, prerequisites, setup instructions
- `QUICK_START.md` - Database setup, troubleshooting, checklist
- `TROUBLESHOOTING.md` - Database issues, error messages
- `PROJECT_OVERVIEW.md` - Backend stack description
- `setup.sh` - Installation checks

---

## 🚀 Setup Instructions

### Option 1: Local MongoDB

1. **Install MongoDB**:
   ```bash
   sudo apt install mongodb
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

2. **Update `.env`**:
   ```env
   DATABASE_URL="mongodb://localhost:27017/zenith"
   ```

3. **Install correct Prisma version**:
   ```bash
   cd /home/kali/code/project-zenith
   npm install @prisma/client@~5.19.0 prisma@~5.19.0
   ```

4. **Generate Prisma client & push schema**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Option 2: MongoDB Atlas (Cloud - Recommended)

1. **Sign up for free**: https://www.mongodb.com/cloud/atlas

2. **Create a cluster**:
   - Choose free tier (M0)
   - Select a region close to you
   - Create cluster

3. **Setup database access**:
   - Database Access → Add New Database User
   - Create username/password
   - Select "Read and write to any database"

4. **Setup network access**:
   - Network Access → Add IP Address
   - Allow access from anywhere (0.0.0.0/0) for development
   - Or add your specific IP for security

5. **Get connection string**:
   - Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with `zenith`

6. **Update `.env`**:
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/zenith?retryWrites=true&w=majority"
   ```

7. **Install and generate**:
   ```bash
   npm install @prisma/client@~5.19.0 prisma@~5.19.0
   npx prisma generate
   npx prisma db push
   ```

---

## 🔄 Differences: PostgreSQL vs MongoDB

### ID Generation
- **PostgreSQL**: Used `cuid()` for string IDs
- **MongoDB**: Uses `auto()` with `@map("_id") @db.ObjectId`

### Text Fields
- **PostgreSQL**: Long text used `@db.Text`
- **MongoDB**: All strings stored as BSON strings (no special attribute needed)

### Relationships
- **PostgreSQL**: Foreign keys as plain `String`
- **MongoDB**: Foreign keys need `@db.ObjectId` attribute

### Schema Validation
- **PostgreSQL**: Enforced at database level
- **MongoDB**: Enforced at application level via Prisma

---

## ✅ Verification

After setup, verify everything works:

```bash
# 1. Check MongoDB connection
npx prisma db push

# 2. Open Prisma Studio to browse database
npx prisma studio

# 3. Run development server
npm run dev

# 4. Sign in and test all widgets
# Visit http://localhost:3000
```

---

## 🎯 Why MongoDB?

### Advantages
- **Flexible schema** - Easier to iterate on data models
- **Free cloud hosting** - MongoDB Atlas offers generous free tier
- **No setup required** - Database creates automatically
- **Horizontal scaling** - Built for cloud-native apps
- **JSON-like documents** - Natural fit for JavaScript/TypeScript apps

### Considerations
- **No SQL joins** - Prisma handles relations in application
- **Different query patterns** - Optimized for document retrieval
- **Eventual consistency** - Design for distributed systems

---

## 🐛 Troubleshooting

### Error: "Prisma schema validation error"
If you see Prisma 7.x errors:
```bash
# Remove node_modules and reinstall with correct version
rm -rf node_modules package-lock.json
npm install
```

### Error: "MongoServerError: Authentication failed"
- Check username/password in connection string
- Verify database user has proper permissions
- For Atlas, check IP whitelist

### Error: "getaddrinfo ENOTFOUND"
- Check internet connection (for Atlas)  
- Verify cluster is running
- Check connection string is correct

### MongoDB not starting locally
```bash
# Check status
sudo systemctl status mongodb

# Check logs
sudo journalctl -u mongodb

# Restart service
sudo systemctl restart mongodb
```

---

## 📚 Resources

- [Prisma MongoDB Guide](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Installation](https://docs.mongodb.com/manual/installation/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

---

## ✨ You're All Set!

The migration to MongoDB is complete. The application now uses MongoDB for data storage while maintaining all the same functionality.

**Next steps**:
1. Choose MongoDB option (local or Atlas)
2. Install correct Prisma version
3. Run `npx prisma db push`
4. Start developing!
