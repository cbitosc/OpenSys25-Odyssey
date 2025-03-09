import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ArrowRight, Volume2 } from "lucide-react";
import { useToast } from "../ui/use-toast";

const MorseCodeLevel = ({ levelNumber, onComplete, nextLevelNumber }) => {
  const [inputValue, setInputValue] = useState("");
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [message, setMessage] = useState("Listen to the Morse code and decode the message!");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSignalType, setCurrentSignalType] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const audioContextRef = useRef(null);
  const morseSequence = [
    // C
    { type: "dash", duration: 0.3 },
    { type: "dot", duration: 0.1 },
    { type: "dash", duration: 0.3 },
    { type: "dot", duration: 0.1 },
    // Pause between letters
    { type: "pause", duration: 0.4 },
    // O
    { type: "dash", duration: 0.3 },
    { type: "dash", duration: 0.3 },
    { type: "dash", duration: 0.3 },
    // Pause between letters
    { type: "pause", duration: 0.4 },
    // S
    { type: "dot", duration: 0.1 },
    { type: "dot", duration: 0.1 },
    { type: "dot", duration: 0.1 },
    // Pause between letters
    { type: "pause", duration: 0.4 },
    // C
    { type: "dash", duration: 0.3 },
    { type: "dot", duration: 0.1 },
    { type: "dash", duration: 0.3 },
    { type: "dot", duration: 0.1 }
  ];

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    setTimeout(() => {
      playMorseSequence();
    }, 1500);
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Level Completed!",
        description: "You've successfully decoded the code message!",
        variant: "success",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
      });
      
      setTimeout(() => {
        onComplete(nextLevelNumber);
      }, 2000);
    }
  }, [isSuccess, nextLevelNumber, onComplete, toast]);

  const playSound = (duration, frequency = 600) => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContextRef.current.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + duration - 0.01);
    
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  const playMorseSequence = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setMessage("Playing code...");
    
    let totalDelay = 0;
    
    for (let i = 0; i < morseSequence.length; i++) {
      const { type, duration } = morseSequence[i];
      
      setTimeout(() => {
        setCurrentSignalType(type);
        if (type !== "pause") {
          playSound(duration);
        }
      }, totalDelay * 1000);
      
      setTimeout(() => {
        setCurrentSignalType(null);
      }, (totalDelay + duration) * 1000);
      
      totalDelay += duration + 0.1; 
    }
    
    setTimeout(() => {
      setIsPlaying(false);
      setMessage("What's the decoded message?");
    }, totalDelay * 1000);
  };

  const resetGame = () => {
    setMessage("Listen to the code and decode the message!");
    setCurrentSignalType(null);
    setIsPlaying(false);
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
    const playMatch = inputValue.match(/^\/play$/i);
    const decodeMatch = inputValue.match(/^\/decode\s+(.+)$/i);
    
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
    } else if (playMatch) {
      playMorseSequence();
      toast({
        title: "Playing Code",
        description: "Listen carefully to decode the message",
        variant: "default",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg",
      });
    } else if (decodeMatch) {
      const answer = decodeMatch[1].trim().toUpperCase();
      
      if (answer === "COSC") {
        setMessage("Perfect! You've decoded the message correctly! 🎉");
        setIsSuccess(true);
      } else {
        setMessage("Not quite right. Try listening again!");
        toast({
          title: "Incorrect Answer",
          description: "The decoded message isn't right. Try again!",
          variant: "destructive",
          className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
        });
      }
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
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-6 py-3 text-2xl font-bold text-[#2D1B4B] dark:text-[#1A0F2E] bg-gradient-to-r from-[#F9DC34] to-[#F5A623] rounded-full shadow-lg"
      >
        Level 9
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
        <div className="min-h-48 flex flex-col items-center justify-center">
          <div className="flex justify-center gap-8 my-6">
            <div className="flex flex-col items-center">
              <motion.div
                className="w-16 h-32 rounded-md"
                animate={{
                  scale: currentSignalType === "dot" ? 1.2 : 1,
                  backgroundColor: currentSignalType === "dot" 
                    ? "#8B5CF6" 
                    : theme === 'dark' ? "#4B5563" : "#D1D5DB"
                }}
              />
              <span className="mt-2 text-sm text-purple-700 dark:text-purple-300">Short</span>
            </div>
            
            <div className="flex flex-col items-center">
              <motion.div
                className="w-16 h-32 rounded-md"
                animate={{
                  scale: currentSignalType === "dash" ? 1.2 : 1,
                  backgroundColor: currentSignalType === "dash" 
                    ? "#8B5CF6" 
                    : theme === 'dark' ? "#4B5563" : "#D1D5DB"
                }}
              />
              <span className="mt-2 text-sm text-purple-700 dark:text-purple-300">Long</span>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={playMorseSequence}
            disabled={isPlaying}
            className={`px-6 py-3 rounded-lg bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] text-[#2D1B4B] flex items-center gap-2 shadow-md ${
              isPlaying ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Volume2 className="w-5 h-5" />
            Play Code
          </motion.button>
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
                    <span className="font-bold text-purple-700 dark:text-purple-300">/play</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Play the code sequence again.</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/decode</span>{" "}
                    <span className="text-blue-600 dark:text-blue-300">[word]</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Submit your answer (e.g., /decode HELLO).</p>
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
                Listen carefully—two distinct beeps, one long and one short. Patterns matter, but so do the silences in between.
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

export default MorseCodeLevel;