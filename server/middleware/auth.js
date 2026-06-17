//middleware to protect route/api endpoints
//this function will execute before the controoler function to check pre authincation
//this will check user before reaching endpoint


import User from "../models/User.js";
import jwt from "jsonwebtoken";

//next is used to execute the next funxtion{controllers}
export const protectRoute = async(req , res , next)=>{
    try {
        const token = req.headers.token;
        const decoded = jwt.verify(token , process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId).select("-password");

        if(!user) return res.json({success:false , message:"User not found"});

        req.user = user 
        //insert thi user inot req so controoler cna use user data 
        next();
    } catch (error) {
        res.json({success:false , message:error.message });
    }
}

//frontend -> token -> decode it > find in User model -> insert userdata -> req -> controllers access user data