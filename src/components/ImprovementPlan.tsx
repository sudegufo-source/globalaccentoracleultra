import React, { useState } from 'react';
import { Goal, ImprovementPlan as PlanType } from '../types';
import { generateImprovementPlan } from '../services/accentService';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, GraduationCap, Briefcase, Gamepad2, Headphones, Users, Loader2, FileText, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';

interface ImprovementPlanProps {
  topMatch: string;
  phoneticAnalysis: any;
  transcription: string;
  scores: any;
}

const goals: { id: Goal; label: string; icon: any }[] = [
  { id: 'Student', label: 'Academic / Student', icon: GraduationCap },
  { id: 'Call Center', label: 'Customer Support', icon: Headphones },
  { id: 'Business Communication', label: 'Corporate / Business', icon: Briefcase },
  { id: 'Gaming / Streaming', label: 'Gaming / Content Creation', icon: Gamepad2 },
  { id: 'Online Teaching', label: 'Education / Teaching', icon: Users },
];

export const ImprovementPlan: React.FC<ImprovementPlanProps> = ({ topMatch, phoneticAnalysis, transcription, scores }) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [plan, setPlan] = useState<PlanType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePlan = async (goal: Goal) => {
    setSelectedGoal(goal);
    setIsLoading(true);
    try {
      const result = await generateImprovementPlan(goal, topMatch, phoneticAnalysis);
      setPlan(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!plan) return;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("Global Accent Oracle Ultra - Report", 20, 20);
    
    doc.setFontSize(14);
    doc.text(`Current Accent Match: ${topMatch}`, 20, 40);
    doc.text(`Goal: ${selectedGoal}`, 20, 50);
    
    doc.setFontSize(12);
    doc.text("Analysis Summary:", 20, 70);
    doc.text(`Transcription: ${transcription}`, 20, 80, { maxWidth: 170 });
    
    doc.addPage();
    doc.text("Improvement Plan:", 20, 20);
    const splitText = doc.splitTextToSize(plan.plan, 170);
    doc.text(splitText, 20, 30);
    
    doc.save("accent-profile-report.pdf");
  };

  return (
    <div className="w-full max-w-6xl mt-12">
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Improve Your Accent</h2>
        </div>

        {!plan && !isLoading && (
          <div className="space-y-6">
            <p className="text-white/60">Select your professional goal to generate a personalized training plan:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleGeneratePlan(goal.id)}
                  className="flex flex-col items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <goal.icon className="w-8 h-8 text-white/40 group-hover:text-emerald-400 transition-colors" />
                  <span className="text-xs font-medium text-white/60 text-center group-hover:text-white">{goal.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
            <p className="text-white/60 font-mono animate-pulse">CRAFTING PERSONALIZED CURRICULUM...</p>
          </div>
        )}

        <AnimatePresence>
          {plan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400">
                  <FileText className="w-5 h-5" />
                  <span className="font-mono text-sm uppercase tracking-widest">Training Plan Generated</span>
                </div>
                <button 
                  onClick={downloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download PDF Report
                </button>
              </div>

              <div className="prose prose-invert max-w-none bg-black/20 p-8 rounded-2xl border border-white/5">
                <ReactMarkdown>{plan.plan}</ReactMarkdown>
              </div>

              <button 
                onClick={() => { setPlan(null); setSelectedGoal(null); }}
                className="text-white/40 hover:text-white text-sm underline underline-offset-4 transition-colors"
              >
                Choose a different goal
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
