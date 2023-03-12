"use strict";

const Cell = (index) => {
  return { value: "", index };
};
///////////////////////// Board Controller ///////////////////////////

const Gameboard = (() => {
  const board = [];
  for (let i = 0; i < 9; i++) {
    board[i] = Cell(i);
  }
  const getBoard = () => board;
  const getValue = (index) => board[index].value;
  const setValue = (index, mark) => {
    if (board[index].value === "") {
      board[index].value = mark;
    }
  };

  const resetBoard = () => {
    for (let i = 0; i < 9; i++) {
      board[i] = Cell(i);
    }
  };
  return { getValue, setValue, getBoard, resetBoard };
})();

const Player = (name, marker) => {
  return { name: name, marker: marker };
};

///////////////////////// Score ///////////////////////////

const Score = (() => {
  let _x = 0;
  let _o = 0;
  let _t = 0;

  const update = (player) => {
    if (player === "tie") {
      _t++;
    } else if (player.marker === "X") {
      _x++;
    } else if (player.marker === "O") {
      _o++;
    }
  };

  const getXScore = () => _x;
  const getOScore = () => _o;
  const getTiesScore = () => _t;

  const reset = () => {
    _o = 0;
    _t = 0;
    _x = 0;
  };

  return { update, getOScore, getXScore, getTiesScore, reset };
})();

///////////////////////// Game Controller ///////////////////////////
const GameController = (() => {
  let activePlayer, playerOne, playerTow;
  const init = (playerOneMarker, playerTwoMarker, withComputer) => {
    playerOne = Player("player 1", playerOneMarker);
    if (withComputer) {
      playerTow = Player("computer", playerTwoMarker);
    } else {
      playerTow = Player("player 2", playerTwoMarker);
    }
    activePlayer = playerOne;
    screenController.changeTurn(activePlayer);
  };
  const playRound = async (index) => {
    Gameboard.setValue(index, activePlayer.marker);
    checkWinOrTie();
    // switch between players;
    switchPlayer();
    // Computer turn
    if (activePlayer.name === "computer") {
      if (!checkTie()) {
        screenController.blockCells();
        await sleep(1000);
        let index = getComputerMove();
        while (!(Gameboard.getValue(index) === "") && !checkNotFill()) {
          index = getComputerMove();
        }
        Gameboard.setValue(index, activePlayer.marker);
        screenController.renderGameBoard();
        checkWinOrTie();
        switchPlayer();
        screenController.unBlockCells();
      }
    }
  };
  const checkWinOrTie = () => {
    if (checkWinner()) {
      Score.update(activePlayer);
      screenController.showWinner(activePlayer);
    } else if (checkTie()) {
      Score.update("tie");
      screenController.showTie();
    }
  };

  const switchPlayer = () => {
    if (activePlayer.name === "player 1") {
      activePlayer = playerTow;
    } else if (activePlayer.name === "player 2") {
      activePlayer = playerOne;
    } else if (activePlayer.name === "computer") {
      activePlayer = playerOne;
    }
    screenController.changeTurn(activePlayer);
  };

  const checkWinner = () => {
    for (let i = 0; i < 3; i++) {
      if (checkColumn(i)) {
        return true;
      } else if (checkRow(i * 3)) {
        return true;
      }
    }
    if (checkCross()) {
      return true;
    }
    return false;
  };

  const checkColumn = (num) => {
    const board = Gameboard.getBoard();
    return [board[num], board[num + 3], board[num + 6]].every(
      (cell) => cell.value === activePlayer.marker
    );
  };

  const checkRow = (num) => {
    const board = Gameboard.getBoard();
    return [board[num], board[num + 1], board[num + 2]].every(
      (cell) => cell.value === activePlayer.marker
    );
  };

  const checkCross = () => {
    const board = Gameboard.getBoard();
    const cross1 = [board[0], board[4], board[8]];
    const cross2 = [board[2], board[4], board[6]];
    return (
      cross1.every((cell) => cell.value === activePlayer.marker) ||
      cross2.every((cell) => cell.value === activePlayer.marker)
    );
  };

  const checkTie = () => {
    const board = Gameboard.getBoard();
    return !board.some((cell) => cell.value === "");
  };

  const getComputerMove = () => {
    return Math.floor(Math.random() * 9);
  };

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const checkNotFill = () => {
    const board = Gameboard.getBoard();
    return !board.some((cell) => cell.value === "");
  };

  const changeActivePlayer = () => {
    activePlayer = playerOne;
  };
  return { playRound, checkWinner, init, changeActivePlayer };
})();

///////////////////////// Screen Controller ///////////////////////////

const screenController = (() => {
  const newGameModal = document.querySelector(".new-game-modal");
  const mainBoard = document.querySelector("main");
  const winnerModal = document.querySelector(".winner-modal");
  const restartModal = document.querySelector(".restart-modal");
  const init = () => {
    showNewGameModal();
    listenNewGameEvents();
  };
  const listenNewGameEvents = () => {
    const buttons = document.querySelectorAll(
      ".new-game-modal .buttons button"
    );
    const cells = document.querySelectorAll(".cell");
    const restartButton = document.querySelector(".restart");
    // Listen to new game buttons
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        if (button.id === "c") {
          const playerOneMarker = getPlayerOneMarker();
          const playerTwoMarker = playerOneMarker === "X" ? "O" : "X";
          GameController.init(playerOneMarker, playerTwoMarker, true);
        } else if (button.id === "h") {
          const playerOneMarker = getPlayerOneMarker();
          const playerTwoMarker = playerOneMarker === "X" ? "O" : "X";
          GameController.init(playerOneMarker, playerTwoMarker);
        }
        hideNewGameModal();
        showMainBoard();
      });
    });
    // Listen to players move
    cells.forEach((cell) => {
      cell.addEventListener("click", makeMove);
    });
    // Listen to restart click
    restartButton.addEventListener("click", showRestartModal);
  };

  const makeMove = (e) => {
    const cell = e.target;
    if (cell.textContent.length === 0) {
      GameController.playRound(cell.id);
      renderGameBoard();
    }
  };

  const blockCells = () => {
    const cells = document.querySelectorAll(".cell");
    for (let i = 0; i < 9; i++) {
      const cell = cells[i];
      cell.classList.add("block");
    }
  };

  const unBlockCells = () => {
    const cells = document.querySelectorAll(".cell");
    for (let i = 0; i < 9; i++) {
      const cell = cells[i];
      cell.classList.remove("block");
    }
  };

  const renderGameBoard = () => {
    const board = Gameboard.getBoard();
    const cells = document.querySelectorAll(".cell");
    removeColorFromCells(cells);
    for (let i = 0; i < 9; i++) {
      const cell = cells[i];
      const cellValue = board[i].value;
      cell.textContent = cellValue;
      if (cellValue === "X") {
        cell.classList.add("X");
      } else if (cellValue === "O") {
        cell.classList.add("O");
      }
    }
  };

  const showNewGameModal = () => {
    newGameModal.classList.remove("hidden");
  };
  const hideNewGameModal = () => {
    newGameModal.classList.add("hidden");
  };
  const getPlayerOneMarker = () => {
    return document.querySelector(`.form-raw-mark input[name="mark"]:checked`)
      .id;
  };

  const showMainBoard = () => {
    mainBoard.classList.remove("hidden");
  };

  const hideMainBoard = () => {
    mainBoard.classList.add("hidden");
  };

  const showWinner = (player) => {
    hideMainBoard();
    winnerModal.classList.remove("hidden");
    const playerName = winnerModal.querySelector(".winner-name");
    const winner = winnerModal.querySelector(".winner");
    playerName.textContent = `${player.name.toUpperCase()} WIN !`;
    winner.textContent = `${player.marker}`;
    listenWinnerModelEvent();
    showScore();
  };

  const listenWinnerModelEvent = () => {
    const quitButton = winnerModal.querySelector(".quit");
    const nextRoundButton = winnerModal.querySelector(".next-round");
    quitButton.addEventListener("click", restartGame);
    nextRoundButton.addEventListener("click", nextRound);
  };
  const nextRound = () => {
    winnerModal.classList.add("hidden");
    Gameboard.resetBoard();
    GameController.changeActivePlayer();
    renderGameBoard();
    showMainBoard();
  };

  const removeColorFromCells = (cells) => {
    cells.forEach((cell) => {
      if (cell.classList.contains("X")) {
        cell.classList.remove("X");
      } else if (cell.classList.contains("O")) {
        cell.classList.remove("O");
      }
    });
  };
  const showTie = () => {
    hideMainBoard();
    winnerModal.classList.remove("hidden");
    const playerName = winnerModal.querySelector(".winner-name");
    const winner = winnerModal.querySelector(".winner");
    playerName.textContent = "";
    winner.textContent = `TIE`;
    listenWinnerModelEvent();
    showScore();
  };

  const changeTurn = (player) => {
    const turn = document.querySelector(".turn");
    turn.textContent = `${player.marker} TURN`;
  };

  const showRestartModal = () => {
    hideMainBoard();
    restartModal.classList.remove("hidden");
    const restartBtn = restartModal.querySelector(".restart-btn");
    const cancelBtn = restartModal.querySelector(".cancel-btn");
    restartBtn.addEventListener("click", restartGame);
    cancelBtn.addEventListener("click", hideRestartModal);
  };

  const restartGame = () => {
    init();
    Score.reset();
    showScore();
    Gameboard.resetBoard();
    renderGameBoard();
    restartModal.classList.add("hidden");
    winnerModal.classList.add("hidden");
  };

  const hideRestartModal = () => {
    restartModal.classList.add("hidden");
    showMainBoard();
  };

  const showScore = () => {
    const container = document.querySelector(".footer");
    const xScore = container.querySelector(".x-score");
    const oScore = container.querySelector(".o-score");
    const tieScore = container.querySelector(".ties-score");
    xScore.textContent = Score.getXScore();
    oScore.textContent = Score.getOScore();
    tieScore.textContent = Score.getTiesScore();
  };
  return {
    init,
    showWinner,
    changeTurn,
    showTie,
    renderGameBoard,
    blockCells,
    unBlockCells,
  };
})();

screenController.init();
