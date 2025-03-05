import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Gamepad2 } from "lucide-react";
import { useToast } from "../ui/use-toast";

const BOARD_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE_SPEED = 200; // milliseconds
const SUCCESS_SCORE = 60; // Score to trigger success

const CommandSnake = ({ levelNumber, onComplete, nextLevelNumber }) => {
  // Game state
  const [snake, setSnake] = useState([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState('RIGHT');
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Input and UI state
  const [inputValue, setInputValue] = useState("");
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [message, setMessage] = useState("Welcome to Command Snake!");

  // Refs and hooks
  const gameLoopRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Generate food position
  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE)
      };
    } while (snake.some(segment => 
      segment.x === newFood.x && segment.y === newFood.y
    ));
    return newFood;
  }, [snake]);

  // Initialize game
  const initializeGame = useCallback(() => {
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ]);
    setFood(generateFood());
    setDirection('RIGHT');
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setIsSuccess(false);
  }, [generateFood]);

  // Move snake
  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused || isSuccess) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      // Move head based on direction
      switch (direction) {
        case 'UP':
          head.y = (head.y - 1 + BOARD_SIZE) % BOARD_SIZE;
          break;
        case 'DOWN':
          head.y = (head.y + 1) % BOARD_SIZE;
          break;
        case 'LEFT':
          head.x = (head.x - 1 + BOARD_SIZE) % BOARD_SIZE;
          break;
        case 'RIGHT':
          head.x = (head.x + 1) % BOARD_SIZE;
          break;
      }

      // Check self-collision
      if (newSnake.slice(1).some(segment => 
        segment.x === head.x && segment.y === head.y
      )) {
        setIsGameOver(true);
        return prevSnake;
      }

      // Unshift new head
      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        // Grow snake and generate new food
        setFood(generateFood());
        const newScore = score + 10;
        setScore(newScore);

        // Check for success condition
        if (newScore >= SUCCESS_SCORE) {
          setIsSuccess(true);
          onComplete && onComplete();
        }
      } else {
        // Remove tail if no food eaten
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, generateFood, isGameOver, isPaused, isSuccess, score, onComplete]);

  // Game loop
  useEffect(() => {
    if (isGameOver || isPaused || isSuccess) return;

    gameLoopRef.current = setInterval(moveSnake, INITIAL_SNAKE_SPEED);
    return () => clearInterval(gameLoopRef.current);
  }, [moveSnake, isGameOver, isPaused, isSuccess]);

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
    if (isGameOver || isSuccess) {
      initializeGame();
      return;
    }

    const upCommand = inputValue.match(/^\/up$/i);
    const downCommand = inputValue.match(/^\/down$/i);
    const leftCommand = inputValue.match(/^\/left$/i);
    const rightCommand = inputValue.match(/^\/right$/i);
    const pauseCommand = inputValue.match(/^\/pause$/i);
    const resetCommand = inputValue.match(/^\/reset$/i);
    const helpCommand = inputValue.match(/^\/help$/i);
    const themeCommand = inputValue.match(/^\/theme\s+(dark|light)$/i);

    // Prevent 180-degree turns
    const isOppositeDirection = (newDir) => {
      const oppositeMap = {
        'UP': 'DOWN',
        'DOWN': 'UP',
        'LEFT': 'RIGHT',
        'RIGHT': 'LEFT'
      };
      return direction === oppositeMap[newDir];
    };

    if (upCommand && !isOppositeDirection('UP')) {
      setDirection('UP');
    } else if (downCommand && !isOppositeDirection('DOWN')) {
      setDirection('DOWN');
    } else if (leftCommand && !isOppositeDirection('LEFT')) {
      setDirection('LEFT');
    } else if (rightCommand && !isOppositeDirection('RIGHT')) {
      setDirection('RIGHT');
    } else if (pauseCommand) {
      setIsPaused(prev => !prev);
    } else if (resetCommand) {
      initializeGame();
    } else if (helpCommand) {
      setHelpModalOpen(true);
    } else if (themeCommand) {
      const newTheme = themeCommand[1];
      setTheme(newTheme);
    } else {
      toast({
        title: "Unknown Command",
        description: "Type /help for available commands",
        variant: "destructive",
      });
    }

    setInputValue("");
  };

  // Render game board
  const renderBoard = () => {
    const board = Array(BOARD_SIZE).fill().map(() => 
      Array(BOARD_SIZE).fill(0)
    );

    // Mark snake segments
    snake.forEach((segment, index) => {
      board[segment.y][segment.x] = index === 0 ? 2 : 1; // Head is different
    });

    // Mark food
    board[food.y][food.x] = 3;

    return board.map((row, rowIndex) => (
      <div key={rowIndex} className="flex">
        {row.map((cell, cellIndex) => {
          let cellClass = "w-4 h-4 sm:w-5 sm:h-5 border border-gray-200";
          switch(cell) {
            case 1: // Snake body
              cellClass += " bg-green-600";
              break;
            case 2: // Snake head
              cellClass += " bg-green-800";
              break;
            case 3: // Food
              cellClass += " bg-red-500";
              break;
            default:
              cellClass += " bg-gray-100 dark:bg-gray-800";
          }
          return (
            <div 
              key={cellIndex} 
              className={cellClass}
            />
          );
        })}
      </div>
    ));
  };

  return (
    <div className="flex flex-col items-center mt-4 sm:mt-8 max-w-4xl mx-auto px-4">
      {/* Game Header */}
      <motion.h1 
        className="px-4 sm:px-6 py-2 sm:py-3 text-xl sm:text-2xl font-bold text-[#2D1B4B] dark:text-[#1A0F2E] bg-gradient-to-r from-[#F9DC34] to-[#F5A623] rounded-full shadow-lg"
      >
        Level 14
      </motion.h1>

      <motion.h1 
        className="px-4 sm:px-6 py-2 sm:py-3 text-xl sm:text-2xl font-bold text-black dark:text-white rounded-full shadow-lg"
      >
        Have Fun! Score 60
      </motion.h1>

      {/* Game Status */}
      <div className="flex items-center justify-between w-full max-w-md mt-2 sm:mt-4">
        <span className="text-base sm:text-lg font-semibold">
          Score: {score}
        </span>
        {isPaused && (
          <span className="text-yellow-600 font-bold text-sm sm:text-base">
            PAUSED
          </span>
        )}
        {isGameOver && (
          <span className="text-red-600 font-bold text-sm sm:text-base">
            GAME OVER
          </span>
        )}
        {isSuccess && (
          <span className="text-green-600 font-bold text-sm sm:text-base">
            SUCCESS!
          </span>
        )}
      </div>

      {/* Game Board */}
      <div className="mt-2 sm:mt-4 border-4 border-purple-700 dark:border-purple-300 inline-block">
        {renderBoard()}
      </div>

       <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mx-10 my-6 text-center cursor-pointer text-purple-700 dark:text-purple-300 hover:text-[#F5A623] dark:hover:text-[#F9DC34] transition-colors"
              onClick={() => setHelpModalOpen(true)}
            >
              Type <span className="font-mono bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">/help</span> to get commands and hints
            </motion.span>

      {/* Input Area */}
      <motion.div 
        className="flex gap-2 w-full max-w-md mt-2 sm:mt-4"
      >
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter command..."
          className="border-purple-300 dark:border-purple-600/50"
        />
        <Button 
          onClick={handleCommandSubmit}
          className="bg-gradient-to-r from-[#F9DC34] to-[#F5A623]"
          size="icon"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Game Help Dialog */}
      <Dialog open={isHelpModalOpen} onOpenChange={setHelpModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Snake Commands</DialogTitle>
            <DialogDescription>
              Control the snake using these commands:
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div>/up - Move snake up</div>
              <div>/down - Move snake down</div>
              <div>/left - Move snake left</div>
              <div>/right - Move snake right</div>
              <div>/pause - Pause/unpause game</div>
              <div>/reset - Start new game</div>
              <div>/help - Show this menu</div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <strong>Rules:</strong>
              <ul className="list-disc pl-5">
                <li>Eat food to grow longer</li>
                <li>Avoid hitting yourself</li>
                <li>Wrap around screen edges</li>
                <li>Reach 60 points to win</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" onClick={() => setHelpModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommandSnake;