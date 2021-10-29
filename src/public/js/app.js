// io function이 알아서 socket.io를 실행하고 있는 서버를 찾을 거다
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", { payload: input.value }, () => {
        console.log("function is executed from frontend")
    });
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);