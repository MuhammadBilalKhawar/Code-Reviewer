import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not set");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB Connected Successfully");
    console.log(`   Database: ${conn.connection.db.databaseName}`);
    return conn;
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    if (err.name === "MongoServerError") {
      console.error("   Server Error - Check credentials and network access");
    } else if (err.name === "MongoNetworkError") {
      console.error("   Network Error - Check your internet connection");
    }
    throw err;
  }
};

export default connectDB;
