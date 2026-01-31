# IMMEDIATE ACTIONS REQUIRED FOR GITHUB AUTH ON VERCEL

## ✅ Code Changes Complete

All necessary code fixes have been implemented and pushed to GitHub.

## 🔧 Required Configuration on Render Dashboard

### 1. Add/Update Environment Variables

Go to: https://dashboard.render.com → Your Backend Service → Environment

Add or update these variables:

```
SERVER_URL=https://code-review-szuc.onrender.com
CLIENT_URL=[YOUR_VERCEL_URL]
GITHUB_CLIENT_ID=[YOUR_GITHUB_CLIENT_ID]
GITHUB_CLIENT_SECRET=[YOUR_GITHUB_CLIENT_SECRET]
JWT_SECRET=[YOUR_JWT_SECRET]
MONGO_URI=[YOUR_MONGODB_URI]
GROQ_API_KEY=[YOUR_GROQ_API_KEY]
GROQ_MODEL=llama-3.3-70b-versatile
```

**Note**: Actual values should be stored in Render environment variables, not committed to Git.

**Important**: Replace `[YOUR_VERCEL_FRONTEND_URL]` with your actual Vercel deployment URL

### 2. Restart Render Service

After updating environment variables:

1. Go to your Render backend service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete

## 🐙 GitHub OAuth App Update

### Update Authorization Callback URL

1. Go to: https://github.com/settings/developers
2. Click on your OAuth App
3. Find "Authorization callback URL"
4. Update to: `https://code-review-szuc.onrender.com/auth/github/callback`
5. Save changes

## ✨ Frontend Deployment

### Deploy to Vercel

```bash
git push origin main
# Vercel auto-deploys on push
```

Vercel will automatically use:

- `.env.production` for production build
- Backend URL: `https://code-review-szuc.onrender.com`

## 🧪 Testing Checklist

### Before Testing

- [ ] All environment variables set on Render
- [ ] Render deployment restarted
- [ ] GitHub OAuth callback URL updated
- [ ] Frontend pushed to Vercel

### Test Procedure

1. Visit your Vercel frontend URL
2. Click "Sign in with GitHub"
3. Authorize the app
4. Should see dashboard after redirect

### If It Fails

1. Check Render logs for "GitHub callback error"
2. Verify all environment variables are set correctly
3. Check GitHub OAuth app settings match exactly
4. Open browser console for error messages
5. Check `/debug/config` endpoint on backend

## 📝 Quick Reference

| Service          | URL                                                |
| ---------------- | -------------------------------------------------- |
| Backend          | https://code-review-szuc.onrender.com              |
| Frontend         | https://your-vercel-url.vercel.app                 |
| Config Check     | https://code-review-szuc.onrender.com/debug/config |
| GitHub Settings  | https://github.com/settings/developers             |
| Render Dashboard | https://dashboard.render.com                       |

## 🚨 Common Issues & Fixes

| Issue                          | Fix                                                    |
| ------------------------------ | ------------------------------------------------------ |
| "Authorization error" on login | Check CLIENT_URL is set correctly on Render            |
| CORS error                     | Verify CLIENT_URL matches your Vercel domain exactly   |
| "No code received"             | Check GitHub OAuth callback URL is correct             |
| Blank page after login         | Check token is saved in localStorage (browser console) |
| "User not found"               | Check MongoDB connection string in MONGO_URI           |

## 📞 Support Info

If auth still doesn't work:

1. Check Render logs: Dashboard → Backend Service → "Logs"
2. Look for "🔐 Redirecting to GitHub OAuth" message
3. Look for "❌ GitHub callback error" for details
4. Verify the exact error in your browser network tab

---

**Status**: ✅ Code ready, awaiting configuration
**Next Step**: Set environment variables on Render and restart
