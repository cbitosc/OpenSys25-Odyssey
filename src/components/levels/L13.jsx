import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Hourglass, HelpCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const HourglassPuzzleLevel = ({ levelNumber, onComplete, nextLevelNumber }) => {
  // State management
  const [inputValue, setInputValue] = useState("");
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isHourglassRunning, setIsHourglassRunning] = useState(false);
  const [message, setMessage] = useState("Measure exactly 15 minutes using the 7 and 11-minute hourglasses!");
  const [gameState, setGameState] = useState({
    sevenMinuteTimer: 7,
    elevenMinuteTimer: 11,
    runningGlasses: []
  });
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Hooks
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Game logic timer
  useEffect(() => {
    let timer;
    if (isHourglassRunning) {
      timer = setInterval(() => {
        setGameState(prev => {
          const updatedState = { ...prev };
          
          // Decrement running glasses
          updatedState.runningGlasses = prev.runningGlasses.map(glass => {
            const remainingTime = glass === '7min' 
              ? Math.max(0, updatedState.sevenMinuteTimer - 1)
              : Math.max(0, updatedState.elevenMinuteTimer - 1);
            
            if (glass === '7min') {
              updatedState.sevenMinuteTimer = remainingTime;
            } else {
              updatedState.elevenMinuteTimer = remainingTime;
            }
            
            return remainingTime > 0 ? glass : null;
          }).filter(Boolean);

          // Check win condition (exactly 15 minutes)
          if (updatedState.sevenMinuteTimer === 0 && updatedState.elevenMinuteTimer === 0) {
            setIsSuccess(true);
            setIsHourglassRunning(false);
            setMessage("Congratulations! You've measured exactly 15 minutes!");
          }

          return updatedState;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isHourglassRunning]);

  // Success effect
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Vault Solved!",
        description: "You've successfully measured exactly 15 minutes!",
        variant: "success",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
      });
      
      setTimeout(() => {
        onComplete(nextLevelNumber);
      }, 2000);
    }
  }, [isSuccess, nextLevelNumber, onComplete, toast]);

  // Reset game logic
  const resetGame = () => {
    setGameState({
      sevenMinuteTimer: 7,
      elevenMinuteTimer: 11,
      runningGlasses: []
    });
    setIsHourglassRunning(false);
    setIsSuccess(false);
    setMessage("Measure exactly 15 minutes using the 7 and 11-minute hourglasses!");
  };

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
    const flipSevenMatch = inputValue.match(/^\/flip\s*7$/i);
    const flipElevenMatch = inputValue.match(/^\/flip\s*11$/i);
    const resetMatch = inputValue.match(/^\/reset$/i);
    const helpMatch = inputValue.match(/^\/help$/i);
    const themeMatch = inputValue.match(/^\/theme\s+(dark|light)$/i);

    if (resetMatch) {
      resetGame();
      toast({
        title: "Game Reset",
        description: "Hourglasses reset to initial state",
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
    } else if (flipSevenMatch) {
      setGameState(prev => {
        const newState = { ...prev };
        if (!prev.runningGlasses.includes('7min')) {
          // Start 7-minute hourglass if not already running
          newState.runningGlasses.push('7min');
          setIsHourglassRunning(true);
        } else {
          // Flip 7-minute hourglass back to 7 minutes
          newState.sevenMinuteTimer = 7;
        }
        return newState;
      });
    } else if (flipElevenMatch) {
      setGameState(prev => {
        const newState = { ...prev };
        if (!prev.runningGlasses.includes('11min')) {
          // Start 11-minute hourglass if not already running
          newState.runningGlasses.push('11min');
          setIsHourglassRunning(true);
        } else {
          // Flip 11-minute hourglass back to 11 minutes
          newState.elevenMinuteTimer = 11;
        }
        return newState;
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
  };

  return (
    <div className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4">
      {/* Header */}
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-6 py-3 text-2xl font-bold text-[#2D1B4B] dark:text-[#1A0F2E] bg-gradient-to-r from-[#F9DC34] to-[#F5A623] rounded-full shadow-lg"
      >
        Level {levelNumber}: Hourglass Puzzle
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8 text-xl font-semibold mb-4 text-center text-purple-900 dark:text-[#F9DC34]"
      >
        {message}
      </motion.p>

      {/* Hourglass Status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex gap-4 mb-8"
      >
        <div className="bg-white dark:bg-[#2D1B4B]/40 rounded-xl p-4 shadow-lg border border-purple-200 dark:border-purple-700/30">
          <div className="flex items-center">
            <Hourglass className="mr-2 text-purple-700 dark:text-purple-300" />
            <span className="font-medium text-purple-900 dark:text-[#F9DC34]">
              7-min Hourglass: {gameState.sevenMinuteTimer} mins
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-[#2D1B4B]/40 rounded-xl p-4 shadow-lg border border-purple-200 dark:border-purple-700/30">
          <div className="flex items-center">
            <Hourglass className="mr-2 text-purple-700 dark:text-purple-300" />
            <span className="font-medium text-purple-900 dark:text-[#F9DC34]">
              11-min Hourglass: {gameState.elevenMinuteTimer} mins
            </span>
          </div>
        </div>
      </motion.div>
      
      {/* Help text */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mx-10 my-6 text-center cursor-pointer text-purple-700 dark:text-purple-300 hover:text-[#F5A623] dark:hover:text-[#F9DC34] transition-colors"
        onClick={() => setHelpModalOpen(true)}
      >
        Type <span className="font-mono bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">/help</span> to get commands and hints
      </motion.span>

      {/* Input and command button */}
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
                    <span className="font-bold text-purple-700 dark:text-purple-300">/flip 7</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Start or reset the 7-minute hourglass.</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/flip 11</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Start or reset the 11-minute hourglass.</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/reset</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Reset both hourglasses to initial state.</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/theme</span>{" "}
                    <span className="text-blue-600 dark:text-blue-300">[dark|light]</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Change the theme to dark or light.</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-purple-800 dark:text-[#F9DC34]">How to Play:</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                  <li>Your goal is to measure exactly 15 minutes</li>
                  <li>You have two hourglasses: 7-minute and 11-minute</li>
                  <li>Use /flip commands to start and reset hourglasses</li>
                </ul>
                
                <h3 className="text-xl font-bold mt-4 mb-2 text-purple-800 dark:text-[#F9DC34]">Hint:</h3>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  Solve the puzzle by strategically flipping the hourglasses to measure exactly 15 minutes.
                  Remember: The 7-minute and 11-minute hourglasses can be combined creatively!
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

export default HourglassPuzzleLevel;