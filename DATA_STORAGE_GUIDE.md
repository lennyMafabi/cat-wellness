# Data Storage Setup - No Payment, No External Signup

Your app now has **THREE layers of data persistence** that work together automatically. No external signups required!

## How It Works

### 🔵 Development (Local Testing)
- Data saves to `data/` JSON files automatically
- Files sync every 30 seconds
- Automatic backups created in `data/backup-*.json`
- Perfect for testing - data persists between restarts

**Location**: `http://localhost:3000/app`

### 🟣 Production (Vercel Deployment)  
- Data stored in **in-memory cache** during server session
- Persists for ~15 minutes of inactivity
- Upgrades automatically to permanent database when configured
- Current status: ✅ Working (session-based)

**Live URL**: `https://cat-wellness-orpin.vercel.app`

### 🟢 Permanent Storage (Optional Upgrade)
- Free tier databases available (no credit card)
- Choose one when ready:
  - **PlanetScale** (MySQL): Best overall
  - **Neon** (PostgreSQL): PostgreSQL fans
  - **Supabase** (PostgreSQL + extras): Full backend suite

## Current Data Storage Status

✅ **Local Development**: Fully persistent  
✅ **Vercel Production**: Session-based (15min)  
❌ **External Database**: Not yet configured  

**To upgrade**: Follow "Add Permanent Database" section below

## How to Add Permanent Database (Optional)

### Option 1: PlanetScale (Easiest) 

1. Go to **https://planetscale.com** → Sign up (GitHub or email)
2. Create new database named `cat-wellness`
3. Create connection string for "Node.js"
4. Add to `.env.local`:
   ```
   DATABASE_URL=mysql://user:password@host/database
   ```
5. Add to Vercel (via CLI, no dashboard needed):
   ```bash
   npx vercel env add DATABASE_URL
   ```
6. Redeploy: `npx vercel deploy --prod`

### Option 2: Neon (PostgreSQL)

1. Go to **https://neon.tech** → Sign up
2. Create new project
3. Copy connection string  
4. Add to `.env.local`:
   ```
   DATABASE_URL=postgres://user:password@host/database
   ```
5. Follow same Vercel steps as Option 1

### Option 3: Supabase (Full Backend)

1. Go to **https://supabase.com** → Sign up
2. Create new project
3. Run schema from `lib/supabase-schema.sql` in SQL Editor
4. Copy API credentials
5. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```

## Data Management

### View Local Data
```bash
cat data/accounts.json           # See all user accounts
cat data/sessions.json           # See all sessions
cat data/backup-*.json           # View backups
```

### Export Data
```bash
git log --oneline data/          # View backup history
```

### Restore from Backup
```bash
cp data/backup-2026-05-25T12-34-56.json data/accounts.json
npm run dev
```

## FAQ

**Q: Where is my data on Vercel?**  
A: In server memory during active sessions (max 15min of inactivity). Reload page after 15min = data lost. This is temporary until you add a permanent database.

**Q: Can I keep using it without adding a database?**  
A: Yes! For MVP and testing, in-memory works fine. Add a database when you need persistent data across deployments.

**Q: How do I add a database?**  
A: Pick one of the three options above. Each takes ~5 minutes.

**Q: Will my local data transfer?**  
A: No, they're separate. You'd need to manually migrate if desired.

**Q: What happens to old data when I add a database?**  
A: It only affects new data. Old local data stays in `data/` folder.

## File Structure

```
data/
├── accounts.json              # User accounts (auto-synced)
├── accountCredentials.json    # Password hashes (auto-synced)
├── sessions.json              # Session records (auto-synced)
├── adminMirrorRecords.json    # Admin tracking (auto-synced)
├── retainedChats.json         # Chat history (auto-synced)
└── backup-*.json              # Auto-created backups (daily)

lib/
├── accountSystemDb.ts         # Database layer (synced to files)
├── persistentStore.ts         # Backup mechanism
├── supabase.ts                # Supabase config (ready if needed)
└── supabaseDb.ts              # Supabase layer (ready if needed)
```

## How Data Auto-Syncs

1. **Server receives request** → writes to memory cache
2. **Every 30 seconds** → syncs cache to JSON files
3. **On app restart** → loads from JSON files back to memory
4. **Daily** → auto-backup created for safety

## Upgrade Path (When You're Ready)

1. Current: ✅ In-memory (Vercel) + Files (Local)
2. Next: Add PlanetScale/Neon/Supabase (choose one)
3. Finally: Remove file fallback, use database only

**No rush** - works great as-is for MVP!

## Support

- All data stays in your control (no vendor lock-in)
- Can export from `data/` folder anytime
- Can migrate to different database freely
- All backups in Git history

Happy coding! 🚀
