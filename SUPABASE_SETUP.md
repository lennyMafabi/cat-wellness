# Setting Up Permanent Data Storage with Supabase

This guide walks you through setting up free permanent database storage for your Cat Wellness app using Supabase (PostgreSQL).

## Step 1: Create a Supabase Account (FREE)

1. Go to **https://supabase.com**
2. Click "Start for Free" or "Sign Up"
3. Create account with email or GitHub
4. Verify your email
5. Create a new project:
   - **Project Name**: `cat-wellness`
   - **Database Password**: Save this! (you'll need it)
   - **Region**: Choose closest to you (US East if unsure)
   - Click "Create new project"

Wait for project to be created (takes ~2 minutes)

## Step 2: Get Your API Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** tab
3. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon Public Key** (under "Project API keys")

## Step 3: Create Database Tables

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy and paste the entire contents of `lib/supabase-schema.sql`
4. Click **Run** (play button)
5. Wait for tables to be created (you should see "Success")

## Step 4: Add Environment Variables

Create `.env.local` in your project root with:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual values from Step 2.

## Step 5: Configure Vercel

1. Go to **https://vercel.com** and log in
2. Select your `cat-wellness` project
3. Click **Settings** → **Environment Variables**
4. Add the same two variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Save**

## Step 6: Test Locally

```bash
npm run dev
```

Visit http://localhost:3000/app and try creating an account. You should see it in Supabase!

To verify:
1. In Supabase, go to **Table Editor** (left sidebar)
2. Click on `accounts` table
3. You should see your test account listed

## Step 7: Deploy to Vercel

```bash
git add .
git commit -m "Add Supabase permanent database storage"
git push
npx vercel deploy --prod
```

## Benefits

✅ **Free**: 500MB storage, no credit card required  
✅ **Permanent**: Data persists between deployments  
✅ **Scalable**: PostgreSQL can handle thousands of users  
✅ **Secure**: Row-level security, encryption at rest  
✅ **Real-time**: Optional real-time subscriptions  

## Supabase Free Tier Limits

- **Storage**: 500 MB
- **Database size**: 500 MB
- **Bandwidth**: 2 GB/month
- **Max connections**: 4

Perfect for MVP and testing. Upgrade to Pro ($25/month) when needed.

## Troubleshooting

**"Supabase credentials not configured"**
- Double-check your `.env.local` file
- Verify API key is correct in Supabase dashboard
- Restart dev server: `npm run dev`

**Account creation still failing**
- Check browser console for errors
- Verify SQL schema ran successfully in Supabase SQL Editor
- Try deleting test data in `accounts` table and try again

**Data not persisting**
- Ensure environment variables are set on Vercel
- Check Vercel deployment logs for errors
- Verify all tables exist in Supabase Table Editor
