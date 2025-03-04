"use client";

import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../firebase";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setStatus({
        type: "error",
        message: "Please enter your email address",
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus({
        type: "success",
        message: "Password reset email sent. Please check your inbox.",
      });
      setEmail("");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      
      // Handle different error codes
      let errorMessage = "Failed to send reset email. Please try again.";
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      }
      
      setStatus({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleResetPassword();
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
          <Link
            href="/"
            className="inline-flex items-center text-[#F9DC34]/80 hover:text-[#F9DC34] mb-6 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to login
          </Link>

          <h2 className="text-3xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#F9DC34] to-[#F5A623]">
            Reset Password
          </h2>

          <p className="mb-6 text-center text-gray-300">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {status.message && (
            <div
              className={`mb-6 p-3 rounded-lg ${
                status.type === "error"
                  ? "bg-red-500/20 border border-red-500/30 text-red-200"
                  : "bg-green-500/20 border border-green-500/30 text-green-200"
              }`}
            >
              {status.message}
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
                onKeyDown={handleKeyPress}
              />
            </div>

            <button
              type="button"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#F9DC34] to-[#F5A623] hover:from-[#FFE55C] hover:to-[#FFBD4A] text-purple-900 font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              onClick={handleResetPassword}
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 mr-3 rounded-full border-2 border-t-purple-900 border-purple-900/30 animate-spin"></span>
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}