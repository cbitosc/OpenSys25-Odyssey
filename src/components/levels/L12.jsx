import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Volume2, Play, Music } from "lucide-react";
import { useToast } from "../ui/use-toast";

const Level6 = ({ onComplete }) => {
  // State management
  const [inputValue, setInputValue] = useState("");
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [message, setMessage] = useState("Listen to the sequence and replay it!");
  const [isPlaying, setIsPlaying] = useState(false);
  const [userSequence, setUserSequence] = useState([]);
  const [playbackIndex, setPlaybackIndex] = useState(-1);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Hooks
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Audio contexts and notes
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);

  // Define the target sequence
  const targetSequence = ['C', 'E', 'G', 'A', 'B', 'F', 'D'];
  
  const noteFrequencies = {
    'C': 130.81, // C3
    'D': 196.00, // G3
    'E': 261.63, // C4
    'F': 349.23, // F4
    'G': 440.00, // A4
    'A': 587.33, // D5
    'B': 783.99, // G5
  };
  

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Success effect - triggers level completion
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Level Completed!",
        description: "You've successfully matched the musical sequence!",
        variant: "success",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
      });
      
      setTimeout(() => {
        onComplete(7);
      }, 2000);
    }
  }, [isSuccess, onComplete, toast]);

  const playNote = (note, duration = 0.5) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(noteFrequencies[note], audioContextRef.current.currentTime);
    
    // Add envelope for smoother sound
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContextRef.current.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  const playSequence = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setMessage("Playing sequence...");

    for (let i = 0; i < targetSequence.length; i++) {
      setPlaybackIndex(i);
      playNote(targetSequence[i]);
      await new Promise(resolve => setTimeout(resolve, 700));
    }

    setPlaybackIndex(-1);
    setIsPlaying(false);
    setMessage("Now try to replay the sequence!");
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
    const playMatch = inputValue.match(/^\/play\s+([A-G]\s*)+$/);
    const listenMatch = inputValue.match(/^\/listen$/);

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
      const sequence = inputValue.slice(6).split(/\s+/);
      setUserSequence(sequence);
      
      // Play the user's sequence
      sequence.forEach((note, index) => {
        setTimeout(() => {
          playNote(note);
        }, index * 700);
      });

      // Check if the sequence is correct
      const isCorrect = sequence.join('') === targetSequence.join('');
      
      if (isCorrect) {
        setMessage("Perfect! You've matched the sequence! 🎵");
        setIsSuccess(true);
      } else {
        toast({
          title: "Incorrect Sequence",
          description: "Not quite right. Try listening again! 🎵",
          variant: "destructive",
          className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
        });
      }
    } else if (listenMatch) {
      playSequence();
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

  const resetGame = () => {
    setMessage("Listen to the sequence and replay it!");
    setIsPlaying(false);
    setUserSequence([]);
    setPlaybackIndex(-1);
    setIsSuccess(false);
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

      {/* Game Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white dark:bg-[#2D1B4B]/40 rounded-2xl p-6 shadow-lg backdrop-blur-sm border border-purple-200 dark:border-purple-700/30 w-full max-w-md"
      >
        {/* Musical Visualization */}
        <div className="mb-8 flex gap-2 justify-center">
          {targetSequence.map((note, index) => (
            <motion.div
              key={index}
              className={`w-12 h-32 rounded-b-lg relative ${
                playbackIndex === index 
                  ? 'bg-purple-500' 
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
              animate={{
                scale: playbackIndex === index ? 1.1 : 1,
                backgroundColor: playbackIndex === index ? '#8B5CF6' : '#D1D5DB'
              }}
            >
              {playbackIndex === index && (
                <motion.div
                  className="absolute bottom-0 w-full"
                  animate={{ height: ['0%', '100%', '0%'] }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Control Button */}
        <div className="flex justify-center mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={playSequence}
            disabled={isPlaying}
            className={`px-6 py-3 rounded-lg bg-purple-600 text-white flex items-center gap-2 ${
              isPlaying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
            }`}
          >
            <Volume2 className="w-5 h-5" />
            Listen Again
          </motion.button>
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
            <Music className="w-5 h-5 text-purple-900" />
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
                    <span className="font-bold text-purple-700 dark:text-purple-300">/play</span>{" "}
                    <span className="text-blue-600 dark:text-blue-300">[notes]</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Play a sequence of musical notes (e.g., /play D A B)</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/listen</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Listen to the original musical sequence again</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/reset</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Reset the level to its initial state</p>
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
                  <li>Listen to the musical sequence carefully</li>
                  <li>Use /play command to replay the sequence you remember</li>
                  <li>Notes are: A, B, C, D, E, F, G</li>
                  <li>Enter notes in the exact order you heard them</li>
                </ul>
                
                <h3 className="text-xl font-bold mt-4 mb-2 text-purple-800 dark:text-[#F9DC34]">Hint:</h3>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  Pay close attention to the sequence. You might want to write down the notes as you hear them! you can play one note at a time (/play C)
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

export default Level6;