import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { AnalysisResult } from '../types';
import { motion } from 'motion/react';
import { Trophy, Target, Info, Map } from 'lucide-react';

interface AccentResultsProps {
  result: AnalysisResult;
}

export const AccentResults: React.FC<AccentResultsProps> = ({ result }) => {
  const radarData = Object.entries(result.scores).map(([name, value]) => ({
    subject: name,
    A: value,
    fullMark: 100,
  }));

  // Sort scores for the top matches
  const sortedScores = Object.entries(result.scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const top3 = sortedScores.slice(0, 3);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
      {/* Left Column: Top Match & Profile */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-6"
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-500/20 rounded-2xl">
              <Trophy className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white/60 text-sm font-mono uppercase tracking-widest">Primary Accent Match</h2>
              <h1 className="text-3xl font-bold text-white">{result.topMatch}</h1>
            </div>
            <div className="ml-auto text-right">
              <div className="text-4xl font-black text-emerald-400">{(result.confidence * 100).toFixed(1)}%</div>
              <div className="text-white/40 text-xs font-mono">CONFIDENCE</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
              <h3 className="text-white/80 font-semibold mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                Linguistic Feedback
              </h3>
              <p className="text-white/60 text-sm leading-relaxed italic">
                "{result.feedback}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(result.phoneticAnalysis).map(([key, value]) => (
                <div key={key} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <h4 className="text-white/40 text-[10px] font-mono uppercase mb-1">{key}</h4>
                  <p className="text-white/80 text-xs line-clamp-2">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-xl">
          <h3 className="text-white/80 font-semibold mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Top 3 Accent Profiles
          </h3>
          <div className="space-y-6">
            {top3.map(([name, score], idx) => (
              <div key={name} className="relative">
                <div className="flex justify-between mb-2">
                  <span className="text-white/80 text-sm font-medium">{name}</span>
                  <span className="text-white/60 text-sm font-mono">{score.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: COLORS[idx] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Column: Visualizations */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-6"
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-xl flex-1 min-h-[400px]">
          <h3 className="text-white/80 font-semibold mb-6 flex items-center gap-2">
            <Map className="w-5 h-5 text-emerald-400" />
            Global Accent Radar
          </h3>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Accent Profile"
                  dataKey="A"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-xl">
          <h3 className="text-white/80 font-semibold mb-2">Speech Transcription</h3>
          <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-emerald-400/80 text-sm">
            {result.transcription}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
