import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ArrowRight, Droplets } from "lucide-react";
import { useToast } from "../ui/use-toast";

const Level1 = ({ levelNumber = 1, onComplete, nextLevelNumber = 2 }) => {
  const [inputValue, setInputValue] = useState("");
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [message, setMessage] = useState("The fish is out of water! Can you help?");
  const [gameState, setGameState] = useState({
    fishPosition: "land",
    attempts: 0,
  });
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Level Completed!",
        description: "You've successfully put the fish back in water!",
        variant: "success",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
      });
      
      setTimeout(() => {
        onComplete(nextLevelNumber);
      }, 2000);
    }
  }, [isSuccess, nextLevelNumber, onComplete, toast]);

  const checkWinCondition = () => {
    if (gameState.fishPosition === "water") {
      console.log(gameState.fishPosition)
      setIsSuccess(true);
    }
  };

  const resetGame = () => {
    setGameState({
      fishPosition: "land",
      attempts: 0,
    });
    setMessage("The fish is out of water! Can you help?");
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
    const undoMatch = inputValue.match(/^\/undo$/i);
    
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
    } else if (undoMatch) {
      setGameState(prevState => ({
        ...prevState,
        fishPosition: "water",
        attempts: prevState.attempts + 1,
      }));
      console.log(gameState.fishPosition)
      setMessage("Great job! The fish is back in water!");
      setIsSuccess(true); 
      checkWinCondition();  
    } else {
      setGameState(prevState => ({
        ...prevState,
        attempts: prevState.attempts + 1,
      }));
      toast({
        title: "Try Again",
        description: "Type /help to see available commands",
        variant: "destructive",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
      });
    }
    
    setInputValue("");
  };

  return (
    <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-6 py-3 text-2xl font-bold text-[#2D1B4B] dark:text-[#1A0F2E] bg-gradient-to-r from-[#F9DC34] to-[#F5A623] rounded-full shadow-lg"
      >
        Level {levelNumber}
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
        {/* Fish Illustration */}
        <div className="min-h-48 flex items-center justify-center relative overflow-hidden">
          {gameState.fishPosition === "land" ? (
            <div className="relative">
              {/* Land */}
              <div className="absolute bottom-0 w-64 h-12 bg-yellow-200 dark:bg-yellow-900 rounded-t-full"></div>
              
              {/* Fish */}
              <motion.svg 
                viewBox="0 0 100 50" 
                width="120"
                className="relative z-10"
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <path 
                  d="M20,25 C20,15 30,5 50,5 C70,5 80,15 80,25 C80,35 70,45 50,45 C30,45 20,35 20,25 Z" 
                  fill="#ff9800" 
                  stroke="#e65100" 
                  strokeWidth="2"
                />
                <circle cx="35" cy="20" r="3" fill="#000" />
                <path 
                  d="M80,25 L95,10 L95,40 Z" 
                  fill="#ff9800" 
                  stroke="#e65100" 
                  strokeWidth="2"
                />
                <path 
                  d="M50,5 L45,15 L55,15 Z" 
                  fill="#ff9800" 
                  stroke="#e65100" 
                  strokeWidth="2"
                />
              </motion.svg>
              
              {/* Droplets indicating dryness */}
              <motion.div
                className="absolute top-0 right-0"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: [0.7, 0.3, 0.7] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Droplets className="text-blue-300 dark:text-blue-500 opacity-50" size={24} />
              </motion.div>
            </div>
          ) : (
            <div className="relative">
              {/* Water */}
              <div className="absolute inset-0 w-64 h-48 bg-blue-300 dark:bg-blue-900/70 rounded-lg">
                <motion.div 
                  className="absolute top-0 left-0 right-0 h-4 bg-blue-200 dark:bg-blue-800 rounded-t-lg"
                  initial={{ y: -4 }}
                  animate={{ y: [0, 2, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>
              
              {/* Happy Fish */}
              <motion.svg 
                viewBox="0 0 100 50" 
                width="120"
                className="relative z-10"
                initial={{ x: -20 }}
                animate={{ 
                  x: [0, 30, 0],
                  y: [0, 5, 0, -5, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4,
                  times: [0, 0.5, 1]
                }}
              >
                <path 
                  d="M20,25 C20,15 30,5 50,5 C70,5 80,15 80,25 C80,35 70,45 50,45 C30,45 20,35 20,25 Z" 
                  fill="#ff9800" 
                  stroke="#e65100" 
                  strokeWidth="2"
                />
                <circle cx="35" cy="20" r="3" fill="#000" />
                <path 
                  d="M80,25 L95,10 L95,40 Z" 
                  fill="#ff9800" 
                  stroke="#e65100" 
                  strokeWidth="2"
                />
                <path 
                  d="M50,5 L45,15 L55,15 Z" 
                  fill="#ff9800" 
                  stroke="#e65100" 
                  strokeWidth="2"
                />
                <path
                  d="M40,30 Q50,40 60,30"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </motion.svg>
              
              {/* Bubbles */}
              <motion.div 
                className="absolute top-6 right-10"
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -20, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <div className="w-3 h-3 bg-white rounded-full opacity-60"></div>
              </motion.div>
              <motion.div 
                className="absolute top-12 right-16"
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -15, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
              >
                <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
              </motion.div>
            </div>
          )}
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
                    <span className="font-bold text-purple-700 dark:text-purple-300">/undo</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Reverses the situation that just happened</p>
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
                
                
                
                <h3 className="text-xl font-bold mt-4 mb-2 text-purple-800 dark:text-[#F9DC34]">Hint:</h3>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  The fish just got out of the tank.
                </p>
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

export default Level1;