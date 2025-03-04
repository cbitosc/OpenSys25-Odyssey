import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "../ui/input";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useToast } from "../ui/use-toast";

const Level2 = ({ onComplete }) => {
  const [ballColor, setBallColor] = useState("#CCCCCC");
  const [inputValue, setInputValue] = useState("");
  const { theme, setTheme } = useTheme();
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [colorHistory, setColorHistory] = useState([]);
  const { toast } = useToast();

  const colorPalette = {
    red: "#FF0000",
    yellow: "#FFFF00",
    blue: "#0000FF",
  };

  const blendColors = (color1, color2) => {
    if ((color1 === "red" && color2 === "yellow") || (color1 === "yellow" && color2 === "red")) {
      return "#FFA500"; 
    } else if ((color1 === "red" && color2 === "blue") || (color1 === "blue" && color2 === "red")) {
      return "#800080"; 
    } else if ((color1 === "blue" && color2 === "yellow") || (color1 === "yellow" && color2 === "blue")) {
      return "#008000"; 
    } else {
      return ballColor;
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Success!",
        description: "You've successfully created orange!",
        variant: "success",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
      });
      
      setTimeout(() => {
        onComplete(4);
      }, 2000);
    }
  }, [isSuccess, onComplete, toast]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleCommandSubmit();
    }
  };

  const handleCommandSubmit = () => {
    const blendMatch = inputValue.match(/^\/blend\s+(\w+)\s+(\w+)$/i);
    const resetMatch = inputValue.match(/^\/reset$/i);
    const themeMatch = inputValue.match(/^\/theme\s+(dark|light)$/i);
    const helpMatch = inputValue.match(/^\/help$/i);

    if (blendMatch) {
      const color1 = blendMatch[1].toLowerCase();
      const color2 = blendMatch[2].toLowerCase();

      if (colorPalette[color1] && colorPalette[color2]) {
        const newColor = blendColors(color1, color2);
        setBallColor(newColor);
        setColorHistory([...colorHistory, { colors: [color1, color2], result: newColor }]);
        
        if (newColor === "#FFA500") { 
          setIsSuccess(true);
        } else {
          toast({
            title: "Color Blended",
            description: `You blended ${color1} and ${color2}, but that's not orange. Try again!`,
            variant: "default",
            className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg", 
          });
        }
      } else {
        toast({
          title: "Invalid Colors",
          description: "One or both colors are not in your palette. Try using Red, Yellow, or Blue.",
          variant: "destructive",
          className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg", 
        });
      }
      setInputValue("");
    } else if (resetMatch) {
      setBallColor("#CCCCCC");
      setInputValue("");
      toast({
        title: "Ball Reset",
        description: "The ball has been reset to its original color.",
        variant: "default",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg", 
      });
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
      setInputValue("");
      toast({
        title: "Unknown Command",
        description: "Type /help to see available commands",
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
        Level 2
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8 text-xl font-semibold mb-4 text-center text-purple-900 dark:text-[#F9DC34]"
      >
        You need to turn this ball into the color Orange. Use the colors available in your palette.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white dark:bg-[#2D1B4B]/40 rounded-2xl p-8 shadow-lg backdrop-blur-sm border border-purple-200 dark:border-purple-700/30"
      >
        <div 
          className="w-64 h-64 rounded-full mx-auto transition-all duration-700 ease-in-out"
          style={{ backgroundColor: ballColor, boxShadow: `0 0 30px ${ballColor}80` }}
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex justify-center gap-4 mt-6"
      >
        {Object.entries(colorPalette).map(([name, color]) => (
          <div 
            key={name}
            className="flex flex-col items-center"
          >
            <div 
              className="w-12 h-12 rounded-full border-2 border-purple-300 dark:border-purple-600 shadow-md cursor-pointer transition-transform hover:scale-110" 
              style={{ backgroundColor: color }}
              title={name.charAt(0).toUpperCase() + name.slice(1)}
            />
            <span className="mt-1 text-sm font-medium text-purple-800 dark:text-purple-300">
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </span>
          </div>
        ))}
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
            className="bg-white dark:bg-[#2D1B4B] rounded-xl overflow-hidden shadow-2xl max-w-md w-full mx-4"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-purple-800 dark:text-[#F9DC34]">Available Commands:</h2>
              <div className="space-y-1 mb-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">/blend</span>{" "}
                  <span className="text-blue-600 dark:text-blue-300">[color1] [color2]</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">Blend two colors together (Red, Yellow, Blue).</p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                  <span className="font-bold text-purple-700 dark:text-purple-300">/reset</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">Reset the ball to its original color.</p>
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
              
              <h3 className="text-xl font-bold mb-2 text-purple-800 dark:text-[#F9DC34]">Hint:</h3>
              <p className="text-gray-600 dark:text-gray-300 italic">
              Blend the fiery sun with the golden land,
              Together they make a shade so grand!
              </p>
              
              {colorHistory.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold mb-2 text-purple-800 dark:text-[#F9DC34]">Your Attempts:</h3>
                  <div className="space-y-1">
                    {colorHistory.slice(-3).map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colorPalette[entry.colors[0]] }} />
                        <span>+</span>
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colorPalette[entry.colors[1]] }} />
                        <span>=</span>
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.result }} />
                      </div>
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

export default Level2;