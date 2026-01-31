# Backend & Frontend Communication Fixes

## Issues Fixed

### 1. **CORS Configuration** (Backend)

**Problem**: Generic CORS allowed all origins, causing credential issues
**Solution**: Explicit CORS configuration with:

- ✅ Credentials enabled (`credentials: true`)
- ✅ Specific allowed origins (SERVER_URL, localhost variants)
- ✅ Authorization header explicitly allowed
- ✅ All HTTP methods supported

**File**: `backend/server.js`

### 2. **Axios Configuration** (Frontend)

**Problem**: Inconsistent axios instances, missing token injection, no credential support
**Solution**: Centralized axios config file with:

- ✅ Single `api` instance for all requests
- ✅ Automatic token injection from localStorage
- ✅ Credentials enabled for all requests
- ✅ Centralized error handling (401 redirects)
- ✅ Interceptors for request/response

**File**: `frontend/src/utils/axiosConfig.js`

### 3. **GitHub OAuth Error Handling** (Backend)

**Problem**: No error handling for GitHub OAuth failures, redirect errors not shown
**Solution**: Enhanced error handling with:

- ✅ Error parameter checking from GitHub
- ✅ User-friendly error redirects
- ✅ Detailed console logging for debugging
- ✅ Proper error descriptions in redirect params
- ✅ SERVER_URL validation

**File**: `backend/controllers/authController.js`

### 4. **Auth Success Page** (Frontend)

**Problem**: Still using old axios syntax, not using centralized config
**Solution**: Updated to use:

- ✅ Centralized `api` instance
- ✅ Proper error handling
- ✅ Removed manual header setting

**File**: `frontend/src/pages/AuthSuccess.jsx`

### 5. **All Frontend API Calls**

**Problem**: Scattered axios imports and inconsistent API URL handling
**Solution**: Updated all pages to use centralized config:

- ✅ App.jsx
- ✅ AuthSuccess.jsx
- ✅ Layout.jsx
- ✅ Dashboard.jsx
- ✅ Repositories.jsx
- ✅ RepositoryDetail.jsx
- ✅ PullRequestDetail.jsx
- ✅ ReviewResults.jsx
- ✅ CommitDetail.jsx
- ✅ Settings.jsx
- ✅ Documentation.jsx
- ✅ ProtectedRoute.jsx

### 6. **Environment Configuration**

**Files Created/Updated**:

- `.env.production` → Backend URL for production
- `.env.development` → Localhost for development
- `.env.local` → Local overrides

## How to Deploy

### On Render (Backend)

Add these environment variables in Render dashboard:

```
SERVER_URL=https://code-review-szuc.onrender.com
CLIENT_URL=https://your-vercel-url.vercel.app
JWT_SECRET=your-secret
GITHUB_CLIENT_ID=your-id
GITHUB_CLIENT_SECRET=your-secret
MONGO_URI=your-mongodb-uri
GROQ_API_KEY=your-groq-key
```

### On Vercel (Frontend)

Frontend automatically uses:

- Production: `.env.production` (with live backend URL)
- Development: `.env.development` (with localhost)

## Testing Auth Flow

1. **Local Testing** (both localhost):

   - Backend: `npm run dev` (localhost:5000)
   - Frontend: `npm run dev` (localhost:5173)
   - Set `CLIENT_URL=http://localhost:5173` in backend `.env`

2. **Production Testing** (Vercel + Render):
   - Set correct `SERVER_URL` and `CLIENT_URL` on Render
   - Restart Render deployment
   - Update GitHub OAuth callback URL to include Render backend
   - Test from Vercel frontend URL

## Error Indicators

If you see these errors, check the corresponding item:

| Error                               | Check                                                   |
| ----------------------------------- | ------------------------------------------------------- |
| "No authorization code provided"    | GitHub redirect working but parameter missing           |
| "Failed to get GitHub access token" | GitHub Client ID/Secret incorrect or permissions denied |
| CORS error                          | CLIENT_URL env var not set on Render                    |
| "User not found"                    | MongoDB connection or user creation failed              |
| Blank page after login              | Token not stored in localStorage                        |

## Quick Verification

Run this in browser console on the login page:

```javascript
// Check frontend config
console.log("API URL:", import.meta.env.VITE_API_URL);

// Check stored token after auth
console.log("Token:", localStorage.getItem("token"));
console.log("User:", localStorage.getItem("user"));
```

Check backend config endpoint:

```
https://code-review-szuc.onrender.com/debug/config
```

Should show all required env vars are set ✓
