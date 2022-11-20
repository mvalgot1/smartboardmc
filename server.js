const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const uuid = require('uuid-random');

const express = require('express');
const app = express();

const server = require('http').createServer(app);
const { Server } = require('socket.io');

const {
  addUser,
  getUser,
  removeUser,
  getUsersInRoom,
  getUserIdsInRoom
} = require('./utils/users');

const io = new Server(server);

app.use(cors());

let roomIdGlobal, imgURLGlobal;
let userMap = new Map();
let shareMap = new Map();
io.on('connection', (socket) => {
  console.log('socket connected')
  socket.on('userJoined', (data) => {
    console.log('User joined')
    const { name, userId, roomId, host, presenter, hostId, isGroup, groupMembers} = data;
    roomIdGlobal = roomId;
    socket.join(roomId);
    const users = addUser({ name, userId, roomId, host, presenter, hostId, isGroup, groupMembers });
    socket.emit('userIsJoined', { success: true, users });
    socket.nsp.to(roomId).emit('allUsers', users);
    if (host){
      shareMap.set(roomId, {userId: userId, userName: name});
    }
    const userIdsInRoom = getUserIdsInRoom(roomId);
    const roomMap = new Map(
      [...userMap].filter(([k, v]) => userIdsInRoom.includes(k))
    );
    socket.nsp.to(data.roomId).emit('shareIdResponse', shareMap.get(data.roomId))
    socket.nsp.to(data.roomId).emit('whiteBoardDataResponse', {
      imgMap: Array.from(roomMap)
    });
  });

  socket.on('createGroup', (data) => {
    socket.broadcast.to(data.roomId).emit('joinGroup', data);
  });

  socket.on('whiteboardData', (data) => {
    userMap.set(data.uid, data.imgurl);
    const userIdsInRoom = getUserIdsInRoom(data.roomId);
    const roomMap = new Map(
      [...userMap].filter(([k, v]) => userIdsInRoom.includes(k))
    );
    socket.nsp.to(data.roomId).emit('whiteBoardDataResponse', {
      imgMap: Array.from(roomMap)
    });
  });

  socket.on('requestBoard', (data) => {
    const userIdsInRoom = getUserIdsInRoom(data.roomId);
    const roomMap = new Map(
      [...userMap].filter(([k, v]) => userIdsInRoom.includes(k))
    );
    io.to(data.roomId).emit('whiteBoardDataResponse', {
      imgMap: Array.from(roomMap)
    });
  });

  socket.on('sharedWhiteboardData', (data) => {
    socket.broadcast.to(data.roomId).emit('sharedWhiteBoardDataResponse', data);
  });

  socket.on('message', (data) => {
    const { message } = data;
    const user = getUser(socket.id);
    if (user) {
      socket.broadcast
        .to(roomIdGlobal)
        .emit('messageResponse', { message, name: user.name });
    }
  });

  socket.on('disconnect', () => {
    const user = getUser(socket.id);
    if (user) {
      removeUser(socket.id);
      socket.broadcast
        .to(roomIdGlobal)
        .emit('userLeftMessageBroadcasted', user.name);
    }
  });

  socket.on('exitMeeting', (data) => {
    const user = getUser(data.userId);
    if (user) {
      removeUser(data.userId);
      userMap.delete(data.userId);
      const userIdsInRoom = getUserIdsInRoom(data.roomId);
      const roomMap = new Map(
        [...userMap].filter(([k, v]) => userIdsInRoom.includes(k))
      );
      socket.broadcast.to(data.roomId).emit('whiteBoardDataResponse', {
        imgMap: Array.from(roomMap)
      });
      const users = getUsersInRoom(data.roomId);
      socket.broadcast.to(data.roomId).emit('allUsers', users);
      socket.leave(data.roomId);
    }
  });

  socket.on('endMeeting', (data) => {
    console.log('endMeeting Event' + data.name);
    const user = getUser(data.userId);
    if (user) {
      const userIdsInRoom = getUserIdsInRoom(data.roomId);
      userIdsInRoom.forEach((userId) => {
        removeUser(userId);
        userMap.delete(userId);
      });
      socket.nsp.to(data.roomId).emit('meetingEnded', data.roomId);
    }
  });

  socket.on('closeMeeting', (data) => {
    io.socketsLeave(data);
  });

  socket.on('updateShareId', (data) => {
    shareMap.set(data.roomId, {userId : data.shareId, userName: data.shareName})
    socket.nsp.to(data.roomId).emit('shareIdResponse', shareMap.get(data.roomId))
  })

  socket.on('getShareId', (data) => {
    // socket.nsp.to(data).emit('shareIdResponse', shareMap.get(data))
    socket.emit('shareIdResponse', shareMap.get(data));
  })


  socket.on('getWhiteBoardData', (data) => {
    const userIdsInRoom = getUserIdsInRoom(data);
    const roomMap = new Map(
      [...userMap].filter(([k, v]) => userIdsInRoom.includes(k))
    );
    socket.nsp.to(data).emit('whiteBoardDataResponse', {
      imgMap: Array.from(roomMap)
    });
  })

  socket.on('getUserWhiteBoardData', (data) => {
    // const userIdsInRoom = getUserIdsInRoom(data.roomId);
    if (userMap.has(data)){
      // socket.nsp.to(data).emit('whiteBoardDataResponse', userMap.get(data.userId));
      socket.emit('userWhiteBoardResponse', userMap.get(data));
    }
    else {
      socket.emit('userWhiteBoardResponse', null);
    }
  })

});

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/sessions', require('./routes/api/sessions'));
app.use('/api/courses', require('./routes/api/courses'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
server.listen(8080, () => {
  console.log('Started on : 8080');
});
