class DrawingCanvas{
    constructor(canvas){
        this.canvas = canvas;
        this.mode = this.canvas.getContext("2d");// we want to use the 2d option
        this.isdrawing = false;
        this.height = this.canvas.height;
        this.width = this.canvas.width;
        this.onmousedown = this.onmousedown.bind(this);
        this.onmouseup = this.onmouseup.bind(this);
        this.onmousedrag = this.onmousedrag.bind(this);
        this.onmouseleave = this.onmouseleave.bind(this);
        this.ontouchstart = this.ontouchstart.bind(this);
        this.ontouchmove = this.ontouchmove.bind(this);
        this.canvas.addEventListener("mousedown", this.onmousedown);
        this.canvas.addEventListener("mouseup", this.onmouseup);
        this.canvas.addEventListener("mousemove", this.onmousedrag);
        this.canvas.addEventListener("mouseleave", this.onmouseleave);
        this.canvas.addEventListener("touchstart", this.ontouchstart);
        this.canvas.addEventListener("touchmove", this.ontouchmove);
        this.mode.fillStyle = "black";
        this.mode.fillRect(0, 0, this.width, this.height);
    }

    ontouchstart(event) {
        event.preventDefault(); // Prevent scrolling
        this.isdrawing = true;
        let touch = event.touches[0];
        let touchposition = this.calcRelativePos([touch.clientX, touch.clientY]);
        allPositions.push([touchposition]);
    }
    
    ontouchmove(event) {
        event.preventDefault(); // Prevent scrolling
        if (this.isdrawing) {
          let touch = event.touches[0];
          let touchposition = this.calcRelativePos([touch.clientX, touch.clientY]);
          allPositions[allPositions.length - 1].push(touchposition);
          this.draw();
        }
      }

    onmousedown(message) {
        // todo start drawing on the canvas
        this.isdrawing = true;
        let mousePos = [message.clientX, message.clientY] // get the mouse position(X,Y)
        allPositions.push([this.calcRelativePos(mousePos)])
        console.log(allPositions)
    }

    onmouseup() {
        // todo stop drawing on the canvas
        this.isdrawing = false;
    }

    onmousedrag(message) {
        // todo - remember the user's mouse/finger position
        // only draw if we clicked
        if(this.isdrawing == true) {
            let mousePos = [message.clientX, message.clientY] // get the mouse position(X,Y)
            allPositions[allPositions.length-1].push(this.calcRelativePos(mousePos))
            console.log(allPositions)
            this.draw()
        }
    }

    onmouseleave() {
        // stop drawing
        this.isdrawing = false;
    }

    draw() {
        this.mode.strokeStyle = "white";
        this.mode.lineWidth = 5;
        for(let lineNo = 0; lineNo < allPositions.length; lineNo++) {
            for(let index = 0; index < allPositions[lineNo].length-1; index++) {
                let startPos = allPositions[lineNo][index];
                let endPos = allPositions[lineNo][index+1];
                this.mode.beginPath();
                this.mode.moveTo(startPos[0], startPos[1]);
                this.mode.lineTo(endPos[0], endPos[1]);
                this.mode.stroke();
            }
        }
    }

    calcRelativePos(mousePos) {
        let rect = this.canvas.getBoundingClientRect();
        let x = mousePos[0] - rect.left;
        let y = mousePos[1] - rect.top;
        return [x, y];
    }

}

let allPositions = []

let canvas = document.getElementById("drawingCanvas");
let dm = new DrawingCanvas(canvas);

let predButton = document.getElementById("predictionButton");
predButton.addEventListener("click", sendData);

let clearButton = document.getElementById("clearButton");
clearButton.addEventListener("click", clearCanvas);

function sendData() {
    console.log("***")
    console.log(allPositions)
    fetch("https://web-production-8cbdf.up.railway.app/mnist_playground", {
        method : "POST",
        body : JSON.stringify(allPositions),
        headers : {"Content-type":"application/json; charset=UTF-8"}
    }).then((response) => response.json()).then((data) => showResultAsHtml(data));
} 

function clearCanvas(){
    let clearCanvas = document.getElementById("drawingCanvas")
    clearCanvas.getContext('2d').clearRect(0, 0, 280, 280)
    allPositions = []
}

function showResultAsHtml(data){
    let div = document.getElementById("results");
    div.innerHTML = ""
        for (let i=0; i<10; i++){
    div.innerHTML+= `
        <div class="d-flex flex-row align-items-center mb-2">
            <p class="me-3 fw-bold" style="min-width: 25px; color:white;">${i}</p>
            <span style="width: 200px; height: 12px; background-color: rgba(255, 255, 255, 0.1); border-radius: 6px; overflow: hidden;">
                <div
                    style="width:${Math.round(data[i])}%;
                    height: 12px;
                    background: linear-gradient(90deg, #6366F1, #3B82F6);
                    color:white;
                    transition: width 0.3s ease;"
                    >
                </div>
            </span>
            <p class="ms-3" style="color:white;">${Math.round(data[i])}%</p>
        </div>
        `;
    }
}  
function mousedown(message){
    console.log("clicked");
    console.log(message);
}
function mouseup(message){
    console.log("Mouse released");
    console.log(message);
}
// eventlisteners - its like an ear to listen to what the user does
canvas.addEventListener("mousedown", mousedown);
canvas.addEventListener("mouseup", mouseup);
