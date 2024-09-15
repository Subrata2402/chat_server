const Auth = require('../models/auth');
const bcrypt = require("bcryptjs");
const sendMail = require('./mail');

const register = async (req, res) => {
    let userEmail = await Auth.findOne({ email: req.body.email });
    if (userEmail) {
        return res.status(400).json({ success: false, message: "Sorry a user with this email already exists" });
    }
    let userName = await Auth.findOne({ userName: req.body.userName });
    if (userName) {
        return res.status(400).json({ success: false, message: "Sorry a user with this username already exists" });
    }
    try {
        const registerUser = new Auth({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName,
            email: req.body.email,
            password: req.body.password,
            otp: {
                id: Math.floor(100000 + Math.random() * 900000),
                expiredAt: new Date(new Date().getTime() + 5 * 60000)
            }
        });

        await sendMail("Doux Chat", registerUser.email, "Email Verification", `<h1>Hi ${registerUser.firstName},</h1><p>Your OTP is ${registerUser.otp.id}</p>`);
        await registerUser.save();
        res.status(201).send({ success: true, message: "User registered successfully" });
    } catch (error) {
        res.status(404).send({ success: false, message: "User registration failed", error: error });
    }
}

const verifyEmail = async (req, res) => {
    try {
        const email = req.body.email;
        const otp = req.body.otp;
        const user = await Auth.findOne({ email: email });
        if (!user) {
            return res.status(400).send({ success: false, message: "Invalid Email" });
        }
        if (user.otp.id == otp && user.otp.expiredAt > new Date()) {
            user.emailVerified = true;
            await user.save();
            res.status(200).send({ success: true, message: "Email verified successfully" });
        } else {
            res.status(400).send({ success: false, message: "Invalid OTP" });
        }
    } catch (error) {
        res.status(400).send({ success: false, message: "Email verification failed", error: error });
    }
}

const login = async (req, res) => {
    try {
        const username = req.body.userName;
        const password = req.body.password;
        // console.log(username, password);
        let user = await Auth.findOne({ email: username });
        if (!user) {
            user = await Auth.findOne({ userName: username });
        }
        if (!user) {
            return res.status(400).send({ success: false, message: "Invalid Username" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            if (!user.emailVerified) {
                user.otp = {
                    id: Math.floor(100000 + Math.random() * 900000),
                    expiredAt: new Date(new Date().getTime() + 5 * 60000)
                }
                await sendMail("Doux Chat", user.email, "Email Verification", `<h1>Hi ${user.firstName},</h1><p>Your OTP is ${user.otp.id}</p>`);
                await user.save();
                return res.status(400).send({ success: false, message: "Email not verified", data: { email: user.email, firstName: user.firstName, userName: user.userName } });
            }
            const token = await user.generateAuthToken();
            const { password, otp, tokens, chatUsers, ...userData } = user._doc;
            res.status(200).json({ success: true, message: "User logged in successfully", data: userData, accessToken: token });
        } else {
            res.status(400).json({ success: false, message: "Invalid Password" });
        }
    }
    catch (error) {
        res.status(400).json({ success: false, message: "User login failed", error: error });
    }
}

module.exports = { register, verifyEmail, login };