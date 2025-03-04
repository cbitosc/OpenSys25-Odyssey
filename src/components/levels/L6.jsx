import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { useToast } from "../ui/use-toast";

const Level6 = ({ onComplete }) => {
  const OBJECT_TYPES = {
    WALL: "wall",
    METAL: "metal", 
    WOOD: "wood",   
    EXIT: "exit",
    PLAYER: "player"
  };

  // Initial game layout
  const initialLayout = [
    [OBJECT_TYPES.WALL, OBJECT_TYPES.WALL, OBJECT_TYPES.WALL, OBJECT_TYPES.WALL, OBJECT_TYPES.WALL, OBJECT_TYPES.WALL, OBJECT_TYPES.WALL, OBJECT_TYPES.WALL, OBJECT_TYPES.WALL],
    [OBJECT_TYPES.WALL, OBJECT_TYPES.PLAYER, null, null, OBJECT_TYPES.WOOD, null, OBJECT_TYPES.METAL, null, OBJECT_TYPES.WALL],
    [OBJECT_TYPES.WALL, OBJECT_TYPES.WOOD, null, null, OBJECT_TYPES.WALL, null, OBJECT_TYPES.WALL, OBJECT_TYPES.WOOD, OBJECT_TYPES.WALL],
    [OBJECT_TYPES.WALL, null, OBJECT_TYPES.METAL, null, OBJECT_TYPES.WOOD, null, OBJECT_TYPES.METAL, null, OBJECT_TYPES.WALL],
    [OBJECT_TYPES.WALL, OBJECT_TYPES.WALL, OBJECT_TYPES.WALL, null, OBJECT_TYPES.WALL, null, OBJECT_TYPES.WALL, OBJECT_TYPES.WALL, OBJECT_TYPES.WALL],
    [OBJECT_TYPES.WALL, null, OBJECT_TYPES.WOOD, null, OBJECT_TYPES.METAL, null, OBJECT_TYPES.WOOD, null, OBJECT_TYPES.WALL],
    [OBJECT_TYPES.WALL, OBJECT_TYPES.METAL, OBJECT_TYPES.WALL, null, OBJECT_TYPES.WALL, null, OBJECT_TYPES.WALL, OBJECT_TYPES.METAL, OBJECT_TYPES.WALL],
    [OBJECT_TYPES.WALL, null, null, OBJECT_TYPES.WOOD, null, OBJECT_TYPES.EXIT, null, null, OBJECT_TYPES.WALL],
    [OBJECT_TYPES.WALL, OBJECT_TYPES.WALL, OBJECT_TYPES.WALL, OBJECT_TYPES.WALL, OBJECT_TYPES.WALL, OBJECT_TYPES.WALL, OBJECT_TYPES.WALL, OBJECT_TYPES.WALL, OBJECT_TYPES.WALL],
  ];

  const [layout, setLayout] = useState(initialLayout);
  const [inputValue, setInputValue] = useState("");
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [message, setMessage] = useState("Shift gravity to clear a path to the exit!");
  const [currentGravity, setCurrentGravity] = useState("down");
  const [moveCount, setMoveCount] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const getObjectColor = (type) => {
    switch (type) {
      case OBJECT_TYPES.WALL: return "bg-purple-900 dark:bg-[#1A0F2E]";
      case OBJECT_TYPES.METAL: return "bg-gray-400 dark:bg-gray-500";
      case OBJECT_TYPES.WOOD: return "bg-yellow-700 dark:bg-yellow-800";
      case OBJECT_TYPES.EXIT: return "bg-green-500 dark:bg-green-600";
      case OBJECT_TYPES.PLAYER: return "bg-blue-500 dark:bg-blue-600";
      default: return "bg-transparent";
    }
  };

  const simulateGravity = async (direction) => {
    setIsSimulating(true);
    let hasChanges = true;
    let currentLayout = [...layout.map(row => [...row])];
    
    while (hasChanges) {
      hasChanges = false;
      let newLayout = [...currentLayout.map(row => [...row])];
      
      for (let y = 0; y < layout.length; y++) {
        for (let x = 0; x < layout[0].length; x++) {
          const obj = currentLayout[y][x];
          if (obj === OBJECT_TYPES.METAL || obj === OBJECT_TYPES.WOOD) {
            let newX = x;
            let newY = y;
            
            switch (direction) {
              case "down":
                newY = y + 1;
                break;
              case "up":
                newY = y - 1;
                break;
              case "left":
                newX = x - 1;
                break;
              case "right":
                newX = x + 1;
                break;
            }
            
            if (newY >= 0 && newY < layout.length && 
                newX >= 0 && newX < layout[0].length && 
                !currentLayout[newY][newX]) {
              newLayout[newY][newX] = obj;
              newLayout[y][x] = null;
              hasChanges = true;
            }
          }
        }
      }
      
      if (hasChanges) {
        currentLayout = newLayout;
        setLayout(newLayout);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    setIsSimulating(false);
    checkWinCondition(currentLayout);
  };

  const checkWinCondition = (currentLayout) => {
    let playerX, playerY;
    for (let y = 0; y < currentLayout.length; y++) {
      for (let x = 0; x < currentLayout[0].length; x++) {
        if (currentLayout[y][x] === OBJECT_TYPES.PLAYER) {
          playerY = y;
          playerX = x;
          break;
        }
      }
    }

    const exitX = 5;
    const exitY = 7;
    
    if (canReachExit(currentLayout, playerX, playerY, exitX, exitY)) {
      setMessage("Congratulations! You've cleared a path to the exit! 🎉");
      toast({
        title: "Level Completed!",
        description: "You've successfully cleared a path to the exit!",
        variant: "success",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
      });
      setTimeout(() => {
        onComplete(9);
      }, 2000);
    }
  };

  const canReachExit = (layout, startX, startY, exitX, exitY) => {
    const visited = new Set();
    const queue = [[startX, startY]];
    
    while (queue.length > 0) {
      const [x, y] = queue.shift();
      const key = `${x},${y}`;
      
      if (x === exitX && y === exitY) return true;
      if (visited.has(key)) continue;
      
      visited.add(key);
      
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (const [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;
        
        if (newX >= 0 && newX < layout[0].length &&
            newY >= 0 && newY < layout.length &&
            !layout[newY][newX] || layout[newY][newX] === OBJECT_TYPES.EXIT) {
          queue.push([newX, newY]);
        }
      }
    }
    
    return false;
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleCommandSubmit = () => {
    if (isSimulating) return;

    const gravityMatch = inputValue.match(/^\/gravity\s+(up|down|left|right)$/i);
    const resetMatch = inputValue.match(/^\/reset$/i);
    const helpMatch = inputValue.match(/^\/help$/i);
    const themeMatch = inputValue.match(/^\/theme\s+(dark|light)$/i);

    if (gravityMatch) {
      const direction = gravityMatch[1].toLowerCase();
      setCurrentGravity(direction);
      setMoveCount(prev => prev + 1);
      toast({
        title: `Gravity Shifted to ${direction}`,
        description: `Objects are now falling ${direction}ward`,
        variant: "default",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg",
      });
      simulateGravity(direction);
      setInputValue("");
    } else if (resetMatch) {
      setLayout(initialLayout);
      setMoveCount(0);
      setCurrentGravity("down");
      setMessage("Shift gravity to clear a path to the exit!");
      toast({
        title: "Level Reset",
        description: "The game has been reset to its initial state",
        variant: "default",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg",
      });
      setInputValue("");
    } else if (helpMatch) {
      setHelpModalOpen(true);
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
    } else {
      toast({
        title: "Unknown Command",
        description: "Type /help to see available commands",
        variant: "destructive",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
      });
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCommandSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-6 py-3 text-2xl font-bold text-[#2D1B4B] dark:text-[#1A0F2E] bg-gradient-to-r from-[#F9DC34] to-[#F5A623] rounded-full shadow-lg"
      >
        Level 6
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
        <div className="mb-6 relative flex justify-center">
          <div className="grid gap-1 p-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl border-2 border-purple-600 dark:border-purple-500">
            {layout.map((row, y) => (
              <div key={y} className="flex gap-1">
                {row.map((cell, x) => (
                  <motion.div
                    key={`${x}-${y}`}
                    className={`w-8 h-8 rounded-lg ${getObjectColor(cell)}`}
                    animate={{ scale: cell ? 1 : 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                ))}
              </div>
            ))}
          </div>
          
          <motion.div
            className="absolute -bottom-16 flex justify-center items-center"
            animate={{ 
              rotate: currentGravity === "down" ? 0 :
                      currentGravity === "up" ? 180 :
                      currentGravity === "left" ? 90 :
                      currentGravity === "right" ? 270 : 0 
            }}
          >
            <div className="bg-gradient-to-r from-[#F9DC34] to-[#F5A623] p-3 rounded-full shadow-md">
              <ArrowDown className="w-6 h-6 text-purple-900" />
            </div>
          </motion.div>
        </div>

        <div className=" pt-12 text-lg font-semibold text-center text-purple-900 dark:text-[#F9DC34]">
          Moves: {moveCount}
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
          <div className="w-5 h-5 flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-purple-900" />
          </div>
        </button>
      </motion.div>

      {/* Help Modal */}
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
                    <span className="font-bold text-purple-700 dark:text-purple-300">/gravity</span>{" "}
                    <span className="text-blue-600 dark:text-blue-300">[up|down|left|right]</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Change the direction in which objects fall (e.g., /gravity up).</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/reset</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Reset the level to its initial state.</p>
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
                  <li>Your goal is to clear a path from the player (blue) to the exit (green).</li>
                  <li>Change gravity direction to move blocks around the level.</li>
                  <li>Wooden blocks (brown) and metal blocks (gray) will fall in the direction of gravity.</li>
                  <li>Walls (black) never move.</li>
                  <li>Use as few gravity shifts as possible to solve the puzzle.</li>
                </ul>
                
                <h3 className="text-xl font-bold mt-4 mb-2 text-purple-800 dark:text-[#F9DC34]">Objects:</h3>
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    🟦 Blue: Player<br />
                    🟫 Brown: Wooden blocks (can be moved)<br />
                    ⬜ Gray: Metal blocks (can be moved)<br />
                    🟩 Green: Exit<br />
                    ⬛ Black: Walls (immovable)
                  </p>
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

export default Level6;