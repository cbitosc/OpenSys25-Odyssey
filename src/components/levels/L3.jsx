import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ArrowRight } from "lucide-react";
import { useToast } from "../ui/use-toast";

const Level3 = ({ levelNumber = 3, onComplete, nextLevelNumber = 4 }) => {
  const [inputValue, setInputValue] = useState("");
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [message, setMessage] = useState("Stop the moving crosshair precisely at the red dot");
  const [gameState, setGameState] = useState({
    targetPosition: { x: 50 },
    crosshairPosition: { x: 10 },
    direction: 1,
    speed: 1.0,
    isStopped: false,
    attempts: 0,
    tolerance: 2
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  
  const animationRef = useRef(null);
  const lastPositionRef = useRef({ x: 10 });
  
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const preventClickStop = (e) => {
    e.stopPropagation();
  };

  useEffect(() => {
    if (gameState.isStopped || isSuccess) {
      setIsAnimating(false);
      return;
    }
    
    setIsAnimating(true);
    let lastTimestamp = 0;
    const FRAME_RATE = 60;
    const FRAME_DURATION = 1000 / FRAME_RATE;
    
    const animate = (timestamp) => {
      if (!isAnimating) return;
      
      if (timestamp - lastTimestamp >= FRAME_DURATION) {
        lastTimestamp = timestamp;
        
        setGameState(prevState => {
          if (prevState.isStopped) return prevState;
          
          let newX = prevState.crosshairPosition.x + prevState.direction * prevState.speed;
          let newDirection = prevState.direction;
          
          if (newX >= 95) {
            newX = 95;
            newDirection = -1;
          } else if (newX <= 5) {
            newX = 5;
            newDirection = 1;
          }
          
          lastPositionRef.current = { x: newX };
          
          return {
            ...prevState,
            crosshairPosition: { x: newX },
            direction: newDirection
          };
        });
      }
      
      if (isAnimating) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      setIsAnimating(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [gameState.isStopped, isSuccess, isAnimating]);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!gameState.isStopped && !isSuccess && !isAnimating) {
        setIsAnimating(true);
      }
    };
    
    window.addEventListener('click', handleGlobalClick);
    
    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [gameState.isStopped, isSuccess, isAnimating]);

  useEffect(() => {
    if (gameState.isStopped && !isSuccess) {
      const distance = Math.abs(gameState.crosshairPosition.x - gameState.targetPosition.x);
      if (distance <= gameState.tolerance) {
        setIsSuccess(true);
      }
    }
  }, [gameState, isSuccess]);

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Level Completed!",
        description: "Perfect aim! You've hit the target!",
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
      animationRef.current = null;
    }
    
    lastPositionRef.current = { x: 10 };
    
    setGameState({
      targetPosition: { x: 50 },
      crosshairPosition: { x: 10 },
      direction: 1,
      speed: 1.2,
      isStopped: false,
      attempts: 0,
      tolerance: 3
    });
    setMessage("Stop the moving crosshair precisely at the red dot");
    setIsSuccess(false);
    setIsAnimating(true);
  };

  const stopCrosshair = () => {
    if (gameState.isStopped) {
      toast({
        title: "Already Stopped",
        description: "The crosshair is already stopped. Type /reset to try again.",
        variant: "default",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white opacity-100 shadow-lg",
      });
      return;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    setGameState(prevState => {
      const exactPosition = lastPositionRef.current.x;
      const distance = Math.abs(exactPosition - prevState.targetPosition.x);
      let newMessage = "";
      
      if (distance <= prevState.tolerance) {
        newMessage = "Perfect hit! You've got it!";
      } else if (distance <= 10) {
        newMessage = "Close! You missed by a small margin.";
      } else {
        newMessage = "Missed! Try again with /reset.";
      }
      
      setMessage(newMessage);
      
      return {
        ...prevState,
        crosshairPosition: { x: exactPosition },
        isStopped: true,
        attempts: prevState.attempts + 1
      };
    });
    
    setIsAnimating(false);
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
    const stopMatch = inputValue.match(/^\/stop$/i);
    
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
      stopCrosshair();
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

  const ensureAnimationRunning = () => {
    if (!gameState.isStopped && !isSuccess && !isAnimating) {
      setIsAnimating(true);
    }
  };

  return (
    <div 
      className="flex flex-col items-center mt-8 max-w-4xl mx-auto px-4"
      onClick={preventClickStop}
    >
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-6 py-3 text-2xl font-bold text-[#2D1B4B] dark:text-[#1A0F2E] bg-gradient-to-r from-[#F9DC34] to-[#F5A623] rounded-full shadow-lg"
      >
        Level 3
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
        onClick={preventClickStop}
      >
        <div 
          className="relative min-h-48 flex items-center justify-center"
          onClick={preventClickStop}
          onMouseDown={preventClickStop}
          onMouseUp={preventClickStop}
        >
          <div 
            className="relative w-full h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700"
            onClick={preventClickStop}
          >
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full bg-red-600"
              style={{ left: `${gameState.targetPosition.x}%` }}
            />
            
            <div 
              className={`absolute top-1/2 transform -translate-y-1/2 transition-colors ${
                isSuccess ? 'text-green-500' : gameState.isStopped ? 'text-blue-500' : 'text-purple-600'
              }`}
              style={{ 
                left: `${gameState.crosshairPosition.x}%`,
                transition: 'none'
              }}
              onClick={preventClickStop}
            >
              <div className="relative">
                <div className="absolute h-12 w-0.5 bg-current left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute w-12 h-0.5 bg-current top-1/2 transform -translate-y-1/2 -translate-x-1/2" />
                <div className="absolute w-2 h-2 rounded-full bg-current top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 right-2 text-sm text-gray-500 dark:text-gray-400">
            Attempts: {gameState.attempts}
          </div>
        </div>
      </motion.div>
      
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mx-10 my-6 text-center cursor-pointer text-purple-700 dark:text-purple-300 hover:text-[#F5A623] dark:hover:text-[#F9DC34] transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setHelpModalOpen(true);
          ensureAnimationRunning();
        }}
      >
        Type <span className="font-mono bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">/help</span> to get commands and hints
      </motion.span>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex gap-2 w-full max-w-md"
        onClick={preventClickStop}
      >
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter command..."
          className="border-purple-300 dark:border-purple-600/50 bg-white dark:bg-[#1A0F2E]/70 shadow-inner focus:ring-[#F5A623] focus:border-[#F9DC34]"
          onClick={(e) => {
            e.stopPropagation();
            ensureAnimationRunning();
          }}
        />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleCommandSubmit();
            ensureAnimationRunning();
          }}
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
            onClick={(e) => {
              e.stopPropagation();
              ensureAnimationRunning();
              setHelpModalOpen(false);
            }}
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-[#2D1B4B] rounded-xl overflow-hidden shadow-2xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 overflow-y-auto flex-grow">
                <h2 className="text-2xl font-bold mb-4 text-purple-800 dark:text-[#F9DC34]">Available Commands:</h2>
                <div className="space-y-1 mb-6">
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/stop</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Stop the moving crosshair.</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/reset</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Reset the level to try again.</p>
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
                I move with steady pace, left and right I trace.
Time me well, don't hesitate—
Hit my heart before it's too late!
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/30 px-6 py-4 text-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setHelpModalOpen(false);
                    ensureAnimationRunning();
                  }}
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

export default Level3;