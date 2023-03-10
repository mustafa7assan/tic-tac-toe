"use strict";

const Cell = (index) => {
  return { value: "E", index };
};

const Gameboard = (() => {
  const board = [];
  for (let i = 0; i < 9; i++) {
    board[i] = Cell(i);
  }
  const getBoard = () => board;
  const getValue = (index) => board[index].value;
  const setValue = (index, value) => {
    board[index].value = value;
  };
  const displayBoard = () => {
    for (let i = 0; i < 9; i += 3) {
      console.log(
        `${board[i].value} | ${board[i + 1].value} | ${board[i + 2].value}`
      );
    }
    console.log("---------");
  };
  return { getValue, setValue, getBoard, displayBoard };
})();

const Player = (name, marker) => {
  return { name: name, marker: marker };
};

const GameController = (() => {
  const human = Player("Human", "X");
  const computer = Player("Computer", "O");
  let activePlayer = human;

  const playRound = () => {
    Gameboard.displayBoard();
    let index = "";
    // Get Player Move
    if (activePlayer.name === "Human") {
      index = getHumanMove();
    } else if (activePlayer.name === "Computer") {
      index = getComputerMove();
    }
    // Check if the cell is empty
    if (Gameboard.getValue(index) === "E") {
      Gameboard.setValue(index, activePlayer.marker);
    } else {
      playRound();
    }
    // switch between players;
    switchPlayer();
  };

  const getComputerMove = () => {
    const randomNumber = Math.floor(Math.random() * 9);
    return randomNumber;
  };

  const getHumanMove = () => {
    const move = Number(prompt("Your Move ?"));
    return move;
  };

  const switchPlayer = () => {
    if (activePlayer.name === "Human") {
      activePlayer = computer;
    } else if (activePlayer.name === "Computer") {
      activePlayer = human;
    }
  };

  const checkWinner = () => {
    for (let i = 0; i < 3; i++) {
      if (checkColumn(i)) {
        console.log(`${activePlayer.name} is winner`);
        return true;
      } else if (checkRow(i * 3)) {
        console.log(`${activePlayer.name} is winner`);
        return true;
      }
    }
    if (checkCross()) {
      console.log(`${activePlayer.name} is winner`);
      return true;
    }
    return false;
  };

  const checkColumn = (num) => {
    const board = Gameboard.getBoard();
    const col = [board[num], board[num + 3], board[num + 6]];
    return col.every((cell) => cell.value === activePlayer.marker);
  };

  const checkRow = (num) => {
    const board = Gameboard.getBoard();
    const row = [board[num], board[num + 1], board[num + 2]];
    return row.every((cell) => cell.value === activePlayer.marker);
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

  const checkNotFill = () => {
    const board = Gameboard.getBoard();
    return board.some((cell) => cell.value === "E");
  };

  return { playRound, checkNotFill, checkWinner };
})();

const screenController = (() => {
  const newGameModal = document.querySelector(".new-game-modal");
  const init = () => {
    showNewGameModal();
  };
  const showNewGameModal = () => {
    newGameModal.classList.remove("hidden");
  };
  return { init };
})();
