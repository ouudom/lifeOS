"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { chatService, Message as ApiMessage } from "@/api/services/chat.service";
import { ApiError } from "@/api/base/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    error?: boolean;
}

export function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingHistory, setIsFetchingHistory] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollPositionRef = useRef<number>(0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Fetch messages
    const fetchMessages = async (pageNum: number) => {
        if (isFetchingHistory) return;

        try {
            setIsFetchingHistory(true);
            const response = await chatService.getMessages(pageNum, 6);

            if (response.data) {
                const newMessages: Message[] = response.data.map((msg: ApiMessage) => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    timestamp: new Date(msg.created_at),
                })).reverse(); // Backend returns newest first, we want oldest first for display

                if (newMessages.length < 6) {
                    setHasMore(false);
                }

                if (pageNum === 1) {
                    setMessages(newMessages);
                    // Scroll to bottom on initial load
                    setTimeout(scrollToBottom, 100);
                } else {
                    // Prepend messages
                    setMessages(prev => [...newMessages, ...prev]);
                }

                setPage(pageNum + 1);
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        } finally {
            setIsFetchingHistory(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchMessages(1);
    }, []);

    // Handle scroll for infinite loading
    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container) return;

        if (container.scrollTop === 0 && hasMore && !isFetchingHistory) {
            // Save current scroll height to restore position after loading
            scrollPositionRef.current = container.scrollHeight;
            fetchMessages(page);
        }
    };

    // Restore scroll position after history load
    useEffect(() => {
        if (page > 2 && messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            const newScrollHeight = container.scrollHeight;
            const scrollDiff = newScrollHeight - scrollPositionRef.current;
            container.scrollTop = scrollDiff;
        }
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

        const userMessageContent = input.trim();
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Call the chat service API
            const reply = await chatService.getReply(userMessageContent);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: reply || "I received your message but couldn't generate a response.",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Chat error:", error);

            // Handle API errors
            let errorMessage = "Failed to get a response. Please try again.";

            if (error instanceof ApiError) {
                errorMessage = `${error.message} (Error code: ${error.code})`;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            // Add error message to chat
            const errorAssistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: errorMessage,
                timestamp: new Date(),
                error: true,
            };

            setMessages((prev) => [...prev, errorAssistantMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="flex h-full flex-col">
            {/* Messages Container */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-6"
            >
                <div className="mx-auto max-w-3xl space-y-6">
                    {isFetchingHistory && page > 1 && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    )}
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
                                    <AvatarFallback className={cn(
                                        message.error
                                            ? "bg-destructive text-destructive-foreground"
                                            : "bg-primary text-primary-foreground"
                                    )}>
                                        {message.error ? (
                                            <AlertCircle className="h-4 w-4" />
                                        ) : (
                                            <Bot className="h-4 w-4" />
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                            )}

                            <div
                                className={cn(
                                    "group relative max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                                    message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : message.error
                                            ? "bg-destructive/10 border border-destructive/50"
                                            : "bg-muted"
                                )}
                            >
                                <div className={cn(
                                    "text-sm",
                                    message.error && "text-destructive"
                                )}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            // Style links
                                            a: ({ node, ...props }) => (
                                                <a
                                                    {...props}
                                                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline break-all font-medium"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                />
                                            ),
                                            // Style lists
                                            ul: ({ node, ...props }) => (
                                                <ul {...props} className="list-disc pl-5 space-y-1 my-2" />
                                            ),
                                            ol: ({ node, ...props }) => (
                                                <ol {...props} className="list-decimal pl-5 space-y-1 my-2" />
                                            ),
                                            li: ({ node, ...props }) => (
                                                <li {...props} className="leading-relaxed" />
                                            ),
                                            // Style paragraphs
                                            p: ({ node, ...props }) => (
                                                <p {...props} className="whitespace-pre-wrap break-words leading-relaxed my-2 first:mt-0 last:mb-0" />
                                            ),
                                            // Style headings
                                            h1: ({ node, ...props }) => (
                                                <h1 {...props} className="text-lg font-bold my-2" />
                                            ),
                                            h2: ({ node, ...props }) => (
                                                <h2 {...props} className="text-base font-bold my-2" />
                                            ),
                                            h3: ({ node, ...props }) => (
                                                <h3 {...props} className="text-sm font-bold my-2" />
                                            ),
                                            // Style strong/bold
                                            strong: ({ node, ...props }) => (
                                                <strong {...props} className="font-bold" />
                                            ),
                                            // Style code blocks
                                            code: ({ node, inline, ...props }: any) => (
                                                inline ? (
                                                    <code {...props} className="bg-muted/50 px-1.5 py-0.5 rounded text-xs font-mono" />
                                                ) : (
                                                    <code {...props} className="block bg-muted/50 p-3 rounded text-xs font-mono overflow-x-auto my-2" />
                                                )
                                            ),
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                                {/* <span className="mt-1 block text-[10px] opacity-50">
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span> */}
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
                    <div className="flex items-center gap-3 rounded-full border bg-background px-6 py-3 shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <input
                            ref={textareaRef as any}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown as any}
                            placeholder="Message"
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            disabled={isLoading}
                        />

                        <Button
                            type="submit"
                            size="icon"
                            disabled={!input.trim() || isLoading}
                            className="h-10 w-10 shrink-0 rounded-full"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
