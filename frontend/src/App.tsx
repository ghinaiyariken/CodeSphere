import { useState } from 'react';
import { Navbar } from './layouts/Navbar';
import { Hero } from './components/Hero';
import { InfoSections } from './components/InfoSections';
import { ResumeExamples } from './components/ResumeExamples';
import { Footer } from './layouts/Footer';
import { Dashboard } from './views/Dashboard';
import { CoverLetter } from './views/CoverLetter';
import { ResumeBuilder } from './views/ResumeBuilder';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [view, setView] = useState<'home' | 'cover-letter' | 'builder'>('home');
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>();

  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setView('builder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/30 selection:text-white overflow-x-hidden">
      <Navbar onNavigate={setView} />
      <main>
        <AnimatePresence mode="wait">
          {view === 'cover-letter' ? (
            <motion.div
              key="cover-letter"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CoverLetter />
            </motion.div>
          ) : view === 'builder' ? (
            <motion.div
              key="builder"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ResumeBuilder onBack={() => setView('home')} initialTemplate={selectedTemplate} />
            </motion.div>
          ) : (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Hero onGetStarted={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })} />
              <InfoSections />
              <ResumeExamples onUseTemplate={handleUseTemplate} />
              <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer onNavigate={setView} />
    </div>
  );
}

export default App;
