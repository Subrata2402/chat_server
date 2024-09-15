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

  io.on('connection', (socket) => {
    console.log(socket.id + ' user connected');

    socket.on('join-chat', (userId) => {
      users[userId] = socket.id;
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

    socket.on('disconnect', () => {
      console.log('user disconnected');
      users = Object.fromEntries(
        Object.entries(users).filter(([_, value]) => value !== socket.id)
      );
    });
  });
}

module.exports = setupSocket;