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
let memory = new Stack();
let past = ['0,0'];
let started_at;

let matriz = new Array(BOARD_ROWS).fill("empty");
for (let i = 0; i < BOARD_ROWS; i++) {
    matriz[i] = new Array(BOARD_COLS).fill("empty");
}

function createBoard() {
    matriz[0][0] = "start";
    matriz[BOARD_ROWS - 1][BOARD_COLS - 1] = "end"; 

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

    board.style.width = `${BOARD_COLS * 25}px`;
    board.style.height = `${BOARD_ROWS * 25}px`;
}

function createHoles(rate) {
    for (let i = 0; i < BOARD_ROWS; i++) {
        for (let j = 0; j < BOARD_COLS; j++) {
            if (Math.random() < rate && matriz[i][j] === 'empty') matriz[i][j] = "hole";
        }
    }
}

function moveRobot(row, col, angle) {
    robot.style.top = `${row * 25}px`;
    robot.style.left = `${col * 25}px`;
    robot.style.transform = `rotate(${angle}deg)`;
    robot.dataset.angle = angle;
}

function run() {
    // Posição atual do personagem
    const posX = parseInt(robot.style.left || 0) / 25;
    const posY = parseInt(robot.style.top || 0) / 25;
    
    // Caso o personagem encontre o destino final é exibida a tela de "Victory"
    // além da pontuação até o momento sendo representada como a quantidade de
    // iterações
    if(posX === (BOARD_COLS - 1) && posY === (BOARD_ROWS - 1)) {
        clearInterval(loop);

        document.getElementById('end__screen').classList.add('show');
        document.getElementById('end__score').innerHTML = new Date().getTime() - started_at;
        document.getElementById('end__audio').play();

        return;
    }

    /**
     * N  = Norte    = 0°
     * NE = Nordeste = 45°
     * E  = Leste    = 90°
     * SE = Sudeste  = 135°
     * S  = Sul      = 180°
     * SO = Sudoeste = 225°
     * O  = Oeste    = 270°
     * NO = Noroeste = 315°
     */

    // Realiza tratativas para avaliar para quais locais o personagem pode se mover baseado
    // nas regras definidas na função canMoveToOutput(). Caso o personagem possa se mover
    // até a localização desejada, as coordenadas e a direção são adicionadas à pilha para
    // permitir a navegação do personagem

    // NOTE: Algumas coordenadas estão comentadas pois, sob a heurística atual,
    // foi considerado sem sentido o personagem voltar ao destino anterior.
    // Dessa forma, por exemplo, se o personagem está virado para o Sudoeste, ele
    // estava no destino à Noroeste.
    switch(parseInt(robot.dataset.angle)) {
        case 0:
        case 360:
            // TODO: refatorar essa porção do código. Os ifs são sempres os mesmos
            // tirando os casos específicos de cada orientação do personagem.

            if(canMoveToOffset(1, 1)) { // SE
                memory.push([posY + 1, posX + 1, 45]);
            }

            if(canMoveToOffset(0, 1)) { // S
                memory.push([posY + 1, posX, 90]);
            }

            if(canMoveToOffset(-1, 1)) { // SO
                memory.push([posY + 1, posX - 1, 135]);
            }

            // if(canMoveToOffset(-1, 0)) { // O
            //     memory.push([posY, posX - 1, 180]);
            // }

            if(canMoveToOffset(-1, -1)) { // NO
                memory.push([posY - 1, posX - 1, 225]);
            }

            if(canMoveToOffset(0, -1)) { // N
                memory.push([posY - 1, posX, 270]);
            }

            if(canMoveToOffset(1, -1)) { // NE
                memory.push([posY - 1, posX + 1, 315]);
            }

            if(canMoveToOffset(1, 0)) { // E
                memory.push([posY, posX + 1, 0]);
            }
        break;

        case 45:
        case -315:
            if(canMoveToOffset(1, 1)) { // SE
                memory.push([posY + 1, posX + 1, 45]);
            }

            if(canMoveToOffset(0, 1)) { // S
                memory.push([posY + 1, posX, 90]);
            }

            if(canMoveToOffset(-1, 1)) { // SO
                memory.push([posY + 1, posX - 1, 135]);
            }

            if(canMoveToOffset(-1, 0)) { // O
                memory.push([posY, posX - 1, 180]);
            }

            // if(canMoveToOffset(-1, -1)) { // NO
            //     memory.push([posY - 1, posX - 1, 225]);
            // }

            if(canMoveToOffset(0, -1)) { // N
                memory.push([posY - 1, posX, 270]);
            }

            if(canMoveToOffset(1, -1)) { // NE
                memory.push([posY - 1, posX + 1, 315]);
            }

            if(canMoveToOffset(1, 0)) { // E
                memory.push([posY, posX + 1, 0]);
            }
        break;

        case 90:
        case -270:
            if(canMoveToOffset(1, 1)) { // SE
                memory.push([posY + 1, posX + 1, 45]);
            }

            if(canMoveToOffset(0, 1)) { // S
                memory.push([posY + 1, posX, 90]);
            }

            if(canMoveToOffset(-1, 1)) { // SO
                memory.push([posY + 1, posX - 1, 135]);
            }

            if(canMoveToOffset(-1, 0)) { // O
                memory.push([posY, posX - 1, 180]);
            }

            if(canMoveToOffset(-1, -1)) { // NO
                memory.push([posY - 1, posX - 1, 225]);
            }

            // if(canMoveToOffset(0, -1)) { // N
            //     memory.push([posY - 1, posX, 270]);
            // }

            if(canMoveToOffset(1, -1)) { // NE
                memory.push([posY - 1, posX + 1, 315]);
            }

            if(canMoveToOffset(1, 0)) { // E
                memory.push([posY, posX + 1, 0]);
            }
        break;

        case 135:
        case -225:
            if(canMoveToOffset(1, 1)) { // SE
                memory.push([posY + 1, posX + 1, 45]);
            }

            if(canMoveToOffset(0, 1)) { // S
                memory.push([posY + 1, posX, 90]);
            }

            if(canMoveToOffset(-1, 1)) { // SO
                memory.push([posY + 1, posX - 1, 135]);
            }

            if(canMoveToOffset(-1, 0)) { // O
                memory.push([posY, posX - 1, 180]);
            }

            if(canMoveToOffset(-1, -1)) { // NO
                memory.push([posY - 1, posX - 1, 225]);
            }

            if(canMoveToOffset(0, -1)) { // N
                memory.push([posY - 1, posX, 270]);
            }

            // if(canMoveToOffset(1, -1)) { // NE
            //     memory.push([posY - 1, posX + 1, 315]);
            // }

            if(canMoveToOffset(1, 0)) { // E
                memory.push([posY, posX + 1, 0]);
            }
        break;

        case 180:
        case -180:
            if(canMoveToOffset(1, 1)) { // SE
                memory.push([posY + 1, posX + 1, 45]);
            }

            if(canMoveToOffset(0, 1)) { // S
                memory.push([posY + 1, posX, 90]);
            }

            if(canMoveToOffset(-1, 1)) { // SO
                memory.push([posY + 1, posX - 1, 135]);
            }

            if(canMoveToOffset(-1, 0)) { // O
                memory.push([posY, posX - 1, 180]);
            }

            if(canMoveToOffset(-1, -1)) { // NO
                memory.push([posY - 1, posX - 1, 225]);
            }

            if(canMoveToOffset(0, -1)) { // N
                memory.push([posY - 1, posX, 270]);
            }

            if(canMoveToOffset(1, -1)) { // NE
                memory.push([posY - 1, posX + 1, 315]);
            }

            // if(canMoveToOffset(1, 0)) { // E
            //     memory.push([posY, posX + 1, 0]);
            // }
        break;

        case 225:
        case -135:
            // if(canMoveToOffset(1, 1)) { // SE
            //     memory.push([posY + 1, posX + 1, 45]);
            // }

            if(canMoveToOffset(0, 1)) { // S
                memory.push([posY + 1, posX, 90]);
            }

            if(canMoveToOffset(-1, 1)) { // SO
                memory.push([posY + 1, posX - 1, 135]);
            }

            if(canMoveToOffset(-1, 0)) { // O
                memory.push([posY, posX - 1, 180]);
            }

            if(canMoveToOffset(-1, -1)) { // NO
                memory.push([posY - 1, posX - 1, 225]);
            }

            if(canMoveToOffset(0, -1)) { // N
                memory.push([posY - 1, posX, 270]);
            }

            if(canMoveToOffset(1, -1)) { // NE
                memory.push([posY - 1, posX + 1, 315]);
            }

            if(canMoveToOffset(1, 0)) { // E
                memory.push([posY, posX + 1, 0]);
            }
        break;

        case 270:
        case -90:
            if(canMoveToOffset(1, 1)) { // SE
                memory.push([posY + 1, posX + 1, 45]);
            }

            // if(canMoveToOffset(0, 1)) { // S
            //     memory.push([posY + 1, posX, 90]);
            // }

            if(canMoveToOffset(-1, 1)) { // SO
                memory.push([posY + 1, posX - 1, 135]);
            }

            if(canMoveToOffset(-1, 0)) { // O
                memory.push([posY, posX - 1, 180]);
            }

            if(canMoveToOffset(-1, -1)) { // NO
                memory.push([posY - 1, posX - 1, 225]);
            }

            if(canMoveToOffset(0, -1)) { // N
                memory.push([posY - 1, posX, 270]);
            }

            if(canMoveToOffset(1, -1)) { // NE
                memory.push([posY - 1, posX + 1, 315]);
            }

            if(canMoveToOffset(1, 0)) { // E
                memory.push([posY, posX + 1, 0]);
            }
        break;

        case 315:
        case -45:
            if(canMoveToOffset(1, 1)) { // SE
                memory.push([posY + 1, posX + 1, 45]);
            }

            if(canMoveToOffset(0, 1)) { // S
                memory.push([posY + 1, posX, 90]);
            }

            // if(canMoveToOffset(-1, 1)) { // SO
            //     memory.push([posY + 1, posX - 1], 135);
            // }

            if(canMoveToOffset(-1, 0)) { // O
                memory.push([posY, posX - 1, 180]);
            }

            if(canMoveToOffset(-1, -1)) { // NO
                memory.push([posY - 1, posX - 1, 225]);
            }

            if(canMoveToOffset(0, -1)) { // N
                memory.push([posY - 1, posX, 270]);
            }

            if(canMoveToOffset(1, -1)) { // NE
                memory.push([posY - 1, posX + 1, 315]);
            }

            if(canMoveToOffset(1, 0)) { // E
                memory.push([posY, posX + 1, 0]);
            }
        break;
    }

    try {
        // Remove da pilha o próximo destino do personagem
        // Caso a pilha esteja vazia isso indica que as opções acabaram e o jogo terminou
        let next_offset = memory.pop();

        // Move o personagem para o próximo destino e define a direção do mesmo
        moveRobot(...next_offset);
    
        // Adiciona o destino no array contendo as coordenadas percorridas
        past.push(`${next_offset[0]},${next_offset[1]}`);
    } catch(e) {
        // A pilha está vazia. Dessa forma, o loop é finalizado
        // e é exibida a tela de "Game Over". Também é mostrado na tela 
        // o tempo em milisegundos até a finalização do jogo

        clearInterval(loop);
        
        document.getElementById('death__screen').classList.add('show');
        document.getElementById('death__score').innerHTML = new Date().getTime() - started_at;
        new Audio('./audios/death.mp3').play();
    }
}

function canMoveToOffset(xOff, yOff)
{
    // Posição atual do personagem
    const posX = parseInt(robot.style.left || 0) / 25;
    const posY = parseInt(robot.style.top || 0) / 25;

    // Avalia se:
    return past.indexOf(`${posY + yOff},${posX + xOff}`) === -1 // O destino ainda não foi visitado
            && matriz[posY + yOff] !== undefined // A linha a ser visitada existe (não está na borda inferior/superior)
            && matriz[posY + yOff][posX + xOff] !== undefined // O destino a ser visidado existe
            && matriz[posY + yOff][posX + xOff] !== 'hole'; // Não é um obstáculo
}

createHoles(HOLE_RATE);
createBoard();
document.getElementById('end__audio').load();

// Inicia o loop
started_at = new Date().getTime();
let loop = setInterval(run, LOOP_INTERVAL);

document.querySelectorAll('button').forEach(function (button) {
    // Adiciona um listener a todos os botões para que,
    // ao serem clicados, o jogo será reiniciado. Pra isso,
    // o loop é finalizado, o campo regerado (incluindo obstáculos)
    // e o personagem retorna ao estado inicial.
    // Por fim, o loop é recriado
    button.addEventListener('click', function () {
        new Audio('./audios/button.mp3').play().then(function () {
            setTimeout(function () {
                clearInterval(loop);
                document.querySelectorAll('.board .cell').forEach(function (el) {
                    el.remove()
                });
                robot.style.top = '0';
                robot.style.left = '0';
                robot.style.transform = 'rotate(0deg)';
                robot.dataset.angle = '0';
        
                matriz = new Array(BOARD_ROWS).fill("empty");
                for (let i = 0; i < BOARD_ROWS; i++) {
                    matriz[i] = new Array(BOARD_COLS).fill("empty");
                }
        
                memory = new Stack();
                past = ['0,0'];
        
                createHoles(HOLE_RATE);
                createBoard();
        
                document.getElementById('death__screen').classList.remove('show');
                document.getElementById('end__screen').classList.remove('show');
                document.getElementById('end__audio').load();
        
                started_at = new Date().getTime();
                loop = setInterval(run, LOOP_INTERVAL);
            }, 35);
        });
    });
});
