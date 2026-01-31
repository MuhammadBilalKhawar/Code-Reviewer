import mongoose from "mongoose";
import dotenv from "dotenv";
import Review from "./models/Review.js";
import User from "./models/User.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Get or create a demo user
    let user = await User.findOne({ login: "demo-user" });
    if (!user) {
      user = await User.create({
        githubId: 999999,
        name: "Demo User",
        login: "demo-user",
        email: "demo@example.com",
        avatar: "https://avatars.githubusercontent.com/u/1?v=4",
        githubAccessToken: "demo-token",
      });
      console.log("✅ Demo user created");
    }

    // Clear existing reviews for demo user
    await Review.deleteMany({ user: user._id });
    console.log("🗑️  Cleared existing reviews");

    // Create sample reviews with realistic data
    const reviews = [
      {
        user: user._id,
        owner: "facebook",
        repo: "react",
        pullNumber: 27845,
        summary: "Found 5 issues",
        issues: [
          {
            file: "src/core/ReactFiberClassComponent.js",
            line: 245,
            severity: "high",
            type: "performance",
            message: "Unnecessary re-renders detected in component lifecycle",
            suggestion: "Consider using useMemo to optimize re-renders",
          },
          {
            file: "src/core/ReactFiberHooks.js",
            line: 312,
            severity: "medium",
            type: "bug",
            message: "Hook dependency array is missing variables",
            suggestion:
              "Add all dependencies to the useEffect dependency array",
          },
          {
            file: "src/core/ReactFiberScheduler.js",
            line: 89,
            severity: "low",
            type: "style",
            message: "Inconsistent code formatting",
            suggestion: "Format code according to project standards",
          },
          {
            file: "src/core/ReactFiberScheduler.js",
            line: 156,
            severity: "medium",
            type: "security",
            message: "Potential XSS vulnerability",
            suggestion: "Sanitize user input before rendering",
          },
          {
            file: "src/core/ReactDOM.js",
            line: 423,
            severity: "high",
            type: "bug",
            message: "Missing null check before property access",
            suggestion: "Add null/undefined checks before accessing properties",
          },
        ],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        user: user._id,
        owner: "vercel",
        repo: "next.js",
        pullNumber: 52341,
        summary: "Found 3 issues",
        issues: [
          {
            file: "packages/next/server/render.ts",
            line: 134,
            severity: "high",
            type: "performance",
            message: "Synchronous operations blocking event loop",
            suggestion: "Convert to async/await pattern",
          },
          {
            file: "packages/next/server/lib/utils.ts",
            line: 67,
            severity: "low",
            type: "style",
            message: "Unused variable declaration",
            suggestion: "Remove unused variable or use it",
          },
          {
            file: "packages/next/client/index.ts",
            line: 211,
            severity: "medium",
            type: "bug",
            message: "Race condition in async state update",
            suggestion: "Use AbortController to cancel pending requests",
          },
        ],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        user: user._id,
        owner: "angular",
        repo: "angular",
        pullNumber: 48756,
        summary: "Found 2 issues",
        issues: [
          {
            file: "packages/core/src/change_detection/differs/default_iterable_differ.ts",
            line: 289,
            severity: "medium",
            type: "performance",
            message: "O(n²) algorithm used for array comparison",
            suggestion: "Optimize to O(n) using hash-based comparison",
          },
          {
            file: "packages/common/src/pipes/common_pipes.ts",
            line: 145,
            severity: "low",
            type: "style",
            message: "Missing JSDoc comments",
            suggestion: "Add documentation for public API",
          },
        ],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        user: user._id,
        owner: "vuejs",
        repo: "vue",
        pullNumber: 9834,
        summary: "Found 4 issues",
        issues: [
          {
            file: "packages/reactivity/src/reactive.ts",
            line: 78,
            severity: "high",
            type: "bug",
            message: "Proxy handler missing trap implementations",
            suggestion: "Implement all required proxy traps",
          },
          {
            file: "packages/runtime-core/src/component.ts",
            line: 234,
            severity: "medium",
            type: "security",
            message: "Unvalidated user input in template",
            suggestion: "Validate and sanitize template content",
          },
          {
            file: "packages/runtime-dom/src/index.ts",
            line: 56,
            severity: "low",
            type: "style",
            message: "Deprecated API usage",
            suggestion: "Use new API: useComposable instead of use",
          },
          {
            file: "packages/compiler-core/src/ast.ts",
            line: 412,
            severity: "high",
            type: "performance",
            message: "Memory leak in AST node caching",
            suggestion: "Implement WeakMap for automatic garbage collection",
          },
        ],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        user: user._id,
        owner: "sveltejs",
        repo: "svelte",
        pullNumber: 7234,
        summary: "Found 1 issue",
        issues: [
          {
            file: "src/compiler/compile/index.ts",
            line: 145,
            severity: "medium",
            type: "bug",
            message: "Component scoping conflict in nested components",
            suggestion: "Use unique namespace for component styles",
          },
        ],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ];

    await Review.insertMany(reviews);
    console.log(`✅ Seeded ${reviews.length} sample reviews`);

    // Display stats
    const totalReviews = await Review.countDocuments({ user: user._id });
    const allIssues = await Review.aggregate([
      { $match: { user: user._id } },
      { $unwind: "$issues" },
      { $group: { _id: "$issues.severity", count: { $sum: 1 } } },
    ]);

    console.log(`\n📊 Dashboard Stats:`);
    console.log(`   Total Reviews: ${totalReviews}`);
    console.log(`   Issues by Severity:`);
    allIssues.forEach((item) => {
      console.log(`     - ${item._id}: ${item.count}`);
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding Error:", err.message);
    process.exit(1);
  }
};

connectDB().then(seedData);
