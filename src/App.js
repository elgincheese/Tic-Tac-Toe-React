import React, { Component } from 'react';
import { BrowserRouter,
         Route,
         Switch,
         Redirect } from 'react-router-dom';

// App Components
import LandingPage from './components/LandingPage';
import EnterName from './components/EnterName';
import Game from './components/Game';
import GameOver from './components/GameOver'

import logo from './logo.svg';
import './css/normalize.css';
import './css/style.css';

class App extends Component {

  swap = {
    x:"o",
    o:"x"
  }

  wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  state = {
    board: [
      "", "", "",
      "", "", "",
      "", "", ""
    ],
    player: "o",
    gameOver: false,
    winner: "",
    isOnePlayerGame: false,
    level: .3,
    name: ""
  }

  levels = {
    easy:.3,
    medium:.6,
    hard:.9
  }

  reset = {
    board: [
      "", "", "",
      "", "", "",
      "", "", ""
    ],
    player: "o",
    gameOver: false,
    winner: "",
  }

// Callbacks for UI controls
  setLevel = (diff) => {
    this.setState({
      ...this.state,
      level: this.levels[diff]
    });
  }

  updateName = input => {
    this.setState({
      ...this.state,
      name: input
    });
  }

  setOnePlayerGame = () => {
    this.setState({
      ...this.state,
      isOnePlayerGame: true
    });
  }

  resetState = isOnePlayer => {
    this.setState({
      ...this.state,
      ...this.reset,
      isOnePlayerGame: isOnePlayer?true:false
    })
  }

//Helps computer player functions execute synchronously
  setStateSync = state => {
    return new Promise((resolve, reject) => {
      if (state) {
        this.setState({
          ...this.state,
          ...state
        }, () => {resolve()});
      } else {
        resolve();
      }
    });
  }

// Gameplay
  humanMove = index => {
    if ( !this.state.board[index] ) {
      this.fillBox(index)
      .then( () => this.setStateSync(this.checkForWinner()))
      .then(this.changePlayer)
      .then(() => {
        if ( !this.state.gameOver && this.state.isOnePlayerGame ) {
          setTimeout(() => {
            this.computerMove()
            .then( () => this.setStateSync(this.checkForWinner()))
            .then(this.changePlayer)
          }, 700);
        }
      });
    }
  }

  computerMove = () => {
    const isSmart = Math.random() <= this.state.level;

    const currentBoard = [...this.state.board];
    const possibleMoves = this.getEmptyBoxes();

    const i = Math.floor( Math.random() * possibleMoves.length );
    const randomMove = possibleMoves[i];

    let chosenMove = randomMove;

    if (isSmart) {
      //Can computer win?
      const winningMoves = possibleMoves.filter( index => {
        const newBoard = currentBoard.map((box, i) => i===index?"x":box);
        return this.checkForWinner(newBoard, "x");
      });
      //Can Computer Lose?
      const opponentWinningMoves = possibleMoves.filter( index => {
        const newBoard = currentBoard.map((box, i) => i===index?"o":box);
        return this.checkForWinner(newBoard, "o");
      });
      if (winningMoves.length) {
        //Play winning move
        chosenMove = winningMoves[0];
      } else if (opponentWinningMoves.length) {
        // Or block opponent
        chosenMove = opponentWinningMoves[0];
      }
    }
    return this.fillBox(chosenMove);
  }

// Helper functions for each turn
  fillBox = index => {
    return this.setStateSync({
      board: this.state.board.map((box, i) => i===index?this.state.player:box)
    });
  }

  checkForWinner = (newBoard, newPlayer) => {
    const player = newPlayer?newPlayer:this.state.player;
    const board = newBoard?newBoard:this.state.board;

    const isBoardFull = !board.filter( box => box === "").length;
    const isWinner = !!this.wins.filter( at => ( board[at[0]] === player
                                              && board[at[1]] === player
                                              && board[at[2]] === player)).length;
    const gameOver = isWinner || isBoardFull;
    const winner = isWinner?player:"";

    return gameOver?{gameOver, winner}:false
  }

  changePlayer = () => {
    return this.setStateSync({
      player: this.swap[this.state.player]
    });
  }

  getEmptyBoxes = () => {
    const emptyIndices = [];
    this.state.board.forEach((box, index) => {
      if (box === "") {
        emptyIndices.push(index);
      }
    })
    return emptyIndices;
  }

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" render={ () => <LandingPage setOnePlayer={this.setOnePlayerGame} />} />
          <Route path="/1p"
                 render={ () => <EnterName setDifficulty={this.setLevel}
                                           name={this.state.name}
                                           updateName={this.updateName}/>
                        } />

          <Route path="/play"
                 render={ () => this.state.gameOver?
                                 <Redirect to="/gameover"/>
                                 :
                                 <Game name={this.state.name}
                                       board={this.state.board}
                                       move={this.humanMove}
                                       gameOver={this.state.gameOver}
                                       player={this.state.player}
                                       reset={this.resetState} />
                        } />
          <Route path="/gameover"
                 render={ () => <GameOver winner={this.state.winner}
                                          reset={this.resetState}
                                          setOnePlayer={this.setOnePlayerGame}
                                          onePlayerMode={this.isOnePlayerGame} />
                        } />
          <Route render={ () => <Redirect to="/" /> } />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;