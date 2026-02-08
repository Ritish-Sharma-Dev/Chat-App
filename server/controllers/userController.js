import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

//SIGNUP A NEW USER
export const signUp = async (req, res) => {
    const { fullName, email, password, bio } = req.body;
    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: "Missing Details" });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.json({ success: false, message: "Account already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt); //$2a$10$FQ/...hashed...
        const newUser = await User.create({ fullName, email, password: hashedPassword, bio });
        const token = generateToken(newUser._id);
        res.json({ success: true, userData: newUser, token, message: "Account created successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//CONTROLLER TO LOGIN A USER
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email });
        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid credentials" });
        }
        const token = generateToken(userData._id);
        res.json({ success: true, userData, token, message: "Login successfull" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//CONTROLLER TO CHECK WHETHER THE USER IS AUTHENTICATED
export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user });
}

//CONTROLLER TO UPDATE USER PROFILE DETAILS
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id;
        let updatedUser;
        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName }, { new: true });
        } else {
            const upload = await cloudinary.uploader.upload(profilePic); //{ "secure_url": "https://res.cloudinary.com/new-pic.jpg"}
            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullName }, { new: true });
        }
        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//OTP GENERATOR AND SENDER
export const otpSender = async (req, res) => {
    try {
        console.log('backend working');
        const { email } = req.body;
        console.log("Sending OTP to:", email); // Debug log
        let generatedOtp = Math.floor(100000 + Math.random() * 900000); // 6 digit OTP
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS, // App password (not normal Gmail password)
            },
        });
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is ${generatedOtp}. It will expire in 5 minutes.`,
        });

        res.json({ success: true, otp: generatedOtp,  message: "OTP sent to Gmail"});
    } catch (error) {
        console.error("OTP Send Error:", error); // Detailed error log
        res.status(500).json({ success: false, message: "Failed to send OTP" });
    }
}