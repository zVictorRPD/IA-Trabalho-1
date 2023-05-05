/* 
    empty = espaço vazio
    hole = buraco/obstáculo
    robot = robô
    start = início
    end = fim
*/

//Global variables
const board = document.querySelector(".board");
const robot = document.querySelector(".robot");
let matriz = new Array(36).fill("empty");
for (let i = 0; i < 36; i++) {
    matriz[i] = new Array(36).fill("empty");
}

class Robot {
    constructor(row, col, angle) {
        this.row = row;
        this.col = col;
        this.angle = angle;
    }
}

function createBoard() {
    matriz.forEach((row, rowIndex) => {
        row.forEach((column, columnIndex) => {
            const div = document.createElement("div");
            div.classList.add("cell");
            div.classList.add(matriz[rowIndex][columnIndex]);
            div.setAttribute("data-row", rowIndex);
            div.setAttribute("data-column", columnIndex);
            board.appendChild(div);
        });
    });
}

function createHoles(rate) {
    for (let i = 0; i < 36; i++) {
        for (let j = 0; j < 36; j++) {
            if (Math.random() < rate) matriz[i][j] = "hole";
        }
    }
}

function moveRobot(row, col, angle) {
    let robot = document.querySelector(".robot");
    robot.style.top = `${row * 25}px`;
    robot.style.left = `${col * 25}px`;
    robot.style.transform = `rotate(${angle}deg)`;
}

matriz[0][0] = "start";
matriz[35][35] = "end";

createHoles(0.2);
createBoard();


setTimeout(() => {
    moveRobot(0, 1, 0);
}, 1000);
setTimeout(() => {
    moveRobot(0, 2, 0);
}, 2000);
setTimeout(() => {
    moveRobot(0, 3, 0);
}, 3000);