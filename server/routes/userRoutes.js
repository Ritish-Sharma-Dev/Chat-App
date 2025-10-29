import express from "express";
import { checkAuth, login, signUp, updateProfile,otpSender } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter=express.Router();
userRouter.post("/signup",signUp);
userRouter.post("/login",login);
userRouter.post("/otp",otpSender);
userRouter.put("/update-profile",protectRoute, updateProfile);
userRouter.get("/check",protectRoute, checkAuth);

export default userRouter;