const socket = io();

// get username and room from URL
const { username, roomCode } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// whenever a user joins a room 
socket.emit('join-room', roomCode, username);

// to display all the old data of the room to the user 
socket.on('room-data', (room) => {
  const { messages, users } = room;
  displayAllMessages(messages);
  displayAllUsers(users);
});

// to display that the user joined 
socket.on('user-joined', (username) => {
  outputMessage(`${username} has joined the room`);
  addUserToDisplay(username);
});


//whenever a chat message is sent 
const chatForm = document.getElementById('chat-form');
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newMsg = document.getElementById('msg').value;

  socket.emit('new-message', newMsg, username, roomCode);

  document.getElementById('msg').value = '';
});

socket.on('display-message', (message) => {
  const msg = `${message.user}: ${message.message}`;
  outputMessage(msg);
});

//whenver a user leaves the room 
const leaveForm=document.querySelector('#leaveButton')
leaveForm.addEventListener('click',(e)=>{
    e.preventDefault();
    socket.emit('disconnect',username)
});

// all the function definations 
function outputMessage(msg) {
  const newMessage = document.createElement('p');
  newMessage.innerText = msg;
  const messagesDiv = document.querySelector('.chat-messages');
  messagesDiv.appendChild(newMessage);
}

function displayAllMessages(messages) {
  messages.forEach(({ user, message }) => {
    const msg = `${user}: ${message}`;
    outputMessage(msg);
  });
}

function displayAllUsers(users) {
  const userList = document.getElementById('usersList');
  userList.innerHTML = ''; 
  users.forEach(addUserToDisplay);
}

function addUserToDisplay(user) {
  const newUser = document.createElement('li');
  newUser.innerText = user;
  const userList = document.getElementById('usersList');
  userList.appendChild(newUser);
}
