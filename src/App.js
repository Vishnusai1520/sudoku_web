import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [sudokuData, setSudokuData] = useState(Array(9).fill('').map(() => Array(9).fill('')));
  const [initialValues, setInitialValues] = useState(Array(9).fill('').map(() => Array(9).fill(false)));
  const [difficulty, setDifficulty] = useState('easy');
  const [sudokuSolution, setSudokuSolution] = useState(Array(9).fill('').map(() => Array(9).fill('')));

  useEffect(() => {
    fetchSudokuData(difficulty);
  }, [difficulty]);

  useEffect(() => {
    console.log('Sudoku Solution:', sudokuSolution);
  }, [sudokuSolution]);

  const fetchSudokuData = async (difficulty) => {
    try {
      const response = await fetch(`http://0.0.0.0:8000/api/v1/sudoku?difficulty=${difficulty}`);
      const data = await response.json();
      console.log(data);
      if (data && data['puzzle']) {
        const newSudokuData = data['puzzle'];
        const newSudokuSolution = data['solution'];
        setSudokuData(newSudokuData);
        setInitialValues(newSudokuData.map(row => row.map(cell => cell !== '')));
        setSudokuSolution(newSudokuSolution);
      }
    } catch (error) {
      console.error('Error fetching Sudoku data:', error);
    }
  };

  const handleInputChange = (e, i, j) => {
    const { value } = e.target;
    if (value.match(/^[1-9]$/) || value === '') {
      const newSudokuData = [...sudokuData];
      newSudokuData[i][j] = value;
      setSudokuData(newSudokuData);
    }
  };

  const validateSudoku = () => {
    console.log(sudokuData)
    console.log(sudokuSolution)
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (sudokuData[i][j] === '' || sudokuData[i][j] !== sudokuSolution[i][j]) {
          return false;
        }
      }
    }
    return true;
  };

  const renderSquare = (i, j) => {
    if (!sudokuData[i] || typeof sudokuData[i][j] === 'undefined') {
      return null;
    }
    return (
      <input
        type="text"
        maxLength="1"
        className="sudoku-input"
        key={`${i}-${j}`}
        value={sudokuData[i][j] || ''}
        onChange={(e) => handleInputChange(e, i, j)}
        readOnly={initialValues[i][j]}
      />
    );
  };

  const renderRow = (i) => {
    const row = [];
    for (let j = 0; j < 9; j++) {
      row.push(renderSquare(i, j));
    }
    return (
      <div className="sudoku-row" key={i}>
        {row}
      </div>
    );
  };

  const renderBoard = () => {
    const board = [];
    for (let i = 0; i < 9; i++) {
      board.push(renderRow(i));
    }
    return board;
  };

  const handleSubmit = () => {
    if (validateSudoku()) {
      alert('Congratulations! You solved the puzzle!');
    } else {
      alert('Some values are incorrect. Please try again.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="sudoku-header">
          <div className="difficulty">
            Difficulty:
            <button onClick={() => setDifficulty('easy')}>Easy</button>
            <button onClick={() => setDifficulty('medium')}>Medium</button>
            <button onClick={() => setDifficulty('expert')}>Expert</button>
            <button onClick={() => setDifficulty('extreme')}>Extreme</button>
          </div>
        </div>
        <div className="sudoku-container">
          <div className="sudoku-board">{renderBoard()}</div>
          <div className="sudoku-controls">
            <button>Undo</button>
            <button>Erase</button>
            <button>Notes</button>
            <button>Hint</button>
            <div className="number-buttons">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button key={num}>{num}</button>
              ))}
            </div>
            <button className="new-game-button" onClick={() => fetchSudokuData(difficulty)}>New Game</button>
            <button className="submit-button" onClick={handleSubmit}>Submit</button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
