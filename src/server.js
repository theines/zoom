import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"))

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));
 
const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {//여기서의 socket은 연결된 브라우저를 뜻한다
    sockets.push(socket); // 연결된 브라우저(socket)을 위에 정의한 배열에 넣는다.
    console.log("Connected to Browser");
    socket.on("close", () => console.log("disconnected from browser"))
    socket.on("message", (message) => {
        sockets.forEach((aSocket) => aSocket.send(message.toString('utf-8')));
        //socket.send(message.toString('utf-8'));
    });
});

server.listen(3000, handleListen);