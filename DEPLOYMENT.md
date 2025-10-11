# Deployment Guide - AI Adventure Engine

## Quick Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free tier) - sign up at https://vercel.com

### Step 1: Push to GitHub

```bash
# If you haven't already, create a GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/textgamea.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

**Option A: Via Vercel Dashboard (Easiest)**

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository (`textgamea`)
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click "Deploy"
6. Done! Your site will be live at `https://your-project.vercel.app`

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from project root
vercel

# Follow prompts - it will auto-detect settings from vercel.json
```

### Step 3: Enable Automatic Deployments

Vercel automatically sets up continuous deployment:
- **Every push to `main`** → Automatic production deployment
- **Pull requests** → Preview deployments
- **Deployment time** → Typically <3 minutes

### Step 4: Verify Deployment

Visit your deployment URL and verify:
- ✅ Test Harness loads
- ✅ API key can be entered and saved
- ✅ Preset buttons work
- ✅ API calls to OpenAI succeed
- ✅ HTTPS is enabled (automatic with Vercel)

---

## Alternative: Deploy to Netlify

### Step 1: Create `netlify.toml`

Already configured in the repository.

### Step 2: Deploy

1. Go to https://app.netlify.com/start
2. Connect your GitHub repository
3. Build settings (should auto-detect):
   - **Build command:** `cd frontend && npm run build`
   - **Publish directory:** `frontend/dist`
4. Click "Deploy site"

---

## Configuration Files

### `vercel.json`
```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "framework": "vite"
}
```

### `netlify.toml`
```toml
[build]
  command = "cd frontend && npm run build"
  publish = "frontend/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Build Verification

Test the production build locally:

```bash
# Build
npm run build

# Preview the build
npm run preview

# Open http://localhost:4173
```

**Build Output:**
- `dist/index.html` - ~0.45 KB
- `dist/assets/*.css` - ~5 KB
- `dist/assets/*.js` - ~45 KB
- **Total: ~50 KB** (well under 1MB requirement)

---

## Environment Variables

**Note:** This app requires **NO server-side environment variables**!

- API keys are user-provided through the UI
- Keys are stored in browser localStorage only
- No backend configuration needed

---

## Troubleshooting

### Build fails with "command not found"
- Ensure `package.json` is in the `frontend/` directory
- Verify build command in vercel.json: `cd frontend && npm run build`

### Styles not loading
- Check that `@tailwindcss/postcss` is installed
- Verify `postcss.config.js` uses `'@tailwindcss/postcss'`

### API calls fail in production
- User must provide their own OpenAI API key
- Check browser console for CORS or network errors
- Verify HTTPS is enabled (required for localStorage)

### 404 errors on page refresh
- SPA routing requires redirect rules
- Vercel: handled by `rewrites` in vercel.json
- Netlify: handled by `redirects` in netlify.toml

---

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate auto-provisioned

### Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Update DNS records
4. SSL certificate auto-provisioned

---

## Deployment Checklist

Before going live:

- [ ] Production build succeeds locally (`npm run build`)
- [ ] All tests pass (`npm test`)
- [ ] Test harness works in production
- [ ] API key input/storage functions correctly
- [ ] World generation works with user's API key
- [ ] Narrative generation works
- [ ] HTTPS enabled
- [ ] Custom domain configured (if desired)
- [ ] README updated with live URL

---

## Monitoring

### Vercel Analytics (Optional)
- Enable in Project Settings → Analytics
- Track page views, performance
- Free tier: 100k events/month

### Error Tracking
- Check browser console for client-side errors
- Vercel logs: `vercel logs <deployment-url>`
- User-reported issues via GitHub Issues

---

## Rollback

If a deployment breaks production:

**Vercel:**
```bash
vercel rollback
```

**Or via dashboard:**
1. Go to Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

---

## Cost

**Vercel Free Tier:**
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- Perfect for this project

**Netlify Free Tier:**
- 300 build minutes/month
- 100 GB bandwidth/month
- Automatic HTTPS

**Note:** API costs are paid by users (their own OpenAI keys)

---

## Support

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Project Issues: GitHub Issues tab
