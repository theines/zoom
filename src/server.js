import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"))

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
// https://admin.socket.io
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    },
});
instrument(wsServer, {
    auth: false
});

/* #2-8 Room Count part1
Adaptor will synchronize my realtime application
among diffenet servers
*/

function publicRooms(){
    //const sids = wsServer.sockets.adapter.sids;
    //const rooms = wsServer.sockets.adapter.rooms;
    // 아래코드는 위 코드의 섹시버전
    const {
        sockets: {
            adapter: { sids, rooms },
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName){
    return wsServer.socket.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anonnymous";
    socket.on("nickname", nickname => socket["nickname"] = nickname);
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName); 
        done(); // app.js의 showRoom()이 execute 됨
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName)); // socketIO는 나를 제외하고 메세지를 보낸다는걸 잊지말자
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => 
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)// -1 안하면 나 자신도 포함일테니까
        );
    }); 
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    })
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
});

/*
const wss = new WebSocket.Server({ server });
const sockets = [];
wss.on("connection", (socket) => {//여기서의 socket은 연결된 브라우저를 뜻한다
    sockets.push(socket); // 연결된 브라우저(socket)을 위에 정의한 배열에 넣는다.
    socket["nickname"] = "Anon";
    console.log("Connected to Browser");
    socket.on("close", () => console.log("disconnected from browser"))
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch(message.type){
            case "new_message":
                sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`))
            case "nickname":
                socket["nickname"] = message.payload;
        }
    });
});
 */
httpServer.listen(3000, handleListen);