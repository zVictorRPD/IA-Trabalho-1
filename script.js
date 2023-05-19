// Variáveis globais
const board = document.querySelector(".board");
const robot = document.querySelector(".robot");
let memory = new Stack();
let past = ['0,0'];
let started_at;

let astar_memory = [[0, 0, 0, 0]]; // [Y, X, angle, cost]
let astar_past = ['0,0,0'];
let cost_live = 0;

let loop;
let matriz;

// Criando os elementos HTML que representam as células da matriz
// que compoem o campo
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

// Adicionando os obstáculos à matriz considerando apenas células vazias
function createHoles(rate) {
    for (let i = 0; i < BOARD_ROWS; i++) {
        for (let j = 0; j < BOARD_COLS; j++) {
            if (Math.random() < rate && matriz[i][j] === 'empty') matriz[i][j] = "hole";
        }
    }
}

// Move visualmente o robô para a posição especificada e define sua direção
function moveRobot(row, col, angle) {
    robot.style.top = `${row * 25}px`;
    robot.style.left = `${col * 25}px`;
    robot.style.transform = `rotate(${angle}deg)`;
    robot.dataset.angle = angle;
}

// Função que executa o loop
function run() {
    switch(ALGORITHM) {
        case Algorithms.DFS:
            // Posição atual do personagem
            const posX = parseInt(robot.style.left || 0) / 25;
            const posY = parseInt(robot.style.top || 0) / 25;

            // Caso o personagem encontre o destino final é exibida a tela de "Victory"
            // além da pontuação até o momento sendo representada como a quantidade de
            // iterações
            if(posX === (BOARD_COLS - 1) && posY === (BOARD_ROWS - 1)) {
                showVictoryScreen();

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

            switch(parseInt(robot.dataset.angle)) {
                case 0:
                case 360:
                    assertNeighboringCellsExcept('O');
                break;

                case 45:
                case -315:
                    assertNeighboringCellsExcept('NO');
                break;

                case 90:
                case -270:
                    assertNeighboringCellsExcept('N');
                break;

                case 135:
                case -225:
                    assertNeighboringCellsExcept('NE');
                break;

                case 180:
                case -180:
                    assertNeighboringCellsExcept('E');
                break;

                case 225:
                case -135:
                    assertNeighboringCellsExcept('SE');
                break;

                case 270:
                case -90:
                    assertNeighboringCellsExcept('S');
                break;

                case 315:
                case -45:
                    assertNeighboringCellsExcept('SO');
                break;
            }

            moveUsingDepthFirstSearchAlgorithm();
        break;

        case Algorithms.A_STAR:
            moveUsingAStarSearchAlgorithm();
        break;
    }
}

// Checa todos os vizinhos mais próximo do robô e decide para quais pode se mover
function assertNeighboringCellsExcept(except) {
    const posX = parseInt(robot.style.left || 0) / 25;
    const posY = parseInt(robot.style.top || 0) / 25;

    const cardinals = {
        SE: [ 1,  1,  45],
        S:  [ 0,  1,  90],
        SO: [-1,  1, 135],
        O:  [-1,  0, 180],
        NO: [-1, -1, 225],
        N:  [ 0, -1, 270],
        NE: [ 1, -1, 315],
        E:  [ 1,  0,   0]
    }

    // Realiza tratativas para avaliar para quais locais o personagem pode se mover baseado
    // nas regras definidas na função canMoveToOutput(). Caso o personagem possa se mover
    // até a localização desejada, as coordenadas e a direção são adicionadas à pilha para
    // permitir a navegação do personagem

    // NOTE: Algumas coordenadas estão comentadas pois, sob o pensamento atual,
    // foi considerado sem sentido o personagem voltar ao destino anterior.
    // Dessa forma, por exemplo, se o personagem está virado para o Sudoeste, ele
    // estava no destino à Noroeste.
    for(let cardinal in cardinals) {
        if(except === cardinal) continue;

        const [xOff, yOff, angle] = cardinals[cardinal];

        if(canMoveToOffset(xOff, yOff)) {
            if(ALGORITHM === Algorithms.DFS) {
                memory.push([posY + yOff, posX + xOff, angle]);
            } else {
                // Realiza o calculo de custo para a Busca A*;
                const node = [posY + yOff, posX + xOff, angle, cost_live + calculateNumTurns(parseInt(robot.dataset.angle), angle) + caculateHeuristics(posX + xOff, posY + yOff)];

                // Porcura se o nó a ser visitado já foi visitado
                const memory_node = astar_memory.find(function (m_node) {
                    for(let i = 0; i < m_node.length; i++) {
                        if(m_node[i] !== node[i]) {
                            return false
                        }
                    }

                    return true;
                });

                // Caso já tenha sido visitado é avaliado se o custo do novo é menor que o anterior
                if(memory_node) {
                    // Caso o custo seja menor, o nó passado é removido da fila e adiciona o novo
                    if(memory_node[3] > node[3]) {
                        memory_node_index = astar_memory.findIndex(function (m_node) {
                            for(let i = 0; i < m_node.length; i++) {
                                if(m_node[i] !== node[i]) {
                                    return false
                                }
                            }
        
                            return true;
                        });

                        astar_memory.splice(memory_node_index, 1)
                        astar_memory.push(node);
                    }
                } else {
                    // Caso não tenha sido visitado é adicionado à fila
                    astar_memory.push(node);
                }

                // Ordena a fila por custo de maneira crescente
                astar_memory.sort(function (node_a, node_b) {
                    return node_a[3] - node_b[3];
                });
            }
        }
    }
}

// Verifica se o robô pode se mover para uma célula específica baseado em xOff e yOff
function canMoveToOffset(xOff, yOff)
{
    // Posição atual do personagem
    const posX = parseInt(robot.style.left || 0) / 25;
    const posY = parseInt(robot.style.top || 0) / 25;

    // Checa se a célula destino já foi visitada
    const is_past_cell = ALGORITHM == Algorithms.DFS 
        ? past.indexOf(`${posY + yOff},${posX + xOff}`) !== -1
        : astar_past.find(function (past) {
            const [y, x] = past.split(',');
            
            return y == posY + yOff && x == posX + xOff;
        });

    // Avalia se:
    return !is_past_cell // O destino ainda não foi visitado
            && matriz[posY + yOff] !== undefined // A linha a ser visitada existe (não está na borda inferior/superior)
            && matriz[posY + yOff][posX + xOff] !== undefined // O destino a ser visidado existe
            && matriz[posY + yOff][posX + xOff] !== 'hole'; // Não é um obstáculo
}

// Calcula o custo baseado na distância pela heurística de Manhattan
function caculateHeuristics(posX, posY)
{
    const x_dist = Math.abs(posX - (BOARD_COLS - 1));
    const y_dist = Math.abs(posY - (BOARD_ROWS - 1));
    const manhattan_dist = x_dist + y_dist;

    return manhattan_dist;
}

// Calcúla o número de giros necessário para ir de uma direção a outra
function calculateNumTurns(heading1, heading2) {
    const angle_diff = Math.abs(heading1 - heading2);

    if (angle_diff === 0) {
        return 0;
    } else if (angle_diff === 45 || angle_diff === 315) {
        return 1;
    } else if (angle_diff === 90 || angle_diff === 270) {
        return 2;
    } else if (angle_diff === 135 || angle_diff === 225) {
        return 3;
    } else if (angle_diff === 180) {
        return 4;
    }
}

// Adiciona um listener aos botões de "Novo jogo" e "Tentar de nova" para que,
// ao serem clicados, o jogo exibirá a tela de início. Pra isso,
// o loop é finalizado, o personagem retorna ao estado inicial,
// as variávies retornam ao estado inicial e é exibida apenas a 
// a tela de início com as configurações.
document.querySelectorAll('.new__game').forEach(function (button) {
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
        
                memory = new Stack();
                past = ['0,0'];
                
                astar_memory = [[0, 0, 0, 0]]; // [Y, X, angle, cost]
                astar_past = ['0,0,0'];
                cost_live = 0;
        
                document.getElementById('death__screen').classList.remove('show');
                document.getElementById('end__screen').classList.remove('show');
                document.getElementById('start__screen').style.display = 'flex';
                document.getElementById('end__audio').load();
            }, 35);
        });
    });
});

// Realiza o loop utilizando o algoritmo de busca em profundidade
function moveUsingDepthFirstSearchAlgorithm()
{
    try {
        // Remove da pilha o próximo destino do personagem
        // Caso a pilha esteja vazia isso indica que as opções acabaram e o jogo terminou
        let next_offset = memory.pop();

        // Move o personagem para o próximo destino e define a direção do mesmo
        moveRobot(...next_offset);
    
        // Adiciona o destino no array contendo as coordenadas percorridas
        past.push(`${next_offset[0]},${next_offset[1]}`);
    } catch(e) {
        showDeathScreen();
        return;
    }
}

// Realiza o loop utilizando o algoritmo de busca a*
function moveUsingAStarSearchAlgorithm()
{
    const posX = parseInt(robot.style.left || 0) / 25;
    const posY = parseInt(robot.style.top || 0) / 25;
    
    let [y, x, angle, cost] = astar_memory[0];

    if(posX == BOARD_COLS - 1 && posY == BOARD_ROWS - 1) {
        astar_past.push(`${y},${x},${cost}`);
        showVictoryScreen();
        return;
    } else {
        switch(parseInt(robot.dataset.angle)) {
            case 0:
            case 360:
                assertNeighboringCellsExcept('O');
            break;

            case 45:
            case -315:
                assertNeighboringCellsExcept('NO');
            break;

            case 90:
            case -270:
                assertNeighboringCellsExcept('N');
            break;

            case 135:
            case -225:
                assertNeighboringCellsExcept('NE');
            break;

            case 180:
            case -180:
                assertNeighboringCellsExcept('E');
            break;

            case 225:
            case -135:
                assertNeighboringCellsExcept('SE');
            break;

            case 270:
            case -90:
                assertNeighboringCellsExcept('S');
            break;

            case 315:
            case -45:
                assertNeighboringCellsExcept('SO');
            break;
        }

        // Adiciona o nó de menor custo ao início da fila
        [y, x, angle, cost] = astar_memory.shift();
    }

    cost_live = calculateNumTurns(robot.dataset.angle, angle);
    moveRobot(y, x, angle);

    astar_past.push(`${y},${x},${cost}`);

    if(astar_memory.length === 0) {
        showDeathScreen();
        return;
    }
}

// Inicia o jogo baseado nas configfurações definidas na tela de início
// Cria o campo e adiciona os obstátulos no mesmo. Inicia o loop e grava o
// momento de início do jogo para cálculo da pontuação
function start()
{
    BOARD_ROWS = parseInt(document.getElementById('BOARD_ROWS').value);
    BOARD_COLS = parseInt(document.getElementById('BOARD_COLS').value);
    HOLE_RATE = parseFloat(document.getElementById('HOLE_RATE').value);
    LOOP_INTERVAL = parseInt(document.getElementById('LOOP_INTERVAL').value);
    ALGORITHM = document.getElementById('ALGORITHM').value;

    matriz = new Array(BOARD_ROWS).fill("empty");

    for (let i = 0; i < BOARD_ROWS; i++) {
        matriz[i] = new Array(BOARD_COLS).fill("empty");
    }

    createHoles(HOLE_RATE);
    createBoard();
    document.getElementById('end__audio').load();
    document.getElementById('start__screen').style.display = 'none';

    started_at = new Date().getTime();
    loop = setInterval(run, LOOP_INTERVAL);
}

// Reseta as variáveis para os valores padrões
function resetConfigs()
{
    BOARD_ROWS = 20;
    BOARD_COLS = 20;
    HOLE_RATE = 0.2;
    LOOP_INTERVAL = 500; 
    ALGORITHM = Algorithms.DFS;

    document.getElementById('BOARD_ROWS').value = BOARD_ROWS.toString();
    document.getElementById('BOARD_COLS').value = BOARD_COLS.toString();
    document.getElementById('HOLE_RATE').value = HOLE_RATE.toString();
    document.getElementById('LOOP_INTERVAL').value = LOOP_INTERVAL.toString();
    document.getElementById('ALGORITHM').value = ALGORITHM.toString();
}

// Mostra a tela de vitória
function showVictoryScreen()
{
    clearInterval(loop);

    document.getElementById('end__screen').classList.add('show');
    document.getElementById('end__score').innerHTML = new Date().getTime() - started_at;
    document.getElementById('end__audio').play();
}

// A pilha está vazia. Dessa forma, o loop é finalizado
// e é exibida a tela de "Game Over". Também é mostrado na tela 
// o tempo em milisegundos até a finalização do jogo
function showDeathScreen()
{
    clearInterval(loop);
        
    document.getElementById('death__screen').classList.add('show');
    document.getElementById('death__score').innerHTML = new Date().getTime() - started_at;
    new Audio('./audios/death.mp3').play();
}
