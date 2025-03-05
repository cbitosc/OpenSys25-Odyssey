import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ArrowRight } from "lucide-react";
import { useToast } from "../ui/use-toast";

const ChessKnightLevel = ({ levelNumber, onComplete, nextLevelNumber }) => {
  const BOARD_SIZE = 5;
  const BOARD_LETTERS = ['A', 'B', 'C', 'D', 'E'];

  const initialState = {
    board: [
      ['♞', '🟩', '🟩', '🔴', '🟩'],
      ['🟩', '🟩', '🔴', '🟩', '🟩'],
      ['🟩', '🟩', '🏁', '🔴', '🟩'],
      ['🟩', '🟩', '🔴', '🟩', '🟩'],
      ['🟩', '🟩', '🟩', '🟩', '🟩']
    ],
    knightPosition: { x: 0, y: 0 },
    moves: 0,
    visitedSquares: [{ x: 0, y: 0 }]
  };

  const [inputValue, setInputValue] = useState("");
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [gameState, setGameState] = useState(initialState);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("Move the knight to the exit in exactly 4 moves!");
  
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const knightMoves = [
    { dx: 2, dy: 1 }, { dx: 2, dy: -1 },
    { dx: -2, dy: 1 }, { dx: -2, dy: -1 },
    { dx: 1, dy: 2 }, { dx: 1, dy: -2 },
    { dx: -1, dy: 2 }, { dx: -1, dy: -2 }
  ];

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Level Completed!",
        description: "You've successfully moved the knight to the exit!",
        variant: "success",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
      });
      
      setTimeout(() => {
        onComplete(nextLevelNumber);
      }, 2000);
    }
  }, [isSuccess, nextLevelNumber, onComplete, toast]);

  const isValidMove = (newX, newY) => {
    if (newX < 0 || newX >= BOARD_SIZE || newY < 0 || newY >= BOARD_SIZE) {
      return false;
    }

    if (gameState.board[newY][newX] === '🔴') {
      return false;
    }

    const dx = Math.abs(newX - gameState.knightPosition.x);
    const dy = Math.abs(newY - gameState.knightPosition.y);
    const isKnightMove = (dx === 2 && dy === 1) || (dx === 1 && dy === 2);

    return isKnightMove;
  };

  const parseChessNotation = (notation) => {
    const letter = notation[0].toUpperCase();
    const number = parseInt(notation[1]);
    
    const x = BOARD_LETTERS.indexOf(letter);
    const y = 5 - number;

    return { x, y };
  };

  const moveKnight = (newPosition) => {
    const { x, y } = newPosition;

    if (!isValidMove(x, y)) {
      toast({
        title: "Invalid Move",
        description: "That move is not allowed for a knight!",
        variant: "destructive",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
      });
      return;
    }

    const newBoard = gameState.board.map(row => [...row]);
    newBoard[gameState.knightPosition.y][gameState.knightPosition.x] = '🟩';
    newBoard[y][x] = '♞';

    console.log('Current Position:', { x, y });
console.log('Exit Position:', gameState.board.findIndex(row => row.includes('🏁')));


    const isExit = newBoard[2][2] === '♞';
    const updatedMoves = gameState.moves + 1;

    console.log('Is Exit:', isExit);
console.log('Moves:', updatedMoves);

    const newState = {
      ...gameState,
      board: newBoard,
      knightPosition: { x, y },
      moves: updatedMoves,
      visitedSquares: [...gameState.visitedSquares, { x, y }]
    };

    setGameState(newState);

    if (isExit && updatedMoves === 4) {
      setIsSuccess(true);
      setMessage("Congratulations! You solved the puzzle!");
    } else if (updatedMoves > 4) {
      toast({
        title: "Too Many Moves",
        description: "You've exceeded the 4-move limit!",
        variant: "destructive",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
      });
      resetGame();
    }
  };

  const resetGame = () => {
    setGameState(initialState);
    setMessage("Move the knight to the exit in exactly 4 moves!");
    setIsSuccess(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCommandSubmit();
    }
  };

  const handleCommandSubmit = () => {
    const resetMatch = inputValue.match(/^\/reset$/i);
    const helpMatch = inputValue.match(/^\/help$/i);
    const themeMatch = inputValue.match(/^\/theme\s+(dark|light)$/i);
    const moveMatch = inputValue.match(/^\/move\s+([A-Ea-e][1-5])$/i);

    if (resetMatch) {
      resetGame();
      toast({
        title: "Level Reset",
        description: "The game has been reset to its initial state",
        variant: "default",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg",
      });
    } else if (helpMatch) {
      setHelpModalOpen(true);
    } else if (themeMatch) {
      const newTheme = themeMatch[1];
      setTheme(newTheme);
      toast({
        title: "Theme Changed",
        description: `Theme set to ${newTheme} mode`,
        variant: "default",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg",
      });
    } else if (moveMatch) {
      const target = parseChessNotation(moveMatch[1]);
      moveKnight(target);
    } else {
      toast({
        title: "Unknown Command",
        description: "Type /help to see available commands",
        variant: "destructive",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
      });
    }
    
    setInputValue("");
  };

  const renderBoard = () => {
    return gameState.board.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div 
            key={`${x}-${y}`} 
            className={`w-12 h-12 flex items-center justify-center border ${
              gameState.knightPosition.x === x && gameState.knightPosition.y === y 
                ? 'border-purple-500' 
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {cell}
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-6 py-3 text-2xl font-bold text-[#2D1B4B] dark:text-[#1A0F2E] bg-gradient-to-r from-[#F9DC34] to-[#F5A623] rounded-full shadow-lg"
      >
        Level 11
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8 text-xl font-semibold mb-4 text-center text-purple-900 dark:text-[#F9DC34]"
      >
        {message}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white dark:bg-[#2D1B4B]/40 rounded-2xl p-6 shadow-lg backdrop-blur-sm border border-purple-200 dark:border-purple-700/30 w-full max-w-md"
      >
        <div className="flex flex-col items-center">
          <div className="text-xs text-gray-500 mb-2">Current Moves: {gameState.moves}/4</div>
          <div className="border border-gray-300 dark:border-gray-700">
            {renderBoard()}
          </div>
        </div>
      </motion.div>
      
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mx-10 my-6 text-center cursor-pointer text-purple-700 dark:text-purple-300 hover:text-[#F5A623] dark:hover:text-[#F9DC34] transition-colors"
        onClick={() => setHelpModalOpen(true)}
      >
        Type <span className="font-mono bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">/help</span> to get commands and hints
      </motion.span>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex gap-2 w-full max-w-md"
      >
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter move (e.g., /move B3)"
          className="border-purple-300 dark:border-purple-600/50 bg-white dark:bg-[#1A0F2E]/70 shadow-inner focus:ring-[#F5A623] focus:border-[#F9DC34]"
        />
        <button 
          onClick={handleCommandSubmit}
          className="bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] p-2 rounded-lg shadow-md transition-transform hover:scale-105"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-purple-900" />
          </div>
        </button>
      </motion.div>

      <AnimatePresence>
        {isHelpModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-[#2D1B4B] rounded-xl overflow-hidden shadow-2xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
            >
              <div className="p-6 overflow-y-auto flex-grow">
                <h2 className="text-2xl font-bold mb-4 text-purple-800 dark:text-[#F9DC34]">Help</h2>
                <div className="space-y-4">
                  
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-purple-700 dark:text-purple-300">Commands:</h3>
                    <div className="space-y-2">
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                        <span className="font-bold text-purple-700 dark:text-purple-300">/move [Square]</span>

                        <p className="mt-1 text-gray-600 dark:text-gray-300">Move the knight to a specific square (e.g., /move B3)</p>
                      </div>
                      
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                        <span className="font-bold text-purple-700 dark:text-purple-300">/reset</span>
                        <p className="mt-1 text-gray-600 dark:text-gray-300">Reset the game to the initial state</p>
                      </div>
                      
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                        <span className="font-bold text-purple-700 dark:text-purple-300">/theme</span>{" "}
                        <span className="text-blue-600 dark:text-blue-300">[dark|light]</span>
                        <p className="mt-1 text-gray-600 dark:text-gray-300">Change the theme to dark or light</p>
                      </div>
                      
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                        <span className="font-bold text-purple-700 dark:text-purple-300">/help</span>
                        <p className="mt-1 text-gray-600 dark:text-gray-300">Show this help menu</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-purple-700 dark:text-purple-300">Hint:</h3>
                    <p className="text-gray-600 dark:text-gray-300 italic">
                      Carefully plan your L-shaped moves. Remember, you must reach the exit in exactly 4 moves!
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/30 px-6 py-4 text-center">
                <button
                  onClick={() => setHelpModalOpen(false)}
                  className="bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] px-6 py-2 rounded-lg text-purple-900 font-medium shadow-md transition-transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChessKnightLevel;