import pkg from "pg";

const { Pool } = pkg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on("error", (error) => {
    console.log("Unexpected PostgreSQL pool error:", error.message);
});

export const connectDB = async () => {
    try {
        await pool.query("SELECT 1");
        console.log("Database connected");
    } catch (error) {
        console.log("Database connection error:", error.message);
    }
};