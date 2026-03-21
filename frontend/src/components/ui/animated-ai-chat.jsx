"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
    SendIcon,
    XIcon,
    LoaderIcon,
    Sparkles,
    Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";

function useAutoResizeTextarea({ minHeight, maxHeight }) {
    const textareaRef = useRef(null);

    const adjustHeight = useCallback(
        (reset) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

const Textarea = React.forwardRef(
    ({ className, containerClassName, showRing = true, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);

        return (
            <div
                className={cn("relative", containerClassName)}
            >
                <textarea
                    className={cn(
                        "flex min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                        "transition-all duration-200 ease-in-out",
                        "placeholder:text-muted-foreground",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        showRing
                            ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            : "",
                        className
                    )}
                    ref={ref}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {showRing && isFocused && (
                    <motion.span
                        className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-violet-500/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </div>
        );
    }
);
Textarea.displayName = "Textarea";

export function AnimatedAIChat({
    messages = [],
    onSendMessage,
    isLoading = false,
    userName = "Friend"
}) {
    const [value, setValue] = useState("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 44,
        maxHeight: 120,
    });
    const scrollRef = useRef(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !isLoading) {
                onSendMessage(value.trim());
                setValue("");
                adjustHeight(true);
            }
        }
    };

    const handleSendClick = () => {
        if (value.trim() && !isLoading) {
            onSendMessage(value.trim());
            setValue("");
            adjustHeight(true);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const messageVariants = {
        hidden: { opacity: 0, y: 10, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1 }
    };

    return (
        <div className="flex flex-col w-full h-full max-h-[calc(100vh-120px)] relative glass-panel !p-0 overflow-hidden shadow-glow">
            {/* Background Blobs */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-64 h-64 opacity-20 bg-primary/20 rounded-full mix-blend-normal filter blur-[80px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 opacity-20 bg-secondary/10 rounded-full mix-blend-normal filter blur-[80px] animate-pulse delay-700" />
            </div>

            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 backdrop-blur-md bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-secondary">Therapy Session</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">CBT • {userName}</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
            >
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-4"
                >
                    <AnimatePresence mode="popLayout">
                        {messages.map((msg, index) => (
                            <motion.div
                                key={`${index}-${msg.role}`}
                                variants={messageVariants}
                                layout
                                className={cn(
                                    "flex w-full",
                                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                                )}
                            >
                                <div className={cn(
                                    "max-w-[85%] md:max-w-[70%] px-4 py-2.5 rounded-2xl text-[0.9375rem] leading-relaxed shadow-sm",
                                    msg.role === 'user'
                                        ? "bg-primary text-white rounded-tr-none border border-white/10"
                                        : "bg-white/5 backdrop-blur-sm text-white/90 rounded-tl-none border border-white/5"
                                )}>
                                    {msg.content.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line}
                                            {i !== msg.content.split('\n').length - 1 && <br />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start items-center"
                        >
                            <div className="bg-white/5 backdrop-blur-sm px-4 py-2.5 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                                <span className="text-xs text-secondary/60 italic font-medium">Assistant thinking</span>
                                <TypingDots />
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/5 backdrop-blur-xl border-t border-white/5">
                <div className="relative flex items-center gap-2">
                    <div className="relative flex-1 group">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={`Express yourself, ${userName}...`}
                            className="w-full px-4 py-2.5 resize-none bg-black/20 border-white/10 text-white text-sm focus:border-secondary/30 placeholder:text-white/20 min-h-[44px] rounded-xl pr-10 transition-all"
                        />
                        <button
                            onClick={handleSendClick}
                            disabled={isLoading || !value.trim()}
                            className={cn(
                                "absolute right-2.5 bottom-2 p-1 rounded-lg transition-all",
                                value.trim() && !isLoading
                                    ? "text-secondary hover:text-secondary-light"
                                    : "text-white/10"
                            )}
                        >
                            {isLoading ? (
                                <LoaderIcon className="w-5 h-5 animate-spin" />
                            ) : (
                                <ArrowUpIcon className="w-5 h-5 transition-transform hover:-translate-y-0.5" />
                            )}
                        </button>
                    </div>
                </div>
                <p className="text-[9px] text-center text-white/20 mt-2 uppercase tracking-widest font-bold">Encrypted End-to-End</p>
            </div>
        </div>
    );
}

function TypingDots() {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-1.5 h-1.5 bg-secondary/80 rounded-full"
                    animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: dot * 0.2,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}
