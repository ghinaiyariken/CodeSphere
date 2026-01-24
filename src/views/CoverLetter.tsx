import { useState, useRef } from 'react';
import { Button } from '../components/Button';
import { Sparkles, Download, Copy, Check, FileText, Upload, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';

export const CoverLetter = () => {
    const [resumeText, setResumeText] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [jdFile, setJdFile] = useState<File | null>(null);
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const resumeInputRef = useRef<HTMLInputElement>(null);
    const jdInputRef = useRef<HTMLInputElement>(null);

    const handleGenerate = async () => {
        if ((!resumeText && !resumeFile) || (!jobDescription && !jdFile)) return;
        setIsGenerating(true);

        const formData = new FormData();
        if (resumeFile) formData.append('resume_file', resumeFile);
        else formData.append('resume_text', resumeText);

        if (jdFile) formData.append('jd_file', jdFile);
        else formData.append('job_description', jobDescription);

        try {
            const response = await fetch('/api/generate-cover-letter', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                setGeneratedLetter(data.cover_letter);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLetter);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([generatedLetter], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "cover_letter.txt";
        document.body.appendChild(element);
        element.click();
    };

    return (
        <section id="cover-letter" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary inline-block mb-4">
                    Smart Cover Letter
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Generate a tailored cover letter in seconds based on your resume and the job description.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                    <Card className="p-6 space-y-6">
                        {/* Resume Block */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-300">Resume Content</label>
                                <button
                                    onClick={() => resumeInputRef.current?.click()}
                                    className="text-xs text-primary hover:text-primary/70 flex items-center gap-1 transition-colors"
                                >
                                    <Upload className="w-3 h-3" /> {resumeFile ? 'Change File' : 'Upload PDF'}
                                </button>
                                <input type="file" ref={resumeInputRef} className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
                            </div>
                            {resumeFile ? (
                                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-slate-300">
                                        <FileText className="w-4 h-4 text-primary" />
                                        <span className="truncate max-w-[200px]">{resumeFile.name}</span>
                                    </div>
                                    <button onClick={() => setResumeFile(null)} className="text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <textarea
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    placeholder="Paste your full resume text here..."
                                    className="w-full h-40 p-4 bg-black/20 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                                />
                            )}
                        </div>

                        {/* JD Block */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-300">Job Description</label>
                                <button
                                    onClick={() => jdInputRef.current?.click()}
                                    className="text-xs text-primary hover:text-primary/70 flex items-center gap-1 transition-colors"
                                >
                                    <Upload className="w-3 h-3" /> {jdFile ? 'Change File' : 'Upload PDF'}
                                </button>
                                <input type="file" ref={jdInputRef} className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={(e) => setJdFile(e.target.files?.[0] || null)} />
                            </div>
                            {jdFile ? (
                                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-slate-300">
                                        <FileText className="w-4 h-4 text-primary" />
                                        <span className="truncate max-w-[200px]">{jdFile.name}</span>
                                    </div>
                                    <button onClick={() => setJdFile(null)} className="text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste the job description here..."
                                    className="w-full h-40 p-4 bg-black/20 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                                />
                            )}
                        </div>

                        <Button
                            variant="glow"
                            className="w-full h-12"
                            onClick={handleGenerate}
                            disabled={((!resumeText && !resumeFile) || (!jobDescription && !jdFile)) || isGenerating}
                        >
                            {isGenerating ? (
                                <span className="flex items-center gap-2">
                                    <Sparkles className="animate-spin w-5 h-5" /> Generating...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" /> Generate Cover Letter
                                </span>
                            )}
                        </Button>
                    </Card>
                </div>

                {/* Output */}
                <div className="h-full min-h-[500px]">
                    <Card className="h-full flex flex-col p-6 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Generated Letter
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopy}
                                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                    title="Copy to Clipboard"
                                >
                                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                    title="Download Text"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {generatedLetter ? (
                            <textarea
                                value={generatedLetter}
                                onChange={(e) => setGeneratedLetter(e.target.value)}
                                className="flex-1 w-full bg-transparent border-0 text-slate-300 focus:ring-0 resize-none leading-relaxed whitespace-pre-wrap font-serif text-lg"
                            />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                                <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                                <p>Your tailored cover letter will appear here.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </section>
    );
};
