import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useToast } from "../ui/use-toast";

const CipherPuzzleLevel = ({ levelNumber, onComplete, nextLevelNumber }) => {
  const [inputValue, setInputValue] = useState("");
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [currentWord, setCurrentWord] = useState("14 13 4 11 18 22 18");
  const [message, setMessage] = useState("Transform the numbers to spell 'OpenSys'");
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const letterToNumber = (letter) => {
    return letter.toUpperCase().charCodeAt(0) - 64;
  };

  const numberToLetter = (num) => {
    return num >= 1 && num <= 26 
      ? String.fromCharCode(num + 64) 
      : num.toString();
  };

  const isNumeric = (value) => {
    return value.split(' ').every(item => !isNaN(parseInt(item)));
  };

  const isAlphabetic = (value) => {
    return value.split(' ').every(item => isNaN(parseInt(item)));
  };

  const cipherCommands = {
    '@': (word) => {
      if (!isNumeric(word)) {
        throw new Error("Numeric cipher can only be applied to numbers");
      }
      return word.split(' ').map(item => {
        const num = parseInt(item);
        return numberToLetter(num);
      }).join(' ');
    },
    '$': (word) => {
      if (isNumeric(word)) {
        return word.split(' ').map((item, index) => {
          const num = parseInt(item);
          const transformed = index % 2 === 0 ? (num - 1) : (num + 1);
          return numberToLetter(transformed);
        }).join(' ');
      } else if (isAlphabetic(word)) {
        return word.split(' ').map((item, index) => {
          const num = letterToNumber(item);
          const transformed = index % 2 === 0 ? (num - 1) : (num + 1);
          return numberToLetter(transformed);
        }).join(' ');
      } else {
        throw new Error("Alternating cipher requires consistent input type");
      }
    },
    '#': (word) => {
      if (isNumeric(word)) {
        return word.split(' ').map(item => {
          const num = parseInt(item);
          const transformed = num + 2;
          return numberToLetter(transformed);
        }).join(' ');
      } else if (isAlphabetic(word)) {
        return word.split(' ').map(item => {
          const num = letterToNumber(item);
          const transformed = num + 2;
          return numberToLetter(transformed);
        }).join(' ');
      } else {
        throw new Error("Add 2 cipher requires consistent input type");
      }
    },
    '%': (word) => {
      return word.split(' ').reverse().join(' ');
    },
    '&': (word) => {
      return word.split(' ').sort((a, b) => {
        const convertToSortValue = (item) => {
          const num = parseInt(item);
          return !isNaN(num) ? num : letterToNumber(item);
        };
        return convertToSortValue(a) - convertToSortValue(b);
      }).join(' ');
    }
  };

  useEffect(() => {
    if (currentWord === "O P E N S Y S") {
      setIsSuccess(true);
      toast({
        title: "Level Completed!",
        description: "You've successfully transformed the code!",
        variant: "success",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
      });
      
      setTimeout(() => {
        onComplete(nextLevelNumber);
      }, 2000);
    }
  }, [currentWord, nextLevelNumber, onComplete, toast]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCommandSubmit();
    }
  };

  const handleCommandSubmit = () => {
    const cipherMatch = inputValue.match(/^\/cipher\s*([%@#$&])\s*(\w*)$/i);
    const resetMatch = inputValue.match(/^\/reset$/i);
    const helpMatch = inputValue.match(/^\/help$/i);
    const themeMatch = inputValue.match(/^\/theme\s+(dark|light)$/i);
    
    if (cipherMatch) {
      const [, command, param] = cipherMatch;
      if (cipherCommands[command]) {
        try {
          const newWord = cipherCommands[command](currentWord);
          setCurrentWord(newWord);
          
          toast({
            title: "Cipher Applied",
            description: `Applied /cipher ${command} command`,
            variant: "default",
            className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg",
          });
        } catch (error) {
          toast({
            title: "Cipher Error",
            description: error.message,
            variant: "destructive",
            className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
          });
        }
      }
    } else if (resetMatch) {
      setCurrentWord("14 13 4 11 18 22 18");
      toast({
        title: "Level Reset",
        description: "Restored initial number sequence",
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
        Level 13
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
        <div className="min-h-48 flex flex-col items-center justify-center space-y-4">
          <div className="text-center text-purple-700 dark:text-purple-300">
            <span className="font-mono text-xl">Current Sequence:</span>
            <p className="mt-2 text-2xl font-bold">{currentWord}</p>
          </div>
          <div className="text-center text-purple-700 dark:text-purple-300">
            <span className="font-mono text-xl">Target:</span>
            <p className="mt-2 text-2xl font-bold">OpenSys</p>
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
          placeholder="Enter cipher command..."
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
                    <span className="font-bold text-purple-700 dark:text-purple-300">/cipher @</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Convert numbers to letters (A=1, B=2, etc.)</p>
                  </div>
                  
                  
                  
                  
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/cipher %</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Reverse the order of numbers</p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/cipher #</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Add 2 to all numbers</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/cipher &</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Sort numbers in ascending order</p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/cipher $</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Alternating +1 and -1 transformation</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/reset</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Reset to the initial number sequence</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mt-4 mb-2 text-purple-800 dark:text-[#F9DC34]">Hint:</h3>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  The solution involves multiple steps
                  Use other commands to manipulate the sequence
                  Experiment with combining commands in different orders
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

export default CipherPuzzleLevel;