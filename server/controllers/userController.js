import { generateToken } from "../lb/utlis.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lb/cloudinary.js";
import { pool } from "../lb/db.js";

export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;
    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: "Missing Details" });
        }

        const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existing.rows.length > 0) {
            return res.json({ success: false, message: "Account already exits" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await pool.query(
            `INSERT INTO users (full_name, email, password, bio)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [fullName, email, hashedPassword, bio]
        );
        const newUser = result.rows[0];
        const token = generateToken(newUser.id);

        res.json({ success: true, userData: newUser, token, message: "Account created successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: true, message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const userData = result.rows[0];

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "invalid credentials" });
        }

        const token = generateToken(userData.id);
        res.json({ success: true, userData, token, message: "Login successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: true, message: error.message });
    }
};

export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user });
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user.id;
        let updatedUser;

        if (!profilePic) {
            const result = await pool.query(
                `UPDATE users SET bio = $1, full_name = $2, updated_at = NOW()
                 WHERE id = $3 RETURNING *`,
                [bio, fullName, userId]
            );
            updatedUser = result.rows[0];
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            const result = await pool.query(
                `UPDATE users SET profile_pic = $1, bio = $2, full_name = $3, updated_at = NOW()
                 WHERE id = $4 RETURNING *`,
                [upload.secure_url, bio, fullName, userId]
            );
            updatedUser = result.rows[0];
        }
        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};