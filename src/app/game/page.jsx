"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { database } from "../../../firebase";
import { ref, onValue, set, off } from "firebase/database";
import {
  convertDotsToUnderscores,
  getIndianEpochTimeFromWorldTimeAPI,
  levelScore,
} from "@/lib/utils";
import { staticData } from "@/lib/staticdata";
import Level1 from "@/components/levels/L1";
import Level2 from "@/components/levels/L2";
import Level3 from "@/components/levels/L3";
import Level4 from "@/components/levels/L4";
import Level5 from "@/components/levels/L5";
import Level6 from "@/components/levels/L6";
import Level7 from "@/components/levels/L7";
import Level8 from "@/components/levels/L8";
import Level9 from "@/components/levels/L9";
import Level10 from "@/components/levels/L10";
import Level11 from "@/components/levels/L11";
import Level12 from "@/components/levels/L12";
import Level13 from "@/components/levels/L13";
import Level14 from "@/components/levels/L14";
import Level15 from "@/components/levels/L15";


const levels = [
  Level1,
  Level2,
  Level3,
  Level4,
  Level5,
  Level6,
  Level7,
  Level8,
  Level9,
  Level10,
  Level11,
  Level12,
  Level13,
  Level14,
  Level15,
];

const Game = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [userDet, setUserDet] = useState(null);
  const router = useRouter();

  const getUserId = () => {
    if (!session || !session.user) return null;
    return (
      session.user.id ||
      session.user.uid ||
      session.user.userId ||
      (session.user.email ? convertDotsToUnderscores(session.user.email) : null)
    );
  };

  const handleLevelComplete = async () => {
    setTransitioning(true);
    const userId = getUserId();
    if (userId) {
      await setScore(userId);
      setTimeout(() => {
        setTransitioning(false);
      }, 2000); // Simulate loading time
    }
  };

  const setScore = async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const userRef = ref(database, `/odysseyParticipants/${userId}`);
      const updatedScore = await levelScore(
        userDet?.CL || 0,
        userDet?.CS || 0,
        userDet?.S || 0
      );
      await set(userRef, { CL: (userDet?.CL || 0) + 1, CS: 0, S: updatedScore });
    } catch (error) {
      console.error("Error setting score:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      const userRef = ref(database, `/odysseyParticipants/${userId}`);
      onValue(userRef, (snapshot) => {
        setUserDet(snapshot.val() || { CL: 1, CS: 0, S: 0 });
      });
      return () => off(userRef);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") setLoading(false);
    else if (status !== "loading") router.push("/");
  }, [status]);

  if (loading || !userDet) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (userDet?.CL > staticData.maxLevel) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-purple-800">Well played</h2>
          <p className="text-purple-600">Come back soon for more levels!</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const CurrentLevel = levels[userDet?.CL - 1];

  return (
    <div className="w-screen">
      {transitioning ? (
        <div className="h-screen flex items-center justify-center text-2xl font-bold">
          Loading next level...
        </div>
      ) : (
        <CurrentLevel onComplete={handleLevelComplete} />
      )}
    </div>
  );
};

export default Game;
