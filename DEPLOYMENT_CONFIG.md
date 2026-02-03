# Deployment Configuration for Vercel & Render

## Frontend (Vercel)

### Environment Variables Setup
Add this environment variable in your Vercel project settings:

**Production:**
```
VITE_API_URL=https://your-backend-url.onrender.com
```

**Steps to deploy on Vercel:**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Set the environment variable `VITE_API_URL` to your Render backend URL
4. Deploy!

**Local Development:**
- Use `.env.local` with `VITE_API_URL=http://localhost:5000`
- Run `npm run dev`

---

## Backend (Render)

### Environment Variables Required
Add these environment variables in your Render service settings:

```
PORT=5000
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-backend-url.onrender.com/auth/github/callback
CLIENT_URL=https://your-frontend-url.vercel.app
GROQ_API_KEY=your_groq_api_key
SONARCLOUD_TOKEN=your_sonarcloud_token (optional)
SONARCLOUD_ORGANIZATION=your_organization (optional)
```

**Steps to deploy on Render:**
1. Create a new Web Service on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && node server.js`
5. Add all environment variables listed above
6. Deploy!

---

## GitHub OAuth Configuration

After deploying, update your GitHub OAuth App:
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Update **Authorization callback URL** to: `https://your-backend-url.onrender.com/auth/github/callback`
3. Update **Homepage URL** to: `https://your-frontend-url.vercel.app`

---

## Quick Switch Between Local & Production

**For Local Development:**
```bash
# Frontend
cd frontend
npm run dev   # Uses .env.local (localhost:5000)

# Backend
cd backend
npm run dev   # Uses .env (local settings)
```

**For Production:**
- Frontend automatically uses Vercel environment variables
- Backend automatically uses Render environment variables
