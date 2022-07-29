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
// 소켓 로직
io.on("connection", (socket) => {
    console.log(`user connected: ${socket.id}`);
    // 1. Room 입장 이벤트 처리
    socket.on("join_room", (roomId) => {
        socket.join(roomId);
        console.log(`user ID: ${socket.id} joined room: ${roomId}`); // roomId = {"2208267975_2208267975"}
    });
    // 2. Room에 메세지 전송 이벤트 처리
    socket.on("send_message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        socket.to(data.room).emit("receive_message", data);
        // data = { room: "2208267975_2208267975",
        //          author: "윤지", authorId: "123456",
        //          targetAuthor: "태성", targetAuthorId: "654321",
        //          message: "d", time: "16:46" }
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
    res.send("good");
});
// 서버 열기
server.listen(3000, () => {
    console.log("Server On");
});
