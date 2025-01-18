const socket = io();

const { username, roomCode } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const errorHandler = document.getElementById('error-handler');

socket.emit('join-room', roomCode, username);

socket.on('error', (msg) => {
  errorHandler.innerText = msg;
});

socket.on('room-data', (room) => {
  const { messages, users } = room;
  displayAllMessages(messages);
  displayAllUsers(users);
});

socket.on('user-joined', (username) => {
  outputMessage(`${username} has joined the room`);
  addUserToDisplay(username);
});

socket.on('user-left',(username)=>{
  const msg=`${username}has left`
  outputMessage(msg);

})

//handling chat messages 
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


//handling leave funcitons 
const leaveForm = document.querySelector('#leaveButton');
leaveForm.addEventListener('click', (e) => {
  e.preventDefault();
  socket.emit('leave-room', username, roomCode);
  window.location.href = '/';
});



//all the dependecy funcitnos 
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
  const userList = document.querySelector('.usersList');
  userList.innerHTML = '';
  users.forEach(addUserToDisplay);
}

function addUserToDisplay(user) {
  const newUser = document.createElement('li');
  newUser.innerText = user;
  const userList = document.querySelector('.usersList');
  userList.appendChild(newUser);
}
