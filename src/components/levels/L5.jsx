import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Input } from "../ui/input";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useToast } from "../ui/use-toast";

const Level5 = ({ onComplete }) => {
  const [inputValue, setInputValue] = useState("");
  const { theme, setTheme } = useTheme();
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [showPath, setShowPath] = useState(false);
  const [mazeVisible, setMazeVisible] = useState(false); 
  const [playerPosition, setPlayerPosition] = useState(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const { toast } = useToast();

  const GRID_SIZE = 8;
  
  const [mazeGrid, setMazeGrid] = useState([]);
  const [pathTiles, setPathTiles] = useState([]);
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);
  
  useEffect(() => {
    initializeFixedMaze();
  }, []);
  
  useEffect(() => {
    if (showPath && isGameActive) {
      const timer = setTimeout(() => {
        setShowPath(false);
        toast({
          title: "Time's up!",
          description: "The path is now hidden. Navigate using movement commands!",
          variant: "default",
          className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg",
        });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showPath, isGameActive, toast]);
  
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Maze Completed!",
        description: "You've successfully navigated through the maze!",
        variant: "success",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
      });
      
      setTimeout(() => {
        onComplete(6);
      }, 2000);
    }
  }, [isSuccess, onComplete, toast]);

  const initializeFixedMaze = () => {
    const fixedPath = [
      { x: 0, y: 3 },
      { x: 1, y: 3 },
      { x: 2, y: 3 },
      { x: 2, y: 2 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 4, y: 2 },
      { x: 5, y: 2 },
      { x: 5, y: 3 },
      { x: 5, y: 4 },
      { x: 6, y: 4 },
      { x: 7, y: 4 }
    ];
    
    const grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill('empty'));
    
    fixedPath.forEach(pos => {
      grid[pos.y][pos.x] = 'path';
    });
    
    setMazeGrid(grid);
    setPathTiles(fixedPath);
    setStartPosition(fixedPath[0]);
    setEndPosition(fixedPath[fixedPath.length - 1]);
    setPlayerPosition(fixedPath[0]);
  };
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleCommandSubmit();
    }
  };

  const handleCommandSubmit = () => {
    const moveMatch = inputValue.match(/^\/move\s+(up|down|left|right)$/i);
    const startMatch = inputValue.match(/^\/start$/i);
    const resetMatch = inputValue.match(/^\/reset$/i);
    const themeMatch = inputValue.match(/^\/theme\s+(dark|light)$/i);
    const helpMatch = inputValue.match(/^\/help$/i);

    if (moveMatch && isGameActive && !showPath) {
      const direction = moveMatch[1].toLowerCase();
      handleMove(direction);
      setInputValue("");
    } else if (startMatch) {
      startGame();
      setInputValue("");
    } else if (resetMatch) {
      resetGame();
      setInputValue("");
    } else if (themeMatch) {
      const newTheme = themeMatch[1];
      setTheme(newTheme);
      setInputValue("");
      toast({
        title: "Theme Changed",
        description: `Theme set to ${newTheme} mode`,
        variant: "default",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg",
      });
    } else if (helpMatch) {
      setHelpModalOpen(true);
      setInputValue("");
    } else {
      if (moveMatch && !isGameActive) {
        toast({
          title: "Game Not Started",
          description: "Type /start to begin the maze challenge!",
          variant: "default",
          className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg",
        });
      } else if (moveMatch && showPath) {
        toast({
          title: "Memorization Phase",
          description: "Wait until the path disappears before making your move!",
          variant: "default",
          className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg",
        });
      } else {
        toast({
          title: "Unknown Command",
          description: "Type /help to see available commands",
          variant: "destructive",
          className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
        });
      }
      setInputValue("");
    }
  };

  const startGame = () => {
    setIsGameActive(true);
    setShowPath(true);
    setMazeVisible(true);
    setPlayerPosition(startPosition);
    setMoveHistory([]);
    
    toast({
      title: "Memorization Phase",
      description: "You have 5 seconds to memorize the path!",
      variant: "default",
      className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg",
    });
  };

  const resetGame = () => {
    setIsGameActive(false);
    setShowPath(false);
    if (resetCount % 2 === 1) {
      setMazeVisible(false);
    }
    setPlayerPosition(startPosition);
    setMoveHistory([]);
    setResetCount(resetCount + 1);
    
    toast({
      title: "Game Reset",
      description: "Type /start to begin a new attempt!",
      variant: "default",
      className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg",
    });
  };

  const handleMove = (direction) => {
    if (!playerPosition) return;
    
    const newPos = { ...playerPosition };
    
    switch (direction) {
      case 'up':
        newPos.y = Math.max(0, newPos.y - 1);
        break;
      case 'down':
        newPos.y = Math.min(GRID_SIZE - 1, newPos.y + 1);
        break;
      case 'left':
        newPos.x = Math.max(0, newPos.x - 1);
        break;
      case 'right':
        newPos.x = Math.min(GRID_SIZE - 1, newPos.x + 1);
        break;
      default:
        return;
    }
    
    setMoveHistory([...moveHistory, direction]);
    
    const isOnPath = pathTiles.some(tile => tile.x === newPos.x && tile.y === newPos.y);
    
    if (isOnPath) {
      setPlayerPosition(newPos);
      
      if (newPos.x === endPosition.x && newPos.y === endPosition.y) {
        setIsSuccess(true);
      }
    } else {
      setPlayerPosition(startPosition);
      
      toast({
        title: "Wrong Move!",
        description: "You stepped off the path. Try again!",
        variant: "destructive",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
      });
    }
  };

  const closeHelpModal = () => {
    setHelpModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-6 py-3 text-2xl font-bold text-[#2D1B4B] dark:text-[#1A0F2E] bg-gradient-to-r from-[#F9DC34] to-[#F5A623] rounded-full shadow-lg"
      >
        Level 5
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8 text-xl font-semibold mb-4 text-center text-purple-900 dark:text-[#F9DC34]"
      >
        Memorize the maze path in 5 seconds, then navigate from start to finish!
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white dark:bg-[#2D1B4B]/40 rounded-2xl p-6 shadow-lg backdrop-blur-sm border border-purple-200 dark:border-purple-700/30 w-full max-w-md"
      >
        <div className="flex justify-center mb-4">
          <button
            onClick={startGame}
            disabled={isGameActive && showPath}
            className={`px-6 py-3 rounded-full flex items-center gap-2 shadow-lg transition-all ${
              isGameActive && showPath
                ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                : "bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] hover:scale-105"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-900">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span className="font-bold text-purple-900">
              {isGameActive && showPath ? "Memorizing..." : "Show Maze"}
            </span>
          </button>
        </div>
        
        {mazeVisible && (
          <div className="mt-4 mb-6 flex justify-center">
            <div className="grid grid-cols-8 gap-1 border-2 border-purple-600 dark:border-purple-500 p-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              {mazeGrid.map((row, y) => 
                row.map((cell, x) => {
                  const isPlayerHere = playerPosition && playerPosition.x === x && playerPosition.y === y;
                  const isStart = startPosition && startPosition.x === x && startPosition.y === y;
                  const isEnd = endPosition && endPosition.x === x && endPosition.y === y;
                  const isPath = cell === 'path';
                  
                  let bgColor = 'bg-gray-200 dark:bg-gray-700';
                  
                  if (isPlayerHere) {
                    bgColor = 'bg-blue-500 dark:bg-blue-600';
                  } else if (showPath && isPath) {
                    bgColor = 'bg-green-500 dark:bg-green-600';
                  } else if (!showPath && isStart) {
                    bgColor = 'bg-blue-300 dark:bg-blue-700';
                  } else if (!showPath && isEnd) {
                    bgColor = 'bg-yellow-400 dark:bg-yellow-600';
                  }
                  
                  return (
                    <div 
                      key={`${x}-${y}`} 
                      className={`w-8 h-8 ${bgColor} rounded-sm flex items-center justify-center transition-colors duration-150`}
                    >
                      {isPlayerHere && (
                        <div className="w-4 h-4 rounded-full bg-white shadow-inner"></div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
        
        {!mazeVisible && (
          <div className="mt-4 mb-6 flex justify-center items-center h-64 w-full">
            <div className="text-center p-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-dashed border-purple-400 dark:border-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-purple-600 dark:text-purple-300">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="15" y1="3" x2="15" y2="21"></line>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" y2="15"></line>
              </svg>
              <p className="text-purple-700 dark:text-purple-300 font-medium">
                The maze will appear here after you click "Start Challenge"
              </p>
            </div>
          </div>
        )}
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
          onKeyPress={handleEnter}
          placeholder="Enter command..."
          className="border-purple-300 dark:border-purple-600/50 bg-white dark:bg-[#1A0F2E]/70 shadow-inner focus:ring-[#F5A623] focus:border-[#F9DC34]"
        />
        <button 
          onClick={handleCommandSubmit}
          className="bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] p-2 rounded-lg shadow-md transition-transform hover:scale-105"
        >
          <Image
            src="/runcode.png"
            alt="Run"
            height={20}
            width={20}
            className="rounded-sm"
          />
        </button>
      </motion.div>
      
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#2D1B4B] rounded-xl overflow-hidden shadow-2xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
          >
            <div className="p-6 overflow-y-auto flex-grow">
              <h2 className="text-2xl font-bold mb-4 text-purple-800 dark:text-[#F9DC34]">Available Commands:</h2>
              <div className="space-y-1 mb-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">/start</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">Begin the maze challenge and start the 5-second memorization period.</p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">/move</span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">[up|down|left|right]</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">Move your character in the specified direction (e.g., /move right).</p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">/reset</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">Reset the current game.</p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">/theme</span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">[dark|light]</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">Change the theme to dark or light.</p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">/help</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">Show available commands and hints.</p>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mt-4 mb-2 text-purple-800 dark:text-[#F9DC34]">Hint:</h3>
              <p className="text-gray-600 dark:text-gray-300 italic">
              Step by step, a path unfolds,
Left or right, the choice you hold.
Trace the way with careful sight,
Or let the buttons guide you right!
              </p>
              
              {moveHistory.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold mb-2 text-purple-800 dark:text-[#F9DC34]">Your Moves:</h3>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded text-sm">
                    {moveHistory.slice(-10).map((move, index) => (
                      <span key={index} className="inline-block mr-1 mb-1 px-2 py-1 bg-purple-200 dark:bg-purple-800 rounded">
                        {move}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/30 px-6 py-4 text-center">
              <button
                onClick={closeHelpModal}
                className="bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] px-6 py-2 rounded-lg text-purple-900 font-medium shadow-md transition-transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Level5;