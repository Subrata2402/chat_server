// socket.js
const { Server } = require('socket.io');

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
    transports: ['websocket'],
  });

  let users = {};
  let onlineUsers = {};

  io.on('connection', (socket) => {
    console.log(socket.id + ' user connected');

    socket.on('join-chat', (userId) => {
      users[userId] = socket.id;
      onlineUsers[userId] = true;
      console.log(`User ${userId} registered with socket ID ${socket.id}`);
    });

    socket.on('leave-chat', (userId) => {
      delete users[userId];
      console.log(`User ${userId} unregistered`);
    });

    socket.on('private-message', (data) => {
      console.log('message', data);
      const socketId = users[data.receiverId];
      if (socketId) {
        socket.to(socketId).emit('private-message', data);
      } else {
        console.log(`User ${data.receiverId} is not connected`);
      }
    });

    socket.on('online', (data) => {
      const isOnline = onlineUsers[data.userId] ? true : false;
      socket.emit('online', { userId: data.userId, isOnline: isOnline });
    });

    // socket.on('offline', (userId) => {
    //   delete onlineUsers[userId];
    //   socket.emit('online', { userId: userId, isOnline: false });
    // });
      

    socket.on('typing', (data) => {
      // console.log('typing', data);
      const socketId = users[data.receiverId];
      if (socketId) {
        socket.to(socketId).emit('typing', data);
      } else {
        console.log(`User ${data.receiverId} is not connected`);
      }
    });

    socket.on('stop-typing', (data) => {
      // console.log('stop-typing', data);
      const socketId = users[data.receiverId];
      if (socketId) {
        socket.to(socketId).emit('stop-typing', data);
      } else {
        console.log(`User ${data.receiverId} is not connected`);
      }
    });

    socket.on('read-message', (data) => {
      console.log('read-message', data);
      const socketId = users[data.senderId];
      if (socketId) {
        socket.to(socketId).emit('read-message', data);
      } else {
        console.log(`User ${data.senderId} is not connected`);
      }
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
      users = Object.fromEntries(
        Object.entries(users).filter(([_, value]) => value !== socket.id)
      );
      // 
    });
  });
}

module.exports = setupSocket;