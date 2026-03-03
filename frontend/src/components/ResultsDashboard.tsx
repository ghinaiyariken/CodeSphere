import { useState, useRef } from 'react';
import {
    CheckCircle2, XCircle, AlertTriangle,
    Lightbulb, Sparkles,
    ArrowRight, Trophy
} from 'lucide-react';
import { Card } from './Card';
import { ScoreDial } from './ScoreDial';
import { Button } from './Button';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ResultsDashboardProps {
    onReset: () => void;
    data?: {
        score: number;
        matched_keywords: string[];
        missing_keywords: string[];
        total_keywords: number;
        suggestions: string[];
        parsed_resume?: {
            full_text: string;
            contact_info: Record<string, string>;
            summary: string;
            skills: string[];
            experience: Array<{
                title: string;
                company: string;
                duration: string;
                description: string;
                years: number;
            }>;
            education: Array<{
                degree: string;
                institution: string;
                year: string;
            }>;
            projects: Array<{ text: string }>;
            certifications: string[];
            tools_and_technologies: string[];
        };
    };
}

const MOCK_RESUME = {
    name: "JASON WEBSTER",
    role: "Full Stack Developer",
    contact: "+91 98765 43210 | jason.webster@email.com",
    links: "github.com/jwebster-test | linkedin.com/in/jwebster-test",
    summary: "As a results-oriented software engineer with 3 years of experience, I specialize in building scalable web applications. I have proven expertise in JavaScript and backend systems, and I am eager to contribute to a forward-thinking tech team.",
    experience: {
        role: "Junior Web Developer",
        company: "CloudSoft Solutions",
        date: "01/2022",
        description: "A software company focused on providing web development solutions.\n• Developed and maintained the company's main dashboard using React.js and Tailwind CSS.\n• Built RESTful APIs using Node.js to handle over 10,000 monthly active users.\n• Collaborated with the UI/UX team to implement responsive designs."
    },
    skills: ["GitHub", "JavaScript", "ES6+", "Python", "HTML", "React", "Node.js", "Next.js", "PostgreSQL", "Git", "Docker", "AWS", "Stripe", "JWT"],
    projects: {
        title: "E-Commerce Platform",
        description: "Developed a full-stack e-commerce solution with integrated payment gateways."
    }
};

export const ResultsDashboard = ({ onReset, data }: ResultsDashboardProps) => {
    const [viewMode, setViewMode] = useState<'original' | 'enhanced'>('original');
    const [isTransforming, setIsTransforming] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const resumeRef = useRef<HTMLDivElement>(null);

    // UI Transformation Handler
    const handleViewToggle = (mode: 'original' | 'enhanced') => {
        if (mode === viewMode) return;
        setIsTransforming(true);
        setViewMode(mode);
        // Simulate scanning effect
        setTimeout(() => setIsTransforming(false), 1200);
    };

    // Data Normalization and Type Safety
    const score = data?.score || 0;
    const matchedList = data?.matched_keywords?.length ? data.matched_keywords : [];
    const missingList = data?.missing_keywords?.length ? data.missing_keywords : [];

    const getNormalizedData = () => {
        if (data?.parsed_resume) {
            const pr = data.parsed_resume;
            return {
                name: pr.contact_info?.name || "YOUR NAME",
                role: pr.experience?.[0]?.title || "Professional",
                contact_info: pr.contact_info || {},
                summary: pr.summary || pr.full_text?.slice(0, 300) || "No summary provided.",
                experience: pr.experience || [],
                skills: pr.skills || [],
                education: pr.education || []
            };
        }
        return {
            name: MOCK_RESUME.name,
            role: MOCK_RESUME.role,
            contact_info: { phone: MOCK_RESUME.contact, links: MOCK_RESUME.links },
            summary: MOCK_RESUME.summary,
            experience: [{
                title: MOCK_RESUME.experience.role,
                company: MOCK_RESUME.experience.company,
                duration: MOCK_RESUME.experience.date,
                description: MOCK_RESUME.experience.description,
                years: 0
            }],
            skills: MOCK_RESUME.skills,
            education: []
        };
    };

    const resumeData = getNormalizedData();
    const name = resumeData.name;
    const role = resumeData.role;

    const enhancedSkills = [...resumeData.skills, ...missingList.slice(0, 5)];
    const enhancedSummary = score < 80
        ? resumeData.summary + " Skilled in " + missingList.slice(0, 3).join(", ") + "."
        : resumeData.summary;

    const handleDownload = async () => {
        if (!resumeRef.current) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(resumeRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
            });
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
            pdf.save(`Optimized_${name.replace(/\s+/g, '_')}_Resume.pdf`);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-300 p-4 md:p-6 animate-in fade-in duration-700 overflow-x-hidden">
            {/* Header Toolbar */}
            <div className="max-w-[1800px] mx-auto mb-6 flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white leading-none">Analysis Dashboard</h2>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 tracking-widest uppercase">ATS Optimization Engine v2.0</p>
                    </div>
                </div>
                <button
                    onClick={onReset}
                    className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 bg-white/2"
                >
                    Analyze New Resume
                </button>
            </div>

            <div className="max-w-[1800px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                {/* LEFT COLUMN: Data Analytics (Span 5) */}
                <div className="xl:col-span-5 flex flex-col gap-6">
                    {/* Score Card */}
                    <Card className="bg-[#111111] border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                        <ScoreDial score={score} />
                        <div className="mt-6 text-center z-10">
                            <h3 className="text-xl font-black text-white uppercase tracking-[0.2em]">
                                {score >= 80 ? "Elite Match" : score >= 50 ? "Solid Candidate" : "Optimization Req."}
                            </h3>
                            <p className="text-[10px] text-slate-500 mt-2 font-bold leading-relaxed tracking-wider">
                                {score}% match with target requirements.
                            </p>
                        </div>
                    </Card>

                    {/* Critical Gaps Tags */}
                    <Card className="bg-[#111111] border-white/5 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                <AlertTriangle className="text-red-500 w-3 h-3" />
                                Critical Skills Gap
                            </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {missingList.slice(0, 10).map((skill) => (
                                <span key={skill} className="px-2.5 py-1.5 rounded-md bg-[#1a1414] text-[#ff7373] border border-red-900/40 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-500/5 transition-colors">
                                    <XCircle className="w-3 h-3 opacity-60" />
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </Card>

                    {/* Side-by-Side Lists (Matched & Improvement) */}
                    <div className="grid grid-cols-2 gap-4 h-[600px]">
                        <Card className="bg-[#111111] border-white/5 p-0 overflow-hidden flex flex-col h-full hover:border-green-500/20 transition-colors">
                            <div className="p-4 border-b border-white/5 bg-white/2 shrink-0">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center justify-between">
                                    Matched <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded text-[9px]">{matchedList.length}</span>
                                </h3>
                            </div>
                            <div className="overflow-y-auto p-2 space-y-1 flex-1 scrollbar-thin scrollbar-thumb-white/10">
                                {matchedList.map(skill => (
                                    <div key={skill} className="flex items-center justify-between p-3 rounded-lg bg-white/2 border border-white/5 group hover:bg-green-500/5 transition-all">
                                        <span className="text-[10px] font-bold text-slate-300 tracking-tight uppercase">{skill}</span>
                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="bg-[#111111] border-white/5 p-0 overflow-hidden flex flex-col h-full hover:border-red-500/20 transition-colors">
                            <div className="p-4 border-b border-white/5 bg-white/2 shrink-0">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center justify-between">
                                    Improvement <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded text-[9px]">{missingList.length}</span>
                                </h3>
                            </div>
                            <div className="overflow-y-auto p-2 space-y-1 flex-1 scrollbar-thin scrollbar-thumb-white/10">
                                {missingList.map(skill => (
                                    <div key={skill} className="flex items-center justify-between p-3 rounded-lg bg-white/2 border border-white/5 group hover:bg-red-500/5 transition-all">
                                        <span className="text-[10px] font-bold text-slate-300 tracking-tight uppercase">{skill}</span>
                                        <XCircle className="w-3 h-3 text-red-500/40" />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* RIGHT COLUMN: Visualizer + Strategy (Span 7) */}
                <div className="xl:col-span-7 flex flex-col gap-6">
                    {/* Resume Visualizer Card */}
                    <Card className="bg-white border-0 shadow-2xl p-0 overflow-hidden text-slate-900 rounded-xl min-h-[800px] flex flex-col relative">

                        {/* THE SCANNING EFFECT OVERLAY */}
                        {isTransforming && (
                            <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-4 border-slate-200 border-t-primary animate-spin mb-6" />
                                    <Sparkles className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-[0.3em] text-slate-900 animate-pulse grid justify-center">
                                    {viewMode === 'enhanced' ? 'Reverting to Original...' : 'Applying AI Enhancements...'}
                                </h3>
                                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
                                    Scanning keywords & formatting
                                </p>
                                {/* Scan Line Animation */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary/50 shadow-[0_0_20px_rgba(147,51,234,0.5)] animate-[scan_1.5s_ease-in-out_infinite]" />
                            </div>
                        )}

                        {/* Resume Toolbar */}
                        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Live Transformation</h3>
                            </div>

                            <div className="flex bg-slate-200/50 p-1 rounded-lg relative">
                                <button
                                    onClick={() => handleViewToggle('original')}
                                    className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all z-10 ${viewMode === 'original' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Original
                                </button>
                                <button
                                    onClick={() => handleViewToggle('enhanced')}
                                    className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all z-10 flex items-center gap-2 ${viewMode === 'enhanced' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <Sparkles className="w-3 h-3" />
                                    Enhancv
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-hide bg-white p-8 md:p-12 max-h-[800px]">
                            <div ref={resumeRef} className="bg-white text-slate-900 max-w-[210mm] mx-auto min-h-[297mm] relative">
                                {viewMode === 'original' ? (
                                    /* --- ORIGINAL (BASIC) LAYOUT --- */
                                    <div className="font-serif p-8 max-w-3xl mx-auto text-slate-800">
                                        <div className="border-b-2 border-slate-900 pb-6 mb-8 text-center">
                                            <h1 className="text-4xl font-extrabold uppercase mb-3 text-slate-900 tracking-tight">{name}</h1>
                                            <p className="text-lg font-medium text-slate-600 mb-2">{role}</p>
                                            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500 font-bold">
                                                {Object.entries(resumeData.contact_info || {}).map(([key, val]) => (
                                                    <span key={key}>{val}</span>
                                                ))}
                                            </div>
                                        </div>

                                        {resumeData.summary && (
                                            <div className="mb-8">
                                                <h3 className="font-black uppercase border-b-2 border-slate-200 mb-4 text-[11px] tracking-[0.2em] text-slate-400">Professional Summary</h3>
                                                <p className="text-[13px] leading-relaxed text-slate-700">{resumeData.summary}</p>
                                            </div>
                                        )}

                                        <div className="mb-8">
                                            <h3 className="font-black uppercase border-b-2 border-slate-200 mb-6 text-[11px] tracking-[0.2em] text-slate-400">Work History</h3>
                                            <div className="space-y-8">
                                                {resumeData.experience?.map((exp, i) => (
                                                    <div key={i} className="relative pl-4 border-l-2 border-slate-100">
                                                        <div className="flex justify-between items-baseline mb-2">
                                                            <h4 className="font-black text-[14px] text-slate-900">{exp.title}</h4>
                                                            <span className="text-[11px] font-bold text-slate-400">{exp.duration || (exp.years + " years")}</span>
                                                        </div>
                                                        <p className="text-[11px] font-black text-primary uppercase tracking-widest mb-3">{exp.company}</p>
                                                        <p className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-line">{exp.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {(resumeData.skills || []).length > 0 && (
                                            <div className="mb-8">
                                                <h3 className="font-black uppercase border-b-2 border-slate-200 mb-4 text-[11px] tracking-[0.2em] text-slate-400">Technical Competencies</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {resumeData.skills.map((skill, i) => (
                                                        <span key={i} className="px-3 py-1 bg-slate-50 text-slate-600 rounded text-[11px] font-bold border border-slate-100">{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* --- ENHANCED (PREMIUM) LAYOUT --- */
                                    <div className="animate-in fade-in duration-700 p-8">
                                        <div className="flex justify-between items-start mb-12">
                                            <div className="space-y-3">
                                                <h1 className="text-[40px] font-black text-slate-900 leading-none tracking-tight uppercase tracking-tighter">{name}</h1>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-[2px] w-8 bg-primary" />
                                                    <p className="text-[13px] font-black uppercase tracking-[0.3em] text-primary">
                                                        {role}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-4 mt-6 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
                                                    {Object.entries(resumeData.contact_info || {}).map(([key, val]) => (
                                                        <span key={key} className="flex items-center gap-2">
                                                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                            {val}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-2xl bg-gradient-to-br from-primary to-purple-600 rotate-3 hover:rotate-0 transition-transform duration-500">
                                                {name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-12">
                                            <div className="col-span-8 space-y-12">
                                                <section>
                                                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mb-6 border-l-4 border-primary pl-4">Professional Narrative</h2>
                                                    <p className="text-[13px] leading-relaxed text-slate-700 font-bold text-justify">
                                                        {enhancedSummary}
                                                    </p>
                                                </section>

                                                <section>
                                                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mb-8 border-l-4 border-primary pl-4">Strategic Experience</h2>
                                                    <div className="space-y-10">
                                                        {resumeData.experience?.map((exp, i) => (
                                                            <div key={i} className="group">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <h3 className="font-black text-slate-900 text-[16px] tracking-tight group-hover:text-primary transition-colors">{exp.title}</h3>
                                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-3 py-1 rounded-full border border-slate-100">{exp.duration || (exp.years + " yrs")}</span>
                                                                </div>
                                                                <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">{exp.company}</p>
                                                                <p className="text-[12px] text-slate-600 whitespace-pre-line leading-[1.8] font-medium border-l border-slate-100 pl-6 ml-1">
                                                                    {exp.description}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>
                                            </div>

                                            <div className="col-span-4 space-y-12">
                                                <section className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 text-center">Optimized Stack</h2>
                                                    <div className="flex flex-col gap-4">
                                                        {enhancedSkills.slice(0, 18).map((skill, i) => (
                                                            <div key={i} className="flex items-center gap-4 group">
                                                                <div className={`w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125 ${missingList.includes(skill) ? 'bg-primary shadow-[0_0_12px_rgba(147,51,234,0.8)]' : 'bg-slate-300'}`} />
                                                                <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${missingList.includes(skill) ? 'text-primary' : 'text-slate-600'}`}>
                                                                    {skill}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>

                                                {resumeData.education?.length > 0 && (
                                                    <section className="px-2">
                                                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">Education</h2>
                                                        <div className="space-y-6">
                                                            {resumeData.education.map((edu, i) => (
                                                                <div key={i}>
                                                                    <p className="text-[12px] font-black text-slate-900 mb-1">{edu.degree}</p>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{edu.institution}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </section>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`bg-[#0F172A] px-6 py-4 shrink-0 flex items-center justify-between border-t border-white/5 transition-all duration-500 ${viewMode === 'enhanced' ? 'bg-[#2E1065]' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${viewMode === 'enhanced' ? 'bg-primary/20' : 'bg-white/5'}`}>
                                    <Sparkles className={`w-5 h-5 ${viewMode === 'enhanced' ? 'text-primary' : 'text-slate-500'}`} />
                                </div>
                                <div className="text-left hidden md:block">
                                    <p className="text-white text-[11px] font-black uppercase tracking-widest">Apply {missingList.length} Enhancements</p>
                                    <p className="text-slate-400 text-[9px] font-bold mt-0.5 tracking-wide">Ready for download.</p>
                                </div>
                            </div>
                            <Button
                                onClick={handleDownload}
                                className="px-8 py-3 bg-primary hover:bg-primary-dark text-[10px] font-black uppercase tracking-widest flex items-center gap-2 h-10 shadow-lg shadow-primary/20"
                            >
                                {isExporting ? <span className="animate-pulse">Generating PDF...</span> : (
                                    <>
                                        Download PDF <ArrowRight className="w-3 h-3" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>

                    {/* Optimization Suggestions (Under Enhancer) */}
                    <Card className="bg-gradient-to-r from-[#111111] to-[#0a0a0a] border-white/5 p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <Lightbulb className="text-yellow-400 w-4 h-4" />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">AI Suggestions</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { id: 1, text: "Good start: Your profile has potential. Add more industry-specific keywords and quantify achievements.", emoji: "✅" },
                                { id: 2, text: "Skill Gap: Missing critical keywords: availability, responsibilities, pipelines.", emoji: "💡" },
                                { id: 3, text: "Content Depth: Your resume is quite short. Professional resumes are typically 400-600 words.", emoji: "📄" },
                                { id: 4, text: "Format: Ensure you use standard section headers for parsing accuracy.", emoji: "🛠️" }
                            ].map((item) => (
                                <div key={item.id} className="flex gap-4 group p-3 rounded-lg bg-white/2 hover:bg-white/5 transition-colors border border-white/5">
                                    <div className="w-6 h-6 rounded bg-white/5 text-primary flex items-center justify-center shrink-0 font-black text-[10px]">
                                        {item.id}
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-bold leading-relaxed">{item.emoji} {item.text}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Styles for scanning animation */}
            <style>{`
                @keyframes scan {
                    0% { top: 0; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};
