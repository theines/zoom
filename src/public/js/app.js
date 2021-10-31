// io function이 알아서 socket.io를 실행하고 있는 서버를 찾을 거다
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = "true"

let roomName;

function showRoom(msg){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);   // function은 꼭 마지막 argument이여야 함.
    roomName = input.value;
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);