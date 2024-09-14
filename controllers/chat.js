const Auth = require('../models/auth');

const addChatUser = async (req, res) => {
    try {
        let chatUser = await Auth.findOne({ userName: req.body.userName });
        if (!chatUser) {
            chatUser = await Auth.findOne({ email: req.body.userName });
        }
        if (!chatUser) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        if (!chatUser.emailVerified) {
            return res.status(400).json({ success: false, message: "User email not verified" });
        }
        if (chatUser._id.toString() == req.user._id.toString()) {
            return res.status(400).json({ success: false, message: "You can't add yourself" });
        }
        if (req.user.chatUsers.includes(chatUser._id)) {
            return res.status(400).json({ success: false, message: "User already added" });
        }
        const user = await Auth.findOne({ _id: req.user._id });
        user.chatUsers.push(chatUser._id);
        await user.save();
        res.status(200).json({ success: true, message: "User added successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: "User addition failed", error: error });
    }
}

const getChatList = async (req, res) => {
    try {
        const user = await Auth.findOne({ _id: req.user._id }).populate("chatUsers", "firstName lastName userName profilePicture");
        res.status(200).json({ success: true, message: "Chat users fetched successfully", data: user.chatUsers });
    } catch (error) {
        res.status(400).json({ success: false, message: "Chat users fetch failed", error: error });
    }
}

module.exports = { addChatUser, getChatList };