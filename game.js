const canvas = document.querySelector("#game");
const game = canvas.getContext("2d");

window.addEventListener("DOMContentLoaded", startGame);
window.addEventListener("resize", setCanvasSize);

// Obtener referencias a los botones
const upButton = document.getElementById("up");
const leftButton = document.getElementById("left");
const rightButton = document.getElementById("right");
const downButton = document.getElementById("down");

const spanLives = document.getElementById("lives");
const spanTime = document.getElementById("time");
const recordTime = document.getElementById("record");

// Agregar manejadores de eventos a los botones
upButton.addEventListener("click", () => movePlayer("up"));
leftButton.addEventListener("click", () => movePlayer("left"));
rightButton.addEventListener("click", () => movePlayer("right"));
downButton.addEventListener("click", () => movePlayer("down"));

document.addEventListener("keydown", handleKeyDown);

let playerPosition = {
  x: undefined,
  y: undefined,
};
let giftPosition = {
  x: undefined,
  y: undefined,
};
let bombPosition = [];
let lives = 3;
let startMap = 0;

let timeStart;
let timePlayer;
let timeInterval;

function handleKeyDown(event) {
  const key = event.key.toLowerCase();
  let direction;

  switch (key) {
    case "arrowup":
    case "w":
      direction = "up";
      break;
    case "arrowleft":
    case "a":
      direction = "left";
      break;
    case "arrowright":
    case "d":
      direction = "right";
      break;
    case "arrowdown":
    case "s":
      direction = "down";
      break;
    default:
      return;
  }

  // Realizar alguna acción basada en la dirección detectada
  // Por ejemplo, llamar a una función para mover al jugador en esa dirección
  movePlayer(direction);
}

let elementsSize;
let map;

function startGame() {
  parseMap();
  setCanvasSize();
}

async function movePlayer(direction) {
  // Realizar acciones según la dirección recibida
  switch (direction) {
    case "up":
      if (!(playerPosition.y > 0)) {
        return; // No se cumple la condición, se sale de la función sin hacer nada
      }
      playerPosition.y -= 1;
      // Lógica para mover al jugador hacia arriba
      break;
    case "left":
      if (!(playerPosition.x > 0)) {
        return; // No se cumple la condición, se sale de la función sin hacer nada
      }
      playerPosition.x -= 1;
      // Lógica para mover al jugador hacia la izquierda
      break;
    case "right":
      if (!(playerPosition.x < 9)) {
        return; // No se cumple la condición, se sale de la función sin hacer nada
      }
      playerPosition.x += 1;
      // Lógica para mover al jugador hacia la derecha
      break;
    case "down":
      if (!(playerPosition.y < 9)) {
        return; // No se cumple la condición, se sale de la función sin hacer nada
      }
      playerPosition.y += 1;
      // Lógica para mover al jugador hacia abajo
      break;
    default:
      return;
  }
  showTime();

  if (
    giftPosition.x === playerPosition.x &&
    giftPosition.y === playerPosition.y
  ) {
    lvlUp();
    return;
  } else if (
    bombPosition.some(
      (bombItem) =>
        bombItem.x === playerPosition.x && bombItem.y === playerPosition.y
    )
  ) {
    lvlFail();
    return;
  }

  // Actualizar el juego, dibujar el mapa actualizado, etc.
  drawMap();
}

function lvlUp() {
  if (isGameWin(startMap)) {
    clearInterval(timeInterval);
    var elapsedTime = Date.now() - timeStart;
    let record = localStorage.getItem("record");
    if (elapsedTime < record) {
      localStorage.setItem("record", elapsedTime);
    }
    if (record == null) {
      localStorage.setItem("record", elapsedTime);
    }

    resetGame();
    return;
  }
  startMap++;
  startGame();
}

function isGameWin(startMap) {
  return maps.length == startMap + 1;
}

function resetGame() {
  startMap = 0;
  lives = 3;
  playerPosition = {
    x: undefined,
    y: undefined,
  };
  timeStart = undefined;
  startGame();
}

function lvlFail() {
  game.fillText(
    emojis.BOMB_COLLISION,
    playerPosition.x * elementsSize,
    (playerPosition.y + 1) * elementsSize
  );
  lives -= 1;
  if (lives === 0) {
    setTimeout(function () {
      resetGame();
    }, 600);
    return;
  }
  playerPosition = {
    x: undefined,
    y: undefined,
  };

  setTimeout(function () {
    startGame();
  }, 600);
}

function setCanvasSize() {
  const canvasSize = Math.min(window.innerHeight, window.innerWidth) * 0.75;

  canvas.width = canvasSize;
  canvas.height = canvasSize;

  elementsSize = Math.floor(canvasSize / 10 - 1);

  game.font = `${elementsSize}px Verdana`;

  drawMap();
}

function drawMap() {
  game.clearRect(0, 0, canvas.width, canvas.height);
  bombPosition = [];
  showLives();
  showRecord();

  map.forEach((row, y) => {
    row.forEach((emoji, x) => {
      game.fillText(emoji, x * elementsSize, (y + 1) * elementsSize);

      if (emoji === "🚪") {
        if (playerPosition.x === undefined && playerPosition.y === undefined) {
          playerPosition = { x, y };
        } // Utiliza object destructuring para simplificar la asignación de coordenadas
      }
      if (emoji === "🎁") {
        giftPosition = { x, y };
      }
      if (emoji === "💣") {
        bombPosition.push({ x, y });
      }
    });
  });

  game.fillText(
    emojis.PLAYER,
    playerPosition.x * elementsSize,
    (playerPosition.y + 1) * elementsSize
  ); // Utiliza la notación de puntos para acceder a las propiedades del objeto emojis
}

function showLives() {
  spanLives.innerHTML = emojis.HEART.repeat(lives);
}

function showTime() {
  if (!timeStart) {
    timeStart = Date.now();
    timeInterval = setInterval(function () {
      var elapsedTime = Date.now() - timeStart;
      var formattedTime = formatTime(elapsedTime);
      spanTime.innerHTML = formattedTime;
    }, 100);
  }
}

function showRecord() {
  let record = localStorage.getItem("record");
  var formattedTime = formatTime(record);
  recordTime.innerHTML = formattedTime;
}

function formatTime(milliseconds) {
  var minutes = Math.floor(milliseconds / 60000);
  milliseconds %= 60000;
  var seconds = Math.floor(milliseconds / 1000);
  var millisecondsRemaining = milliseconds % 1000;

  var formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}:${millisecondsRemaining.toString().padStart(3, "0")}`;
  return formattedTime;
}

function parseMap() {
  try {
    const mapString = maps[startMap].trim();
    const lines = mapString.split("\n").map((line) => line.trim());

    map = lines.map((line) => line.split("").map((symbol) => emojis[symbol]));
  } catch (error) {
    setTimeout(function () {
      resetGame();
    }, 300);
  }
}
