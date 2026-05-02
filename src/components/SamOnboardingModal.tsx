import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

interface SamOnboardingModalProps {
    isOpen: boolean;
    onComplete: () => void;
}

const DIALOGUE_STEPS = [
    {
        text: "You made it. Ringing that bell is the dream.",
        subtext: "But take a breath, because the game just changed.",
    },
    {
        text: "Private markets forgive. Public markets punish.",
        subtext: "Every quarter, Wall Street will grade your existence. Miss your numbers, and the activist sharks will circle.",
    },
    {
        text: "You're no longer just an operator. You're a capital allocator.",
        subtext: "Stock splits, margin loans, lobbying, hostile takeovers... Welcome to the big leagues.",
    },
    {
        text: "Let me show you your new command center.",
        subtext: "Welcome to the Founder Terminal.",
    }
];

export function SamOnboardingModal({ isOpen, onComplete }: SamOnboardingModalProps) {
    const [step, setStep] = useState(0);

    // Reset step when opened
    useEffect(() => {
        if (isOpen) setStep(0);
    }, [isOpen]);

    if (!isOpen) return null;

    const currentDialogue = DIALOGUE_STEPS[step];

    const nextStep = () => {
        if (step < DIALOGUE_STEPS.length - 1) {
            setStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }} // Slow cinematic fade
                className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-6"
            >
                <div className="max-w-2xl w-full text-center flex flex-col items-center justify-center min-h-[60vh]">
                    
                    <motion.div
                        key={`avatar-${step}`}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="w-32 h-32 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.15)] mb-12 relative overflow-hidden"
                    >
                        <span className="text-6xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">🧑🏽‍💼</span>
                    </motion.div>

                    <motion.div
                        key={`text-${step}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="space-y-6"
                    >
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                            {currentDialogue.text}
                        </h2>
                        
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.5, duration: 1 }}
                            className="text-lg md:text-xl text-slate-400 font-medium max-w-xl mx-auto leading-relaxed"
                        >
                            {currentDialogue.subtext}
                        </motion.p>
                    </motion.div>

                    <motion.div
                        key={`btn-${step}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 4, duration: 1 }}
                        className="mt-16"
                    >
                        <Button 
                            onClick={nextStep}
                            variant="outline" 
                            className="bg-transparent text-slate-300 border-slate-700 hover:bg-white hover:text-black hover:border-white transition-all duration-500 px-8 py-6 text-lg rounded-full"
                        >
                            {step < DIALOGUE_STEPS.length - 1 ? "Continue" : "Enter Terminal"}
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
