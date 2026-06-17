import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lb/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";


//create Express app and http server
// college gate office that handle req
// if no iffice no system to handle req of students / visitors
const app = express();
//college gate (http server)
//no clg gate then we can enter gate office
const server = http.createServer(app)

//initialize socket.io server
export const io = new Server(server , {
    cors: {origin: "*"}
})

//store online users
export const userSocketMap = {};// { userId : socketId }


//socket.io connection handler 
io.on("connection" , (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected" , userId);

    if(userId) userSocketMap[userId] = socket.id;

    //EMit online users to all connected client 
    io.emit("getOnlineUsers" , Object.keys(userSocketMap));
    
    socket.on("disconnect" , ()=>{
        console.log("User Disconnected" , userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers" , Object.keys(userSocketMap)); 
    })
})




//middleware setup
app.use(express.json({limit: "4mb"}))
//form reader in office {json middleware} , student can bring their permission form and it is in differnt format {only form reader {json middlearwe} can read it }
//it handles all request 

app.use(cors())
//it will allow all url to connect with our backend 
//watchman middleware {checks if it is from another clg {if student from our clg "no checking" }}


//stdent(user/frontend) -> clg gate(http server) -> watchman(cors middleware(only check oursite student permision )) -> req form go office building (express app)-> form reader( json middleware) -> got res -> go to clg 


//route setup
app.use("/api/status" , (req , res)=> res.send("server is live"))
app.use("/api/auth" , userRouter);
app.use("/api/messages" , messageRouter);
//api end point created here
//api/status is a special room inside office , if we go there and ask if clg open , yes 
//office is express.js 


//connect db function
await connectDB()


//process.end.port says -> use this port today xxxx
//otherwise 5000 

if(process.env.NODE_ENV  !== "production"){
    const PORT = process.env.PORT || 5000 ;
    server.listen(PORT , ()=> console.log("server running on port " + PORT))
}

//export server for vervel
export default server;