import mongoose from 'mongoose';

const db = async () => {

    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

export default db;