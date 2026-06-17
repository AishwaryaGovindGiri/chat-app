// this is api endpoint creation using controller function which handle api endpoints 
// using routes
import { checkAuth, login, signup, updateProfile } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";
import express from "express";
const userRouter = express.Router();

userRouter.post("/signup" , signup);
userRouter.post("/login" , login);
userRouter.put("/update-profile" ,protectRoute, updateProfile);
userRouter.get("/check" ,protectRoute , checkAuth);

//middleware - protedRoute is used to protect route 
// route means api endpoint 
//asign security guard at counter of api ---->protedRoute---->checks id of user 

export default userRouter;