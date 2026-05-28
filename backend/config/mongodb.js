import mongoose from "mongoose";

const connectDB = async () => {
  // Log when MongoDB is connected
  mongoose.connection.on("connected", () => {
    console.log("✅ MongoDB Connected Successfully");
  });

  try {
    // Connect using the MONGODB_URI from .env
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Stop server if connection fails
  }
};

export default connectDB;
