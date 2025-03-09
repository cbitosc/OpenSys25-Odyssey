import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ArrowRight, Book, RotateCcw } from "lucide-react";
import { useToast } from "../ui/use-toast";

const Level7 = ({ onComplete }) => {
  const startWord = "COLD";
  const targetWord = "WARM";
  const nextLevelNumber = 8;
  
  const [inputValue, setInputValue] = useState("");
  const [currentWord, setCurrentWord] = useState(startWord);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [message, setMessage] = useState("Transform COLD into WARM, one letter at a time!");
  const [moveHistory, setMoveHistory] = useState([startWord]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [dictionary] = useState(new Set([
    "ABLE", "ACID", "AGED", "ALSO", "AREA", "ARMY", "AWAY", "BABY", "BACK", "BALD", "BALL",
    "BAND", "BANK", "BASE", "BATH", "BEAR", "BEAT", "BEEN", "BEER", "BELL", "BELT",
    "BEND", "BENT", "BEST", "BILL", "BIRD", "BLOW", "BLUE", "BOAT", "BODY", "BOLD", "BOND",
    "BONE", "BOOK", "BOOM", "BORN", "BOSS", "BOTH", "BOWL", "BULK", "BURN", "BUSH", "BALM",
    "BUSY", "CALL", "CALM", "CAME", "CAMP", "CARD", "CARE", "CASE", "CASH", "CAST",
    "CELL", "CHAT", "CHIP", "CITY", "CLUB", "COAL", "COAT", "CODE", "COLD", "COME",
    "COOK", "COOL", "COPE", "COPY", "CORD", "CORE", "COST", "CREW", "CROP", "CUTE", "DARK",
    "DATA", "DATE", "DAWN", "DAYS", "DEAD", "DEAL", "DEAN", "DEAR", "DEBT", "DEEP",
    "DENY", "DESK", "DIAL", "DICE", "DIET", "DISC", "DISK", "DOES", "DONE", "DOOR",
    "DOSE", "DOWN", "DRAW", "DREW", "DROP", "DRUG", "DUAL", "DUKE", "DUST", "DUTY",
    "EACH", "EARL", "EARN", "EASE", "EAST", "EASY", "EDGE", "ELSE", "EVEN", "EVER",
    "FACE", "FACT", "FAIL", "FAIR", "FALL", "FAME", "FARM", "FAST", "FATE", "FEAR",
    "FEED", "FEEL", "FEET", "FELL", "FELT", "FILE", "FILL", "FILM", "FIND", "FINE",
    "FIRE", "FIRM", "FISH", "FIVE", "FLAT", "FLOW", "FOOD", "FOOT", "FORM", "FORT",
    "FOUR", "FREE", "FROM", "FUEL", "FULL", "FUND", "GAIN", "GAME", "GATE", "GAVE",
    "GEAR", "GENE", "GIFT", "GIRL", "GIVE", "GLAD", "GOAL", "GOES", "GOLD", "GOLF",
    "GONE", "GOOD", "GRAY", "GREW", "GREY", "GROW", "GULF", "HAIR", "HALF", "HALL",
    "HAND", "HANG", "HARD", "HARM", "HATE", "HAVE", "HEAD", "HEAR", "HEAT", "HELD",
    "HELL", "HELP", "HERE", "HERO", "HIGH", "HILL", "HIRE", "HOLD", "HOLE", "HOME",
    "HOPE", "HOST", "HOUR", "HUGE", "HUNG", "HUNT", "HURT", "IDEA", "IDLE", "INCH",
    "INTO", "IRON", "ITEM", "JACK", "JANE", "JEAN", "JOHN", "JOIN", "JUMP", "JURY",
    "JUST", "KEEN", "KEEP", "KENT", "KEpt", "KICK", "KIND", "KING", "KIRK", "KNEE",
    "KNEW", "KNOW", "LACK", "LADY", "LAID", "LAKE", "LAND", "LANE", "LAST", "LATE",
    "LEAD", "LEFT", "LESS", "LIFE", "LIFT", "LIKE", "LINE", "LINK", "LIST", "LIVE",
    "LOAD", "LOAN", "LOCK", "LONG", "LOOK", "LORD", "LOSE", "LOSS", "LOST", "LOVE",
    "LUCK", "MADE", "MAIL", "MAIN", "MAKE", "MALE", "MANY", "MARE", "MARK", "MASS",
    "MATT", "MEAL", "MEAN", "MEAT", "MEET", "MENU", "MILE", "MILK", "MIND", "MINE",
    "MISS", "MODE", "MOOD", "MOON", "MORE", "MOST", "MOVE", "MUCH", "MUST", "NAME",
    "NEAR", "NECK", "NEED", "NEWS", "NEXT", "NICE", "NINE", "NONE", "NOSE", "NOTE",
    "OKAY", "ONCE", "ONLY", "OPEN", "ORAL", "OVER", "PACK", "PAGE", "PAID", "PAIN",
    "PAIR", "PALE", "PALM", "PARK", "PART", "PASS", "PAST", "PATH", "PEAK", "PEAR",
    "PEEL", "PEEP", "PEER", "PICK", "PILE", "PILL", "PINE", "PINK", "PIPE", "PLAN",
    "PLAY", "PLOT", "PLUG", "PLUS", "POLL", "POOL", "POOR", "PORT", "POST", "POUR",
    "PRAY", "PULL", "PURE", "PUSH", "RACE", "RAIL", "RAIN", "RANK", "RARE", "RATE",
    "READ", "REAL", "REAR", "RELY", "RENT", "REST", "RICE", "RICH", "RIDE", "RING",
    "RIPE", "RISE", "RISK", "ROAD", "ROCK", "ROLE", "ROLL", "ROOF", "ROOM", "ROOT",
    "ROPE", "ROSE", "RULE", "RUSH", "SAFE", "SAID", "SAIL", "SALE", "SALT", "SAME",
    "SAND", "SAVE", "SEAT", "SEED", "SEEK", "SEEM", "SELL", "SEND", "SENT", "SHIP",
    "SHOE", "SHOP", "SHOT", "SHOW", "SHUT", "SICK", "SIDE", "SIGN", "SING", "SINK",
    "SITE", "SIZE", "SKIN", "SLIP", "SLOW", "SNOW", "SOAP", "SOFT", "SOIL", "SOLD",
    "SOLE", "SOME", "SONG", "SOON", "SORE", "SORT", "SOUL", "SOUP", "SPOT", "STAR",
    "STAY", "STEP", "STOP", "SUCH", "SUIT", "SURE", "TAKE", "TALE", "TALK", "TALL",
    "TANK", "TAPE", "TASK", "TEAM", "TEAR", "TELL", "TEND", "TERM", "TEST", "THAN",
    "THAT", "THEM", "THEN", "THEY", "THIN", "THIS", "THOU", "THUS", "TIDE", "TIDY",
    "TILE", "TILL", "TIME", "TINY", "TIPS", "TIRE", "TOIL", "TOLL", "TONE", "TOOK",
    "TOOL", "TOUR", "TOWN", "TRAP", "TRAY", "TREE", "TRIP", "TRUE", "TUBE", "TUNE",
    "TURN", "TWIN", "TYPE", "UNIT", "UPON", "USED", "USER", "VAST", "VERY", "VICE",
    "VIEW", "VOTE", "WAGE", "WAIT", "WAKE", "WALK", "WALL", "WANT", "WARD", "WARM",
    "WASH", "WAVE", "WAYS", "WEAK", "WEAR", "WEEK", "WELL", "WENT", "WERE", "WEST",
    "WHAT", "WHEN", "WHOM", "WIDE", "WIFE", "WILD", "WILL", "WIND", "WINE", "WING",
    "WIRE", "WISH", "WITH", "WOLF", "WOOD", "WORD", "WORK", "WORM", "WORN", "WRAP",
    "YARD", "YARN", "YEAR", "YELL", "YOGA", "YOUR", "ZERO", "ZONE"
  ]));

  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const isValidWord = (word) => {
    return dictionary.has(word.toUpperCase());
  };

  const isDifferentByOneLetter = (word1, word2) => {
    if (word1.length !== word2.length) return false;
    let differences = 0;
    for (let i = 0; i < word1.length; i++) {
      if (word1[i] !== word2[i]) differences++;
    }
    return differences === 1;
  };

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Level Completed!",
        description: "You've successfully transformed COLD into WARM!",
        variant: "success",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
      });
      
      setTimeout(() => {
        onComplete(nextLevelNumber);
      }, 2000);
    }
  }, [isSuccess, nextLevelNumber, onComplete, toast]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCommandSubmit();
    }
  };

  const resetGame = () => {
    setCurrentWord(startWord);
    setMoveHistory([startWord]);
    setMessage("Transform COLD into WARM, one letter at a time!");
    setIsSuccess(false);
  };

  const handleCommandSubmit = () => {
    const changeMatch = inputValue.match(/^\/change\s+(\d+)\s+([a-zA-Z])$/i);
    const resetMatch = inputValue.match(/^\/reset$/i);
    const helpMatch = inputValue.match(/^\/help$/i);
    const undoMatch = inputValue.match(/^\/undo$/i);
    const themeMatch = inputValue.match(/^\/theme\s+(dark|light)$/i);

    if (changeMatch) {
      const position = parseInt(changeMatch[1]) - 1;
      const newLetter = changeMatch[2].toUpperCase();
      
      if (position < 0 || position >= currentWord.length) {
        toast({
          title: "Invalid Position",
          description: "Use numbers 1-4 to specify the letter position.",
          variant: "destructive",
          className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
        });
        return;
      }

      const newWord = currentWord.split('');
      newWord[position] = newLetter;
      const newWordStr = newWord.join('');

      if (!isDifferentByOneLetter(currentWord, newWordStr)) {
        toast({
          title: "Invalid Change",
          description: "You can only change one letter at a time!",
          variant: "destructive",
          className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
        });
      } else if (!isValidWord(newWordStr)) {
        toast({
          title: "Invalid Word",
          description: "That's not a valid word in our dictionary!",
          variant: "destructive",
          className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
        });
      } else {
        setCurrentWord(newWordStr);
        setMoveHistory([...moveHistory, newWordStr]);
        
        if (newWordStr === targetWord) {
          setMessage("Congratulations! You've solved the puzzle! 🎉");
          setIsSuccess(true);
        } else {
          setMessage(`Changed to ${newWordStr}. Keep going!`);
          toast({
            title: "Word Changed",
            description: `Successfully changed to ${newWordStr}`,
            variant: "default",
            className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg",
          });
        }
      }
    } else if (resetMatch) {
      resetGame();
      toast({
        title: "Level Reset",
        description: "The game has been reset to its initial state",
        variant: "default",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg",
      });
    } else if (helpMatch) {
      setHelpModalOpen(true);
    } else if (undoMatch && moveHistory.length > 1) {
      const newHistory = moveHistory.slice(0, -1);
      setMoveHistory(newHistory);
      setCurrentWord(newHistory[newHistory.length - 1]);
      setMessage("Moved back one step.");
      toast({
        title: "Move Undone",
        description: "Successfully went back one step",
        variant: "default",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg",
      });
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
        Level 7
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
        <div className="min-h-48 flex flex-col items-center justify-center gap-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="text-lg font-bold text-purple-400 dark:text-purple-500">
              {startWord}
            </div>
            <div className="text-xl">
              →
            </div>
            <motion.div 
              className="text-2xl font-bold text-purple-600 dark:text-[#F9DC34]"
              animate={{ scale: currentWord === targetWord ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.5 }}
            >
              {currentWord}
            </motion.div>
            <div className="text-xl">
              →
            </div>
            <div className="text-lg font-bold text-purple-400 dark:text-purple-500">
              {targetWord}
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            {currentWord.split('').map((letter, index) => (
              <motion.div
                key={index}
                className="w-12 h-12 flex items-center justify-center rounded-lg shadow-md text-xl font-bold"
                style={{
                  backgroundColor: letter === targetWord[index] 
                    ? theme === 'dark' ? '#C4B5FD' : '#DDD6FE' 
                    : theme === 'dark' ? '#1A0F2E' : '#FFFFFF'
                }}
                animate={{ 
                  backgroundColor: letter === targetWord[index] 
                    ? theme === 'dark' ? '#C4B5FD' : '#DDD6FE' 
                    : theme === 'dark' ? '#1A0F2E' : '#FFFFFF',
                  color: letter === targetWord[index] 
                    ? '#4C1D95' 
                    : theme === 'dark' ? '#FFFFFF' : '#1F2937'
                }}
              >
                {letter}
              </motion.div>
            ))}
          </div>

          <div className="mt-4 text-sm text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <div className="font-semibold mb-1">Path:</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {moveHistory.map((word, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-gray-400">→</span>}
                  <span className="font-mono">{word}</span>
                </React.Fragment>
              ))}
            </div>
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
                    <span className="font-bold text-purple-700 dark:text-purple-300">/change</span>{" "}
                    <span className="text-blue-600 dark:text-blue-300">[position] [letter]</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Change a letter at the given position (1-4).</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/undo</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Go back one move.</p>
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
                  <li>Objective: Transform the word "COLD" into "WARM" one letter at a time.</li>
                  <li>Each new word must be a valid 4-letter word in the dictionary.</li>
                  <li>You can only change one letter at a time.</li>
                  <li>Use the <span className="font-mono bg-purple-50 dark:bg-purple-900/30 px-1">/change</span> command to modify letters.</li>
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

export default Level7;