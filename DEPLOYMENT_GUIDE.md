# Complete Deployment Guide - Code Review App

## Overview
- **Backend**: Render (https://code-review-szuc.onrender.com)
- **Frontend**: Vercel (original URL: https://code-review-x5t83jpfn-alonepoetahmad-2032s-projects.vercel.app)
- **Database**: MongoDB Cloud
- **OAuth**: GitHub

---

## STEP 1: Backend Deployment (Render) - Setup

### 1.1 Create/Update Backend on Render
1. Go to **https://dashboard.render.com**
2. If you don't have the service, create a new **Web Service**
3. Connect your GitHub repository: `MuhammadAhmad-n17/Code-review`
4. Select the `backend` folder as root directory
5. Set Build Command: `npm install`
6. Set Start Command: `node server.js`

### 1.2 Set Environment Variables on Render
Go to **Environment** tab and set these variables:

```
CLIENT_URL=https://code-review-x5t83jpfn-alonepoetahmad-2032s-projects.vercel.app
SERVER_URL=https://code-review-szuc.onrender.com
PORT=5000
GITHUB_CLIENT_ID=[YOUR_GITHUB_CLIENT_ID]
GITHUB_CLIENT_SECRET=[YOUR_GITHUB_CLIENT_SECRET]
JWT_SECRET=[YOUR_JWT_SECRET]
MONGO_URI=mongodb+srv://[USER]:[PASSWORD]@[CLUSTER].mongodb.net/[DB_NAME]
GROQ_API_KEY=[YOUR_GROQ_API_KEY]
```

**⚠️ IMPORTANT**:
- `CLIENT_URL`: Must match your ACTUAL Vercel frontend URL (no trailing slash)
- `SERVER_URL`: Must match your Render backend URL (https://code-review-szuc.onrender.com)
- No trailing slashes on URLs

### 1.3 Verify Backend is Running
- Visit: https://code-review-szuc.onrender.com
- Should see: "AI Code Review SaaS Backend Running"
- Visit: https://code-review-szuc.onrender.com/debug/config
- Should see your environment variables (✓ Set for secrets)

---

## STEP 2: GitHub OAuth App Setup

### 2.1 Create/Update GitHub OAuth App
1. Go to **https://github.com/settings/developers**
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - **Application name**: Code Review
   - **Homepage URL**: `https://code-review-x5t83jpfn-alonepoetahmad-2032s-projects.vercel.app`
   - **Authorization callback URL**: `https://code-review-szuc.onrender.com/auth/github/callback`

4. **Copy**:
   - Client ID → Paste into `GITHUB_CLIENT_ID` on Render
   - Client Secret → Paste into `GITHUB_CLIENT_SECRET` on Render

### 2.2 Verify OAuth Settings
- Authorization callback URL must be **exactly**: `https://code-review-szuc.onrender.com/auth/github/callback`
- No variations, no trailing slash

---

## STEP 3: Frontend Deployment (Vercel)

### 3.1 Connect Frontend to Vercel
1. Go to **https://vercel.com/dashboard**
2. Import your GitHub repository: `MuhammadAhmad-n017/Code-review`
3. Select `frontend` folder as root
4. Vercel auto-detects Vite configuration
5. Click **Deploy**

### 3.2 Set Environment Variables on Vercel
After deployment:

1. Go to your project **Settings**
2. Click **Environment Variables**
3. Add:
   ```
   VITE_API_URL=https://code-review-szuc.onrender.com
   ```
4. Select all environments: **Production**, **Preview**, **Development**
5. Click **Save**

### 3.3 Add vercel.json for Client-Side Routing
File: `frontend/vercel.json`
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 3.4 Redeploy Vercel
1. Push the vercel.json to GitHub
2. Vercel auto-redeploys on git push
3. Or manually click **Redeploy** in Vercel dashboard

---

## STEP 4: Code Verification

### 4.1 Frontend Files - axiosConfig.js
File: `frontend/src/utils/axiosConfig.js`

Should have:
```javascript
const apiUrl = import.meta.env.VITE_API_URL || "https://code-review-szuc.onrender.com";
const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 4.2 Backend Files - authController.js
File: `backend/controllers/authController.js`

Should validate:
- `process.env.SERVER_URL` exists
- `process.env.CLIENT_URL` exists
- Redirects to GitHub with correct callback URL
- Redirects back to CLIENT_URL after GitHub auth

### 4.3 Frontend Files - AuthSuccess.jsx
File: `frontend/src/pages/AuthSuccess.jsx`

Should:
- Extract token from URL params
- Store token in localStorage
- Call `/auth/me` with Bearer token
- Store user data
- Redirect to `/dashboard`

---

## STEP 5: Testing OAuth Flow

### 5.1 Test Locally (Optional)
1. Backend: `npm run dev` in `backend/` folder (runs on http://localhost:5000)
2. Frontend: `npm run dev` in `frontend/` folder (runs on http://localhost:5173)
3. Create `.env.local` in frontend:
   ```
   VITE_API_URL=http://localhost:5000
   ```
4. Test GitHub login flow

### 5.2 Test on Production
1. Clear browser cache: **Ctrl+Shift+Delete**
2. Visit: `https://code-review-x5t83jpfn-alonepoetahmad-2032s-projects.vercel.app`
3. Open DevTools Console: **F12**
4. Click **"Sign in with GitHub"**
5. **Authorize** on GitHub
6. Should see loading animation
7. Should redirect to **Dashboard**
8. Should see your GitHub profile info

### 5.3 Check Console Logs
In browser DevTools Console, you should see:
```
🔧 Axios Config - API URL: https://code-review-szuc.onrender.com
🔍 AuthSuccess Page - URL search params: ?token=...
🔑 Token extracted: ✓ Found
💾 Token stored in localStorage
📡 Calling /auth/me endpoint with token...
✅ /auth/me response received: {...}
🚀 Redirecting to dashboard in 1.5 seconds...
```

---

## STEP 6: Troubleshooting

### Issue: 404 on `/auth/me`
**Solution**: 
- Check `VITE_API_URL` is set on Vercel
- Verify Backend `CLIENT_URL` matches your Vercel URL
- Redeploy both frontend and backend

### Issue: Redirects to wrong Vercel URL
**Solution**:
- Go to Render dashboard
- Update `CLIENT_URL` to your actual Vercel URL
- Service auto-restarts
- Test OAuth flow again

### Issue: GitHub OAuth returns error
**Solution**:
- Check GitHub OAuth app **Authorization callback URL** is exactly: `https://code-review-szuc.onrender.com/auth/github/callback`
- Check `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set on Render
- Verify they match your GitHub OAuth app settings

### Issue: localStorage not persisting
**Solution**:
- Check Browser Settings → Privacy
- Ensure localStorage is not blocked
- Try Incognito mode to test

---

## STEP 7: Deployment Checklist

Before considering deployment complete, verify:

- [ ] Backend running on Render: https://code-review-szuc.onrender.com
- [ ] `/debug/config` shows all env vars as "✓ Set"
- [ ] Frontend deployed on Vercel
- [ ] `VITE_API_URL` set on Vercel to Render backend URL
- [ ] `vercel.json` exists in frontend folder
- [ ] GitHub OAuth app callback URL is correct
- [ ] All env vars (CLIENT_URL, SERVER_URL) have no trailing slashes
- [ ] Can click "Sign in with GitHub" on login page
- [ ] GitHub authorization succeeds
- [ ] Redirected to `/auth-success` page
- [ ] Redirected to Dashboard
- [ ] GitHub profile info displayed
- [ ] Token in localStorage
- [ ] Can navigate to other pages

---

## Quick Reference: URLs

| Service | URL |
|---------|-----|
| Backend | `https://code-review-szuc.onrender.com` |
| Frontend | `https://code-review-x5t83jpfn-alonepoetahmad-2032s-projects.vercel.app` |
| OAuth Callback | `https://code-review-szuc.onrender.com/auth/github/callback` |
| Debug Endpoint | `https://code-review-szuc.onrender.com/debug/config` |

---

## Files to Verify

### Backend
- `backend/server.js` - CORS, routes, debug endpoint
- `backend/controllers/authController.js` - OAuth flow
- `backend/routes/authRoutes.js` - Routes defined
- `backend/middleware/auth.js` - JWT verification

### Frontend
- `frontend/src/utils/axiosConfig.js` - API client config
- `frontend/src/pages/AuthSuccess.jsx` - Token handling
- `frontend/src/App.jsx` - Login page
- `frontend/main.jsx` - React Router setup
- `frontend/vercel.json` - Client routing
- `frontend/.env.production` - Production env vars
- `frontend/.env.development` - Development env vars

---

## Environment Variables Summary

### Render Backend
```
CLIENT_URL = [Your Vercel Frontend URL]
SERVER_URL = https://code-review-szuc.onrender.com
PORT = 5000
GITHUB_CLIENT_ID = [From GitHub OAuth App]
GITHUB_CLIENT_SECRET = [From GitHub OAuth App]
JWT_SECRET = [Random secure string]
MONGO_URI = [Your MongoDB connection string]
GROQ_API_KEY = [Your Groq API key]
```

### Vercel Frontend
```
VITE_API_URL = https://code-review-szuc.onrender.com
```

### GitHub OAuth App
- **Homepage URL**: Your Vercel frontend URL
- **Authorization callback URL**: `https://code-review-szuc.onrender.com/auth/github/callback`

---

## Next Steps

1. Verify all environment variables are correctly set
2. Test GitHub OAuth flow end-to-end
3. If any step fails, check the specific error and reference the troubleshooting section
4. Monitor Render logs and Vercel logs for any deployment issues

**Need help?** Check browser console (F12) → Console tab for detailed error messages.
