const socket = io();
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const listUser = document.getElementById("users");
const notify = document.getElementById("notify");
const roomName = document.getElementById("room-name");
const message = document.getElementById("msg");
//Lấy tên user thông qua URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});


socket.emit("userJoin", { username, room });

//Hiển thị thông báo khi user tham gia chat trên giao diện
socket.on("otherUserJoined", (msg) => {
  notifyUser(msg);
  setTimeout(function () {
    notify.style.display = "none";
  }, 4000);
});
//Hiển thị thông báo khi user rời chat trên giao diện
socket.on("userLeave", (msg) => {
  notifyUser(msg);
  setTimeout(function () {
    notify.style.display = "none";
  }, 4000);
});


// Hiển thị tên phòng và danh sách user trong phòng trên giao diện
socket.on("userInRoom", ({ room, users }) => {
  outputRooms(room);
  outputUsers(users);
});

// Hiển thị nội dung chat lên giao diện
socket.on("message", (message) => {
  appendMsg(message);
   //Set hướng của thanh cuộn từ dưới lên
   chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Hiển thị lịch sử chat thông qua dữ liệu được lấy từ mongoose
socket.on("outputMessage", (message) => {
  if (message.length > 0) {
    message.forEach((data) => {
      appendMsg(data);
    });
  }
 //Set hướng của thanh cuộn từ dưới lên
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Xử lý khi user gửi tin nhắn
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = message.value;
  socket.emit("chatMessage", msg);
  message.value = "";
  message.focus();
});

//Hiển thị nội dung tin nhắn
function appendMsg(message) {
  var div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p> `;
  document.querySelector(".chat-messages").appendChild(div);
}

//Hiển thị danh sách user đang trực tuyến trong phòng
function outputUsers(users) {
  listUser.innerHTML = `
        ${users.map(
            (user) =>
              `<div style ="width: 100%"><img src="img/user.png" style="max-height: 20px"> ${user.username}</div>`
          )
          .join("")}
    `;
}

//Hiển thị tên phòng hiện tại
function outputRooms(room) {
  roomName.innerText = room;
}

//Hiển thị dialog thông báo khi có user kết nối hoặc ngắt kết nối
function notifyUser(message) {
  var div = document.querySelector(".notify");
  div.innerHTML = `<p>${message.text}</p>`;
  div.style.display = "block";
}
