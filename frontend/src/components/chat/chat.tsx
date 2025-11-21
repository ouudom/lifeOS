"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export function Chat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hello! I'm your LifeOS AI assistant. How can I help you today?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I'm a demo response. In a real implementation, this would connect to your backend API to process your message and provide a meaningful response.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setIsLoading(false);
        }, 1000);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="flex h-full flex-col">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="mx-auto max-w-3xl space-y-6">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                "flex gap-3 animate-in fade-in-50 slide-in-from-bottom-2",
                                message.role === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            {message.role === "assistant" && (
                                <Avatar className="h-8 w-8 border">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        <Bot className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                            )}

                            <div
                                className={cn(
                                    "group relative max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                                    message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                )}
                            >
                                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                    {message.content}
                                </p>
                                <span className="mt-1 block text-[10px] opacity-50">
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>

                            {message.role === "user" && (
                                <Avatar className="h-8 w-8 border">
                                    <AvatarFallback className="bg-muted">
                                        <User className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3 animate-in fade-in-50">
                            <Avatar className="h-8 w-8 border">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    <Bot className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm text-muted-foreground">Thinking...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Form */}
            <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <form onSubmit={handleSubmit} className="mx-auto max-w-3xl p-4">
                    <div className="relative flex items-end gap-2">
                        <div className="relative flex-1">
                            <Textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                                className="min-h-[60px] max-h-[200px] resize-none rounded-2xl pr-12 shadow-sm"
                                disabled={isLoading}
                            />
                        </div>
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!input.trim() || isLoading}
                            className="h-[60px] w-[60px] shrink-0 rounded-2xl shadow-sm"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
