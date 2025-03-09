"use client";

import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../../firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };
  
  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/",
      });
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const user = result.user;
      
      await signIn("credentials", {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        image: user.photoURL,
        isFirebaseGoogleUser: true,
        redirect: true,
        callbackUrl: "/",
      });
      
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-4rem)] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="backdrop-blur-md bg-white/5 rounded-xl p-8 shadow-xl border border-purple-300/20">
          <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#F9DC34] to-[#F5A623]">
            Login
          </h2>
          
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <label className="block text-[#F9DC34] text-lg mb-2 font-medium">
                Email
              </label>
              <input
                type="email"
                value={email}
                className="w-full px-4 py-3 bg-purple-900/30 border border-purple-400/30 focus:border-[#F9DC34]/70 rounded-lg shadow-inner outline-none text-white transition-all duration-200"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-[#F9DC34] text-lg mb-2 font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  className="w-full px-4 py-3 bg-purple-900/30 border border-purple-400/30 focus:border-[#F9DC34]/70 rounded-lg shadow-inner outline-none text-white transition-all duration-200"
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-purple-800/50 transition-colors duration-200"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible ? (
                    <EyeIcon className="w-5 h-5 text-gray-300" />
                  ) : (
                    <EyeSlashIcon className="w-5 h-5 text-gray-300" />
                  )}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-[#F9DC34]/80 hover:text-[#F9DC34] text-sm transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            
            <button
              type="button"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] text-purple-900 font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              onClick={handleLogin}
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 mr-3 rounded-full border-2 border-t-purple-900 border-purple-900/30 animate-spin"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-purple-400/30"></div>
              <span className="flex-shrink mx-4 text-purple-300">or</span>
              <div className="flex-grow border-t border-purple-400/30"></div>
            </div>
            
            <button
              type="button"
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              onClick={handleGoogleLogin}
            >
              {isGoogleLoading ? (
                <>
                  <span className="w-5 h-5 mr-3 rounded-full border-2 border-t-purple-900 border-purple-900/30 animate-spin"></span>
                  Connecting...
                </>
              ) : (
                <>
                  <FcGoogle className="w-5 h-5 mr-3" />
                  Continue with Google
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;