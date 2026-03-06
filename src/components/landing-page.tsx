"use client";

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Sparkles, Layout, Zap, ArrowRight, CheckCircle, Network, GitBranch, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';


export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
    const { user } = useAuth();
    const router = useRouter();

    const handleAuthAction = async () => {
        if (user) {
            onGetStarted();
        } else {
            if (!auth) return;
            const provider = new GoogleAuthProvider();
            try {
                await signInWithPopup(auth, provider);
                onGetStarted();
            } catch (error: any) {
                if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
                    console.error("Error signing in with Google: ", error);
                }
            }
        }
    };


    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">

            {/* ─── NAV ─── */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-primary p-1.5 rounded-xl shadow-md shadow-primary/20">
                            <BrainCircuit className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-black tracking-tight">
                            Mind<span className="text-primary">Navigator</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
                        <a href="#features" className="hover:text-primary transition-colors">Features</a>
                        <a href="#how" className="hover:text-primary transition-colors">How It Works</a>
                        <a href="#cta" className="hover:text-primary transition-colors">Get Started</a>
                    </div>

                    <Button
                        onClick={handleAuthAction}
                        className="rounded-full px-5 h-9 text-sm font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {user ? 'Dashboard →' : 'Sign In Free'}
                    </Button>
                </div>
            </nav>

            {/* ─── HERO ─── */}
            <section className="relative pt-28 pb-16 px-6 overflow-hidden">
                {/* Blurry gradient blobs */}
                <div className="absolute top-20 left-[10%] w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-0 animate-pulse"></div>
                <div className="absolute top-40 right-[5%] w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-0"></div>

                <div className="relative max-w-7xl mx-auto">
                    <div className="max-w-2xl mb-14">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                            <Sparkles className="h-3.5 w-3.5" />
                            AI-Powered Project Planning
                        </div>

                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-6 leading-[1.05]">
                            Turn goals into
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                                visual workflows
                            </span>
                            <br />
                            instantly.
                        </h1>

                        <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
                            Describe any project, and our AI builds a connected task graph with dependencies and layout — just like the flow you see below.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <Button
                                onClick={handleAuthAction}
                                size="lg"
                                className="rounded-full px-8 h-12 text-base font-bold shadow-xl shadow-primary/20 hover:shadow-2xl hover:translate-y-[-2px] transition-all"
                            >
                                Start for Free <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <p className="text-sm text-slate-400 font-medium">No credit card · Free forever</p>
                        </div>
                    </div>

                    {/* ─── ANIMATED FLOW CANVAS ─── */}
                    <FlowCanvas />
                </div>
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section id="how" className="py-24 px-6 bg-slate-50/70">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">How it works</h2>
                        <p className="text-slate-500 text-lg max-w-lg mx-auto">Three steps from idea to structured workflow.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 relative">
                        {/* Connector line */}
                        <div className="hidden md:block absolute top-10 left-[calc(33.3%+32px)] right-[calc(33.3%+32px)] h-0.5 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 z-0"></div>

                        <StepCard step="01" icon={<Brain className="h-6 w-6 text-primary" />} title="Describe Your Goal" desc="Type a plain-English description of your project — e.g. 'Launch a SaaS app' or 'Write a research paper'." />
                        <StepCard step="02" icon={<Sparkles className="h-6 w-6 text-blue-500" />} title="AI Builds the Graph" desc="Our AI generates tasks with logical connections, grouping them into phases and setting up a visual workflow." />
                        <StepCard step="03" icon={<Network className="h-6 w-6 text-violet-500" />} title="Edit and Collaborate" desc="Drag nodes, update statuses, add team members, and save your mind map — all in real time." />
                    </div>
                </div>
            </section>

            {/* ─── FEATURES ─── */}
            <section id="features" className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Everything you need</h2>
                        <p className="text-slate-500 text-lg max-w-lg mx-auto">Built for teams who move fast and think visually.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <FeatureCard icon={<BrainCircuit className="h-7 w-7 text-primary" />} color="primary" title="AI Task Generation" desc="Describe your goal and get a full breakdown of tasks with connections in seconds." />
                        <FeatureCard icon={<GitBranch className="h-7 w-7 text-blue-500" />} color="blue" title="Visual Flow Editor" desc="Drag, connect, and reorganise nodes on an infinite canvas with smooth zoom and pan." />
                        <FeatureCard icon={<Layout className="h-7 w-7 text-violet-500" />} color="violet" title="Auto Layout" desc="Tasks are intelligently positioned to create a clear, readable workflow on every generation." />
                        <FeatureCard icon={<CheckCircle className="h-7 w-7 text-emerald-500" />} color="emerald" title="Status Tracking" desc="Mark tasks as Todo, In Progress, or Done with colour-coded visual indicators." />
                        <FeatureCard icon={<Zap className="h-7 w-7 text-amber-500" />} color="amber" title="Instant Save" desc="Your mind map is saved to the cloud in real time — never lose your work again." />
                        <FeatureCard icon={<Sparkles className="h-7 w-7 text-pink-500" />} color="pink" title="OpenRouter AI" desc="Powered by best-in-class models via OpenRouter for fast, accurate task planning." />
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section id="cta" className="py-24 px-6 bg-gradient-to-br from-primary/5 via-blue-50 to-white border-t border-slate-100">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">Ready to map your mind?</h2>
                    <p className="text-slate-500 text-lg mb-10">Join thousands of builders who plan faster with AI-powered workflows.</p>
                    <Button onClick={handleAuthAction} size="lg" className="rounded-full px-12 h-14 text-lg font-black shadow-2xl shadow-primary/25 hover:translate-y-[-2px] hover:shadow-3xl transition-all">
                        Get Started — It's Free
                    </Button>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="py-10 px-6 bg-slate-900 text-slate-400">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary p-1 rounded-lg">
                            <BrainCircuit className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-white">MindNavigator</span>
                    </div>
                    <p>© 2026 MindTask Navigator. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

/* ──────────────────────────────
   ANIMATED FLOW CANVAS COMPONENT
   ────────────────────────────── */
function FlowCanvas() {
    return (
        <div className="relative w-full h-[420px] bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
            {/* Dot grid background */}
            <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill="#94a3b8" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>

            {/* Subtle gradient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            {/* SVG Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Goal → Design */}
                <path d="M 220 95 C 280 95 280 165 340 165" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="6 4" fill="none" className="animate-dash" />
                {/* Goal → Research */}
                <path d="M 220 95 C 280 95 280 265 340 265" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="6 4" fill="none" className="animate-dash" style={{ animationDelay: '0.3s' }} />
                {/* Design → Dev */}
                <path d="M 520 165 C 580 165 580 115 640 115" stroke="#60a5fa" strokeWidth="2" strokeDasharray="6 4" fill="none" className="animate-dash" style={{ animationDelay: '0.6s' }} />
                {/* Research → Dev */}
                <path d="M 520 265 C 580 265 580 115 640 115" stroke="#60a5fa" strokeWidth="2" strokeDasharray="6 4" fill="none" className="animate-dash" style={{ animationDelay: '0.9s' }} />
                {/* Dev → Launch */}
                <path d="M 820 115 C 880 115 890 210 860 240" stroke="#a78bfa" strokeWidth="2" strokeDasharray="6 4" fill="none" className="animate-dash" style={{ animationDelay: '1.2s' }} />

                {/* Arrow heads */}
                <defs>
                    <marker id="arrowTeal" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 Z" fill="#2dd4bf" />
                    </marker>
                    <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 Z" fill="#60a5fa" />
                    </marker>
                    <marker id="arrowViolet" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 Z" fill="#a78bfa" />
                    </marker>
                </defs>
            </svg>

            {/* Nodes */}
            <FlowNode x={60} y={55} title="Project Goal" desc="Launch SaaS App" color="teal" emoji="🎯" />
            <FlowNode x={340} y={125} title="Design Phase" desc="Wireframes & UI" color="blue" emoji="🎨" />
            <FlowNode x={340} y={225} title="Research" desc="Market Analysis" color="violet" emoji="🔍" />
            <FlowNode x={620} y={75} title="Development" desc="Build & Iterate" color="emerald" emoji="💻" delay="200ms" />
            <FlowNode x={720} y={285} title="Launch" desc="Go Live! 🚀" color="pink" emoji="🚀" delay="400ms" />

            {/* MiniMap mockup */}
            <div className="absolute bottom-4 right-4 w-28 h-20 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-xl shadow-lg overflow-hidden opacity-80">
                <svg className="w-full h-full" viewBox="0 0 112 80">
                    <rect x="10" y="15" width="20" height="12" rx="3" fill="#2dd4bf" opacity="0.6" />
                    <rect x="42" y="28" width="18" height="10" rx="3" fill="#60a5fa" opacity="0.6" />
                    <rect x="42" y="45" width="18" height="10" rx="3" fill="#a78bfa" opacity="0.6" />
                    <rect x="76" y="20" width="22" height="12" rx="3" fill="#34d399" opacity="0.6" />
                    <rect x="88" y="50" width="18" height="10" rx="3" fill="#f472b6" opacity="0.6" />
                    <line x1="30" y1="21" x2="42" y2="33" stroke="#94a3b8" strokeWidth="1" />
                    <line x1="30" y1="21" x2="42" y2="50" stroke="#94a3b8" strokeWidth="1" />
                    <line x1="60" y1="33" x2="76" y2="26" stroke="#94a3b8" strokeWidth="1" />
                    <line x1="60" y1="50" x2="76" y2="26" stroke="#94a3b8" strokeWidth="1" />
                    <line x1="98" y1="26" x2="96" y2="50" stroke="#94a3b8" strokeWidth="1" />
                </svg>
            </div>

            {/* Controls mockup */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-1">
                <div className="w-7 h-7 bg-white border border-slate-200 rounded-lg shadow flex items-center justify-center text-slate-400 text-sm font-bold hover:bg-slate-50 cursor-pointer select-none">+</div>
                <div className="w-7 h-7 bg-white border border-slate-200 rounded-lg shadow flex items-center justify-center text-slate-400 text-sm font-bold hover:bg-slate-50 cursor-pointer select-none">−</div>
            </div>

            <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -40; }
        }
        .animate-dash {
          animation: dash 1.5s linear infinite;
        }
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .flow-node {
          animation: floatIn 0.6s ease forwards;
          position: absolute;
        }
      `}</style>
        </div>
    );
}

function FlowNode({ x, y, title, desc, color, emoji, delay = '0ms' }: {
    x: number; y: number; title: string; desc: string; color: string; emoji: string; delay?: string
}) {
    const border: Record<string, string> = {
        teal: 'border-l-teal-400',
        blue: 'border-l-blue-400',
        violet: 'border-l-violet-400',
        emerald: 'border-l-emerald-400',
        pink: 'border-l-pink-400',
    };
    const dot: Record<string, string> = {
        teal: 'bg-teal-400',
        blue: 'bg-blue-400',
        violet: 'bg-violet-400',
        emerald: 'bg-emerald-400',
        pink: 'bg-pink-400',
    };

    return (
        <div
            className={`flow-node bg-white rounded-2xl border border-slate-100 shadow-lg border-l-[3px] ${border[color]} px-4 py-3 w-[170px] hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-default`}
            style={{ left: x, top: y, animationDelay: delay }}
        >
            <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dot[color]}`}></div>
                <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{title}</div>
                    <div className="text-sm font-bold text-slate-800">{desc}</div>
                </div>
            </div>
            {/* Handle dots */}
            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white shadow"></div>
            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white shadow"></div>
        </div>
    );
}

function StepCard({ step, icon, title, desc }: { step: string; icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="relative z-10 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all">
            <div className="text-5xl font-black text-slate-100 mb-4 -mt-1">{step}</div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-5">{icon}</div>
            <h3 className="text-lg font-black mb-2">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

function FeatureCard({ icon, color, title, desc }: { icon: React.ReactNode; color: string; title: string; desc: string }) {
    const bg: Record<string, string> = {
        primary: 'bg-primary/5',
        blue: 'bg-blue-50',
        violet: 'bg-violet-50',
        emerald: 'bg-emerald-50',
        amber: 'bg-amber-50',
        pink: 'bg-pink-50',
    };
    return (
        <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 group">
            <div className={`w-13 h-13 w-12 h-12 rounded-2xl ${bg[color]} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <h3 className="text-base font-black mb-2">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}
