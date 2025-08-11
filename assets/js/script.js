// 게임 진행 상태
const GAME_STATUS = {
    READY: "ready",
    PLAYING: "playing",
    GAME_OVER: "game_over",
    GAME_CLEAR: "game_clear",
};

// 게임 난이도
const GAME_MODE = {
    EASY: {
        name: "easy",
        size: 10,
        mineCount: 10,
    },
    NORMAL: {
        name: "normal",
        size: 16,
        mineCount: 40,
    },
    HARD: {
        name: "hard",
        size: 25,
        mineCount: 125,
    },
};

const NO_MINE = 0; // 지뢰 없음
const MINE_EXISTS = 1; // 지뢰 있음
let MINE_MAP = []; // 지뢰 맵

const NO_SEARCH = 0; // 클릭하지 않음
const NO_NEAR_MINE = 1; // 근처에 지뢰가 없음
const NEAR_MINE = 2; // 근처에 지뢰가 있음
let SEARCH_MAP = []; // 클릭 정보 배열

const NO_FLAG = 0; // 깃발을 설치하지 않음
const FLAG = 1; // 깃발을 설치함
let FLAG_MAP = []; // 깃발 맵

// DOM elements
const gameContainer = document.getElementById("game-container");
const endMessageContainer = document.getElementById("end-message");
const gameOverContainer = document.getElementById("overlay-gameover");

const gameModeSelect = document.getElementById("select-game-mode");

const inputSize = document.getElementById("size");
const inputMineCount = document.getElementById("mine-count");

const restartButton = document.getElementById("btn-restart");
const startButton = document.getElementById("btn-start");
const debugButton = document.getElementById("btn-debug");

const flagCountDisplay = document.getElementById("flag-count-display");
const gameTimeDisplay = document.getElementById("game-time-display");

const columns = document.getElementsByClassName("column");

// 게임 상태 초기화
let GAME_WIDTH = 0;
let GAME_HEIGHT = 0;
let MINE_COUNT = 0;

let timeCount = 0;
let timerId = null;

let gameStatus = GAME_STATUS.READY;

// 게임 제어 이벤트
// 게임 종료시 재시작 버튼 클릭
restartButton.addEventListener("click", () => {
    start();
});

// 게임 시작 버튼 클릭
startButton.addEventListener("click", () => {
    start();
});

// 난이도 선택 시 맵의 크기, 지뢰의 개수 자동 지정
gameModeSelect.addEventListener("input", (event) => {
    const selectedMode = event.target.value;
    if (selectedMode === "easy") {
        inputSize.value = GAME_MODE.EASY.size;
        inputMineCount.value = GAME_MODE.EASY.mineCount;
    } else if (selectedMode === "normal") {
        inputSize.value = GAME_MODE.NORMAL.size;
        inputMineCount.value = GAME_MODE.NORMAL.mineCount;
    } else if (selectedMode === "hard") {
        inputSize.value = GAME_MODE.HARD.size;
        inputMineCount.value = GAME_MODE.HARD.mineCount;
    } else {
    }
});

// 유효한 입력값 검증
function validate(width, height, mineCount) {
    if (
        !width ||
        width < 5 ||
        width > 50 ||
        !height ||
        height < 5 ||
        height > 50
    ) {
        alert("크기는 5 이상 50 이하이어야 합니다.");
        return false;
    }
    if (!mineCount || mineCount < 1 || mineCount > (width * height) / 2) {
        alert("지뢰 개수는 1 이상 맵 크기 비율의 절반 이하이어야 합니다.");
        return false;
    }
    return true;
}

// 게임 시작 버튼/재시작 버튼 클릭 시 게임 초기화
function start() {
    // 노란 얼굴 표정 초기화
    startButton.style.backgroundImage = `url('../assets/images/game_play.png')`;

    // 게임 종료 오버레이 숨김
    gameOverContainer.style.display = "none";

    // 맵 크기, 지뢰 개수 초기화
    GAME_WIDTH = parseInt(inputSize.value);
    GAME_HEIGHT = GAME_WIDTH; // 세로 크기를 가로 크기와 동일하게 설정
    MINE_COUNT = parseInt(inputMineCount.value);

    // 입력받은 값 유효성 검사
    if (!validate(GAME_WIDTH, GAME_HEIGHT, MINE_COUNT)) {
        return;
    }

    // 지뢰 개수 표시 (000~999)
    flagCountDisplay.innerText = `${String(MINE_COUNT).padStart(3, "0")}`;

    // 사용자가 클릭할 수 있는 지뢰찾기 판 생성
    initGame(GAME_WIDTH, GAME_HEIGHT, MINE_COUNT);

    // 생성된 판에 클릭/우클릭 이벤트 추가
    for (let i = 0; i < MINE_MAP.length * MINE_MAP[0].length; ++i) {
        columns[i].addEventListener("click", clickEventHandler);
        columns[i].addEventListener("contextmenu", rightClickEventHandler);
    }

    // 게임 상태를 시작으로 변경
    gameStatus = GAME_STATUS.PLAYING;
    // 타이머 시작
    timerStart();
}

// 입력받은 판의 크기, 지뢰 개수에 따라 지뢰찾기판 생성
function initGame(width, height, mineCount) {
    // 지뢰 개수만큼 랜덤한 위치에 중복되지 않게 지뢰 생성
    MINE_MAP = createMap(height, width, mineCount);

    // 클릭 정보, 깃발 정보는 전부 빈 형태로 배열 초기화
    SEARCH_MAP = Array.from({ length: height }, () =>
        Array(width).fill(NO_SEARCH)
    );
    FLAG_MAP = Array.from({ length: height }, () => Array(width).fill(NO_FLAG));

    // 입력받은 크기에 맞게 지뢰찾기판 태그 생성
    let temp = `
        <ul>
    `;

    for (let i = 0; i < MINE_MAP.length; ++i) {
        temp += `
            <li class="row" style="width: ${width * 30}px;">
            <ul>
        `;

        for (let j = 0; j < MINE_MAP[i].length; ++j) {
            temp += `
                <li class="column" data-row="${i}" data-column="${j}"></li>
            `;
        }
        temp += `
            </li>
            </ul>
        `;
    }

    temp += `
        </ul>
    `;

    // 만들어진 태그를 문서에 삽입
    gameContainer.innerHTML = temp;
}

// 지뢰의 개수만큼 랜덤한 위치에 지뢰 생성
function createMap(rows, columns, mineCount) {
    // 초기화된 맵 생성
    const map = Array.from({ length: rows }, () =>
        Array(columns).fill(NO_MINE)
    );

    // 랜덤한 위치에 지뢰 배치
    for (let i = 0; i < mineCount; i++) {
        let row, column;
        do {
            row = Math.floor(Math.random() * rows);
            column = Math.floor(Math.random() * columns);
        } while (map[row][column] === MINE_EXISTS); // 이미 지뢰가 있는 위치는 제외
        map[row][column] = MINE_EXISTS; // 지뢰 배치
    }

    return map;
}

function timerStart() {
    // 이미 타이머가 있으면 초기화
    if (timerId) {
        clearInterval(timerId);
    }

    // 0초부터 시작
    timeCount = 0;
    gameTimeDisplay.innerText = "000";

    // 1초마다 증가하며 만약 999초가 될 경우 게임 종료
    timerId = setInterval(() => {
        timeCount++;
        gameTimeDisplay.innerText = `${String(timeCount).padStart(3, "0")}`;
        if (timeCount >= 999) {
            failGame("시간 초과! 😢");
        }
    }, 1000);
}

// SEARCH_MAP과 FLAG_MAP을 화면애 표시
function render() {
    let flagCount = 0;
    for (let i = 0; i < MINE_MAP.length; ++i) {
        for (let j = 0; j < MINE_MAP[i].length; ++j) {
            const target = columns[i * MINE_MAP.length + j];

            // 해당 위치에 발견 정보가 있다면
            if (SEARCH_MAP[i][j]) {
                target.classList.remove("flag");
                target.classList.add(
                    SEARCH_MAP[i][j] === NO_NEAR_MINE
                        ? "open-disable"
                        : "open-near-mine"
                );

                // 근처에 지뢰가 있다면 칸에 숫자 표시
                if (SEARCH_MAP[i][j] === NEAR_MINE) {
                    const { aroundMines } = getAroundInfo(i, j);
                    const mineCount = aroundMines.reduce(
                        (acc, cur) => acc + cur,
                        0
                    );
                    target.innerText = mineCount;
                    target.style.color = getCountColor(mineCount);
                }
            }

            // 발견 정보가 없지만 깃발 정보가 있으면 칸에 깃발 표시후 깃발 개수 증가
            else if (FLAG_MAP[i][j]) {
                target.classList.add("flag");
                flagCount++;
            }
        }
    }

    // (남은 지뢰 수 - 깃발 개수) 표시
    flagCountDisplay.innerText = `${String(
        Math.max(0, MINE_COUNT - flagCount)
    ).padStart(3, "0")}`;
}

// 특정 칸에서 근처에 지뢰가 있는지 계산(맵 밖일 경우 filter를 통해 무시)
function getAroundInfo(row, column) {
    const aroundPositions = [
        [row - 1, column - 1],
        [row - 1, column + 0],
        [row - 1, column + 1],
        [row + 0, column - 1],
        [row + 0, column + 1],
        [row + 1, column - 1],
        [row + 1, column + 0],
        [row + 1, column + 1],
    ].filter(
        ([r, c]) =>
            r >= 0 && r < MINE_MAP.length && c >= 0 && c < MINE_MAP[0].length
    );
    const aroundMines = aroundPositions.map(([r, c]) => MINE_MAP[r][c]);

    return {
        aroundPositions,
        aroundMines,
    };
}

// 지뢰 개수에 따라 숫자 색상을 반환하는 함수
function getCountColor(count) {
    switch (count) {
        case 1:
            return "blue";
        case 2:
            return "green";
        case 3:
            return "red";
        case 4:
            return "darkblue";
        case 5:
            return "darkred";
        case 6:
            return "cyan";
        case 7:
            return "black";
        case 8:
            return "gray";
        default:
            return "";
    }
}

// 칸을 좌클릭했을 경우
function clickEventHandler(event) {
    const target = event.currentTarget;
    const { row, column } = target.dataset;
    const parseRow = parseInt(row);
    const parseColumn = parseInt(column);

    // 게임 진행중이 아닐 경우 return
    if (gameStatus !== GAME_STATUS.PLAYING) {
        return;
    }

    // 유효하지 않은 위치 클릭
    if (
        parseRow < 0 ||
        parseColumn < 0 ||
        parseRow >= MINE_MAP.length ||
        parseColumn >= MINE_MAP[0].length
    ) {
        return;
    }

    // 깃발이 꽂혀 있는 칸은 좌클릭해도 아무 동작도 하지 않음
    if (FLAG_MAP[parseRow][parseColumn] === FLAG) {
        return;
    }

    // 지뢰 클릭 시 게임 오버
    if (MINE_MAP[parseRow][parseColumn] === MINE_EXISTS) {
        failGame();
        return;
    }

    // 클릭한 위치 개방
    open(parseRow, parseColumn);
    // 게임 정보 화면에 표시
    render();
}

// 우클릭 이벤트 핸들러
function rightClickEventHandler(event) {
    // 기본 우클릭 이벤트 취소(메뉴 뜨는것)
    event.preventDefault();

    // 게임 진행중이 아닐 경우 return
    if (gameStatus !== GAME_STATUS.PLAYING) {
        return;
    }

    const target = event.currentTarget;
    const { row, column } = target.dataset;

    // 이미 열려있는 칸은 아무 동작도 하지 않음
    if (SEARCH_MAP[row][column]) {
        return;
    }

    // 깃발이 없는 칸에 깃발을 꽂음
    if (FLAG_MAP[row][column] === NO_FLAG) {
        FLAG_MAP[row][column] = FLAG;
        target.classList.add("flag");
    }

    // 깃발이 있는 칸에서 깃발을 제거함
    else if (FLAG_MAP[row][column] === FLAG) {
        FLAG_MAP[row][column] = NO_FLAG;
        target.classList.remove("flag");
    }

    // 게임 정보 화면에 표시
    render();

    // 모든 지뢰를 찾았을 경우 게임 클리어
    if (checkMine()) {
        completeGame();
    }
}

// 모든 지뢰에 깃발이 꽃혀있는지 확인
function checkMine() {
    for (let i = 0; i < MINE_MAP.length; ++i) {
        for (let j = 0; j < MINE_MAP[i].length; ++j) {
            if (MINE_MAP[i][j] !== MINE_EXISTS) continue; // 지뢰가 아닌 칸은 무시
            if (FLAG_MAP[i][j] !== FLAG) {
                return false; // 지뢰가 있지만 깃발이 꽂혀 있지 않음
            }
        }
    }
    return true; // 모든 지뢰에 깃발이 꽂혀 있음
}

// 게임 종료 시 모든 지뢰 위치 표시
function showMine() {
    for (let i = 0; i < MINE_MAP.length; ++i) {
        for (let j = 0; j < MINE_MAP[i].length; ++j) {
            const target = columns[i * MINE_MAP.length + j];
            if (MINE_MAP[i][j] === MINE_EXISTS) {
                target.classList.add("mine");
            }
        }
    }
}

// 특정 위치 개방(마우스클릭 or 주변에 지뢰가 없을 경우 재귀적으로 개방)
function open(row, column) {
    // 이미 열려있는 칸은 무시
    if (SEARCH_MAP[row][column]) {
        return;
    }

    const { aroundPositions, aroundMines } = getAroundInfo(row, column);
    FLAG_MAP[row][column] = NO_FLAG; // 깃발 제거

    // 근처 8칸 주변에 지뢰가 없는 경우
    if (aroundMines.every((mine) => !mine)) {
        SEARCH_MAP[row][column] = NO_NEAR_MINE;
        aroundPositions.forEach(([r, c]) => open(r, c)); // 근처 8칸에 지뢰가 없으므로 전부 개방
    }
    // 주변에 지뢰가 있는 경우
    else {
        SEARCH_MAP[row][column] = NEAR_MINE;
    }
}

// 게임 클리어 오버레이 표시
function completeGame() {
    timerId && clearInterval(timerId);
    gameStatus = GAME_STATUS.GAME_CLEAR;

    startButton.style.backgroundImage = `url('../assets/images/game_clear.png')`;
    gameOverContainer.style.display = "flex";
    endMessageContainer.innerText = `게임 클리어! 🎉\n플레이 시간 : ${timeCount}초`;
}

// 게임 실패 오버레이 표시, 모든 지뢰 위치 표시
function failGame(reason = "게임 오버! 😢") {
    gameStatus = GAME_STATUS.GAME_OVER;
    timerId && clearInterval(timerId);

    startButton.style.backgroundImage = `url('../assets/images/game_fail.png')`;
    gameOverContainer.style.display = "flex";
    endMessageContainer.innerText = reason;

    showMine();
}
