"use client";

import React from "react";
import Link from "next/link";
import Signout from "./Signout";
import { useSession } from "next-auth/react";

const Navbar = () => {
  const { data: session, status } = useSession();
  
  return (
    <div className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-[#2D1B4B]/90 to-[#3D2060]/90 border-b border-purple-400/20 shadow-lg px-4 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center">
        <span className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F9DC34] to-[#F5A623]">
          Odyssey
        </span>
      </Link>
      
      <div className="flex items-center gap-3">
        {status === "loading" ? (
          <div className="w-8 h-8 rounded-full border-2 border-t-[#F9DC34] border-purple-700 animate-spin"></div>
        ) : session && (
          <Signout />
        )}
      </div>
    </div>
  );
};

export default Navbar;