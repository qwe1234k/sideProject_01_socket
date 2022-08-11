"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    "기니피그",
    "개미핥기",
    "토끼",
    "나무늘보",
    "고라니",
    "고슴도치",
    "사막여우",
    "북극곰",
    "펭귄",
    "코알라",
    "캥거루",
    "아르마딜로",
    "알파카",
    "수달",
];
const adjectiveName = [
    "여행광",
    "신이난",
    "게으른",
    "부지런한",
    "씩씩한",
    "긍정적인",
    "쇼핑왕",
    "방구석",
    "먹보",
    "뚜벅이",
    "귀찮은",
    "친절한",
    "즉흥적인",
    "계획적인",
    "0개국어",
];
// 소켓 로직
io.on("connection", (socket) => {
    const combinedName = _.sample(adjectiveName) + " " + _.sample(animalName);
    socket.nickName = combinedName;
    socket.emit("user_nickName", socket.nickName);
    console.log(`user connected: ${socket.id}, user nickName: ${socket.nickName}`);
    // 1. Room 입장 이벤트 처리
    socket.on("join_room", (roomId) => {
        socket.join(roomId);
        console.log(`user ID: ${socket.id} joined room: ${roomId}`); // roomId = {"2208267975_2208267975"}
    });
    // 2. Room에 메세지 전송 이벤트 처리
    socket.on("send_message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        socket.to(data.room).emit("receive_message", data);
        /* data = { room: "2208267975_2208267975",
                  author: "윤지", authorId: "123456",
                  targetAuthor: "태성", targetAuthorId: "654321",
                  message: "d", time: "16:46" }
        */
        console.log("이게 메세지 일까요??", data);
    }));
    // 3. Socket 연결 끊기 이벤트 처리
    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
    });
    // 4. Room 나갈때 해당 Room안에 Socket에게 안내메세지 전송하기
    socket.on("leave-room", (roomId, done) => {
        socket.leave(roomId);
        done();
        console.log(`user ${socket.id}has left the room`);
        io.to(roomId).emit("remove-room", `user ${socket.id}has left the room`);
    });
});
// 테스트용
app.get("/", (req, res) => {
    res.send("good hi");
});
// 서버 열기
server.listen(3000, () => {
    console.log("Server On");
});
