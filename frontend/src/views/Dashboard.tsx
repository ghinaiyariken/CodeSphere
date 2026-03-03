import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadZone } from '../components/UploadZone';
import { JobInput } from '../components/JobInput';
import { Button } from '../components/Button';
import { ResultsDashboard } from '../components/ResultsDashboard';
import { Loader2, Sparkles } from 'lucide-react';

interface AnalysisResult {
    score: number;
    matched_keywords: string[];
    missing_keywords: string[];
    total_keywords: number;
    suggestions: string[];
}

export const Dashboard = () => {
    const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [jdFile, setJdFile] = useState<File | null>(null);
    const [results, setResults] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!file || (!jobDescription && !jdFile)) return;
        setStep('analyzing');
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        if (jdFile) {
            formData.append('jd_file', jdFile);
        } else {
            formData.append('job_description', jobDescription);
        }

        try {
            // Use relative path to leverage Vite proxy
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Analysis failed' }));
                throw new Error(errorData.detail || 'Analysis failed');
            }

            const data = await response.json();
            if (data.success) {
                setResults(data.data);
                setStep('results');
            } else {
                throw new Error('Failed to parse results');
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "An error occurred during analysis.";
            if (errorMessage === 'Failed to fetch') {
                setError("Cannot connect to server. Is the backend running?");
            } else {
                setError(errorMessage);
            }
            setStep('upload');
        }
    };

    const handleReset = () => {
        setFile(null);
        setJobDescription('');
        setJdFile(null);
        setResults(null);
        setStep('upload');
    };

    return (
        <section id="dashboard" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary inline-block mb-4">
                    ATS Analyzer
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Upload your resume (PDF/DOCX) and the job description to get instant feedback.
                </p>
                {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg inline-block">
                        {error}
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {step === 'upload' && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid lg:grid-cols-2 gap-8 items-stretch"
                    >
                        <div className="space-y-6">
                            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                <UploadZone onFileSelect={setFile} />
                            </div>
                        </div>

                        <div className="space-y-6 flex flex-col">
                            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex-1">
                                <JobInput
                                    textValue={jobDescription}
                                    onTextChange={setJobDescription}
                                    fileValue={jdFile}
                                    onFileChange={setJdFile}
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-2 flex justify-center mt-4">
                            <Button
                                size="lg"
                                variant="glow"
                                onClick={handleAnalyze}
                                disabled={!file || (!jobDescription && !jdFile)}
                                className="w-full md:w-1/3"
                            >
                                <Sparkles className="w-5 h-5 mr-2" />
                                Analyze Match
                            </Button>
                        </div>
                    </motion.div>
                )}

                {step === 'analyzing' && (
                    <motion.div
                        key="analyzing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                            <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
                        </div>
                        <h3 className="mt-8 text-2xl font-bold text-white">Analyzing Resume...</h3>
                        <p className="text-slate-400 mt-2">Checking ATS compatibility and keywords</p>
                    </motion.div>
                )}

                {step === 'results' && results && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <ResultsDashboard onReset={handleReset} data={results} />
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
