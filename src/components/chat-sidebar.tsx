"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Sparkles, User, BrainCircuit, Loader2 } from 'lucide-react';
import { generateWorkflow } from '@/ai/flows/generate-workflow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onWorkflowGenerated: (workflow: any) => void;
}

export function ChatSidebar({ isOpen, onClose, onWorkflowGenerated }: ChatSidebarProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hello! I'm your AI Project Assistant. Describe a project goal, and I'll generate a complete workflow for you on the board."
        }
    ]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsGenerating(true);

        try {
            const workflow = await generateWorkflow({ prompt: input });

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I've generated a workflow for you based on your goal. You can see the tasks and connections on the board now!"
            };

            setMessages(prev => [...prev, assistantMessage]);
            onWorkflowGenerated(workflow);

            toast({
                title: "Workflow Generated",
                description: "New tasks and connections have been added to your mind map.",
            });
        } catch (error) {
            console.error('Workflow generation failed:', error);
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: 'I encountered an error while building your workflow. Please try again.',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={cn(
            "fixed inset-y-0 right-0 w-96 bg-card/80 backdrop-blur-2xl border-l border-border shadow-2xl z-50 transition-all duration-500 ease-in-out transform",
            isOpen ? "translate-x-0" : "translate-x-full"
        )}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-card/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground leading-none">AI Assistant</h2>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1 block">Powered by OpenRouter</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
                        <X className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
                    <div className="space-y-6">
                        {messages.map((m) => (
                            <div key={m.id} className={cn(
                                "flex gap-4 max-w-[85%]",
                                m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                            )}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                    m.role === 'assistant' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    {m.role === 'assistant' ? <BrainCircuit className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                </div>
                                <div className={cn(
                                    "p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm",
                                    m.role === 'assistant'
                                        ? "bg-muted border border-border text-foreground rounded-tl-none"
                                        : "bg-primary text-primary-foreground rounded-tr-none"
                                )}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isGenerating && (
                            <div className="flex gap-4 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 animate-pulse">
                                    <BrainCircuit className="h-4 w-4" />
                                </div>
                                <div className="p-4 rounded-[1.5rem] rounded-tl-none bg-muted border border-border text-muted-foreground text-sm flex items-center gap-2 italic">
                                    <Loader2 className="h-3 w-3 animate-spin" /> Analyzing and building your workflow...
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-6 border-t border-border bg-card">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
                        <div className="relative flex items-center gap-2 bg-muted border border-border p-2 rounded-2xl shadow-sm focus-within:border-primary transition-all">
                            <input
                                type="text"
                                placeholder="Describe your project goal..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                style={{
                                    background: 'transparent',
                                    color: 'hsl(var(--foreground))',
                                    caretColor: 'hsl(var(--primary))',
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium rounded-xl outline-none placeholder:text-muted-foreground"
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || isGenerating}
                                size="icon"
                                className="rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all shrink-0"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground mt-4 font-medium">
                        AI can make mistakes. Verify important tasks on the board.
                    </p>
                </div>
            </div>
        </div>
    );
}
