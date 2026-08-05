import cloudinary from "../lb/cloudinary.js";
import { pool } from "../lb/db.js";
import { io, userSocketMap } from "../server.js";

// get all users except the logged in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            `SELECT id, email, full_name, profile_pic, bio, created_at, updated_at
             FROM users WHERE id != $1`,
            [userId]
        );
        const filteredUsers = result.rows;

        const unseenMessages = {};
        const promises = filteredUsers.map(async (user) => {
            const msgResult = await pool.query(
                "SELECT * FROM messages WHERE sender_id = $1 AND receiver_id = $2 AND seen = false",
                [user.id, userId]
            );
            if (msgResult.rows.length > 0) {
                unseenMessages[user.id] = msgResult.rows.length;
            }
        });
        await Promise.all(promises);
        res.json({ success: true, users: filteredUsers, unseenMessages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// get all messages for selected user
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user.id;

        const result = await pool.query(
            `SELECT * FROM messages
             WHERE (sender_id = $1 AND receiver_id = $2)
                OR (sender_id = $2 AND receiver_id = $1)
             ORDER BY created_at ASC`,
            [myId, selectedUserId]
        );
        const messages = result.rows;

        await pool.query(
            "UPDATE messages SET seen = true WHERE sender_id = $1 AND receiver_id = $2",
            [selectedUserId, myId]
        );

        res.json({ success: true, messages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// api to mark msg as seen using msgid
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("UPDATE messages SET seen = true WHERE id = $1", [id]);
        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// send message to selected user
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user.id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const result = await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, text, image)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [senderId, receiverId, text, imageUrl]
        );
        const newMessage = result.rows[0];

        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.json({ success: true, newMessage });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};