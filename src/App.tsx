import React, { useState } from 'react';
import { AudioRecorder } from './components/AudioRecorder';
import { AccentResults } from './components/AccentResults';
import { ImprovementPlan } from './components/ImprovementPlan';
import { AnalysisResult } from './types';
import { Globe, Shield, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export default function App() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysis(result);
    setIsAnalyzing(false);
    if (result.confidence > 0.7) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6']
      });
    }
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center">
        {/* Header */}
        <header className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-mono tracking-widest uppercase mb-6"
          >
            <Globe className="w-3 h-3" />
            Global Intelligence Engine v2.5
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent"
          >
            GLOBAL ACCENT <br /> ORACLE ULTRA
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 max-w-xl mx-auto text-lg"
          >
            Real-time phonetic intelligence for global English variations. 
            Analyze, compare, and master any accent with AI.
          </motion.p>
        </header>

        {/* Main Interface */}
        <div className="w-full max-w-4xl space-y-12">
          <section className="flex flex-col items-center">
            <AudioRecorder 
              onAnalysisStart={handleAnalysisStart}
              onAnalysisComplete={handleAnalysisComplete}
              onError={setError}
            />
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <AnimatePresence mode="wait">
            {analysis && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <div className="flex items-center justify-center gap-8 py-4 border-y border-white/5">
                  <div className="flex items-center gap-2 text-white/40 text-[10px] font-mono uppercase tracking-tighter">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    Secure Analysis
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-[10px] font-mono uppercase tracking-tighter">
                    <Zap className="w-3 h-3 text-blue-400" />
                    Low Latency
                  </div>
                </div>

                <AccentResults result={analysis} />
                
                <ImprovementPlan 
                  topMatch={analysis.topMatch}
                  phoneticAnalysis={analysis.phoneticAnalysis}
                  transcription={analysis.transcription}
                  scores={analysis.scores}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-white/5 w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-8 text-white/20 text-xs font-mono">
          <div>© 2026 GLOBAL ACCENT ORACLE ULTRA. ALL RIGHTS RESERVED.</div>
          <div className="flex gap-8">
            <span className="hover:text-white/40 cursor-pointer transition-colors">PRIVACY</span>
            <span className="hover:text-white/40 cursor-pointer transition-colors">LIGUISTIC DATABASE</span>
            <span className="hover:text-white/40 cursor-pointer transition-colors">API ACCESS</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
