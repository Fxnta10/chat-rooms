const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));


//random rooms to test 
const rooms = {
  "1234": {
    users: ["Alice", "Bob", "Charlie"],
    messages: [
      { user: "Alice", message: "Hi everyone!" },
      { user: "Bob", message: "Hey Alice, how's it going?" },
      { user: "Charlie", message: "Good to see you both here." },
    ],
  },
  "5678": {
    users: ["Dave", "Eva"],
    messages: [
      { user: "Dave", message: "Hey Eva, ready for the meeting?" },
      { user: "Eva", message: "Yes, just finishing up some notes." },
      { user: "Dave", message: "Great, let's get started!" },
    ],
  },
};


io.on('connection', (socket) => {
  socket.on('join-room', (roomCode, username) => {
    if (!rooms[roomCode]) {
      rooms[roomCode] = { users: [], messages: [] };
    }

    rooms[roomCode].users.push(username);
    socket.join(roomCode);
    socket.to(roomCode).emit('user-joined', username);
    socket.emit('room-data', rooms[roomCode]);
  });

  socket.on('new-message', (newMsg, writer, roomCode) => {
    if (!rooms[roomCode]) {
      socket.emit('error', 'Room not found');
      return;
    }
    const message = { user: writer, message: newMsg };
    rooms[roomCode].messages.push(message);
    io.to(roomCode).emit('display-message', message);
  });

  socket.on('leave-room', (username, roomCode) => {
    if (!rooms[roomCode]) return;
    removeUserFromRoom(username.roomCode);
    socket.leave(roomCode);
    socket.to(roomCode).emit('user-left', username);
  });
});


function removeUserFromRoom(username,roomCode){
  
  const userArray=rooms[roomCode].users;
  for(let i=0;i<userArray.length;i++){
    if(userArray[i]==username){
      userArray.remove(userArray[i]);
    }
  }

}
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
