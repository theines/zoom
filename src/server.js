import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"))

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));
 
const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

// 여기서 중요한 점
// done함수 코드는 여기 백엔드에서 돌리는게 아니다(보안에 큰 문제라)
// done함수가 실행 되면 프론트의 backendDone함수가 돌아갈 것이다.
// 그러니까 프론트의 코드를 백엔드에서 돌리고 있는 모습이다.
wsServer.on("connection", (socket) => {
    socket.on("enter_room", (roomName, done) => {
        console.log(roomName);
        setTimeout(()=>{
            done("hello from the backend");
        }, 10000);
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