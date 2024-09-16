const Auth = require('../models/auth');
const Chat = require('../models/chat');

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
    const chatUser2 = await Auth.findOne({ _id: chatUser._id });
    chatUser2.chatUsers.push(req.user._id);
    await chatUser2.save();
    res.status(200).json({ success: true, message: "User added successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: "User addition failed", error: error });
  }
}

const getChatList = async (req, res) => {
  try {
    const user = await Auth.findOne({ _id: req.user._id }).populate("chatUsers", "firstName lastName userName profilePicture");

    let chatUserData = [];

    for (let i = 0; i < user.chatUsers.length; i++) {
      // Convert Mongoose document to plain JavaScript object
      let chatUser = user.chatUsers[i].toObject();

      // Fetch the last message between the user and each chat user
      const message = await Chat.find({
        $or: [
          { senderId: req.user._id, receiverId: user.chatUsers[i]._id },
          { senderId: user.chatUsers[i]._id, receiverId: req.user._id }
        ]
      }).sort({ createdAt: -1 }).limit(1);

      // Add the last message and unread count to the plain object
      chatUser.message = message[0] || null;
      chatUser.unread = await Chat.countDocuments({ senderId: user.chatUsers[i]._id, receiverId: req.user._id, read: false });

      // Add modified chat user data to array
      chatUserData.push(chatUser);
    }

    res.status(200).json({ success: true, message: "Chat users fetched successfully", data: chatUserData });
  } catch (error) {
    res.status(400).json({ success: false, message: "Chat users fetch failed", error: error });
  }
};


const addChatMessage = async (req, res) => {
  try {
    const chatData = new Chat({
      message: req.body.message,
      senderId: req.user._id,
      receiverId: req.body.receiverId,
    });
    await chatData.save();
    res.status(200).json({ success: true, message: "Chat message sent successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Chat message send failed", error: error });
  }
}

const getChatMessages = async (req, res) => {
  try {
    const messages = await Chat.find({
      $or: [
        { senderId: req.user._id, receiverId: req.body.receiverId },
        { senderId: req.body.receiverId, receiverId: req.user._id }
      ]
    }).sort({ createdAt: 1 }).limit(50).populate("senderId", "firstName lastName userName profilePicture").populate("receiverId", "firstName lastName userName profilePicture");
    res.status(200).json({ success: true, message: "Chat messages fetched successfully", data: messages });
  } catch (error) {
    res.status(400).json({ success: false, message: "Chat messages fetch failed", error: error });
  }
}

module.exports = { addChatUser, getChatList, addChatMessage, getChatMessages };