"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { database } from "../../firebase";
import { off, onValue, ref, set } from "firebase/database";
import { convertDotsToUnderscores } from "@/lib/utils";
import { staticData } from "@/lib/staticdata";
import { motion } from "framer-motion";

const Home = () => {
  const { data: session } = useSession();
  const [userDet, setUserDet] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const getUserId = () => {
    if (!session || !session.user) return null;
    
    const userId = 
      session.user.id || 
      session.user.uid || 
      session.user.userId || 
      (session.user.email ? convertDotsToUnderscores(session.user.email) : null);
    
    if (!userId) {
      console.error("Could not determine user ID from session:", session.user);
      return null;
    }
    
    return userId;
  };
  
  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      const dbPath = `/odysseyParticipants/${userId}`;
      
      const userRef = ref(database, dbPath);
      onValue(userRef, (snapshot) => {
        setLoading(false);
        const userVal = snapshot.val();
        if (userVal) {
          setUserDet(userVal);
        } else {
          console.log("No user data found, creating default entry");
          // Initialize the user data if it doesn't exist
          set(userRef, { CL: 1, CS: 0, S: 0 }).then(() => {
            setUserDet({ CL: 1, CS: 0, S: 0 });
            console.log("Default user data created");
          }).catch(error => {
            console.error("Error creating default user data:", error);
          });
        }
      }, (error) => {
        setLoading(false);
        console.error("Firebase onValue error:", error);
      });
      
      return () => {
        off(userRef);
      };
    } else {
      setLoading(false);
      console.log("No session or user, cannot fetch userDet");
    }
  }, [session]);
  
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#2D1B4B] to-[#1A0F2E] overflow-hidden relative">

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-full h-full opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M0,25 C20,10 50,40 80,5 L100,25 L100,100 L0,100 Z"
              fill="rgba(237, 139, 255, 0.4)"
            />
            <path
              d="M0,50 C30,35 70,65 100,40 L100,100 L0,100 Z"
              fill="rgba(138, 43, 226, 0.3)"
            />
          </svg>
        </div>
      </div>
      
      <div className="z-10 w-full max-w-md px-6 py-12 flex flex-col items-center">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Image
            src="/DarkVertical.png"
            alt="logo"
            width={300}
            height={300}
            className="drop-shadow-lg"
          />
        </motion.div>
        
        {loading ? (
          <div className="flex justify-center items-center mt-8">
            <div className="w-12 h-12 rounded-full border-4 border-t-[#F9DC34] border-purple-700 animate-spin"></div>
          </div>
        ) : session ? (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full flex flex-col items-center"
          >
            <div className="backdrop-blur-md bg-white/5 rounded-xl p-6 shadow-lg border border-purple-300/20 w-full">
              {userDet?.CL <= staticData.maxLevel ? (
                <Link href="/game" className="w-full flex justify-center">
                  <Button 
                    className="w-full py-6 text-xl font-bold bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] text-purple-900 rounded-lg shadow-lg transform transition-transform hover:scale-105"
                  >
                    Play Level {userDet?.CL || 1}
                  </Button>
                </Link>
              ) : (
                <div className="text-center py-6 text-xl font-semibold text-[#F9DC34]">
                  {userDet?.CL > 16 ? (
                    <span>Congratulations on completing The Odyssey!</span>
                  ) : (
                    <span>The Odyssey unfolds at 11:30 AM</span>
                  )}
                </div>
              )}
              
              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center p-3 bg-purple-900/40 rounded-lg">
                  <span className="text-purple-100">Levels completed</span>
                  <span className="text-[#F9DC34] font-bold text-xl">{(userDet?.CL || 1) - 1}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-900/40 rounded-lg">
                  <span className="text-purple-100">Levels available</span>
                  <span className="text-[#F9DC34] font-bold text-xl">{staticData.maxLevel}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-900/40 rounded-lg">
                  <span className="text-purple-100">Score</span>
                  <span className="text-[#F9DC34] font-bold text-xl">{Math.floor(parseFloat(userDet?.S || 0))}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="backdrop-blur-md bg-white/5 rounded-xl p-6 shadow-lg border border-purple-300/20 w-full text-center"
          >
            <div className="inline-block mb-4 w-12 h-12 rounded-full border-4 border-t-[#F9DC34] border-purple-700 animate-spin"></div>
            <p className="text-purple-100 text-lg">Connecting to The Odyssey...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Home;