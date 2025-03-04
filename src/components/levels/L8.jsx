import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ArrowRight } from "lucide-react";
import { useToast } from "../ui/use-toast";

const Level8 = ({ levelNumber = 8, onComplete, nextLevelNumber = 9 }) => {
  const [inputValue, setInputValue] = useState("");
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [message, setMessage] = useState("Calibrate all three bars to complete the level");
  const [gameState, setGameState] = useState({
    bars: [
      { position: 50, isCalibrated: false, direction: 1, speed: 1.2 },
      { position: 30, isCalibrated: false, direction: -1, speed: 0.9 },
      { position: 70, isCalibrated: false, direction: 1, speed: 1.5 }
    ],
    targetPositions: [50, 50, 50], 
    tolerance: 3, 
    allCalibrated: false
  });
  const [isSuccess, setIsSuccess] = useState(false);
  
  const animationRef = useRef(null);
  

  const { theme, setTheme } = useTheme();
  const { toast } = useToast();


  useEffect(() => {
    if (gameState.allCalibrated) return;
    
    const animate = () => {
      setGameState(prevState => {
        const newBars = [...prevState.bars];
        
        for (let i = 0; i < newBars.length; i++) {
          if (!newBars[i].isCalibrated) {
            newBars[i].position += newBars[i].direction * newBars[i].speed;
            
            if (newBars[i].position >= 100) {
              newBars[i].position = 100;
              newBars[i].direction = -1;
            } else if (newBars[i].position <= 0) {
              newBars[i].position = 0;
              newBars[i].direction = 1;
            }
          }
        }
        
        const anyUncalibrated = newBars.some((bar, idx) => {
          if (bar.isCalibrated) {
            const isStillCalibrated = Math.abs(bar.position - prevState.targetPositions[idx]) <= prevState.tolerance;
            return !isStillCalibrated;
          }
          return false;
        });
        
        if (anyUncalibrated) {
          for (let i = 0; i < newBars.length; i++) {
            newBars[i].isCalibrated = false;
          }
        }
        
        return {
          ...prevState,
          bars: newBars
        };
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.allCalibrated]);

  useEffect(() => {
    const allCalibrated = gameState.bars.every((bar, idx) => 
      bar.isCalibrated && Math.abs(bar.position - gameState.targetPositions[idx]) <= gameState.tolerance
    );
    
    if (allCalibrated && !gameState.allCalibrated) {
      setGameState(prev => ({...prev, allCalibrated: true}));
      setIsSuccess(true);
    }
  }, [gameState]);

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Level Completed!",
        description: "You've successfully calibrated all the bars!",
        variant: "success",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
      });
      
      setTimeout(() => {
        onComplete(nextLevelNumber);
      }, 2000);
    }
  }, [isSuccess, nextLevelNumber, onComplete, toast]);

  const resetGame = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setGameState({
      bars: [
        { position: 50, isCalibrated: false, direction: 1, speed: 1.2 },
        { position: 30, isCalibrated: false, direction: -1, speed: 0.9 },
        { position: 70, isCalibrated: false, direction: 1, speed: 1.5 }
      ],
      targetPositions: [50, 50, 50],
      tolerance: 3,
      allCalibrated: false
    });
    setMessage("Calibrate all three bars to complete the level");
    setIsSuccess(false);
    
    animationRef.current = requestAnimationFrame(() => {});
  };

  const calibrateBar = (barIndex) => {
    if (barIndex < 0 || barIndex >= gameState.bars.length) {
      toast({
        title: "Invalid Bar",
        description: `Valid bar numbers are 1-${gameState.bars.length}`,
        variant: "destructive",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
      });
      return;
    }
    
    setGameState(prevState => {
      const newBars = [...prevState.bars];
      const targetPos = prevState.targetPositions[barIndex];
      const bar = newBars[barIndex];
      
      if (Math.abs(bar.position - targetPos) <= prevState.tolerance) {
        // Calibrate the bar
        newBars[barIndex] = {
          ...bar,
          isCalibrated: true,
          position: targetPos // Snap to exact position
        };
        
        toast({
          title: "Bar Calibrated",
          description: `Bar ${barIndex + 1} successfully calibrated!`,
          variant: "default",
          className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 shadow-lg",
        });
      } else {
        toast({
          title: "Calibration Failed",
          description: `Bar ${barIndex + 1} is not in the target range!`,
          variant: "destructive",
          className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500 text-white opacity-100 shadow-lg",
        });
      }
      
      return {
        ...prevState,
        bars: newBars
      };
    });
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
    // Command parsing
    const resetMatch = inputValue.match(/^\/reset$/i);
    const helpMatch = inputValue.match(/^\/help$/i);
    const themeMatch = inputValue.match(/^\/theme\s+(dark|light)$/i);
    const stopMatch = inputValue.match(/^\/stop\s+([1-3])$/i);
    
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
    } else if (stopMatch) {
      const barNumber = parseInt(stopMatch[1], 10);
      calibrateBar(barNumber - 1); // Convert to 0-indexed
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

  // Render bar component
  const renderBar = (bar, index) => {
    const barHeight = 150; // Total bar height in pixels
    const markerPosition = gameState.targetPositions[index];
    
    return (
      <div className="relative w-16 h-40 mx-4" key={index}>
        <div className="absolute -top-6 left-0 w-full text-center text-purple-700 dark:text-purple-300 font-bold">
          {index + 1}
        </div>
        
        <div className="absolute inset-0 rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden">
          <div 
            className={`absolute left-0 w-full transition-colors rounded-lg ${
              bar.isCalibrated ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{
              bottom: `${bar.position}%`,
              height: '12px',
            }}
          />
          
          <div className="absolute left-0 w-full flex items-center justify-center" style={{ bottom: `${markerPosition}%` }}>
            <div className="w-full h-0.5 bg-red-500" />
            <div className="absolute left-0 text-xs text-red-500">|</div>
            <div className="absolute right-0 text-xs text-red-500">|</div>
          </div>
        </div>
        
        <div className={`absolute -bottom-6 left-0 w-full text-center text-xs font-medium ${
          bar.isCalibrated ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
        }`}>
          {bar.isCalibrated ? 'CALIBRATED' : 'UNCALIBRATED'}
        </div>
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
        <div className="min-h-48 flex items-center justify-center">
          <div className="flex justify-center items-end h-full w-full">
            {gameState.bars.map((bar, index) => renderBar(bar, index))}
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
                    <span className="font-bold text-purple-700 dark:text-purple-300">/stop</span>{" "}
                    <span className="text-blue-600 dark:text-blue-300">[1-3]</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Try to calibrate the specified bar (1, 2, or 3).</p>
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
                Precision is key! Wait for the bar’s indicator to meet the red line—timing it just right makes all the difference.
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

export default Level8;