import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req,res,next)=>{
    try {
        const token = req.headers.token; //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        if (!token) {
            return res.json({ success: false, message: "Not Authorized. Login again." });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET); //{ userId: "64f8a9c12b3abcd123456789" };
        const user=await User.findById(decoded.userId).select("-password"); 
        if (!user){
            return res.json({success: false, message:"user not found"});
        }
        req.user=user;
        next();
    } catch (error) {
        console.log(error.message);
        return res.json({success: false, message: error.message}); 
    }
}