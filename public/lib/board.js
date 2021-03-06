const neighbors = [[-1, 0], [1, 0], [0, -1], [0, 1]];

class Board {
  constructor(pieceMap, $boardNode, multiData, gameMode) {
    this.multiData = multiData;
    this.piecesObjects = Array.from(pieceMap.values());
    this.pieceMap = pieceMap;
    this.$boardNode = $boardNode;
    this.board = this.generateBoard();
    this.cellMap = new Map();
    this.gameMode = gameMode;
  }

  isWon() {
    return this.piecesObjects.every((p) => p.placed);
  }

  isValid(pieceOb, loc) {
    // returns true if the piece can be placed on the location
    // for testing, logging stuff
    if (pieceOb.placed || loc[0] < 0 || loc[1] < 0) {
      console.log("piece already placed or location is smaller than 0");
      return false;
    }
    let piece = pieceOb.currentPiece();
    for (let i=0; i<piece.length; i++) {
      for (let j=0; j<piece[0].length; j++) {
        if (piece[i][j] === 1 && this.board[i+loc[0]][j+loc[1]] !== 1) {
          // These are for testing!
          console.log(`piece location: ${i}, ${j}`);
          console.log(`board location: ${i+loc[0]}, ${j+loc[1]}`);
          console.log("piece:");
          piece.forEach((row, t) => {
            console.log(`${t} ${row.join(" ")}`);
          });
          console.log("board:");
          this.board.forEach((row, t) => {
            console.log(`${t} ${row.join(" ")}`);
          });
          window.board = this.board;
          return false;
        }
      }
    }
    return true;
  }

  placePiece(pieceNode, loc) {
    let pieceOb = this.pieceMap.get(pieceNode);
    let piece = pieceOb.currentPiece();
    for (let i=0; i<piece.length; i++) {
      for (let j=0; j<piece[0].length; j++) {
        if (piece[i][j] === 1) {
          this.placeHelper([i+loc[0], j+loc[1]], pieceNode, pieceOb);
        }
      }
    }
    if (this.gameMode) {
      this.gameMode.boardChangeHandler();
    }
    pieceNode.classList.add("hidden");
    pieceOb.placed = true;
  }

  placeHelper(loc, pieceNode, pieceOb) {
    this.board[loc[0]][loc[1]] = 2;
    this.$boardNode[loc[0]][loc[1]].style.backgroundColor = pieceOb.color;
    this.cellMap.set(this.$boardNode[loc[0]][loc[1]], pieceNode);
    this.$boardNode[loc[0]][loc[1]].classList.add("placed-cell");
    this.$boardNode[loc[0]][loc[1]].style.cursor = "pointer";
  }

  movePieceAt(pos, board, piece, put, callback) {
    // put is boolean. if it's true, place piece
    // if it's false, remove piece from the pos
    for (let i=0; i<piece.length; i++) {
      for (let j=0; j<piece[0].length; j++) {
        if (piece[i][j] === 1) {
          if (put) {
            board[i+pos[0]][j+pos[1]]++;
          } else {
            board[i+pos[0]][j+pos[1]]--;
          }
        }
      }
    }
  }

  removePiece(e) {
    if (this.isPlaying && e.target.classList.contains("placed-cell")) {
      let pieceNode = this.board.cellMap.get(e.target);
      pieceNode.classList.remove("hidden");
      this.pieceMap.get(pieceNode).placed = false;
      this.board.$boardNode.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (this.board.cellMap.get(cell) === pieceNode) {
            cell.setAttribute("style", "");
            cell.classList.remove("placed-cell");
            this.board.board[i][j] = 1;
            this.board.cellMap.delete(cell);
          }
        });
      });
      if (this.gameMode) {
        this.gameMode.boardChangeHandler();
      }
    }
  }

  shuffledPieces() {
    // shuffles the pieces
    const result = this.piecesObjects.map((p) => p);
    for (let i=0; i<result.length; i++) {
      let randomIdx = this.multiData.shuffledOrder[i];
      if (randomIdx === undefined) {
        randomIdx = Math.floor(Math.random() * result.length);
      }
      let j =  randomIdx;
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  generateBoard() {
    let shuffledPieces = this.shuffledPieces();
    let board = this.$boardNode.map((row) => row.map((cell) => 0));
    let randomIdx = this.multiData.firstP === undefined ? Math.floor(Math.random() * 8) : this.multiData.firstP;
    let firstP = shuffledPieces.pop().piecesArr[randomIdx];
    // start at the middle
    let i = Math.floor((board.length - firstP.length) / 2);
    let j = Math.floor((board[0].length - firstP[0].length) / 2);
    this.movePieceAt([i, j], board, firstP, true);

    shuffledPieces.forEach((p) => {
      let [bestPos, bestPiece] = this.getBestPieceAndPosition(board, p);
      this.movePieceAt(bestPos, board, bestPiece, true);
    });
    return board;
  }

  sharedBorder(pos, board, piece) {
    let len = 0;
    for (let i=0; i<piece.length; i++) {
      for (let j=0; j<piece[0].length; j++) {
        if (piece[i][j] === 1) {
          if (board[i+pos[0]][j+pos[1]] === 1) { return -1; }
          neighbors.forEach((n) => {
            if (board[n[0]+i+pos[0]] !== undefined && board[n[0]+i+pos[0]][n[1]+j+pos[1]] === 1) {
              len++;
            }
          });
        }
      }
    }
    return len;
  }

  getBestPieceAndPosition(board, piece) {
    // get the best possible position by running through
    // all possible combination
    let sharedBorder = -1;
    let bestPos = [];
    let bestPiece = [];
    piece.possibleIndexes.forEach((idx) => {
      let current = piece.piecesArr[idx];
      for (let i=0; i<board.length - current.length; i++) {
        for (let j=0; j<board[0].length - current[0].length; j++) {
          let newBorder = this.sharedBorder([i, j], board, current);
          if (newBorder > sharedBorder) {
            sharedBorder = newBorder;
            bestPos = [i, j];
            bestPiece = current;
          }
        }
      }
    });
    return [bestPos, bestPiece];
  }
}

export default Board;
