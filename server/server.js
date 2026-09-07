import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lb/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import { Server } from "socket.io";


// create Express app and http server
const app = express();

const server = http.createServer(app);


// initialize socket.io server
export const io = new Server(server, {
    cors: {
        origin: "*"
    }
});


// store online users
// { userId : socketId }
export const userSocketMap = {};


// socket.io connection handler
io.on("connection", (socket) => {

    const userId = socket.handshake.query.userId;

    console.log("User Connected:", userId);
    console.log("Socket ID:", socket.id);


    if (userId) {
        userSocketMap[userId] = socket.id;
    }


    // Emit online users to all connected clients
    io.emit(
        "getOnlineUsers",
        Object.keys(userSocketMap)
    );


    socket.on("disconnect", () => {

        console.log("User Disconnected:", userId);
        console.log("Socket ID:", socket.id);


        // Only remove the user if this socket
        // is still the active socket for that user
        if (
            userId &&
            userSocketMap[userId] === socket.id
        ) {
            delete userSocketMap[userId];
        }


        // Send updated online users
        io.emit(
            "getOnlineUsers",
            Object.keys(userSocketMap)
        );
    });

});


// middleware setup
app.use(
    express.json({
        limit: "4mb"
    })
);

app.use(cors());


// route setup
app.use(
    "/api/status",
    (req, res) => res.send("server is live")
);

app.use(
    "/api/auth",
    userRouter
);

app.use(
    "/api/messages",
    messageRouter
);

app.use(
    "/api/ai",
    aiRouter
);


// connect database
await connectDB();


// server port
// server port
const PORT = process.env.PORT || 5000;

server.listen(
    PORT,
    () => console.log(
        "server running on port " + PORT
    )
);


// export server for Vercel
export default server;