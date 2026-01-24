import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, FileUp, Sparkles, Upload } from 'lucide-react';
import { Button } from './Button';

interface HeroProps {
    onGetStarted?: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {

    const handleStart = () => {
        if (onGetStarted) {
            onGetStarted();
        } else {
            document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="relative min-h-screen flex items-center pt-20 overflow-hidden" id="hero">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-secondary/10 rounded-full blur-[100px] -z-10 opacity-30" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">

                {/* Left Column: Text Content */}
                <div className="space-y-8 text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-slate-300">AI-Powered Resume Optimization</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6">
                            Beat the <span className="text-gradient">ATS Bot</span> <br />
                            Land the Job.
                        </h1>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Stop getting rejected by algorithms. Our smart builder optimizes your resume keywords,
                            scores your compatibility, and helps you stand out to human recruiters.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
                    >
                        <Button
                            variant="glow"
                            size="lg"
                            className="w-full sm:w-auto"
                            onClick={handleStart}
                        >
                            Analyze My Resume <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto"
                            onClick={() => document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            View Sample Work
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center gap-6 justify-center lg:justify-start text-sm text-slate-500"
                    >
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Free Analysis</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> No Sign Up Required</span>
                    </motion.div>
                </div>

                {/* Right Column: Visual/Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="relative hidden lg:block p-12"
                >
                    {/* Main Card Mockup */}
                    <div className="relative z-10 p-6 glass rounded-2xl border-white/20 bg-black/40">
                        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-700 animate-pulse" />
                                <div className="space-y-2">
                                    <div className="w-32 h-3 bg-slate-700/50 rounded animate-pulse" />
                                    <div className="w-20 h-2 bg-slate-700/50 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-bold border border-green-500/30">
                                Score: 92/100
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1 h-32 rounded-lg bg-white/5 border border-white/10 p-4">
                                    <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm font-medium">
                                        <FileUp className="w-4 h-4" /> Hard Skills
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['React', 'TypeScript', 'Tailwind', 'Next.js'].map(skill => (
                                            <span key={skill} className="px-2 py-1 rounded bg-primary/20 text-primary text-xs border border-primary/30">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="w-1/3 space-y-2">
                                    <div className="h-full rounded-lg bg-white/5 border border-white/10 p-4 flex flex-col justify-center items-center text-center">
                                        <div className="text-2xl font-bold text-white">4</div>
                                        <div className="text-xs text-slate-400">Missing Keywords</div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                                <div className="w-3/4 h-full bg-gradient-to-r from-primary to-secondary" />
                            </div>
                        </div>
                    </div>

                    {/* Floating Elements */}
                    <motion.div
                        animate={{ y: [-10, 10, -10] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-10 -right-8 p-4 glass rounded-xl border-white/20 flex items-center gap-3 z-20"
                    >
                        <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-white font-bold">ATS Optimized</div>
                            <div className="text-xs text-slate-400">Ready for submission</div>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [10, -10, 10] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute -bottom-8 -left-8 p-4 glass rounded-xl border-white/20 flex items-center gap-3 z-0"
                    >
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                            <Upload className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-white font-bold">Smart Parsing</div>
                            <div className="text-xs text-slate-400">Extracting skills...</div>
                        </div>
                    </motion.div>

                </motion.div>
            </div>
        </div>
    );
};
