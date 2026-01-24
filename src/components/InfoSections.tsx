import { motion } from 'framer-motion';
import { Shield, Zap, Search, Target, FileCheck } from 'lucide-react';

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`p-8 glass rounded-2xl border border-white/10 hover:border-primary/50 transition-all duration-300 group ${className}`}>
        {children}
    </div>
);

export const InfoSections = () => {
    return (
        <div className="space-y-32 py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

            {/* Features Section */}
            <section id="features" className="scroll-mt-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">Powerful Features</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Everything you need to bypass applicant tracking systems and land more interviews.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <Card>
                        <Zap className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-bold text-white mb-3">AI Keyword Extraction</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Our AI automatically identifies high-value keywords from job descriptions that recruiters are looking for.
                        </p>
                    </Card>
                    <Card>
                        <Target className="w-12 h-12 text-secondary mb-6 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-bold text-white mb-3">Compatibility Scoring</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Get an instant ATS score out of 100 based on how well your resume matches the job requirements.
                        </p>
                    </Card>
                    <Card>
                        <Search className="w-12 h-12 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-bold text-white mb-3">Missing Skill Detection</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Detailed list of skills and certifications missing from your resume compared to the job posting.
                        </p>
                    </Card>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="scroll-mt-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">How It Works</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">Optimize your resume in three simple steps.</p>
                </div>
                <div className="relative">
                    {/* Connecting line for desktop */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent hidden lg:block -z-10" />

                    <div className="grid lg:grid-cols-3 gap-12">
                        {[
                            { step: "01", title: "Upload Resume", desc: "Upload your PDF, Word, or TXT file to our secure analyzer.", icon: FileCheck },
                            { step: "02", title: "Give Job Description", desc: "Provide the job description you're targeting for a tailored analysis.", icon: Search },
                            { step: "03", title: "Get Results", desc: "Receive a detailed breakdown of your ATS score and optimization tips.", icon: Shield },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="flex flex-col items-center text-center p-8 glass rounded-2xl border border-white/5 bg-white/[0.02]"
                            >
                                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                                    <item.icon className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-primary font-bold text-sm mb-2">STEP {item.step}</div>
                                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-slate-400 text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


        </div>
    );
};
