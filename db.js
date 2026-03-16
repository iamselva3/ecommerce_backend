import mongoose from "mongoose";
import dns from "dns";

export const connectDB = async () => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("MONGODB_URI is not defined in .env");
    }

    try {
        try {
            dns.setServers(['8.8.8.8', '8.8.4.4']);
            console.log("📡 Set DNS to Google (8.8.8.8) to bypass local block");
        } catch (e) {
            console.log("Could not force DNS servers, checking system default...");
        }

        console.log("Connecting to MongoDB...");

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            family: 4,
        });

        console.log("✅ MongoDB connected successfully");

    } catch (err) {
        console.error("❌ MongoDB connection failed");
        console.error(err.message);
        process.exit(1);
    }
};
