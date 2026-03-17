"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, AlertTriangle, UserMinus, LogOut, WifiOff, Rocket } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: "delete" | "warning" | "fire" | "exit" | "offline" | "premium";
}

export function ConfirmModal({
    isOpen,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmText = "CONFIRM",
    cancelText = "Cancel",
    type = "warning"
}: ConfirmModalProps) {
    
    // Icon mapping
    const getIcon = () => {
        switch (type) {
            case "delete": return <Trash2 className="w-6 h-6 text-rose-500" />;
            case "fire": return <UserMinus className="w-6 h-6 text-rose-500" />;
            case "exit": return <LogOut className="w-6 h-6 text-rose-500" />;
            case "offline": return <WifiOff className="w-6 h-6 text-amber-500" />;
            case "premium": return <Rocket className="w-6 h-6 text-indigo-500" />;
            default: return <AlertTriangle className="w-6 h-6 text-amber-500" />;
        }
    };

    const getIconBg = () => {
        switch (type) {
            case "delete":
            case "fire":
                return "bg-rose-50";
            case "premium":
                return "bg-indigo-50";
            default:
                return "bg-amber-50";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] bg-white border-none rounded-[2.5rem] p-8 shadow-2xl overflow-hidden [&>button]:hidden">
                <div className="flex flex-col items-center text-center">
                    {/* Icon Container */}
                    <div className={`mb-6 p-4 rounded-full ${getIconBg()} flex items-center justify-center`}>
                        {getIcon()}
                    </div>

                    {/* Content */}
                    <DialogTitle className="text-2xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                        {title}
                    </DialogTitle>
                    
                    <DialogDescription className="text-slate-500 text-sm leading-relaxed mb-10 px-4 font-medium">
                        {description}
                    </DialogDescription>

                    {/* Actions */}
                    <div className="w-full space-y-4">
                        <button
                            onClick={() => {
                                onConfirm();
                                onOpenChange(false);
                            }}
                            className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-wider text-sm shadow-xl transition-all active:scale-[0.98] ${
                                type === 'premium' 
                                    ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700' 
                                    : 'bg-[#f43f5e] text-white shadow-rose-200 hover:bg-[#e11d48]'
                            }`}
                        >
                            {confirmText}
                        </button>
                        
                        {cancelText && (
                            <button
                                onClick={() => onOpenChange(false)}
                                className="w-full py-2 text-slate-400 font-bold tracking-tight text-sm hover:text-slate-600 transition"
                            >
                                {cancelText}
                            </button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
