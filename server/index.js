const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users.js");

const PORT = process.env.PORT || 5000;

const router = require("./router");

// setup socketio
const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  console.log(`We have a new connection: ${socket.id}`);

  // callback is used for errorHandling or anything to handle immediately after
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    // handle error
    if (error) return callback(error);

    // emit is from backend -> frontend
    // admin (system) message
    socket.emit("message", {
      user: "admin",
      text: `hello, ${user.name}: welcome to the room ${user.room}`,
    });
    // broadcast to the room except for the specific user above
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    // join room
    socket.join(user.room);

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  // user generated messages (waiting on the message from the frontend)
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user)
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left`,
      });
    // console.log(`${socket.id} has left`);
  });
});

app.use(router);

server.listen(PORT, () => console.log(`server has started on port: ${PORT}`));
