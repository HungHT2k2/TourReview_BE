import express from 'express';
import cors from 'cors';
import { Server } from "socket.io";
import http from "http";

const app = express();
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
    socket.join(data)
  });

  socket.on("comment", (data) => {
    console.log(data);
    socket.to(data.slug).emit("done_comment", data);
  });
});

server.listen(1568, () => {
  console.log("SERVER IS RUNNING");
});
