import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// function to connect with postgres
export const connectDB = async () => {
    try {
        await pool.connect();
        console.log("Database connected");
    } catch (error) {
        console.log(error.message);
    }
};