
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error("Connection Error:", error.message);
    console.error("Detailed Reason:");

    if (error.reason?.servers) {
      for (const [address, server] of error.reason.servers) {
        console.error("Server:", address);
        console.error("Error:", server.error?.message || "No details");
      }
    }

    throw error;
  }
};

export default connectDB;
