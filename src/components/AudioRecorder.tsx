import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { analyzeAccent } from '../services/accentService';

interface AudioRecorderProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (result: any) => void;
  onError: (error: string) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAnalysisStart, onAnalysisComplete, onError }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        await handleAudioUpload(audioBlob, mediaRecorder.mimeType);
        stream.getTracks().forEach(track => track.stop());
      };

      // Visualizer setup
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      drawWaveform();

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      onError("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(1, '#3b82f6');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    draw();
  };

  const handleAudioUpload = async (blob: Blob, mimeType: string) => {
    setIsAnalyzing(true);
    onAnalysisStart();
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        try {
          const result = await analyzeAccent(base64Audio, mimeType);
          onAnalysisComplete(result);
        } catch (err: any) {
          onError(err.message);
        } finally {
          setIsAnalyzing(false);
        }
      };
    } catch (err: any) {
      onError(err.message);
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
      <div className="relative mb-8">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={100} 
          className="w-full max-w-md h-24 rounded-lg bg-black/20"
        />
        {!isRecording && !isAnalyzing && (
          <div className="absolute inset-0 flex items-center justify-center text-white/40 font-mono text-sm">
            READY TO RECORD
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-4">
        <AnimatePresence mode="wait">
          {!isRecording ? (
            <motion.button
              key="start"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={startRecording}
              disabled={isAnalyzing}
              className={`group relative flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isAnalyzing ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <Mic className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
              )}
            </motion.button>
          ) : (
            <motion.button
              key="stop"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={stopRecording}
              className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-red-500 hover:bg-red-400 transition-all shadow-[0_0_30px_rgba(239,68,68,0.3)]"
            >
              <Square className="w-8 h-8 text-white fill-current" />
              <div className="absolute -top-12 bg-black/50 px-3 py-1 rounded-full text-white text-xs font-mono">
                {formatTime(recordingTime)}
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        <p className="text-white/60 text-sm font-medium">
          {isRecording ? "Recording... Click to stop" : isAnalyzing ? "Analyzing Phonetics..." : "Tap to analyze your accent"}
        </p>
      </div>
    </div>
  );
};
