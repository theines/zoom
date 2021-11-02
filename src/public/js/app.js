const socket = io();// io function이 알아서 socket.io를 실행하고 있는 서버를 찾을 거다
const welcome = document.getElementById("welcome");
const roomform = welcome.querySelector("#roomname");
const nickform = welcome.querySelector("#nickname");
const room = document.getElementById("room");
let roomName;
room.hidden = "true"

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You : ${value}`);
    }); //sending message to backend
    input.value = "";
}

function showRoom(msg){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleNicknameSubmit(event){
    event.preventDefault();
    const input = welcome.querySelector("#nickname input");
    const value = input.value; //why do i have to do it like this?
    socket.emit("nickname", value);
}

function handleRoomSubmit(event){
    event.preventDefault();
    
    
    const input = roomform.querySelector("#roomname input");
    socket.emit("enter_room", input.value, showRoom);   // function은 꼭 마지막 argument이여야 함.
    roomName = input.value;
    input.value = "";
}
nickform.addEventListener("submit", handleNicknameSubmit);
roomform.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
    addMessage(`${user} arrived!`);
});

socket.on("bye", (left) => {
    addMessage(`${left} left`);
});

socket.on("new_message", addMessage);

// socket.on("room_change", console.log);
// above line is SAME as below line
// socket.on("room_change", (msg) => console.log(msg));

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
})