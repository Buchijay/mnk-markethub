# Deployment Guide for MNK MarketHub

This guide will walk you through deploying the MNK MarketHub application to Vercel.

## Prerequisites

Before deploying, ensure you have:

1. A [Vercel account](https://vercel.com/signup)
2. A [Supabase account](https://supabase.com) with a project set up
3. Git installed on your local machine
4. Node.js 18.x or later installed

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub** (if not already done)

2. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New Project"

3. **Import Your Repository**
   - Select "Import Git Repository"
   - Choose the `Buchijay/mnk-markethub` repository
   - Click "Import"

4. **Configure Your Project**
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

5. **Add Environment Variables**
   
   Click on "Environment Variables" and add the following:

   | Name | Value | Notes |
   |------|-------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | From Supabase Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` | From Supabase Project Settings → API |

   **How to get Supabase credentials:**
   - Go to your [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Navigate to Settings → API
   - Copy "Project URL" for `NEXT_PUBLIC_SUPABASE_URL`
   - Copy "Project API keys" → "anon public" for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

6. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-5 minutes)
   - Your site will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**
   ```bash
   cd /path/to/mnk-markethub
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? Yes
   - Which scope? (Select your account)
   - Link to existing project? No
   - What's your project's name? mnk-markethub
   - In which directory is your code located? ./
   - Want to override the settings? No

5. **Add environment variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

6. **Deploy to production**
   ```bash
   vercel --prod
   ```

## Post-Deployment Configuration

### 1. Configure Custom Domain (Optional)

1. Go to your project in the Vercel Dashboard
2. Navigate to Settings → Domains
3. Add your custom domain
4. Update your DNS records as instructed by Vercel

### 2. Configure Supabase for Production

Update your Supabase project to allow your Vercel domain:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to "Site URL": `https://your-project.vercel.app`
3. Add redirect URLs:
   - `https://your-project.vercel.app/auth/callback`
   - `https://your-project.vercel.app/**`

### 3. Set up Analytics (Optional)

Vercel provides built-in analytics:
1. Go to your project in Vercel Dashboard
2. Navigate to Analytics
3. Enable Web Analytics

## Environment Variables Reference

The following environment variables are required for deployment:

### Required Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key (safe for client-side use)

### Optional Variables

You can add these later as your project grows:
- `NEXT_PUBLIC_SITE_URL`: Your production URL (defaults to Vercel URL)
- Analytics tokens
- Third-party API keys

## Continuous Deployment

Once set up, Vercel automatically deploys:

- **Production**: Every push to the `main` branch
- **Preview**: Every push to other branches and pull requests

You can customize this in Project Settings → Git.

## Troubleshooting

### Build Failures

If your build fails:

1. **Check the build logs** in the Vercel Dashboard
2. **Verify environment variables** are set correctly
3. **Test build locally**:
   ```bash
   npm install
   npm run build
   ```

### Environment Variable Issues

If you see errors about missing Supabase credentials:

1. Verify variables are set in Vercel Dashboard → Settings → Environment Variables
2. Ensure variable names match exactly (case-sensitive)
3. Redeploy after adding variables

### Supabase Connection Issues

1. Check that your Supabase project is active
2. Verify the URL and API key are correct
3. Ensure your Vercel domain is added to Supabase's allowed URLs

## Monitoring and Logs

- **View deployment logs**: Vercel Dashboard → Deployments → Select deployment
- **Runtime logs**: Vercel Dashboard → Deployments → Runtime Logs
- **Function logs**: Available for API routes and middleware

## Performance Optimization

After deployment, consider:

1. **Enable caching** for static assets
2. **Optimize images** using Next.js Image component (already configured)
3. **Monitor Core Web Vitals** in Vercel Analytics
4. **Set up ISR** (Incremental Static Regeneration) for dynamic pages

## Rollback

If you need to rollback a deployment:

1. Go to Vercel Dashboard → Deployments
2. Find the previous working deployment
3. Click "⋯" menu → "Promote to Production"

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

## Security Notes

⚠️ **Important:**
- Never commit `.env` files with actual credentials to Git
- Use Vercel's environment variable system for sensitive data
- The `.env.example` file is safe to commit (contains no real credentials)
- Rotate API keys if they are accidentally exposed

## Next Steps

After successful deployment:

1. ✅ Test all features on the production site
2. ✅ Set up monitoring and alerts
3. ✅ Configure custom domain (if needed)
4. ✅ Set up backup strategy for your database
5. ✅ Review and optimize performance metrics
