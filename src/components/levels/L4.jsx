import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ArrowRight } from "lucide-react";
import { useToast } from "../ui/use-toast";

const Level4 = ({ levelNumber, onComplete, nextLevelNumber }) => {
  const [inputValue, setInputValue] = useState("");
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [message, setMessage] = useState("Use angles to hit all three targets!");
  const [showProtractor, setShowProtractor] = useState(false);
  const protractorTimerRef = useRef(null);
  const [gameState, setGameState] = useState({
    targets: [
      { x: 150, y: 60, hit: false, radius: 15 },
      { x: 50, y: 100, hit: false, radius: 15 },
      { x: 220, y: 150, hit: false, radius: 15 }
    ],
    shooterX: 140,
    shooterY: 220,
    projectiles: [],
    targetCount: 3,
    hitsRequired: 3
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [viewportSize, setViewportSize] = useState({
    width: 280,
    height: 240
  });
  
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    function handleResize() {
      const container = document.querySelector('.game-container');
      if (container) {
        let width = Math.min(400, container.clientWidth - 32);
        let height = Math.floor(width * 0.8);
        
        setViewportSize({
          width,
          height
        });
        
        const scaleX = width / 280;
        const scaleY = height / 240;
        
        setGameState(prevState => ({
          ...prevState,
          shooterX: 140 * scaleX,
          shooterY: 220 * scaleY,
          targets: [
            { x: 150 * scaleX, y: 60 * scaleY, hit: prevState.targets[0].hit, radius: 15 * scaleX },
            { x: 50 * scaleX, y: 100 * scaleY, hit: prevState.targets[1].hit, radius: 15 * scaleX },
            { x: 220 * scaleX, y: 150 * scaleY, hit: prevState.targets[2].hit, radius: 15 * scaleX }
          ]
        }));
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (showProtractor) {
      if (protractorTimerRef.current) {
        clearTimeout(protractorTimerRef.current);
      }
      
      protractorTimerRef.current = setTimeout(() => {
        setShowProtractor(false);
        toast({
          title: "Protractor Hidden",
          description: "Protractor automatically hidden after 5 seconds",
          variant: "default",
          className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg",
        });
      }, 5000);
    }
    
    return () => {
      if (protractorTimerRef.current) {
        clearTimeout(protractorTimerRef.current);
      }
    };
  }, [showProtractor, toast]);

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Level Completed!",
        description: "You've successfully hit all targets!",
        variant: "success",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
      });
      
      setTimeout(() => {
        onComplete(nextLevelNumber);
      }, 2000);
    }
  }, [isSuccess, nextLevelNumber, onComplete, toast]);

  const checkWinCondition = () => {
    const allTargetsHit = gameState.targets.every(target => target.hit);
    if (allTargetsHit) {
      setIsSuccess(true);
    }
  };

  const resetGame = () => {
    const scaleX = viewportSize.width / 280;
    const scaleY = viewportSize.height / 240;
    
    setGameState({
      targets: [
        { x: 150 * scaleX, y: 60 * scaleY, hit: false, radius: 15 * scaleX },
        { x: 50 * scaleX, y: 100 * scaleY, hit: false, radius: 15 * scaleX },
        { x: 220 * scaleX, y: 150 * scaleY, hit: false, radius: 15 * scaleX }
      ],
      shooterX: 140 * scaleX,
      shooterY: 220 * scaleY,
      projectiles: [],
      targetCount: 3,
      hitsRequired: 3
    });
    setMessage("Use angles to hit all three targets!");
    setShowProtractor(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCommandSubmit();
    }
  };

  const shootAtAngle = (angle) => {
    const radians = angle * (Math.PI / 180);
    const newProjectile = {
      startX: gameState.shooterX,
      startY: gameState.shooterY,
      angle: angle,
      path: calculateProjectilePath(gameState.shooterX, gameState.shooterY, radians)
    };
    
    const updatedTargets = [...gameState.targets];
    let hitCount = 0;
    
    newProjectile.path.forEach(point => {
      updatedTargets.forEach((target, index) => {
        if (!target.hit) {
          const distance = Math.sqrt(
            Math.pow(point.x - target.x, 2) + 
            Math.pow(point.y - target.y, 2)
          );
          
          if (distance <= target.radius) {
            updatedTargets[index].hit = true;
            hitCount++;
          }
        }
      });
    });
    
    setGameState(prevState => ({
      ...prevState,
      projectiles: [...prevState.projectiles, newProjectile],
      targets: updatedTargets
    }));
    
    if (hitCount > 0) {
      toast({
        title: "Target Hit!",
        description: `You hit ${hitCount} target${hitCount > 1 ? 's' : ''}!`,
        variant: "success",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white opacity-100 border-0 shadow-lg",
      });
      
      setTimeout(checkWinCondition, 100);
    } else {
      toast({
        title: "Missed All Targets!",
        description: "Level reset - try again with a different angle",
        variant: "destructive",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white opacity-100 shadow-lg",
      });
      
      setTimeout(() => {
        resetGame();
      }, 1500);
    }
  };

  const calculateProjectilePath = (startX, startY, angleRadians) => {
    const path = [];
    const velocity = viewportSize.width / 40; 
    const maxDistance = viewportSize.width * 2;
    let totalDistance = 0;
    let x = startX;
    let y = startY;
    
    while (totalDistance < maxDistance && x >= 0 && x <= viewportSize.width && y >= 0 && y <= viewportSize.height) {
      x += Math.cos(angleRadians) * velocity;
      y -= Math.sin(angleRadians) * velocity;
      path.push({ x, y });
      totalDistance += velocity;
    }
    
    return path;
  };

  const handleCommandSubmit = () => {
    const resetMatch = inputValue.match(/^\/reset$/i);
    const helpMatch = inputValue.match(/^\/help$/i);
    const themeMatch = inputValue.match(/^\/theme\s+(dark|light)$/i);
    const showScaleMatch = inputValue.match(/^\/show\s+scale$/i);
    const shootMatch = inputValue.match(/^\/shoot\s+(\-?\d+\.?\d*)$/i);
    
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
    } else if (showScaleMatch) {
      setShowProtractor(true);
      toast({
        title: "Protractor Shown",
        description: "Protractor will be visible for 5 seconds",
        variant: "default",
        className: "fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#2D1B4B] opacity-100 shadow-lg",
      });
    } else if (shootMatch) {
      const angle = parseFloat(shootMatch[1]);
      if (angle >= -180 && angle <= 180) {
        shootAtAngle(angle);
      } else {
        toast({
          title: "Invalid Angle",
          description: "Angle must be between -180 and 180 degrees",
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

  const drawProtractor = () => {
    const centerX = gameState.shooterX;
    const centerY = gameState.shooterY;
    const radius = viewportSize.width / 3;
    
    const protractorLines = [];
    for (let angle = 0; angle <= 180; angle += 10) {
      const radians = angle * (Math.PI / 180);
      const x2 = centerX + Math.cos(radians) * radius;
      const y2 = centerY - Math.sin(radians) * radius;
      
      protractorLines.push(
        <g key={`angle-${angle}`}>
          <line
            x1={centerX}
            y1={centerY}
            x2={x2}
            y2={y2}
            stroke={angle % 30 === 0 ? "#F5A623" : "#a855f7"}
            strokeWidth={angle % 30 === 0 ? 2 : 1}
            opacity={0.7}
          />
          {angle % 30 === 0 && (
            <text
              x={centerX + Math.cos(radians) * (radius + 15)}
              y={centerY - Math.sin(radians) * (radius + 15)}
              fill="#F5A623"
              fontSize={Math.max(10, viewportSize.width / 30)}
              textAnchor="middle"
            >
              {angle}°
            </text>
          )}
        </g>
      );
    }
    
    return (
      <g className="protractor">
        {protractorLines}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="transparent"
          stroke="#F5A623"
          strokeWidth="1"
          strokeDasharray="5,5"
          opacity="0.5"
        />
      </g>
    );
  };

  return (
    <div className="flex flex-col items-center mt-4 md:mt-8 max-w-4xl mx-auto px-2 md:px-4">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-4 md:px-6 py-2 md:py-3 text-xl md:text-2xl font-bold text-[#2D1B4B] dark:text-[#1A0F2E] bg-gradient-to-r from-[#F9DC34] to-[#F5A623] rounded-full shadow-lg"
      >
        Level 4
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-4 md:mt-8 text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center text-purple-900 dark:text-[#F9DC34] px-2"
      >
        {message}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="game-container bg-white dark:bg-[#2D1B4B]/40 rounded-2xl p-4 shadow-lg backdrop-blur-sm border border-purple-200 dark:border-purple-700/30 w-full max-w-md"
      >
        <div className="relative flex justify-center">
          <svg 
            width={viewportSize.width} 
            height={viewportSize.height} 
            viewBox={`0 0 ${viewportSize.width} ${viewportSize.height}`} 
            className="mx-auto"
          >
            {gameState.targets.map((target, index) => (
              <circle
                key={`target-${index}`}
                cx={target.x}
                cy={target.y}
                r={target.radius}
                fill={target.hit ? "#4ade80" : "#f87171"}
                stroke="#000"
                strokeWidth="2"
              />
            ))}
            
            {gameState.projectiles.map((projectile, pIndex) => (
              <g key={`projectile-${pIndex}`}>
                <path
                  d={`M ${projectile.path.map(p => `${p.x},${p.y}`).join(' L ')}`}
                  stroke="#F5A623"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.7"
                />
              </g>
            ))}
            
            {showProtractor && drawProtractor()}
            
            <circle
              cx={gameState.shooterX}
              cy={gameState.shooterY}
              r={viewportSize.width / 30}
              fill="#1d4ed8"
              stroke="#000"
              strokeWidth="2"
            />
          </svg>
        </div>
      </motion.div>
      
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mx-4 md:mx-10 my-3 md:my-6 text-center cursor-pointer text-purple-700 dark:text-purple-300 hover:text-[#F5A623] dark:hover:text-[#F9DC34] transition-colors text-sm md:text-base"
        onClick={() => setHelpModalOpen(true)}
      >
        Type <span className="font-mono bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">/help</span> to get commands and hints
      </motion.span>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex gap-2 w-full max-w-md px-2 md:px-0"
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
              <div className="p-4 md:p-6 overflow-y-auto flex-grow">
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-purple-800 dark:text-[#F9DC34]">Available Commands:</h2>
                <div className="space-y-1 mb-6">
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/reset</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm md:text-base">Reset the level to its initial state.</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/show scale</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm md:text-base">Show the protractor for 5 seconds.</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/shoot</span>{" "}
                    <span className="text-blue-600 dark:text-blue-300">[angle]</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm md:text-base">Shoot a projectile at the specified angle.</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/theme</span>{" "}
                    <span className="text-blue-600 dark:text-blue-300">[dark|light]</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm md:text-base">Change the theme to dark or light.</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-[#F5A623]">
                    <span className="font-bold text-purple-700 dark:text-purple-300">/help</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm md:text-base">Show this help menu.</p>
                  </div>
                </div>
                
                
                
                <h3 className="text-lg md:text-xl font-bold mt-4 mb-2 text-purple-800 dark:text-[#F9DC34]">Hint:</h3>
                <p className="text-gray-600 dark:text-gray-300 italic text-sm md:text-base">
                  The angle 0° points to the right, 90° points straight up, and 180° points to the left.
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/30 px-4 md:px-6 py-3 md:py-4 text-center">
                <button
                  onClick={() => setHelpModalOpen(false)}
                  className="bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] px-4 md:px-6 py-2 rounded-lg text-purple-900 font-medium shadow-md transition-transform hover:scale-105 text-sm md:text-base"
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

export default Level4;
