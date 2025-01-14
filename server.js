const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {
    "1111": {
      users: ["Alice", "Bob", "Charlie"],
      messages: [
        { user: "Alice", message: "Hi everyone!" },
        { user: "Bob", message: "Hey Alice!" },
        { user: "Charlie", message: "Good to see you all." },
      ],
    },
    "2222": {
      users: ["Dave", "Eva", "Frank"],
      messages: [
        { user: "Dave", message: "What's up?" },
        { user: "Eva", message: "Not much, how about you?" },
        { user: "Frank", message: "Let's start the discussion." },
      ],
    },
    "3333": {
      users: ["Grace", "Hank"],
      messages: [
        { user: "Grace", message: "Hi Hank, ready for the meeting?" },
        { user: "Hank", message: "Yes, just preparing some notes." },
      ],
    },
    "4444": {
      users: ["Ivy", "Jack", "Kate"],
      messages: [
        { user: "Ivy", message: "Good morning, team!" },
        { user: "Jack", message: "Morning, Ivy!" },
        { user: "Kate", message: "Shall we review yesterday's work?" },
      ],
    },
  };
  

io.on('connection', (socket) => {
  // whenever a user joins the room 
  socket.on('join-room', (roomCode, username) => {
    if (!rooms[roomCode]) {
      socket.emit('error', 'Room not found');
      return;
    }


    rooms[roomCode].users.push(username);
    socket.join(roomCode);

    socket.to(roomCode).emit('user-joined', username);
    socket.emit('room-data', rooms[roomCode]);
  });

  // listening to the char messages 
  socket.on('new-message', (newMsg, writer, roomCode) => {
    if (rooms[roomCode]) {
      const message = { user: writer, message: newMsg };
      rooms[roomCode].messages.push(message);
      io.to(roomCode).emit('display-message', message);
    } else {
      socket.emit('error', 'Room not found');
    }
  });

  // wheenever user disconnects
  
});

// Create Room Functionality
app.post('/create-room', (req, res) => {
  const roomCode = generateRandomNumber();
  rooms[roomCode] = { users: [], messages: [] };
  res.status(201).send({ roomCode });
});

const generateRandomNumber = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
