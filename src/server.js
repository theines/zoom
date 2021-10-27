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
// 위에처럼 하면 http server 뿐만아니라 ws server도 올린다는 뜻이고
// 매번 이렇게 안해도 되고 웹소켓이랑 http랑 같이 올리고 싶은 경우에만
// 이렇게 해서 2개의 proptocal이 같은 port를 공유하게 되었다

server.listen(4000, handleListen);