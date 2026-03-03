import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Plus, Download, Sparkles,
    ChevronLeft, CheckCircle2, Layout,
    Palette, Search, Save,
    Undo, Redo, Share2, History,
    Heart, Trophy, Rocket, Globe, Star, Quote
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// --- Types ---
interface Experience {
    id: string;
    company: string;
    role: string;
    duration: string;
    location: string;
    description: string;
}

interface Achievement {
    id: string;
    title: string;
    description: string;
}

interface ProudOf {
    id: string;
    text: string;
    icon: string;
}

interface ResumeData {
    name: string;
    role: string;
    contact: { phone: string; email: string; location: string };
    summary: string;
    experiences: Experience[];
    skills: string[];
    achievements?: Achievement[];
    proudOf?: ProudOf[];
    extraInfo: string;
}

// --- Mock Data (Exact Match for Template Image & Industry Examples) ---
const TEMPLATE_CONFIGS: Record<string, ResumeData> = {
    '1': {
        name: 'Taylor Foster',
        role: 'Lead Software Engineer',
        contact: { phone: '+1-555-0812', email: 'taylor.foster@enhancv.com', location: 'Austin, TX' },
        summary: 'Passionate Lead Software Engineer with over 10 years of experience in developing high-performance web applications and robust backend systems. Expert in writing clean, scalable code and leading cross-functional teams to deliver mission-critical software solutions.',
        experiences: [
            {
                id: '1',
                company: 'Blackbaud',
                role: 'Lead Software Engineer',
                duration: '2021 - Present',
                location: 'Austin, TX',
                description: '• Successfully converted a major legacy project from Python 2 to 3.8.0, ensuring zero downtime.\n• Scripted unique test plans and processes, reducing redundancy by 40% and ensuring predictable outcomes.\n• Developed a desktop application to automate database testing, improving efficiency by 65%.\n• Automated usage graph creation, saving $500,000 annually and increasing reporting accuracy.'
            },
            {
                id: '2',
                company: 'Wayfair',
                role: 'Senior Software Engineer',
                duration: '2017 - 2021',
                location: 'Austin, TX',
                description: '• Moved an automation solution into commercial software, generating $60k/year in recurring revenue.\n• Designed and developed reusable software components used in 3+ major projects, reducing development effort by 50%.\n• Re-engineered critical modules to rely on a centralized library, optimizing performance by 68%.\n• Received top annual performance ratings (top 5% of global engineering team).'
            }
        ],
        skills: ['Java', 'C++', 'Python', 'MySQL', 'React', 'Vue.js', 'Node.js', 'AWS', 'Docker', 'Kubernetes'],
        achievements: [
            { id: '1', title: 'Large Scale Project Lead', description: 'Spearheaded a $12M software project from initial architectural design to global distribution.' },
            { id: '2', title: 'Performance Optimization', description: 'Improved query efficiency by 30% by revising two large MySQL databases serving 500k+ users.' }
        ],
        proudOf: [{ id: '1', text: 'Reducing processing time for 100k+ instruments from 16s to <4s through algorithmic redesign.', icon: 'Rocket' }],
        extraInfo: 'Engineered a new data encryption standard during a company-wide security sprint, increasing overall system security by 40%.'
    },
    '2': {
        name: 'Jordan Statistics',
        role: 'Lead Data Scientist',
        contact: { phone: '+1-555-0211', email: 'jordan.stats@insight.com', location: 'Boston, MA' },
        summary: 'Analytical Data Scientist with a PhD in Statistics and 5+ years of experience in machine learning and predictive modeling. Expert at turning complex data into actionable business insights to drive revenue growth and operational efficiency.',
        experiences: [
            {
                id: '1',
                company: 'InsightAnalytics',
                role: 'Lead Data Scientist',
                duration: '2021 - Present',
                location: 'Boston, MA',
                description: '• Developed a churn prediction model with 92% accuracy, helping marketing reduce turnover by 15%.\n• Built an automated recommendation engine that drove a 20% increase in average order value.\n• Managed 50TB+ data lake migration.'
            }
        ],
        skills: ['Python', 'SQL', 'Scikit-Learn', 'TensorFlow', 'PyTorch', 'Tableau', 'Spark', 'NLP', 'A/B Testing'],
        achievements: [
            { id: '1', title: 'Supply Chain Optimization', description: 'Saved $500k annually by optimizing logistics using genetic algorithms.' }
        ],
        proudOf: [{ id: '1', text: 'Ranked in the top 0.1% of data scientists globally on Kaggle.', icon: 'Trophy' }],
        extraInfo: 'Volunteered data analysis for a non-profit focused on climate change awareness.'
    },
    '3': {
        name: 'Lawren Davis',
        role: 'Senior Project Manager (PMP)',
        contact: { phone: '+1-555-2368', email: 'lawren.davis@pm.com', location: 'San Francisco, CA' },
        summary: 'Strategic Project Manager with a "Philosophy First" approach to leadership. Over 10 years of experience delivering complex infrastructure and product launches for Fortune 500 companies.',
        experiences: [
            {
                id: '1',
                company: 'Global Build',
                role: 'Senior Project Manager',
                duration: '2019 - Present',
                location: 'San Francisco, CA',
                description: '• Managed a $25M annual project portfolio with 98% on-time delivery across 12 countries.\n• Improved team productivity by 25% through the implementation of Agile/Scrum hybrid methodologies.\n• Coordinated with 50+ stakeholders to define project scope and mitigate high-level risks.'
            }
        ],
        skills: ['PMP Certified', 'Agile/Scrum', 'Risk Mitigation', 'Budgeting', 'Jira', 'Stakeholder Management'],
        achievements: [
            { id: '1', title: 'Cost Saving Excellence', description: 'Saved $10M in operational costs by optimizing vendor supply chains and logistics.' }
        ],
        proudOf: [
            { id: '1', text: 'Leading a team of 40 developers to launch a global product 3 weeks ahead of schedule.', icon: 'Star' }
        ],
        extraInfo: 'MY LIFE PHILOSOPHY: "Scientists dream about doing great things. Engineers do them." - James A. Michener'
    },
    '4': {
        name: 'Alex Chen',
        role: 'Principal Business Analyst',
        contact: { phone: '+1-555-0322', email: 'alex.chen@strategy.com', location: 'Seattle, WA' },
        summary: 'Business Analyst focused on data-driven transformation. Specialist in bridging technical capabilities with executive business goals to drive 20%+ growth year-over-year.',
        experiences: [
            {
                id: '1',
                company: 'Market Metrics',
                role: 'Principal Analyst',
                duration: '2018 - Present',
                location: 'Seattle, WA',
                description: '• Identified $5M in untapped market opportunities through predictive analytics and gap analysis.\n• Redesigned internal procurement workflows, reducing operational friction by 30%.\n• Lead requirement gathering for enterprise-wide ERP migration.'
            }
        ],
        skills: ['Business Intelligence', 'SQL Expert', 'BPMN', 'Requirements Gathering', 'ERP Systems', 'SAP', 'Tableau'],
        achievements: [
            { id: '1', title: 'Process Revolution', description: 'Re-engineered the global supply chain workflow, saving 40,000 man-hours annually.' }
        ],
        proudOf: [{ id: '1', text: 'Architecting the 5-year digital transformation roadmap for a $500M retail firm.', icon: 'Rocket' }],
        extraInfo: 'CORE STRENGTHS: Analytical Thinking, Relationship Analysis, Data-Driven Insights.'
    },
    '5': {
        name: 'Alexander Croft, CFA',
        role: 'Senior Financial Analyst',
        contact: { phone: '+1-555-0455', email: 'croft.cfa@finance.com', location: 'New York, NY' },
        summary: 'Expert Financial Analyst with a focus on M&A and high-yield portfolio management. Dedicated to precision, valuation accuracy, and strategic capital allocation.',
        experiences: [
            {
                id: '1',
                company: 'Capital Investments',
                role: 'Senior Analyst',
                duration: '2020 - Present',
                location: 'New York, NY',
                description: '• Managed a $1B equity portfolio with a 15% ROI outperforming the S&P 500 by 4%.\n• Led due diligence for 3 major M&A deals totaling $450M.\n• Developed automated financial models that reduced reporting cycles by 4 days.'
            }
        ],
        skills: ['CFA Certified', 'Valuation (DCF)', 'M&A Due Diligence', 'Portfolio Management', 'Bloomberg', 'Excel Mastery'],
        achievements: [
            { id: '1', title: 'M&A Deal of the Year', description: 'Recognized for the valuation accuracy in the $200M acquisition of TechStream.' }
        ],
        proudOf: [{ id: '1', text: 'Achieving 150% ROI on a distressed asset portfolio within 18 months.', icon: 'Trophy' }],
        extraInfo: 'FINANCIAL PHILOSOPHY: Precision in data, boldness in strategy, integrity in reporting.'
    },
    '6': {
        name: 'Sam Ledger, CPA',
        role: 'Accounting Manager',
        contact: { phone: '+1-555-0677', email: 'sam.cpa@ledger.com', location: 'Chicago, IL' },
        summary: 'Certified Public Accountant with 15+ years of experience in corporate audit and tax compliance. Expert in GAAP, IFRS, and internal controls for multinational corporations.',
        experiences: [
            {
                id: '1',
                company: 'Audit Pros LLP',
                role: 'Accounting Manager',
                duration: '2016 - Present',
                location: 'Chicago, IL',
                description: '• Oversaw global tax compliance for 50+ corporate entities ensuring 100% filing accuracy.\n• Identified $1M in tax savings through strategic restructuring of international holdings.\n• Managed 20+ external audits with zero significant findings.'
            }
        ],
        skills: ['CPA Certified', 'GAAP/IFRS', 'Tax Strategy', 'NetSuite', 'Audit Command', 'Internal Controls'],
        achievements: [
            { id: '1', title: 'Perfect Audit Record', description: 'Maintained a 10-year record of zero major audit discrepancies across all client accounts.' }
        ],
        proudOf: [{ id: '1', text: 'Named "Auditor of the Year" by the National Accounting Association in 2022.', icon: 'Trophy' }],
        extraInfo: 'LANGUAGES: English (Native), Mandarin (Professional), Spanish (Conversational).'
    },
    '7': {
        name: 'Jonathan Lee',
        role: 'Executive Creative Director',
        contact: { phone: '+1-555-0788', email: 'jonathan@vivid.design', location: 'New York, NY' },
        summary: 'Award-winning Creative Director with a focus on "Bold Manifestos." Driven by visual storytelling and the intersection of technology and human emotion.',
        experiences: [
            {
                id: '1',
                company: 'Vivid Design Agency',
                role: 'Executive Director',
                duration: '2015 - Present',
                location: 'New York, NY',
                description: '• Led the creative vision for 5 global rebrands including a $10B consumer electronics giant.\n• Managed a diverse team of 30 designers, writers, and art directors.\n• Increased agency revenue by 40% through innovative digital campaign strategies.'
            }
        ],
        skills: ['Brand Strategy', 'Art Direction', 'UI/UX Vision', 'Visual Storytelling', 'Adobe Creative Suite', 'Creative Leadership'],
        achievements: [
            { id: '1', title: 'Grand Prix Lion', description: 'Won the Cannes Grand Prix for the "Human Connection" digital experience campaign.' }
        ],
        proudOf: [{ id: '1', text: 'Creating a viral campaign that achieved 100M+ organic impressions in under 48 hours.', icon: 'Rocket' }],
        extraInfo: 'CREATIVE PHILOSOPHY: "It’s a BOLD MANIFESTO if it changes the way users feel, not just how they look."'
    },
    '8': {
        name: 'Alex Chen',
        role: 'Growth Marketing Manager',
        contact: { phone: '+1-555-0899', email: 'alex.marketing@growth.com', location: 'Austin, TX' },
        summary: 'Results-driven Growth Marketer with a focus on campaign success and brand impact. Specializing in scaling D2C brands from $0 to $10M+ ARR in record time.',
        experiences: [
            {
                id: '1',
                company: 'Growth Labs',
                role: 'Growth Manager',
                duration: '2020 - Present',
                location: 'Austin, TX',
                description: '• Generated 150% increase in lead acquisition via targeted social ads and content funneling.\n• Elevated brand sentiment score by 25% within 6 months.\n• Expanded email subscriber base to 50k+ active users.'
            }
        ],
        skills: ['Digital Strategy', 'SEO/SEM', 'FB/IG Ads Mastery', 'HubSpot', 'Conversion Optimization', 'Brand Impact'],
        achievements: [
            { id: '1', title: 'Viral Growth Milestone', description: 'Scaled a niche beverage brand to #1 on Amazon within its first 3 months of launch.' }
        ],
        proudOf: [{ id: '1', text: 'Developing an influencer strategy that yielded a 5x return on ad spend (ROAS).', icon: 'Star' }],
        extraInfo: 'MARKETING PHILOSOPHY: Measure everything, optimize constantly, and never stop testing.'
    }
};

const IconMap: Record<string, React.ElementType> = {
    'Globe': Globe,
    'Heart': Heart,
    'Trophy': Trophy,
    'Rocket': Rocket,
    'CheckCircle2': CheckCircle2,
    'Star': Star,
    'Quote': Quote
};

// --- Sub-components ---
interface EditableTextProps {
    value: string;
    onChange: (val: string) => void;
    className?: string;
    multiline?: boolean;
    tagName?: React.ElementType;
}

const EditableText = ({
    value,
    onChange,
    className = "",
    multiline = false,
    tagName: Tag = "div"
}: EditableTextProps) => {
    return (
        <Tag
            contentEditable
            suppressContentEditableWarning
            className={`outline-none transition-colors rounded px-1 -mx-1 border-b border-transparent hover:bg-blue-50/30 focus:bg-blue-50 focus:border-blue-400/50 ${className}`}
            onBlur={(e: React.FocusEvent<HTMLElement>) => onChange((e.target as HTMLElement).innerText)}
            onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
                if (!multiline && e.key === 'Enter') {
                    e.preventDefault();
                    (e.target as HTMLElement).blur();
                }
            }}
        >
            {value || ""}
        </Tag>
    );
};

export const ResumeBuilder = ({ onBack, initialTemplate }: { onBack: () => void, initialTemplate?: string }) => {
    const resumeRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [data, setData] = useState(TEMPLATE_CONFIGS[initialTemplate || '1'] || TEMPLATE_CONFIGS['1']);

    useEffect(() => {
        if (initialTemplate && TEMPLATE_CONFIGS[initialTemplate]) {
            setData(TEMPLATE_CONFIGS[initialTemplate]);
        }
    }, [initialTemplate]);

    const handleDownload = async () => {
        if (!resumeRef.current) return;
        setIsDownloading(true);
        try {
            const canvas = await html2canvas(resumeRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
            });
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
            pdf.save(`${data.name.replace(/\s+/g, '_')}_Resume.pdf`);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F7F9] flex overflow-hidden pt-16">
            {/* Sidebar Toolbar */}
            <div className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col py-8 px-4 z-20 overflow-y-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-12 w-full px-2"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden md:inline font-bold uppercase text-xs tracking-wider">Back to Templates</span>
                </button>

                <div className="space-y-1 w-full text-left">
                    {[
                        { id: 'add', label: 'Add section', icon: Plus },
                        { id: 'rearrange', label: 'Rearrange', icon: Layout },
                        { id: 'templates', label: 'Templates', icon: Search },
                        { id: 'design', label: 'Design & Font', icon: Palette },
                    ].map((item) => (
                        <button
                            key={item.id}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-600 transition-all font-semibold text-sm"
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="hidden md:inline">{item.label}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 w-full space-y-1">
                    {[
                        { id: 'improve', label: 'Improve text', icon: Sparkles, badge: 6, color: 'text-primary' },
                        { id: 'check', label: 'ATS Check', icon: Search },
                    ].map((item) => (
                        <button
                            key={item.id}
                            className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all font-semibold text-sm ${item.color || 'text-slate-600'}`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-5 h-5" />
                                <span className="hidden md:inline">{item.label}</span>
                            </div>
                            {item.badge && (
                                <span className="hidden md:flex w-5 h-5 bg-red-500 text-white text-[10px] rounded-full items-center justify-center">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="mt-auto pt-8 w-full space-y-3">
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="w-full bg-primary hover:bg-primary-dark text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 transition-all text-sm uppercase tracking-widest"
                    >
                        {isDownloading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Download className="w-5 h-5" />}
                        <span className="hidden md:inline">{isDownloading ? 'Exporting...' : 'Download PDF'}</span>
                    </button>
                    <div className="flex items-center gap-2 text-slate-400 px-2 cursor-pointer transition-colors hover:text-slate-900 group">
                        <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="hidden md:inline text-[10px] font-bold uppercase tracking-wider">Share Design</span>
                    </div>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-y-auto bg-[#F5F7F9] p-4 md:p-12 flex flex-col items-center">
                {/* Visual Guide Header */}
                <div className="max-w-[210mm] w-full mb-6 flex items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                            <button title="Undo" className="p-2 hover:bg-slate-50 rounded text-slate-500 transition-colors"><Undo className="w-4 h-4" /></button>
                            <button title="Redo" className="p-2 hover:bg-slate-50 rounded text-slate-500 transition-colors"><Redo className="w-4 h-4" /></button>
                            <div className="w-px h-4 bg-slate-200 mx-1" />
                            <button className="p-2 hover:bg-slate-50 rounded text-slate-500 transition-colors flex items-center gap-2 px-3">
                                <Save className="w-4 h-4 text-green-500" />
                                <span className="text-xs font-bold uppercase tracking-widest leading-none">Draft Saved</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Preview
                        </span>
                        <div className="w-px h-4 bg-slate-200 mx-2" />
                        <div className="flex items-center gap-2 text-slate-400 cursor-help">
                            <History className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-tighter">History</span>
                        </div>
                    </div>
                </div>

                {/* --- The Resume Canvas --- */}
                <div
                    ref={resumeRef}
                    className="bg-white shadow-[0_0_80px_rgba(0,0,0,0.08)] relative overflow-hidden flex flex-col text-slate-900"
                    style={{ width: '210mm', minHeight: '297mm', padding: '15mm 20mm' }}
                >
                    {/* Header */}
                    <header className="mb-10 text-left">
                        <EditableText
                            tagName="h1"
                            className="text-[34px] font-bold text-slate-900 tracking-tight leading-tight mb-1"
                            value={data.name}
                            onChange={(v: string) => setData({ ...data, name: v })}
                        />
                        <EditableText
                            className="text-[14px] font-medium text-blue-600 mb-6"
                            value={data.role}
                            onChange={(v: string) => setData({ ...data, role: v })}
                        />
                        <div className="flex items-center gap-6 text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">
                            <div className="flex items-center gap-2">
                                <span className="opacity-70">📞</span>
                                <EditableText value={data.contact.phone} onChange={(v: string) => setData({ ...data, contact: { ...data.contact, phone: v } })} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="opacity-70">✉️</span>
                                <EditableText value={data.contact.email} onChange={(v: string) => setData({ ...data, contact: { ...data.contact, email: v } })} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="opacity-70">📍</span>
                                <EditableText value={data.contact.location} onChange={(v: string) => setData({ ...data, contact: { ...data.contact, location: v } })} />
                            </div>
                        </div>
                    </header>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-12 gap-12 flex-1">
                        {/* LEFT COLUMN */}
                        <div className="col-span-8 space-y-12">
                            <section className="text-left">
                                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-4 border-b border-slate-100 pb-2">Summary</h2>
                                <EditableText
                                    multiline
                                    className="text-[11px] leading-relaxed text-slate-800 text-justify bg-slate-50/50 p-3 rounded-lg border-l-4 border-blue-500/30"
                                    value={data.summary}
                                    onChange={(v: string) => setData({ ...data, summary: v })}
                                />
                            </section>

                            <section className="text-left">
                                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-6 border-b border-slate-100 pb-2">Professional Experience</h2>
                                <div className="space-y-10">
                                    {data.experiences.map((ex: Experience, idx: number) => (
                                        <div key={ex.id} className="relative group/exp">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <EditableText
                                                    className="font-bold text-slate-900 text-[14px]"
                                                    value={ex.role}
                                                    onChange={(v: string) => {
                                                        const n = [...data.experiences]; n[idx].role = v; setData({ ...data, experiences: n });
                                                    }}
                                                />
                                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold whitespace-nowrap">
                                                    📅 <EditableText value={ex.duration} onChange={(v: string) => {
                                                        const n = [...data.experiences]; n[idx].duration = v; setData({ ...data, experiences: n });
                                                    }} />
                                                    📍 <EditableText value={ex.location} onChange={(v: string) => {
                                                        const n = [...data.experiences]; n[idx].location = v; setData({ ...data, experiences: n });
                                                    }} />
                                                </div>
                                            </div>
                                            <div className="mb-3 text-left">
                                                <EditableText
                                                    className="text-[12px] font-extrabold text-blue-600 uppercase tracking-widest"
                                                    value={ex.company}
                                                    onChange={(v: string) => {
                                                        const n = [...data.experiences]; n[idx].company = v; setData({ ...data, experiences: n });
                                                    }}
                                                />
                                            </div>
                                            <EditableText
                                                multiline
                                                className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-line text-justify"
                                                value={ex.description}
                                                onChange={(v: string) => {
                                                    const n = [...data.experiences]; n[idx].description = v; setData({ ...data, experiences: n });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="col-span-4 space-y-12">
                            <section className="text-left">
                                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-4 border-b border-slate-100 pb-2">Core Competencies</h2>
                                <div className="flex flex-wrap gap-2 text-left">
                                    {data.skills.map((skill: string, sIdx: number) => (
                                        <EditableText
                                            key={sIdx}
                                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-800 shadow-sm hover:border-blue-400 transition-colors"
                                            value={skill}
                                            onChange={(v: string) => {
                                                const s = [...data.skills]; s[sIdx] = v; setData({ ...data, skills: s });
                                            }}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section className="text-left">
                                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-4 border-b border-slate-100 pb-2">Achievements</h2>
                                <div className="space-y-6">
                                    {data.achievements?.map((ach: Achievement, aIdx: number) => (
                                        <div key={ach.id} className="text-left">
                                            <EditableText
                                                className="block font-bold text-slate-900 text-[11px] mb-1 leading-tight"
                                                value={ach.title}
                                                onChange={(v: string) => {
                                                    const a = [...(data.achievements || [])]; a[aIdx].title = v; setData({ ...data, achievements: a });
                                                }}
                                            />
                                            <EditableText
                                                multiline
                                                className="text-[10px] text-slate-500 leading-relaxed"
                                                value={ach.description}
                                                onChange={(v: string) => {
                                                    const a = [...(data.achievements || [])]; a[aIdx].description = v; setData({ ...data, achievements: a });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="text-left">
                                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-4 border-b border-slate-100 pb-2">Impact & Proud Of</h2>
                                {data.proudOf?.map((p: ProudOf, pIdx: number) => {
                                    const IconNode = IconMap[p.icon] || Globe;
                                    return (
                                        <div key={p.id} className="flex gap-3 mb-6 text-left group/item">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover/item:bg-blue-100 transition-colors duration-300">
                                                <IconNode className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <EditableText
                                                multiline
                                                className="text-[10px] font-bold text-slate-800 leading-tight"
                                                value={p.text}
                                                onChange={(v: string) => {
                                                    const pr = [...(data.proudOf || [])]; pr[pIdx].text = v; setData({ ...data, proudOf: pr });
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </section>

                            <section className="bg-blue-600/5 p-4 rounded-xl border-l-4 border-blue-600 text-left">
                                <EditableText
                                    multiline
                                    className="text-[10px] font-bold text-slate-900 leading-relaxed italic"
                                    value={data.extraInfo}
                                    onChange={(v: string) => setData({ ...data, extraInfo: v })}
                                />
                            </section>
                        </div>
                    </div>

                    <div className="mt-12 pt-4 border-t border-slate-100 flex items-center justify-between opacity-30">
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                            {data.name} // Resumee Design
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-slate-900" />
                            <span className="text-[7px] font-black tracking-[0.3em] uppercase text-slate-900">Verified by ResumeAI</span>
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-12 right-12 flex flex-col items-end gap-3 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="bg-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-4 rounded-3xl border border-blue-100 text-slate-800 flex items-center gap-4 px-6 shadow-blue-500/10"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-bold tracking-tight text-slate-900">
                                Template Optimized
                            </p>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                Click any section to edit
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
