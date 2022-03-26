const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  socket.on("join_room", (data) => {
    socket.join(data);
    socket.room = data
    socket.emit("user_socket_id", socket.id)
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
    console.log("Total users of room " + socket.room + ": " + io.sockets.adapter.rooms.get(socket.room).size)
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    if (io.sockets.adapter.rooms.get(socket.room))
      console.log("Total users of room " + socket.room + ": " + io.sockets.adapter.rooms.get(socket.room).size)
    else console.log("Total users of room " + socket.room + ": 0")
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});