// idea: generate game with extra hard mode
// and get the same pieces
// instanciate two games with two board
// but same pieces with same shape (or not same shape but same pieces)

import Game from './game.js';

class MultiMode {
  constructor(options) {
    this.mode = 'multi';
    this.options = options;
    // this.game = new Game(options.boardNode, options.pieces);
    // this.game.pieceNum = 8;
    this.enableUI();
  }

  enableUI() {
    // this.options.timer
  }

  mainBtnHandler() {

  }

  movePiece(action) {

  }
}

export default MultiMode;
