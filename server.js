// Import các module cần sử dụng
const path = require("path");
const express = require("express");
const http = require("http");
const socket = require("socket.io");
const formatMessage = require("./components/message");
const app = express();
const server = http.createServer(app);
const io = socket(server);
const defaultUser = "Chat";
const mongoose = require("mongoose");
const { userJoin, currentUser, userLeft, getRoomUsers } = require("./components/users");
const History = require("./models/historyChat");
app.use(express.static(path.join(__dirname, "public")));
const now = require("moment");

//Kết nối mongoose
mongoose
  .connect("mongodb://localhost:27017/WebSocket", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connect to mongoose");
  })
  .catch((e) => console.log(e));

//Khi user kết nối
io.on("connection", (socket) => {
  socket.on("userJoin", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // Hiển thị lịch sử chat thông qua dữ liệu từ mongoose
    History.find({ room: user.room }).then((result) => {
      socket.emit("outputMessage", result);
    });

    //Thông báo có user khác kết nối
    socket.broadcast
      .to(user.room)
      .emit("otherUserJoined", formatMessage(defaultUser, `${user.username} joined the chat`));

    //Lấy danh sách user đang online trong phòng
    io.to(user.room).emit("userInRoom", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Chat của user
  socket.on("chatMessage", (msg) => {
    const user = currentUser(socket.id);

    //Lưu dữ liệu vào database
    new History({
      username: user.username,
      time: now().format("h:mm a"),
      text: msg,
      room: user.room,
    })
      .save()
      .then(() => {
        io.to(user.room).emit("message", formatMessage(user.username, msg));
      });
  });

  //Người dùng ngắt kết nối
  socket.on("disconnect", () => {
    const user = userLeft(socket.id);
    if (user) {
      io.to(user.room).emit(
        "userLeave",
        formatMessage(defaultUser, `${user.username} has left the chat`)
      );
    }

    //Cập nhật lại danh sách user đang online sau khi có user khác ngắt kết nối
    io.to(user.room).emit("userInRoom", {
      room: user.room,
      users: getRoomUsers(user.room),
    });

  
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Listening on port: http://localhost:${port}`);
});
