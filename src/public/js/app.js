const socket = io();// io function이 알아서 socket.io를 실행하고 있는 서버를 찾을 거다

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind == "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currentCamera.label == camera.label) {
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        });
    } catch (e) {
        console.log(e);
    }
}

async function getMedia(deviceId) {
    const initialConstraints = {
        audio: true,
        video: { facingMode: "user" },
    };
    const cameraConstraints = {
        audio: true,
        video: { deviceId: { exact: deviceId } },
    };
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstraints
        );
        myFace.srcObject = myStream;
        if (!deviceId) {
            await getCameras();
        }
    } catch (e) {
        console.log(e);
    }
}

function handleMuteClick() {
    myStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
    if (!muted) {
        muteBtn.innerText = "Unmute";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}
function handleCameraClick() {
    myStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
    if (cameraOff) {
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}

async function handleCameraChange() {
    //console.log(camerasSelect.value); I can get a ID of the device
    await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);


// Socket code

socket.on("welcome", async() => {
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");
    socket.emit("offer", offer, roomName);
}); // will run on PeerA browser(one that send the offer)

socket.on("offer", async(offer) => {
    // offer를 받으려고 myPeerConnection.setRemoteDescription(offer);
    // 이렇게 하니까 오퍼가 오기도 전에 실행이 되서 에러가 났다.
    // 해결은 원래 join_room 할 때 initCall함수를 같이 emit했었는데 그 전에 실행시켰다. (서버에서도 done()빼고)
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
}); // will run on PeerB broswer(one that joins)

socket.on("answer", answer => {
    myPeerConnection.setRemoteDescription(answer);
}); //this will run on PeerA browser
/* 
  peerA                           server                                 peerB
===================================================================================================
createOffer         
setLocalDescription(offer)
socket.emit("offer")--------->socket.on("offer",()=>               socket.on("offer")
                        socket.to(roomName).emit("offer"))-------->setRemoteDescription(offer)
                                                                    createAnswer()
                                                                    setLocalDescription(answer)
                                 socket.on("answer",() =>    <------socket.emit("answer")
socket.on("answer")      <-------socket.to(roomName).emit("answer")
setRemoteDescripton(answer)

*/



// RTC code

function makeConnection() {
    // 전역에서 사용할 수 있도록 전역변수로 위쪽에 선언 해둠
    myPeerConnection = new RTCPeerConnection();
    // 
    myStream
        .getTracks()
        .forEach(track => myPeerConnection.addTrack(track, myStream));
}