import jwt from "jsonwebtoken";
import { pool } from "../lb/db.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await pool.query(
            "SELECT id, email, full_name, profile_pic, bio, created_at, updated_at FROM users WHERE id = $1",
            [decoded.userId]
        );
        const user = result.rows[0];

        if (!user) return res.json({ success: false, message: "User not found" });

        req.user = user;
        next();
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};