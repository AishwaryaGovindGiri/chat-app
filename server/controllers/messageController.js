import cloudinary from "../lb/cloudinary.js";
import { pool } from "../lb/db.js";
import { io, userSocketMap } from "../server.js";


// get all users except the logged in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT id, email, full_name, profile_pic, bio, created_at, updated_at
             FROM users
             WHERE id != $1`,
            [userId]
        );

        const filteredUsers = result.rows;

        const unseenMessages = {};

        const promises = filteredUsers.map(async (user) => {

            const msgResult = await pool.query(
                `SELECT *
                 FROM messages
                 WHERE sender_id = $1
                 AND receiver_id = $2
                 AND seen = false`,
                [user.id, userId]
            );

            if (msgResult.rows.length > 0) {
                unseenMessages[user.id] =
                    msgResult.rows.length;
            }

        });

        await Promise.all(promises);

        res.json({
            success: true,
            users: filteredUsers,
            unseenMessages
        });

    } catch (error) {

        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });

    }
};


// get all messages for selected user
export const getMessages = async (req, res) => {

    try {

        const { id: selectedUserId } = req.params;

        const myId = req.user.id;

        const result = await pool.query(
            `SELECT *
             FROM messages
             WHERE (sender_id = $1 AND receiver_id = $2)
                OR (sender_id = $2 AND receiver_id = $1)
             ORDER BY created_at ASC`,
            [myId, selectedUserId]
        );

        const messages = result.rows;


        await pool.query(
            `UPDATE messages
             SET seen = true
             WHERE sender_id = $1
             AND receiver_id = $2`,
            [selectedUserId, myId]
        );


        res.json({
            success: true,
            messages
        });

    } catch (error) {

        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });

    }

};


// api to mark msg as seen using msgid
export const markMessageAsSeen = async (req, res) => {

    try {

        const { id } = req.params;

        await pool.query(
            `UPDATE messages
             SET seen = true
             WHERE id = $1`,
            [id]
        );

        res.json({
            success: true
        });

    } catch (error) {

        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });

    }

};


// send message to selected user
export const sendMessage = async (req, res) => {

    try {

        const {
            text,
            image,
            gif_url
        } = req.body;

        const receiverId = req.params.id;

        const senderId = req.user.id;


        // ---------------- IMAGE ----------------

        let imageUrl;

        if (image) {

            const uploadResponse =
                await cloudinary.uploader.upload(image);

            imageUrl =
                uploadResponse.secure_url;
        }


        // ---------------- GIF ----------------

        // GIFs already come from GIPHY,
        // so we do NOT upload them to Cloudinary.

        const gifUrl = gif_url || null;


        // ---------------- SAVE MESSAGE ----------------

        const result = await pool.query(

            `INSERT INTO messages
                (
                    sender_id,
                    receiver_id,
                    text,
                    image,
                    gif_url
                )
             VALUES
                ($1, $2, $3, $4, $5)
             RETURNING *`,

            [
                senderId,
                receiverId,
                text || null,
                imageUrl || null,
                gifUrl
            ]

        );


        const newMessage =
            result.rows[0];


        // ---------------- SOCKET.IO ----------------

        const receiverSocketId =
            userSocketMap[receiverId];


        if (receiverSocketId) {

            io.to(receiverSocketId).emit(
                "newMessage",
                newMessage
            );

        }


        // ---------------- RESPONSE ----------------

        res.json({
            success: true,
            newMessage
        });


    } catch (error) {

        console.log(
            "Send Message Error:",
            error.message
        );

        res.json({
            success: false,
            message: error.message
        });

    }

};