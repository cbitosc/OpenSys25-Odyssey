"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

// Create a reusable loading component with the new theme
const LoadingScreen = () => (
  <div className="flex items-center justify-center w-full h-screen bg-gradient-to-b from-[#2D1B4B] to-[#1A0F2E]">
    <div className="backdrop-blur-md bg-white/5 rounded-xl p-8 shadow-lg border border-purple-300/20 flex flex-col items-center">
      <div className="w-16 h-16 rounded-full border-4 border-t-[#F9DC34] border-purple-700 animate-spin mb-6"></div>
      <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#F9DC34] to-[#F5A623] animate-pulse">
        Loading...
      </h2>
    </div>
  </div>
);

const DynamicHome = dynamic(() => import("@/components/Home"), {
  loading: () => <LoadingScreen />
});

const DynamicLogin = dynamic(() => import("@/components/Login"), {
  loading: () => <LoadingScreen />
});

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#2D1B4B] to-[#1A0F2E] overflow-hidden relative">
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

      {status === "loading" ? (
        <LoadingScreen />
      ) : session ? (
        <Suspense fallback={<LoadingScreen />}>
          <DynamicHome />
        </Suspense>
      ) : (
        <Suspense fallback={<LoadingScreen />}>
          <DynamicLogin />
        </Suspense>
      )}
    </main>
  );
}