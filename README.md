# 🤖 AI Code Review SaaS

A cutting-edge AI-powered code review platform that provides intelligent code analysis, automated testing, and quality insights using advanced AI models.

## 🌟 Features

### **AI-Powered Code Analysis**
- **Pull Request Reviews**: Automated analysis of GitHub pull requests with AI-generated insights
- **Commit Reviews**: Deep analysis of individual commits
- **Real-time Feedback**: Instant code quality assessments
- **Issue Detection**: Identifies bugs, security vulnerabilities, performance issues, and code smells

### **Advanced Testing Suite**
All tests use AI to fetch actual repository code, generate test configurations, and run real analysis:

- **🔍 ESLint Analysis**: AI generates custom ESLint configs and finds syntax errors, unused variables, and style violations
- **🎨 Prettier Formatting**: Automated code formatting analysis with generated Prettier rules
- **🧪 Jest Unit Testing**: AI generates test files and analyzes coverage
- **🔒 Security Scanning**: Detects hardcoded credentials, SQL injection, XSS vulnerabilities
- **⚡ Performance Analysis**: Finds inefficient algorithms, memory leaks, and bottlenecks
- **♿ Accessibility Checks**: WCAG compliance validation with ARIA label verification

### **GitHub Actions Integration**
- **Workflow Generation**: AI creates custom GitHub Actions workflows
- **One-Click Commit**: Commit workflows directly to `.github/workflows/`
- **Auto-Trigger**: Workflows run on every push and pull request
- **Real-time Status**: Track workflow execution and results

### **Premium UI/UX**
- **Dark Theme**: Modern neon/glass design with Tailwind v4
- **Animated Backgrounds**: Professional gradient animations
- **Interactive Dashboard**: Comprehensive stats and metrics
- **Responsive Design**: Optimized for all devices

## 🏗️ Architecture

### **Tech Stack**

#### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI Model**: Groq API (llama-3.3-70b-versatile)
- **Authentication**: GitHub OAuth with JWT
- **API Integration**: GitHub REST API v3

#### Frontend
- **Framework**: React 19.1.1 with Vite 7.1.2
- **Routing**: React Router DOM v7.9.6
- **Styling**: Tailwind CSS v4.1.17
- **HTTP Client**: Axios
- **Markdown**: React Markdown

### **Project Structure**

```
Code-Reviewer/
├── backend/
│   ├── controllers/
│   │   ├── advancedTestingController.js    # AI testing logic
│   │   ├── authController.js               # OAuth & JWT
│   │   ├── githubController.js             # GitHub API
│   │   └── reviewController.js             # Code review logic
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── githubRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── testingRoutes.js
│   ├── models/
│   │   ├── Review.js                       # Review schema
│   │   ├── Testing.js                      # Testing schema
│   │   └── User.js                         # User schema
│   ├── utils/
│   │   ├── dynamicTestingService.js        # AI test generation & analysis
│   │   ├── githubapi.js                    # GitHub API wrapper
│   │   └── groqClient.js                   # AI client
│   ├── middleware/
│   │   ├── auth.js                         # JWT verification
│   │   └── catchasync.js                   # Error handling
│   ├── config/
│   │   └── db.js                           # MongoDB connection
│   ├── server.js                           # Express server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx               # Main dashboard
│   │   │   ├── AdvancedTesting.jsx         # Testing selection
│   │   │   ├── AdvancedTestingResults.jsx  # Test results
│   │   │   ├── Repositories.jsx            # Repo list
│   │   │   ├── RepositoryDetail.jsx        # Repo details
│   │   │   ├── PullRequestDetail.jsx       # PR analysis
│   │   │   ├── CommitDetail.jsx            # Commit analysis
│   │   │   ├── ReviewResults.jsx           # Review results
│   │   │   ├── Settings.jsx                # User settings
│   │   │   ├── Documentation.jsx           # Docs page
│   │   │   └── AuthSuccess.jsx             # OAuth callback
│   │   ├── components/
│   │   │   ├── Layout.jsx                  # App layout
│   │   │   ├── ProtectedRoute.jsx          # Auth guard
│   │   │   └── ui/                         # UI components
│   │   ├── context/
│   │   │   └── ThemeContext.jsx            # Theme provider
│   │   ├── utils/
│   │   │   └── axiosConfig.js              # HTTP config
│   │   └── main.jsx                        # App entry
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- GitHub Account
- Groq API Key

### **1. Clone Repository**
```bash
git clone https://github.com/YOUR_USERNAME/Code-Reviewer.git
cd Code-Reviewer
```

### **2. Backend Setup**

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Variables
Create `backend/.env`:
```env
# Server
PORT=5000
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb://localhost:27017/code-review
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/code-review

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# JWT
JWT_SECRET=your_jwt_secret_min_32_characters

# AI
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

#### Start Backend
```bash
npm run dev
```
Backend runs on http://localhost:5000

### **3. Frontend Setup**

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Environment Variables
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

#### Start Frontend
```bash
npm run dev
```
Frontend runs on http://localhost:5173

### **4. GitHub OAuth Setup**

1. Go to https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in details:
   - **Application name**: Code Review SaaS
   - **Homepage URL**: http://localhost:5173
   - **Authorization callback URL**: http://localhost:5000/auth/github/callback
4. Click **Register application**
5. Copy **Client ID** and **Client Secret** to backend `.env`
6. **Important**: Update OAuth scope in `backend/controllers/authController.js` to include `repo` access:
   ```javascript
   const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${
     process.env.GITHUB_CLIENT_ID
   }&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email,repo`;
   ```

### **5. Get Groq API Key**

1. Visit https://console.groq.com
2. Sign up/login
3. Go to **API Keys** section
4. Create new API key
5. Copy to backend `.env`

## 📱 Usage

### **Login**
1. Open http://localhost:5173
2. Click **Login with GitHub**
3. Authorize the application
4. You'll be redirected to the dashboard

### **Review Pull Request**
1. Navigate to **Repositories**
2. Select a repository
3. Click on a pull request
4. View AI-generated review with issues and suggestions

### **Run Advanced Tests**
1. Go to **Advanced Testing** from dashboard
2. Select a repository
3. Choose test types (can select multiple)
4. Click **Run Selected Tests**
5. View detailed results with scores and issues
6. Optionally commit workflow to GitHub

### **Commit Workflow**
1. After test completion, click **Commit to GitHub**
2. Confirm workflow details in popup
3. Workflow is saved to `.github/workflows/`
4. Auto-runs on every push/PR

## 🔌 API Endpoints

### **Authentication**
- `GET /auth/github` - Initiate GitHub OAuth
- `GET /auth/github/callback` - OAuth callback

### **GitHub**
- `GET /api/github/repos` - List user repositories
- `GET /api/github/repos/:owner/:repo` - Get repository details
- `GET /api/github/repos/:owner/:repo/pulls` - List pull requests
- `GET /api/github/repos/:owner/:repo/commits` - List commits
- `GET /api/github/repos/:owner/:repo/documentation` - Generate AI docs

### **Reviews**
- `POST /api/reviews` - Create PR review
- `POST /api/reviews/commit` - Create commit review
- `GET /api/reviews` - List user reviews
- `GET /api/reviews/stats` - Get review statistics
- `GET /api/reviews/:id` - Get review details

### **Testing**
- `GET /api/testing/available` - List available tests
- `POST /api/testing/dynamic` - Run AI test locally
- `POST /api/testing/commit-workflow` - Commit workflow to GitHub
- `GET /api/testing/history` - Get test history
- `GET /api/testing/stats` - Get test statistics
- `GET /api/testing/:id` - Get test result
- `DELETE /api/testing/:id` - Delete test result

## 🎨 UI Components

The app uses a custom component library with Tailwind v4:

- **Button**: Primary, secondary, accent, ghost variants
- **Card**: Glass-morphism design with gradients
- **Badge**: Status indicators with color variants
- **Spinner**: Loading animations
- **Alert**: Error and success messages
- **Grid**: Responsive grid layouts
- **Flex**: Flexbox utilities
- **Container**: Consistent page containers

## 🧪 Testing Flow

### **How AI Testing Works**

1. **User Selects Test**: Choose test type (ESLint, Security, etc.)
2. **Fetch Repository Code**: System retrieves up to 20 files from GitHub
3. **AI Generates Config**: AI creates test-specific configurations (e.g., `.eslintrc.json`, Jest tests)
4. **Run Analysis**: AI analyzes actual code against generated config
5. **Parse Results**: Extract score, issues, recommendations with file:line references
6. **Display Results**: Show comprehensive report with commit option
7. **Optional Commit**: User can commit workflow to GitHub for continuous testing

### **Test Types**

| Test | Generated Config | Analysis |
|------|-----------------|----------|
| ESLint | `.eslintrc.json` | Syntax errors, unused vars, style issues |
| Prettier | `.prettierrc` | Formatting inconsistencies |
| Jest | Test files | Unit tests, coverage analysis |
| Security | Security scan config | Hardcoded secrets, SQL injection, XSS |
| Performance | Performance rules | Inefficient algorithms, memory leaks |
| Accessibility | A11y rules | WCAG compliance, ARIA labels |

## 🚢 Deployment

### **Backend Deployment (Render)**

1. Create account on https://render.com
2. Click **New** → **Web Service**
3. Connect GitHub repository
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Environment Variables:
   ```
   CLIENT_URL=https://your-frontend-url.vercel.app
   SERVER_URL=https://your-backend-url.onrender.com
   PORT=5000
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   JWT_SECRET=your_jwt_secret
   MONGO_URI=your_mongodb_uri
   GROQ_API_KEY=your_groq_key
   GROQ_MODEL=llama-3.3-70b-versatile
   ```
6. Click **Create Web Service**

### **Frontend Deployment (Vercel)**

1. Create account on https://vercel.com
2. Click **New Project**
3. Import GitHub repository
4. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
6. Click **Deploy**

### **Update GitHub OAuth**

After deployment, update your GitHub OAuth App:
1. Go to https://github.com/settings/developers
2. Select your OAuth App
3. Update **Homepage URL**: Your Vercel URL
4. Update **Authorization callback URL**: `https://your-backend-url.onrender.com/auth/github/callback`

## 🔐 Security

- **JWT Authentication**: Secure token-based auth
- **GitHub OAuth**: Industry-standard OAuth 2.0
- **Environment Variables**: Sensitive data isolated
- **CORS**: Configured for specific origins
- **Input Validation**: All user inputs sanitized
- **MongoDB**: Secure connection with auth

## 📊 Database Schema

### **User**
```javascript
{
  githubId: String,
  login: String,
  email: String,
  avatarUrl: String,
  githubAccessToken: String (encrypted),
  createdAt: Date
}
```

### **Review**
```javascript
{
  user: ObjectId,
  owner: String,
  repository: String,
  prNumber: Number,
  commitSha: String,
  issues: [{
    file: String,
    line: Number,
    severity: String,
    type: String,
    message: String,
    suggestion: String
  }],
  overallScore: Number,
  grade: String,
  createdAt: Date
}
```

### **Testing**
```javascript
{
  user: ObjectId,
  owner: String,
  repo: String,
  testType: String,
  status: String (COMPLETED/ERROR/RUNNING),
  overallScore: Number,
  grade: String,
  results: Object,
  createdAt: Date
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Groq**: AI model provider
- **GitHub**: OAuth and API
- **MongoDB**: Database
- **Tailwind CSS**: Styling framework
- **React**: Frontend framework
- **Express**: Backend framework

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@codereview.com
- Documentation: http://localhost:5173/documentation

## 🗺️ Roadmap

- [ ] Support for GitLab and Bitbucket
- [ ] Custom AI model training
- [ ] Team collaboration features
- [ ] Slack/Discord notifications
- [ ] CI/CD pipeline integration
- [ ] Code metrics dashboard
- [ ] Historical trend analysis
- [ ] Multi-language support
- [ ] VS Code extension
- [ ] Mobile app

---

**Made with ❤️ by the Code Review Team**

*Powered by AI | Built for Developers*
