import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ArrowRight } from "lucide-react";
import { useToast } from "../ui/use-toast";

const EightPuzzleLevel = ({ levelNumber, onComplete, nextLevelNumber }) => {
  const goalState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  
  const [inputValue, setInputValue] = useState("");
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [message, setMessage] = useState("It's 8 piece puzzle time!!");
  const [moveCount, setMoveCount] = useState(0);
  const [gameState, setGameState] = useState({
    board: [1, 8, 2, 0, 4, 3, 7, 6, 5],
    emptyPos: 0, 
  });
  const [isSuccess, setIsSuccess] = useState(false);
  
  useEffect(() => {
    const emptyIndex = gameState.board.findIndex(tile => tile === 0);
    setGameState(prev => ({
      ...prev,
      emptyPos: emptyIndex
    }));
  }, []);
  
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Level Completed!",
        description: `You solved the puzzle in ${moveCount} moves!`,
        variant: "success",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
      });
      
      setTimeout(() => {
        onComplete(nextLevelNumber);
      }, 2000);
    }
  }, [isSuccess, nextLevelNumber, onComplete, toast, moveCount]);

  function shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue, randomIndex;
    const newArray = [...array];
    
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      
      temporaryValue = newArray[currentIndex];
      newArray[currentIndex] = newArray[randomIndex];
      newArray[randomIndex] = temporaryValue;
    }
    
    if (isSolvable(newArray)) {
      return newArray;
    } else {
      [newArray[0], newArray[1]] = [newArray[1], newArray[0]];
      return newArray;
    }
  }
  
  function isSolvable(board) {
    let inversions = 0;
    const boardWithoutEmpty = board.filter(tile => tile !== 0);
    
    for (let i = 0; i < boardWithoutEmpty.length; i++) {
      for (let j = i + 1; j < boardWithoutEmpty.length; j++) {
        if (boardWithoutEmpty[i] > boardWithoutEmpty[j]) {
          inversions++;
        }
      }
    }
    
    return inversions % 2 === 0;
  }

  const checkWinCondition = (board) => {
    if (board.toString() === goalState.toString()) {
      setIsSuccess(true);
    }
  };

  const resetGame = () => {
    const shuffledBoard = [1, 8, 2, 0, 4, 3, 7, 6, 5];
    const emptyIndex = shuffledBoard.findIndex(tile => tile === 0);
    
    setGameState({
      board: shuffledBoard,
      emptyPos: emptyIndex
    });
    setMoveCount(0);
    setMessage("Arrange the tiles in order from 1-8. The space should be in the bottom right.");
    setIsSuccess(false);
  };

  const handleMove = (tileNumber) => {
    const { board, emptyPos } = gameState;
    const tilePos = board.indexOf(parseInt(tileNumber));
    
    if (tilePos === -1) {
      toast({
        title: "Invalid Move",
        description: `Tile ${tileNumber} does not exist on the board`,
        variant: "destructive",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
      });
      return;
    }
    
    const row = Math.floor(tilePos / 3);
    const col = tilePos % 3;
    const emptyRow = Math.floor(emptyPos / 3);
    const emptyCol = emptyPos % 3;
    
    const isAdjacent = (
      (row === emptyRow && Math.abs(col - emptyCol) === 1) || 
      (col === emptyCol && Math.abs(row - emptyRow) === 1)
    );
    
    if (!isAdjacent) {
      toast({
        title: "Invalid Move",
        description: `Tile ${tileNumber} is not adjacent to the empty space`,
        variant: "destructive",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
      });
      return;
    }
    const newBoard = [...board];
    newBoard[emptyPos] = parseInt(tileNumber);
    newBoard[tilePos] = 0;
    
    setGameState({
      board: newBoard,
      emptyPos: tilePos
    });
    
    setMoveCount(prev => prev + 1);
    
    setTimeout(() => {
      checkWinCondition(newBoard);
    }, 100);
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
    const moveMatch = inputValue.match(/^\/move\s+([1-8])$/i);
    
    if (resetMatch) {
      resetGame();
      toast({
        title: "Level Reset",
        description: "The puzzle has been reset to a new configuration",
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
      const tileNumber = moveMatch[1];
      handleMove(tileNumber);
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

  const renderTile = (value, index) => {
    if (value === 0) {
      return (
        <div 
          key={index} 
          className="bg-purple-100 dark:bg-purple-900/20 aspect-square rounded-lg"
        />
      );
    }
    
    return (
      <div 
        key={index} 
        className="bg-gradient-to-br from-[#F9DC34] to-[#F5A623] aspect-square rounded-lg flex items-center justify-center font-bold text-2xl text-purple-900 shadow-md cursor-pointer hover:scale-105 transition-transform"
        onClick={() => {
          setInputValue(`/move ${value}`);
          setTimeout(() => {
            handleCommandSubmit();
          }, 100);
        }}
      >
        {value}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-6 py-3 text-2xl font-bold text-[#2D1B4B] dark:text-[#1A0F2E] bg-gradient-to-r from-[#F9DC34] to-[#F5A623] rounded-full shadow-lg"
      >
        Level 10
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
        <div className="mb-4 flex justify-between items-center">
          <div className="font-semibold text-purple-700 dark:text-purple-300">
            Moves: {moveCount}
          </div>
          <button 
            onClick={resetGame}
            className="text-sm px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors"
          >
            New Puzzle
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {gameState.board.map((tile, index) => renderTile(tile, index))}
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
          placeholder="Enter command..."
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
                <h2 className="text-2xl font-bold mb-4 text-purple-800 dark:text-[#F9DC34]">Available Commands:</h2>
                <div className="space-y-1 mb-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/move</span>{" "}
                    <span className="text-blue-600 dark:text-blue-300">[1-8]</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Move the specified tile to the empty space.</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/reset</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Reset the level to a new random solvable puzzle.</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/theme</span>{" "}
                    <span className="text-blue-600 dark:text-blue-300">[dark|light]</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Change the theme to dark or light.</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/help</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Show this help menu.</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-purple-800 dark:text-[#F9DC34]">How to Play:</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                  <li>Objective: Arrange the numbered tiles in ascending order (1-8) with the empty space in the bottom right.</li>
                  <li>You can only move tiles that are adjacent to the empty space.</li>
                  <li>Use the command <span className="font-mono bg-purple-100 dark:bg-purple-900/30 px-1 rounded">/move [number]</span> to move a tile into the empty space.</li>
                  <li>You can also click on a tile to move it (if it's adjacent to the empty space).</li>
                </ul>
                
                
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

export default EightPuzzleLevel;