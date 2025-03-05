import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Gamepad2, Pause, Play, RotateCcw } from "lucide-react";
import { useToast } from "../ui/use-toast";

// Tetromino shapes
const SHAPES = {
  I: [
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
  ],
  O: [
    [1,1],
    [1,1]
  ],
  T: [
    [0,1,0],
    [1,1,1],
    [0,0,0]
  ],
  L: [
    [0,0,1],
    [1,1,1],
    [0,0,0]
  ],
  J: [
    [1,0,0],
    [1,1,1],
    [0,0,0]
  ],
  S: [
    [0,1,1],
    [1,1,0],
    [0,0,0]
  ],
  Z: [
    [1,1,0],
    [0,1,1],
    [0,0,0]
  ]
};

const COLORS = {
  I: 'cyan',
  O: 'yellow',
  T: 'purple',
  L: 'orange',
  J: 'blue',
  S: 'green',
  Z: 'red'
};

const CommandTetris = ({ levelNumber, onComplete, nextLevelNumber }) => {
  // Game state
  const [board, setBoard] = useState(Array(20).fill().map(() => Array(10).fill(0)));
  const [currentPiece, setCurrentPiece] = useState(null);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Input and UI state
  const [inputValue, setInputValue] = useState("");
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [message, setMessage] = useState("Welcome to Command Tetris!");

  // Refs and hooks
  const gameLoopRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Generate a new random piece
  const getRandomPiece = useCallback(() => {
    const shapeKeys = Object.keys(SHAPES);
    const randomShape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
    return {
      shape: SHAPES[randomShape],
      color: COLORS[randomShape],
      name: randomShape
    };
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    const newBoard = Array(20).fill().map(() => Array(10).fill(0));
    setBoard(newBoard);
    setCurrentPiece(getRandomPiece());
    setCurrentPosition({ x: 5, y: 0 });
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
  }, [getRandomPiece]);

  // Check if move is valid
  const isValidMove = useCallback((piece, offsetX, offsetY) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = currentPosition.x + x + offsetX;
          const newY = currentPosition.y + y + offsetY;

          if (
            newX < 0 || 
            newX >= 10 || 
            newY >= 20 || 
            (newY >= 0 && board[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, [board, currentPosition]);

  // Rotate piece
  const rotatePiece = useCallback(() => {
    if (!currentPiece) return;

    const rotatedShape = currentPiece.shape[0].map((_, index) => 
      currentPiece.shape.map(row => row[index]).reverse()
    );

    const rotatedPiece = { ...currentPiece, shape: rotatedShape };

    if (isValidMove(rotatedPiece, 0, 0)) {
      setCurrentPiece(rotatedPiece);
      setMessage("Piece rotated!");
    } else {
      setMessage("Cannot rotate piece!");
    }
  }, [currentPiece, isValidMove]);

  // Move piece
  const movePiece = useCallback((dx, dy) => {
    if (!currentPiece) return;

    if (isValidMove(currentPiece, dx, dy)) {
      setCurrentPosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
    } else if (dy > 0) {
      // Piece cannot move down - lock it in place
      const newBoard = [...board];
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPosition.y + y;
            const boardX = currentPosition.x + x;
            
            if (boardY >= 0) {
              newBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }

      // Check for completed lines
      const clearedBoard = newBoard.filter(row => !row.every(cell => cell));
      const linesToClear = 20 - clearedBoard.length;
      const newLines = Array(linesToClear).fill(Array(10).fill(0));
      const updatedBoard = [...newLines, ...clearedBoard];

      // Update score
      const scoreIncrease = [0, 40, 100, 300, 1200][linesToClear] || 0;
      setScore(prev => prev + scoreIncrease);

      setBoard(updatedBoard);
      
      // Spawn new piece
      const newPiece = getRandomPiece();
      setCurrentPiece(newPiece);
      setCurrentPosition({ x: 5, y: 0 });

      // Check game over
      if (!isValidMove(newPiece, 0, 0)) {
        setIsGameOver(true);
      }
    }
  }, [board, currentPiece, currentPosition, isValidMove, getRandomPiece]);

  // Game loop
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const dropPiece = () => {
      movePiece(0, 1);
    };

    gameLoopRef.current = setInterval(dropPiece, 1000);
    return () => clearInterval(gameLoopRef.current);
  }, [movePiece, isGameOver, isPaused]);

  // Command handling
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCommandSubmit();
    }
  };

  const handleCommandSubmit = () => {
    if (isGameOver) {
      initializeGame();
      return;
    }

    const moveLeftCommand = inputValue.match(/^\/left$/i);
    const moveRightCommand = inputValue.match(/^\/right$/i);
    const moveDownCommand = inputValue.match(/^\/down$/i);
    const rotateCommand = inputValue.match(/^\/rotate$/i);
    const pauseCommand = inputValue.match(/^\/pause$/i);
    const resetCommand = inputValue.match(/^\/reset$/i);
    const helpCommand = inputValue.match(/^\/help$/i);
    const themeCommand = inputValue.match(/^\/theme\s+(dark|light)$/i);

    if (moveLeftCommand) {
      movePiece(-1, 0);
    } else if (moveRightCommand) {
      movePiece(1, 0);
    } else if (moveDownCommand) {
      movePiece(0, 1);
    } else if (rotateCommand) {
      rotatePiece();
    } else if (pauseCommand) {
      setIsPaused(prev => !prev);
    } else if (resetCommand) {
      initializeGame();
    } else if (helpCommand) {
      setHelpModalOpen(true);
    } else if (themeCommand) {
      const newTheme = themeCommand[1];
      setTheme(newTheme);
    } else {
      toast({
        title: "Unknown Command",
        description: "Type /help for available commands",
        variant: "destructive",
      });
    }

    setInputValue("");
  };

  // Render game board
  const renderBoard = () => {
    const boardWithCurrentPiece = board.map(row => [...row]);

    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPosition.y + y;
            const boardX = currentPosition.x + x;
            
            if (boardY >= 0 && boardY < 20 && boardX >= 0 && boardX < 10) {
              boardWithCurrentPiece[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }

    return boardWithCurrentPiece.map((row, rowIndex) => (
      <div key={rowIndex} className="flex">
        {row.map((cell, cellIndex) => (
          <div 
            key={cellIndex} 
            className={`w-6 h-6 border border-gray-200 
              ${cell ? `bg-${cell}-500` : 'bg-gray-100 dark:bg-gray-800'}`}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">
      {/* Game Header */}
      <motion.h1 
        className="px-6 py-3 text-2xl font-bold text-[#2D1B4B] dark:text-[#1A0F2E] bg-gradient-to-r from-[#F9DC34] to-[#F5A623] rounded-full shadow-lg"
      >
        Command Tetris
      </motion.h1>

      {/* Game Status */}
      <div className="flex items-center justify-between w-full max-w-md mt-4">
        <span className="text-lg font-semibold">
          Score: {score}
        </span>
        {isPaused && (
          <span className="text-yellow-600 font-bold">
            PAUSED
          </span>
        )}
        {isGameOver && (
          <span className="text-red-600 font-bold">
            GAME OVER
          </span>
        )}
      </div>

      {/* Game Board */}
      <div className="mt-4 border-4 border-purple-700 dark:border-purple-300">
        {renderBoard()}
      </div>

      {/* Input Area */}
      <motion.div 
        className="flex gap-2 w-full max-w-md mt-4"
      >
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter command..."
          className="border-purple-300 dark:border-purple-600/50"
        />
        <button 
          onClick={handleCommandSubmit}
          className="bg-gradient-to-r from-[#F9DC34] to-[#F5A623] p-2 rounded-lg"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Game Help Modal */}
      <AnimatePresence>
        {isHelpModalOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <motion.div className="bg-white dark:bg-[#2D1B4B] rounded-xl p-6 max-w-md">
              <h2 className="text-2xl font-bold mb-4">Tetris Commands</h2>
              <div className="space-y-2">
                <div>/left - Move piece left</div>
                <div>/right - Move piece right</div>
                <div>/down - Move piece down faster</div>
                <div>/rotate - Rotate piece</div>
                <div>/pause - Pause/unpause game</div>
                <div>/reset - Start new game</div>
                <div>/help - Show this menu</div>
              </div>
              <button 
                onClick={() => setHelpModalOpen(false)}
                className="mt-4 bg-purple-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommandTetris;