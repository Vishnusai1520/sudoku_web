import React, { useEffect, useState, useRef } from 'react';
import './App.css';

function App() {
  const [sudokuData, setSudokuData] = useState(Array(9).fill(null).map(() => Array(9).fill('')));
  const [initialValues, setInitialValues] = useState(Array(9).fill(null).map(() => Array(9).fill(false)));
  const [difficulty, setDifficulty] = useState('easy');
  const [sudokuSolution, setSudokuSolution] = useState(Array(9).fill(null).map(() => Array(9).fill('')));
  const [history, setHistory] = useState([]);
  const [selectedCell, setSelectedCell] = useState([null, null]);
  const playerId = 10;
  const sudokuId = 1;

  const startTimeRef = useRef(null);
const [elapsedTime, setElapsedTime] = useState(0);
const [intervalId, setIntervalId] = useState(null);


  useEffect(() => {
    fetchSudokuData(difficulty);
  }, [difficulty]);

  // const apiCall = async (endpoint) => {
  //   try {
  //     const apiKey = '123';
  //     const response = await fetch(`http://0.0.0.0:8000/api/v1/${endpoint}`, {
  //       headers: {
  //         'Authorization': `Bearer ${apiKey}`,
  //         'X-API-KEY': apiKey
  //       }
  //     });
  //     const data = await response.json();
  //     return data;
  //   } catch (error) {
  //     console.error('Error making API call:', error);
  //   }
  // };
  
  const handleUndo = async () => {
    //  await apiCall('undo');
    if (history.length > 0) {
      setSudokuData(history[history.length - 1]);
      setHistory(prevHistory => prevHistory.slice(0, -1));
    }
  };
  
  const handleHint = async () => {
    saveHistory();
    setSudokuData(prevSudoku => {
      const newSudoku = prevSudoku.map(row => [...row]);
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (newSudoku[i][j] === '') {
            newSudoku[i][j] = sudokuSolution[i][j];
            return newSudoku;
          }
        }
      }
      return newSudoku;
    });
  };
  
  const handleSubmit = async () => {
    if (!validateSudoku()) {
      alert('Some values are incorrect. Please try again.');
      return;
    }
  
    if (intervalId) clearInterval(intervalId); 
  
    alert('Congratulations! You solved the puzzle!');
    const solveTime = elapsedTime;

  
    try {
      const apiKey = '123';
      const response = await fetch(`http://0.0.0.0:8000/api/v1/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'X-API-KEY': apiKey
        },
        body: JSON.stringify({ player_id: playerId, sudoku_id: sudokuId, solve_time: solveTime })
      });
      // console.log(JSON.stringify({ player_id: playerId, sudoku_id: sudokuId, solve_time: solveTime }))
  
      const data = await response.json();
      console.log('Submission response:', data);
      return data;
    } catch (error) {
      console.error('Error making API call:', error);
    }
  };
  
  const renderSquare = (i, j) => (
    <input
      type="text"
      maxLength="1"
      className={`sudoku-input ${selectedCell[0] === i && selectedCell[1] === j ? 'selected' : ''}`}
      key={`${i}-${j}`}
      value={sudokuData[i][j] || ''}
      onChange={(e) => handleInputChange(e, i, j)}
      onClick={() => handleCellClick(i, j)}
      readOnly={initialValues[i][j]} // Read-only for pre-filled values
      style={{ fontWeight: initialValues[i][j] ? 'bold' : 'normal' }} // Bold for initial values
    />
  );

  const fetchSudokuData = async (difficulty) => {
    try {

      const apiKey = '123'; 
      const response = await fetch(`http://0.0.0.0:8000/api/v1/sudoku?player_id=1&difficulty=${difficulty}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-API-KEY': apiKey
        }
      });
      const data = await response.json();

      if (data && data['puzzle']) {
        const newSudokuData = data['puzzle'].map(row => row.map(cell => (cell === 0 ? '' : cell.toString())));
        const newSudokuSolution = data['solution'].map(row => row.map(cell => cell.toString()));

        setSudokuData(newSudokuData);
        setInitialValues(newSudokuData.map(row => row.map(cell => cell !== ''))); // Cells with numbers should be immutable
        setSudokuSolution(newSudokuSolution);
        setHistory([]);
        setElapsedTime(0);
        startTimeRef.current = Date.now();

        if (intervalId) clearInterval(intervalId);

        const newIntervalId = setInterval(() => {
          const now = Date.now();
          const elapsed = Math.floor((now - startTimeRef.current) / 1000);
          setElapsedTime(elapsed);
        }, 1000);

        setIntervalId(newIntervalId);
      }
    } catch (error) {
      console.error('Error fetching Sudoku data:', error);
    }
  };

  const handleInputChange = (e, i, j) => {
    const value = e.target.value;
    if (!/^[1-9]?$/.test(value)) return; // Only allow 1-9 or empty

    if (initialValues[i][j]) return; // Prevent editing initial values

    saveHistory();
    setSudokuData(prevSudoku => {
      const newSudoku = prevSudoku.map(row => [...row]);
      newSudoku[i][j] = value;
      return newSudoku;
    });
  };

  const handleNumberClick = (num) => {
    const [i, j] = selectedCell;
    if (i !== null && j !== null && !initialValues[i][j]) {
      saveHistory();
      setSudokuData(prevSudoku => {
        const newSudoku = prevSudoku.map(row => [...row]);
        newSudoku[i][j] = num.toString();
        return newSudoku;
      });
    }
  };

  const handleCellClick = (i, j) => {
    setSelectedCell([i, j]);
  };

  const saveHistory = () => {
    setHistory(prevHistory => [...prevHistory, sudokuData.map(row => [...row])]);
  };


  const validateSudoku = () => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (sudokuData[i][j] === '' || sudokuData[i][j] !== sudokuSolution[i][j]) {
          return false;
        }
      }
    }
    return true;
  };

  const renderRow = (i) => (
    <div className="sudoku-row" key={i}>
      {Array.from({ length: 9 }, (_, j) => renderSquare(i, j))}
    </div>
  );

  const renderBoard = () => Array.from({ length: 9 }, (_, i) => renderRow(i));

  return (
    <div className="App">
      <header className="App-header">
      <div className="timer">
        {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
      </div>

        <div className="sudoku-header">
          <div className="difficulty">
            {['easy', 'medium', 'expert', 'extreme'].map(level => (
              <button key={level} onClick={() => setDifficulty(level)}>{level.charAt(0).toUpperCase() + level.slice(1)}</button>
            ))}
          </div>
        </div>
        <div className="sudoku-container">
          <div className="sudoku-board">{renderBoard()}</div>
          <div className="sudoku-inputs">
            <div className="number-buttons">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button key={num} onClick={() => handleNumberClick(num)}>{num}</button>
              ))}
            </div>
            <div className="sudoku-controls">
              <div className="sudoku-controls-row">
                <button onClick={handleUndo}>Undo</button>
                <button onClick={handleHint}>Hint</button>
              </div>
              <div className="sudoku-controls-row">
                <button className="new-game-button" onClick={() => fetchSudokuData(difficulty)}>New Game</button>
                <button className="submit-button" onClick={() => handleSubmit()}>Submit</button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;