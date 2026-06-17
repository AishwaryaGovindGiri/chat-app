//function to genrate token
//token is to authenticate the users 
//and this token is genrated using this functiona  and this function is used bcs it will used lot , 
//so for reusable purpose we are creating function 

import jwt from "jsonwebtoken";

export const generateToken = (userId)=> {
    const token = jwt.sign({userId} , process.env.JWT_SECRET);
    //CREATED UNIQUE TOKEN USING USER_ID
    //SECRET KEY IS A KEY 
    //NOW RETURN TOKEN 
    return token;
    
}