import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';

// Tipo per la griglia
type Board = (number | null)[][];

// Funzione per generare la griglia vuota 9x9
const generateEmptyBoard = (): Board => {
  return Array(9).fill(null).map(() => Array(9).fill(null));
};

// Funzione per generare una griglia completa di Sudoku con backtracking
const generateSudoku = (): Board => {
  const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));

  const isSafe = (board: Board, row: number, col: number, num: number): boolean => {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) {
        return false;
      }
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        if (board[i][j] === num) {
          return false;
        }
      }
    }

    return true;
  };

  const solveSudoku = (board: Board): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === null) {
          for (let num = 1; num <= 9; num++) {
            if (isSafe(board, row, col, num)) {
              board[row][col] = num;
              if (solveSudoku(board)) {
                return true;
              }
              board[row][col] = null; // backtrack
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  solveSudoku(board);
  return board;
};

// Funzione per verificare se la griglia è valida
const isBoardValid = (board: Board): boolean => {
  // Controlla righe e colonne
  for (let i = 0; i < 9; i++) {
    const rowSet = new Set<number>();
    const colSet = new Set<number>();
    for (let j = 0; j < 9; j++) {
      // Controlla che ogni cella sia un numero valido (1-9)
      if (board[i][j] !== null) {
        const rowValue = board[i][j] as number;
        if (rowValue < 1 || rowValue > 9) return false; // Numero non valido
        if (rowSet.has(rowValue)) return false; // Duplicato nella riga
        rowSet.add(rowValue);
      }
      if (board[j][i] !== null) {
        const colValue = board[j][i] as number;
        if (colValue < 1 || colValue > 9) return false; // Numero non valido
        if (colSet.has(colValue)) return false; // Duplicato nella colonna
        colSet.add(colValue);
      }
    }
  }

  // Controlla blocchi 3x3
  for (let i = 0; i < 9; i += 3) {
    for (let j = 0; j < 9; j += 3) {
      const blockSet = new Set<number>();
      for (let r = i; r < i + 3; r++) {
        for (let c = j; c < j + 3; c++) {
          if (board[r][c] !== null) {
            const blockValue = board[r][c] as number;
            if (blockValue < 1 || blockValue > 9) return false; // Numero non valido
            if (blockSet.has(blockValue)) return false; // Duplicato nel blocco 3x3
            blockSet.add(blockValue);
          }
        }
      }
    }
  }

  // Controlla che la griglia sia completa (senza celle vuote)
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === null) return false; // Se c'è una cella vuota, la griglia non è completa
    }
  }

  // Controlla blocchi 3x3
  for (let i = 0; i < 9; i += 3) {
    for (let j = 0; j < 9; j += 3) {
      const blockSet = new Set<number>();
      for (let r = i; r < i + 3; r++) {
        for (let c = j; c < j + 3; c++) {
          if (board[r][c] !== null) {
            if (blockSet.has(board[r][c] as number)) return false; // Duplicato nel blocco 3x3
            blockSet.add(board[r][c] as number);
          }
        }
      }
    }
  }

  return true;
};

const SudokuApp: React.FC = () => {
  const [board, setBoard] = useState<Board>(generateEmptyBoard());
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null); // Numero selezionato
  const [gameCompleted, setGameCompleted] = useState<boolean>(false); // Stato per il messaggio di congratulazioni

  useEffect(() => {
    // Verifica se la griglia è valida ogni volta che la griglia cambia
    if (isBoardValid(board)) {
      setGameCompleted(true); // Mostra il messaggio di congratulazioni
    } else {
      setGameCompleted(false); // Nascondi il messaggio se non è corretto
    }
  }, [board]);
  const createPuzzle = (board: Board, difficulty: string): Board => {
    let newBoard = [...board];
    let numberOfEmptyCells: number;

    // Imposta il numero di celle vuote in base alla difficoltà
    switch (difficulty) {
      case 'easy':
        numberOfEmptyCells = 30; // Rimuovi 30 numeri per un puzzle facile
        break;
      case 'medium':
        numberOfEmptyCells = 40; // Rimuovi 40 numeri per un puzzle medio
        break;
      case 'hard':
        numberOfEmptyCells = 50; // Rimuovi 50 numeri per un puzzle difficile
        break;
      default:
        numberOfEmptyCells = 30; // Predefinito facile
    }

    // Rimuovi celle in modo casuale
    while (numberOfEmptyCells > 0) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (newBoard[row][col] !== null) {
        newBoard[row][col] = null; // Rimuovi il numero
        numberOfEmptyCells--;
      }
    }

    return newBoard;
  };

  const handleCellPress = (row: number, col: number) => {
    if (selectedNumber) {
      const newBoard = [...board];
      newBoard[row][col] = parseInt(selectedNumber); // Inserisci il numero selezionato nella cella
      setBoard(newBoard);
    }
    setSelectedCell({ row, col }); // Imposta la cella selezionata
  };

  const handleNumberPress = (number: string) => {
    setSelectedNumber(number); // Aggiorna il numero selezionato
  };

  const handleGenerateSudoku = (difficulty: string) => {
    const completeBoard = generateSudoku(); // Griglia completa
    const puzzle = createPuzzle(completeBoard, difficulty); // Crea il puzzle con la difficoltà scelta
    setBoard(puzzle); // Imposta la griglia con il puzzle generato
    setGameCompleted(false); // Resetta il messaggio di congratulazioni
  };

  const handleClear = () => {
    setBoard(generateEmptyBoard());
    setSelectedNumber(null);
    setGameCompleted(false); // Nasconde il messaggio di congratulazioni quando si pulisce la griglia
  };

  const handleClearCell = () => {
    if (selectedCell) {
      const { row, col } = selectedCell;
      const newBoard = [...board];
      newBoard[row][col] = null; // Pulisci il valore della cella selezionata
      setBoard(newBoard);
      setSelectedCell(null); // Deseleziona la cella dopo averla pulita
    }
  };

  const renderBoard = () => {
    return board.map((row, rowIndex) => (
        <View style={styles.row} key={rowIndex}>
          {row.map((cell, colIndex) => {
            const isLeftCell = colIndex % 3 === 0;
            const isTopCell = rowIndex % 3 === 0;
            const isRightCell = colIndex === 8;
            const isBottomCell = rowIndex === 8;

            return (
                <TouchableOpacity
                    key={colIndex}
                    style={[
                      styles.cell,
                      selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex
                          ? styles.selectedCell
                          : {},
                      isLeftCell ? styles.leftCell : {},
                      isTopCell ? styles.topCell : {},
                      isRightCell ? styles.rightCell : {},
                      isBottomCell ? styles.bottomCell : {},
                    ]}
                    onPress={() => handleCellPress(rowIndex, colIndex)}
                >
                  <Text style={styles.cellText}>{cell || ''}</Text>
                </TouchableOpacity>
            );
          })}
        </View>
    ));
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Sudoku</Text>
        {renderBoard()}

        {/* Messaggio di congratulazioni */}
        {gameCompleted && (
            <Text style={styles.congratulationsText}>Congratulazioni! Hai risolto il Sudoku!</Text>
        )}

        <View style={styles.numberRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <TouchableOpacity
                  key={num}
                  style={[
                    styles.numberButton,
                    selectedNumber === num.toString() ? styles.selectedNumberButton : {},
                  ]}
                  onPress={() => handleNumberPress(num.toString())}
              >
                <Text style={styles.numberButtonText}>{num}</Text>
              </TouchableOpacity>
          ))}
        </View>

        <View style={styles.difficultyRow}>
          <Button mode="contained" onPress={() => handleGenerateSudoku('easy')}>Facile</Button>
          <Button mode="contained" onPress={() => handleGenerateSudoku('medium')}>Medio</Button>
          <Button mode="contained" onPress={() => handleGenerateSudoku('hard')}>Difficile</Button>
        </View>

        <Button mode="contained" onPress={handleClear}>
          Pulisci Tutto
        </Button>
        <Button mode="contained" onPress={handleClearCell} disabled={!selectedCell}>
          Pulisci Cella
        </Button>
      </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5', // Un grigio chiaro più delicato
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333', // Testo grigio scuro per un buon contrasto
  },
  congratulationsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50', // Verde brillante per il messaggio di successo
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 35,  // Un po' più grande per una buona leggibilità
    height: 35,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    backgroundColor: '#fff', // Sfondo bianco per la cella
    borderRadius: 8,  // Bordo arrotondato
    shadowColor: '#000',  // Aggiunta ombra per un po' di profondità
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3, // Per dispositivi Android
    // transition: 'background-color 0.3s',  // Transizione morbida
  },
  selectedCell: {
    backgroundColor: '#80DEEA', // Colore azzurro chiaro per la cella selezionata
    borderWidth: 2, // Rendi più evidenti le celle selezionate con un bordo
    borderColor: '#00796B', // Bordo verde scuro per selezione
  },
  leftCell: {
    borderLeftWidth: 2,
    backgroundColor: '#f1f1f1',
  },
  topCell: {
    borderTopWidth: 2,
    backgroundColor: '#f1f1f1',
  },
  rightCell: {
    borderRightWidth: 2,
    backgroundColor: '#f1f1f1',
  },
  bottomCell: {
    borderBottomWidth: 2,
    backgroundColor: '#f1f1f1',
  },
  cellText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333', // Colore del testo per un buon contrasto
  },
  numberRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  numberButton: {
    width: 40,  // Bottoni numerici più grandi
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    backgroundColor: '#26C6DA', // Colore turchese per i numeri
    borderRadius: 50, // Bottone circolare
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedNumberButton: {
    backgroundColor: '#00796B', // Colore verde per il bottone selezionato
  },
  numberButtonText: {
    fontSize: 20, // Testo numerico un po' più grande
    fontWeight: 'bold',
    color: '#fff',
  },
  difficultyRow: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
  },
});


export default SudokuApp;
