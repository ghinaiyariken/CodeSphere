import { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { FileText, Menu, X } from 'lucide-react';
import { Button } from '../components/Button';

interface NavbarProps {
    onNavigate: (view: 'home' | 'cover-letter') => void;
}

export const Navbar = ({ onNavigate }: NavbarProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();

    const navBackground = useTransform(
        scrollY,
        [0, 50],
        ['rgba(10, 10, 10, 0)', 'rgba(10, 10, 10, 0.8)']
    );

    const navBackdropBlur = useTransform(
        scrollY,
        [0, 50],
        ['blur(0px)', 'blur(12px)']
    );

    const scrollToSection = (id: string) => {
        onNavigate('home');
        setIsMobileMenuOpen(false);
        setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <motion.nav
            style={{ backgroundColor: navBackground, backdropFilter: navBackdropBlur }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-transparent transition-colors duration-300"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => scrollToSection('hero')}
                    >
                        <div className="p-2 bg-gradient-to-tr from-primary to-secondary rounded-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            ResumeAI
                        </span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <button onClick={() => scrollToSection('features')} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Features</button>
                        <button onClick={() => scrollToSection('how-it-works')} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">How it works</button>
                        <button onClick={() => onNavigate('cover-letter')} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Cover Letter</button>
                        <button onClick={() => scrollToSection('examples')} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Examples</button>

                        <div className="flex items-center gap-4">
                            <Button
                                variant="glow"
                                size="sm"
                                onClick={() => scrollToSection('dashboard')}
                            >
                                Get Started
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-slate-400 hover:text-white p-2"
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-background/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 text-slate-400 hover:text-white transition-colors">Features</button>
                            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left py-2 text-slate-400 hover:text-white transition-colors">How it works</button>
                            <button onClick={() => { onNavigate('cover-letter'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-400 hover:text-white transition-colors">Cover Letter</button>
                            <button onClick={() => scrollToSection('examples')} className="block w-full text-left py-2 text-slate-400 hover:text-white transition-colors">Examples</button>
                            <Button
                                variant="glow"
                                className="w-full mt-4"
                                onClick={() => scrollToSection('dashboard')}
                            >
                                Get Started
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};
