# GitHub OAuth on Vercel - Configuration Guide

## Problem

GitHub OAuth callbacks are failing when the frontend is deployed on Vercel and the backend is on Render.

## Root Cause

The backend environment variables on Render must match your actual deployment URLs:

- `SERVER_URL` must be the backend URL on Render (e.g., `https://code-review-szuc.onrender.com`)
- `CLIENT_URL` must be the frontend URL on Vercel

## Solution: Set Environment Variables on Render

Go to your Render backend dashboard and add these environment variables:

### Production (Vercel + Render)

```
SERVER_URL=https://code-review-szuc.onrender.com
CLIENT_URL=https://your-vercel-domain.vercel.app

GITHUB_CLIENT_ID=[YOUR_ID]
GITHUB_CLIENT_SECRET=[YOUR_SECRET]

JWT_SECRET=[YOUR_JWT_SECRET]

MONGO_URI=[YOUR_MONGODB_CONNECTION_STRING]

GROQ_API_KEY=[YOUR_GROQ_API_KEY]
GROQ_MODEL=llama-3.3-70b-versatile
```

**Security**: Store actual secrets in environment variables on Render dashboard, never commit to Git.

## GitHub OAuth Settings

Update your GitHub App OAuth settings:

1. Go to https://github.com/settings/developers
2. Find your OAuth App
3. Set **Authorization callback URL** to:
   ```
   https://code-review-szuc.onrender.com/auth/github/callback
   ```

## Frontend Setup

- Production: Uses `.env.production` with `VITE_API_URL=https://code-review-szuc.onrender.com`
- Development: Uses `.env.development` with `VITE_API_URL=http://localhost:5000`

## Auth Flow

1. User clicks "Sign in with GitHub" on frontend
2. Frontend redirects to: `{API_URL}/auth/github`
3. Backend redirects to GitHub OAuth
4. GitHub redirects to: `{SERVER_URL}/auth/github/callback`
5. Backend exchanges code for token, creates JWT
6. Backend redirects to: `{CLIENT_URL}/auth-success?token={JWT}`
7. Frontend stores token and fetches user data
8. User is logged in!

## Troubleshooting

If auth still fails:

1. **Check Render Environment Variables**

   - Verify `SERVER_URL` and `CLIENT_URL` are correct
   - Restart the Render deployment after changing env vars

2. **Check GitHub OAuth App Settings**

   - Verify callback URL matches exactly: `{SERVER_URL}/auth/github/callback`

3. **Check Browser Console**

   - Look for CORS errors
   - Check if redirects are happening correctly

4. **Check Render Logs**

   - Look for "GitHub callback error" messages
   - Verify token exchange is working

5. **CORS Issues**
   - Backend has been configured with proper CORS for Vercel
   - If you're getting CORS errors, ensure `CLIENT_URL` env var is set on Render

## Quick Checklist

- [ ] `SERVER_URL` env var is set to your Render backend URL on Render
- [ ] `CLIENT_URL` env var is set to your Vercel frontend URL on Render
- [ ] GitHub OAuth callback URL is set correctly in GitHub app settings
- [ ] Render deployment has been restarted after env var changes
- [ ] Frontend `.env.production` has correct `VITE_API_URL`
- [ ] No typos in any URLs
