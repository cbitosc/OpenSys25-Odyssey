"use client";

import { signOut } from "next-auth/react";
import { Button } from "./ui/button";

const Signout = () => {
  return (
    <Button
      onClick={() => signOut()}
      className="bg-transparent hover:bg-[#F9DC34] text-[#F9DC34] hover:text-[#2D1B4B] font-medium px-4 py-2 border border-[#F9DC34] hover:border-transparent rounded-lg transition-all duration-300 shadow-md hover:shadow-[#F9DC34]/20"
      variant="outline"
    >
      Sign out
    </Button>
  );
};

export default Signout;