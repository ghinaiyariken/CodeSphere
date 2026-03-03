import { FileText, Linkedin, Twitter } from 'lucide-react';


interface FooterProps {
    onNavigate?: (view: 'home' | 'cover-letter') => void;
}

export const Footer = ({ onNavigate }: FooterProps) => {

    const handleScroll = (id: string) => {
        if (onNavigate) {
            onNavigate('home');
            setTimeout(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <footer className="border-t border-white/10 bg-black/40 backdrop-blur-sm mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-gradient-to-tr from-primary to-secondary rounded-lg">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">ResumeAI</span>
                        </div>
                        <p className="text-slate-400 max-w-sm mb-6">
                            AI-powered resume optimization tool that helps you land your dream job by beating the ATS.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Product Column */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Product</h3>
                        <ul className="space-y-3">
                            <li><button onClick={() => handleScroll('features')} className="text-slate-400 hover:text-white transition-colors">Features</button></li>
                            <li><button onClick={() => handleScroll('how-it-works')} className="text-slate-400 hover:text-white transition-colors">How it works</button></li>
                            <li><button onClick={() => onNavigate?.('cover-letter')} className="text-slate-400 hover:text-white transition-colors">Cover Letter</button></li>
                            <li><button onClick={() => handleScroll('examples')} className="text-slate-400 hover:text-white transition-colors">Examples</button></li>
                            <li><button onClick={() => handleScroll('dashboard')} className="text-slate-400 hover:text-white transition-colors">ATS Checker</button></li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">About</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-12 pt-8 text-center text-slate-500 text-sm">
                    <p>© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
