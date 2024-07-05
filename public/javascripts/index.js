const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessBoard");
const h1 = document.querySelector(".res");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowindex) => {
    row.forEach((square, squareindex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowindex;
      squareElement.dataset.col = squareindex;
      //Creating Square
      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );

        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;

        // Adding drag And Drop event Listner
        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowindex, col: squareindex };
            e.dataTransfer.setData("text/plain", "");
          }
        });

        pieceElement.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });
        squareElement.appendChild(pieceElement);
      }
      squareElement.addEventListener("dragover", function (e) {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", function (e) {
        e.preventDefault();
        if (draggedPiece) {
          const targetSource = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };
          handleMove(sourceSquare, targetSource);
        }
      });
      boardElement.appendChild(squareElement);
    });
  });

  if (playerRole === "b") {
    boardElement.classList.add("flipped");
  } else {
    boardElement.classList.remove("flipped");
  }
};

const handleMove = (sourceSquare, targetSource) => {
  const move = {
    from: `${String.fromCharCode(97 + sourceSquare.col)}${
      8 - sourceSquare.row
    }`,
    to: `${String.fromCharCode(97 + targetSource.col)}${8 - targetSource.row}`,
    promotion: "q" || "r",
  };


  const win = () => {
    const result = chess.move(move);
    if (result) {
      if (chess.in_checkmate()) {
        h1.innerText = `${
          playerRole === "w" ? "Black" : "White"
        } wins by Checkmate!`;
        h1.style.display = "block";
      }
    }
  };
  win();
  socket.emit("move", move);
};
const getPieceUnicode = (piece) => {
  const unicodePieces = {
    k: "♔", // White King
    q: "♕", // White Queen
    r: "♖", // White Rook
    b: "♗", // White Bishop
    n: "♘", // White Knight
    p: "♙", // White Pawn
    K: "♚", // Black King
    Q: "♛", // Black Queen
    R: "♜", // Black Rook
    B: "♝", // Black Bishop
    N: "♞", // Black Knight
    P: "w", // Black Pawn
  };
  return unicodePieces[piece.type] || "a";
};

socket.on("playerRole", function (role) {
  playerRole = role;
  renderBoard();
});

socket.on("spectatorRole", function () {
  playerRole = null;
  renderBoard();
});

socket.on("boardState", function (fen) {
  chess.load(fen);
  renderBoard();
});
socket.on("move", function (move) {
  chess.load(move);
  renderBoard();
});

renderBoard();
