const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const hpp = require("hpp");
const { Server } = require("socket.io");
const _ = require("lodash");

//각종 미들웨어
app.use(express.json());
app.use(express.urlencoded());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(hpp());
app.use(cors());

// 소켓 연결
const server = http.createServer(app);
const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: "http://localhost:3000",
  },
});

// 닉네임 배열
const animalName = [
  "나무늘보",
  "팬더",
  "개미핥기",
  "고라니",
  "토끼",
  "강아지",
  "고슴도치",
  "비버",
  "원숭이",
  "송아지",
];

const adjectiveName = [
  "부지런한",
  "좀더 자고싶은",
  "힘이 넘치는",
  "긴장되는",
  "신이난",
  "궁금한게 많은",
  "흡족한",
  "통쾌한",
  "섭섭한",
  "덤덤한",
];

// 소켓 로직
io.on("connection", (socket: any) => {
  const combinedName = _.sample(adjectiveName) + " " + _.sample(animalName);
  socket.nickName = combinedName;
  socket.emit("user_nickName", socket.nickName);
  console.log(
    `user connected: ${socket.id}, user nickName: ${socket.nickName}`
  );

  // 1. Room 입장 이벤트 처리
  socket.on("join_room", (roomId: any) => {
    socket.join(roomId);
    console.log(`user ID: ${socket.id} joined room: ${roomId}`); // roomId = {"2208267975_2208267975"}
  });

  // 2. Room에 메세지 전송 이벤트 처리
  socket.on("send_message", async (data: any) => {
    socket.to(data.room).emit("receive_message", data);
    /* data = { room: "2208267975_2208267975",
              author: "윤지", authorId: "123456",
              targetAuthor: "태성", targetAuthorId: "654321",
              message: "d", time: "16:46" }
    */
    console.log("이게 메세지 일까요??", data);
  });

  // 3. Socket 연결 끊기 이벤트 처리
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });

  // 4. Room 나갈때 해당 Room안에 Socket에게 안내메세지 전송하기
  socket.on("leave-room", (roomId: any, done: any) => {
    socket.leave(roomId);
    done();
    console.log(`user ${socket.id}has left the room`);

    io.to(roomId).emit("remove-room", `user ${socket.id}has left the room`);
  });
});

// 테스트용
app.get("/", (req: any, res: any) => {
  res.send("good");
});

// 서버 열기
server.listen(3000, () => {
  console.log("Server On");
});
