import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Briefcase, TrendingUp, Monitor, Zap, Download } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

const categories = [
    { id: 'tech', name: 'Software & IT', icon: Monitor },
    { id: 'business', name: 'Business & Management', icon: Briefcase },
    { id: 'finance', name: 'Finance & Accounting', icon: TrendingUp },
    { id: 'marketing', name: 'Marketing & Sales', icon: Zap },
];

const resumeExamples = [
    {
        id: 1,
        title: 'Software Engineer',
        category: 'tech',
        image: '/templates/software-engineer.png',
        description: 'Clean, modern layout optimized for technical roles and ATS compatibility.'
    },
    {
        id: 2,
        title: 'Data Scientist',
        category: 'tech',
        image: '/templates/ds.png',
        description: 'Elite technical layout showcasing tech stack, Strengths, and quantifiable data accomplishments.'
    },
    {
        id: 3,
        title: 'Project Manager',
        category: 'business',
        image: '/templates/project-manager.png',
        description: 'Focuses on leadership, budgeting, and delivery metrics.'
    },
    {
        id: 4,
        title: 'Business Analyst',
        category: 'business',
        image: '/templates/business-analyst.png',
        description: 'Highlights analytical skills and strategic planning.'
    },
    {
        id: 5,
        title: 'Financial Analyst',
        category: 'finance',
        image: '/templates/financial-analyst.png',
        description: 'Professional and conservative design for high-finance roles.'
    },
    {
        id: 6,
        title: 'Accountant',
        category: 'finance',
        image: '/templates/accountant.png',
        description: 'Structured layout emphasizing certifications and compliance.'
    },
    {
        id: 7,
        title: 'Creative Director',
        category: 'marketing',
        image: '/templates/creative-director.png',
        description: 'Bold and visually engaging to showcase creative flair.'
    },
    {
        id: 8,
        title: 'Marketing Manager',
        category: 'marketing',
        image: '/templates/marketing-manager.png',
        description: 'Dynamic layout focusing on growth metrics and campaign success.'
    },
];

interface ResumeExamplesProps {
    onUseTemplate?: (id: string) => void;
}

export const ResumeExamples = ({ onUseTemplate }: ResumeExamplesProps) => {
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredExamples = activeCategory === 'all'
        ? resumeExamples
        : resumeExamples.filter(ex => ex.category === activeCategory);

    const handleDownload = (imageUrl: string, title: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${title.replace(/\s+/g, '_')}_Example.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <section id="examples" className="py-24 bg-black/20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Professional <span className="text-gradient">Resume Examples</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Explore thousands of expert-crafted resumes. Choose a template or specific role
                        and start building your own ATS-optimized resume today.
                    </p>
                </motion.div>

                {/* Category Filter */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === 'all'
                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        All Examples
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${activeCategory === cat.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            <cat.icon className="w-4 h-4" />
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredExamples.map((example) => (
                            <motion.div
                                key={example.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="group"
                            >
                                <Card className="p-0 overflow-hidden border-white/10 bg-black/40 hover:border-primary/50 transition-all duration-500 h-full flex flex-col">
                                    <div className="relative aspect-[3/4] overflow-hidden bg-slate-900">
                                        <img
                                            src={example.image}
                                            alt={example.title}
                                            className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 gap-2">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => onUseTemplate?.(example.id.toString())}
                                            >
                                                Use This Template
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full flex items-center justify-center gap-2"
                                                onClick={() => handleDownload(example.image, example.title)}
                                            >
                                                <Download className="w-4 h-4" /> Download High-Res
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors mb-2">
                                            {example.title}
                                        </h3>
                                        <p className="text-sm text-slate-400 flex-1">
                                            {example.description}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                                {categories.find(c => c.id === example.category)?.name}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Bottom CTA */}
                <div className="mt-20 text-center">
                    <div className="inline-flex items-center gap-8 p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/10 backdrop-blur-xl">
                        <div className="text-left hidden md:block">
                            <h4 className="text-xl font-bold text-white mb-1">Didn't find what you're looking for?</h4>
                            <p className="text-slate-400 text-sm">We have over 5,000+ role-specific templates in our database.</p>
                        </div>
                        <Button variant="glow" size="lg">
                            Search All Examples
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};
