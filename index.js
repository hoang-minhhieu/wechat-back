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

var usersList = [];

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  //Event when an user joined a room
  socket.on("join_room", (data, username) => {
    socket.room = data
    socket.join(socket.room);
    socket.emit("user_socket_id", socket.id)
    console.log(`User ${username} with ID: ${socket.id} joined room: ${socket.room}`);

    //Create new User
    const newUser = {
      username: username,
      socketId: socket.id
    }
    
    //Add new object to list users
    usersList.push(newUser)

    //Send signal update list users to all clients in that room
    io.in(socket.room).emit("receive_list_users", usersList); 
    //Show total users of the room on server side
    console.log("Total users of room " + socket.room + ": " + io.sockets.adapter.rooms.get(socket.room).size)
    //Send signal update number of users connected to all users in that room
    io.in(socket.room).emit("receive_total_users", io.sockets.adapter.rooms.get(socket.room).size)
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    for(let i = 0; i < usersList.length; i++){
      if (usersList[i].socketId === socket.id)
        usersList.splice(i, 1)
    }

    if(usersList.length > 0)
      io.in(socket.room).emit("receive_list_users", usersList); 

    if (io.sockets.adapter.rooms.get(socket.room)){
      io.in(socket.room).emit("receive_total_users", io.sockets.adapter.rooms.get(socket.room).size)
      console.log("Total users of room " + socket.room + ": " + io.sockets.adapter.rooms.get(socket.room).size)
    }
    else usersList = []
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});