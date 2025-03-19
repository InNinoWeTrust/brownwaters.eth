"use client";

import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";

interface OnboardingModalProps {
  onClose: () => void;
}

const steps = [
  { title: "Welcome to Brown Waters DAO", content: "Let's get started with your onboarding!" },
  { title: "Connect Your Wallet", content: "Click the 'Connect Wallet' button to begin." },
  { title: "Submit a Proposal", content: "Enter your idea and submit it for voting!" },
  { title: "Vote on Proposals", content: "Engage in governance by casting your vote." },
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onClose();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.9 }} 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-100 z-50"
    >
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-lg font-bold">{steps[stepIndex].title}</h2>
        <p className="mt-2 text-orange-600">{steps[stepIndex].content}</p>
        <button 
          type="button" 
          onClick={nextStep} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-green-700"
        >
          {stepIndex < steps.length - 1 ? "Next" : "Finish"}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingModal;
