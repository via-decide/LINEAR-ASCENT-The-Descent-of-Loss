/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Zap, 
  Activity, 
  Target, 
  RefreshCw, 
  Play, 
  AlertTriangle, 
  CheckCircle2,
  ChevronRight,
  Settings2,
  Info,
  Save,
  HelpCircle,
  X,
  Volume2,
  VolumeX,
  Sliders
} from 'lucide-react';

// --- Types ---

interface Level {
  id: number;
  name: string;
  targetValue: number;
  maxSteps: number;
  tolerance: number;
  landscapeFn: (x: number) => number;
  description: string;
}

interface TutorialStep {
  title: string;
  content: string;
  targetId?: string;
}

// --- Constants ---

const LEVELS: Level[] = [
  {
    id: 1,
    name: "Neuron Alpha: Initial Activation",
    targetValue: 100,
    maxSteps: 10,
    tolerance: 2,
    landscapeFn: (x) => x, // Linear
    description: "The simplest path. Find the pulse that reaches exactly 100 in 10 steps or less."
  },
  {
    id: 2,
    name: "Neuron Beta: The Shallow Valley",
    targetValue: 250,
    maxSteps: 15,
    tolerance: 5,
    landscapeFn: (x) => x * 1.2, // Slightly steeper
    description: "The ground is shifting. Your pulse must be more precise to hit the target voltage."
  },
  {
    id: 3,
    name: "Neuron Gamma: Stochastic Noise",
    targetValue: 500,
    maxSteps: 12,
    tolerance: 10,
    landscapeFn: (x) => x + Math.sin(x / 20) * 30, // Wavy
    description: "The landscape is non-linear. Local minima are everywhere. Navigate the waves."
  },
  {
    id: 4,
    name: "Neuron Delta: The Deep Abyss",
    targetValue: 1000,
    maxSteps: 8,
    tolerance: 15,
    landscapeFn: (x) => (x * x) / 100, // Parabolic
    description: "Exponential growth. A small change in pulse leads to massive leaps. Beware the Exploding Gradient."
  },
  {
    id: 5,
    name: "Neuron Epsilon: The Adaptive Frontier",
    targetValue: 2000,
    maxSteps: 20,
    tolerance: 20,
    landscapeFn: (x) => (x * x * x) / 100000, // Cubic
    description: "The landscape is extremely steep. A fixed pulse will almost certainly explode. Use the Adaptive Pulse to survive."
  }
];

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Neural Architect Induction",
    content: "Welcome, Architect. You are inside a dormant Neural Network. The system has collapsed into Stochastic Chaos. Your mission is to achieve Convergent Harmony."
  },
  {
    title: "The Target Valley",
    content: "The green line in the visualizer is your Target Voltage. You must reach this valley within the specified tolerance to activate the neuron.",
    targetId: "visualizer"
  },
  {
    title: "Initial Bias (a)",
    content: "The Origin (a) is your Initial Bias. It determines where your hypothesis begins in the vast unknown. Start too high, and you're lost in complexity.",
    targetId: "bias-control"
  },
  {
    title: "Learning Rate (d)",
    content: "The Pulse (d) is your Learning Rate. This is the size of each logical step. Small pulses vanish; large pulses explode.",
    targetId: "pulse-control"
  },
  {
    title: "Initiate Descent",
    content: "Once your parameters are set, initiate the descent. Watch the signal carefully. If you overshoot, you crash. If you're too slow, you vanish.",
    targetId: "initiate-btn"
  }
];

// --- Components ---

const LossLandscape = ({ 
  steps, 
  target, 
  tolerance, 
  landscapeFn,
  isSimulating 
}: { 
  steps: number[], 
  target: number, 
  tolerance: number,
  landscapeFn: (x: number) => number,
  isSimulating: boolean
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw Target Line
    const targetY = height - (target / 1200) * height;
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, targetY);
    ctx.lineTo(width, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Tolerance Zone
    ctx.fillStyle = 'rgba(0, 255, 0, 0.05)';
    const tolH = (tolerance / 1200) * height * 2;
    ctx.fillRect(0, targetY - tolH / 2, width, tolH);

    // Draw Landscape
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
      const val = landscapeFn(x * 2); // Scale x for function
      const y = height - (val / 1200) * height;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw Steps (The Bridge of Logic)
    if (steps.length > 0) {
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      steps.forEach((val, i) => {
        const x = (i / 15) * width; // Max 15 steps visually
        const y = height - (val / 1200) * height;
        
        // Draw point
        ctx.fillStyle = i === steps.length - 1 ? '#00ff00' : '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw connection
        if (i > 0) {
          const prevX = ((i - 1) / 15) * width;
          const prevY = height - (steps[i - 1] / 1200) * height;
          
          const gradient = ctx.createLinearGradient(prevX, prevY, x, y);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
          gradient.addColorStop(1, '#00ff00');
          ctx.strokeStyle = gradient;
          
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      });
    }

  }, [steps, target, tolerance, landscapeFn, isSimulating]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-64 bg-[#0a0a0a] border border-white/10 rounded-lg"
      style={{ touchAction: 'none' }}
    />
  );
};

export default function App() {
  const STORAGE_KEY = 'linear_ascent_progress';

  const [currentLevelIdx, setCurrentLevelIdx] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return typeof data.currentLevelIdx === 'number' ? data.currentLevelIdx : 0;
      } catch (e) { return 0; }
    }
    return 0;
  });

  const [a, setA] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return typeof data.a === 'number' ? data.a : 0;
      } catch (e) { return 0; }
    }
    return 0;
  });

  const [d, setD] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return typeof data.d === 'number' ? data.d : 10;
      } catch (e) { return 10; }
    }
    return 10;
  });

  const [steps, setSteps] = useState<number[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [gameState, setGameState] = useState<'idle' | 'success' | 'fail'>('idle');
  const [message, setMessage] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [volume, setVolume] = useState(80);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isAdaptive, setIsAdaptive] = useState(false);

  // Save progress on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentLevelIdx,
      a,
      d
    }));
  }, [currentLevelIdx, a, d]);

  const currentLevel = LEVELS[currentLevelIdx];

  const runSimulation = () => {
    setIsSimulating(true);
    setGameState('idle');
    setMessage('Simulating Stochastic Descent...');
    
    let currentSteps: number[] = [a];
    let i = 0;
    
    const interval = setInterval(() => {
      if (i >= currentLevel.maxSteps - 1) {
        clearInterval(interval);
        finalizeSimulation(currentSteps);
        return;
      }

      let currentD = d;
      if (isAdaptive) {
        const x = currentSteps[i];
        const y1 = currentLevel.landscapeFn(x);
        const y2 = currentLevel.landscapeFn(x + 0.1);
        const slope = Math.abs(y2 - y1) / 0.1;
        // Heuristic: d_adaptive = d / (1 + slope / 5)
        // This reduces the step size in steep areas
        currentD = d / (1 + slope / 5);
      }

      const nextVal = currentLevel.landscapeFn(currentSteps[i] + currentD);
      currentSteps.push(nextVal);
      setSteps([...currentSteps]);
      i++;

      // Check for Exploding Gradient (overshoot)
      if (nextVal > currentLevel.targetValue + 200) {
        clearInterval(interval);
        finalizeSimulation(currentSteps, true);
      }
    }, 150);
  };

  const finalizeSimulation = (finalSteps: number[], exploded = false) => {
    setIsSimulating(false);
    const lastVal = finalSteps[finalSteps.length - 1];
    const diff = Math.abs(lastVal - currentLevel.targetValue);

    if (exploded) {
      setGameState('fail');
      setMessage('EXPLODING GRADIENT: System unstable. You overshot the target valley.');
    } else if (diff <= currentLevel.tolerance) {
      setGameState('success');
      setMessage('CONVERGENCE ACHIEVED: Optimal weights found. Neuron firing.');
    } else if (finalSteps.length >= currentLevel.maxSteps) {
      setGameState('fail');
      if (lastVal < currentLevel.targetValue) {
        setMessage('VANISHING GRADIENT: Signal too weak. Failed to reach activation threshold.');
      } else {
        setMessage('LOCAL MINIMUM: Trapped in suboptimal logic. Adjust parameters.');
      }
    }
  };

  const resetLevel = () => {
    setSteps([]);
    setGameState('idle');
    setMessage('');
  };

  const nextLevel = () => {
    if (currentLevelIdx < LEVELS.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
      setA(0);
      setD(10);
      resetLevel();
    }
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const clearProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentLevelIdx(0);
    setA(0);
    setD(10);
    resetLevel();
    setShowResetConfirm(false);
  };

  const saveGame = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentLevelIdx,
      a,
      d
    }));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const startTutorial = () => {
    setTutorialStep(0);
  };

  const nextTutorialStep = () => {
    if (tutorialStep !== null) {
      if (tutorialStep < TUTORIAL_STEPS.length - 1) {
        setTutorialStep(tutorialStep + 1);
      } else {
        setTutorialStep(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono selection:bg-emerald-500/30">
      {/* Settings Overlay */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <Settings2 className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold italic uppercase tracking-tight text-emerald-400">
                  System Configuration
                </h2>
              </div>

              <div className="space-y-8">
                {/* Audio Controls */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                      <span className="text-xs uppercase font-bold tracking-widest">Audio Output</span>
                    </div>
                    <button 
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${soundEnabled ? 'bg-emerald-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${soundEnabled ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase text-white/40">
                      <span>Volume Level</span>
                      <span>{volume}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      disabled={!soundEnabled}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-20"
                    />
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                {/* Tutorial Reset */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs uppercase font-bold tracking-widest">Induction Protocol</span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsSettingsOpen(false);
                      startTutorial();
                    }}
                    className="w-full bg-white/5 border border-white/10 text-white/60 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Restart Induction (Tutorial)
                  </button>
                </div>

                <div className="h-px bg-white/5" />

                {/* Game Reset */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-xs uppercase font-bold tracking-widest text-red-400/60">Danger Zone</span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setShowResetConfirm(true);
                    }}
                    className="w-full bg-red-500/10 border border-red-500/20 text-red-400/60 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all"
                  >
                    Wipe All Neural Memory
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-full bg-emerald-500 text-[#050505] py-4 rounded-xl font-bold uppercase tracking-widest text-xs mt-8 hover:bg-emerald-400 transition-all"
              >
                Apply Changes
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {tutorialStep !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0a0a0a] border border-emerald-500/30 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.1)] relative"
            >
              <button 
                onClick={() => setTutorialStep(null)}
                className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold italic uppercase tracking-tight text-emerald-400">
                  {TUTORIAL_STEPS[tutorialStep].title}
                </h2>
              </div>

              <p className="text-sm text-white/60 leading-relaxed mb-8">
                {TUTORIAL_STEPS[tutorialStep].content}
              </p>

              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  {TUTORIAL_STEPS.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 rounded-full transition-all ${i === tutorialStep ? 'w-4 bg-emerald-500' : 'w-1 bg-white/10'}`} 
                    />
                  ))}
                </div>
                <button 
                  onClick={nextTutorialStep}
                  className="bg-emerald-500 text-[#050505] px-6 py-2 rounded-xl font-bold uppercase text-xs hover:bg-emerald-400 transition-all flex items-center gap-2"
                >
                  {tutorialStep === TUTORIAL_STEPS.length - 1 ? "Begin Mission" : "Next Protocol"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-white/10 p-6 flex justify-between items-center bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Cpu className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter uppercase italic">Linear Ascent</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Neural Network Architect v1.0.4</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-white/40 uppercase">System Status</p>
            <p className="text-xs text-emerald-400 flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Operational
            </p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-end">
            <p className="text-[10px] text-white/40 uppercase">Level</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold tabular-nums">{currentLevelIdx + 1} / {LEVELS.length}</p>
              <div className="flex gap-1">
                {LEVELS.map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i < currentLevelIdx ? 'bg-emerald-500' : 
                      i === currentLevelIdx ? 'bg-emerald-500 animate-pulse' : 
                      'bg-white/10'
                    }`} 
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex gap-2">
            <button 
              onClick={startTutorial}
              className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              title="Start Induction Protocol"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              title="System Configuration"
            >
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentLevelIdx + 1) / LEVELS.length) * 100}%` }}
            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Game View */}
        <div className="lg:col-span-7 space-y-6">
          <section id="visualizer" className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-xs uppercase font-bold tracking-wider">Loss Landscape Visualizer</span>
              </div>
              <div className="flex gap-4 text-[10px] uppercase text-white/40">
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-400 rounded-full" /> Target</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-white/40 rounded-full" /> Signal</span>
              </div>
            </div>
            
            <div className="p-6">
              <LossLandscape 
                steps={steps} 
                target={currentLevel.targetValue} 
                tolerance={currentLevel.tolerance}
                landscapeFn={currentLevel.landscapeFn}
                isSimulating={isSimulating}
              />
              
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase mb-1">Target Voltage</p>
                  <p className="text-lg font-bold text-emerald-400">{currentLevel.targetValue}mV</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase mb-1">Current Signal</p>
                  <p className="text-lg font-bold">{steps.length > 0 ? Math.round(steps[steps.length - 1]) : 0}mV</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase mb-1">Step Count</p>
                  <p className="text-lg font-bold">{steps.length} / {currentLevel.maxSteps}</p>
                </div>
              </div>
            </div>
          </section>

          <AnimatePresence mode="wait">
            {gameState !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-4 rounded-xl border flex items-start gap-4 ${
                  gameState === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                {gameState === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
                <div>
                  <h3 className="font-bold uppercase text-sm">{gameState === 'success' ? 'Convergence Success' : 'Convergence Failure'}</h3>
                  <p className="text-xs opacity-80 mt-1">{message}</p>
                  {gameState === 'success' && (
                    <button 
                      onClick={nextLevel}
                      className="mt-3 flex items-center gap-2 bg-emerald-500 text-[#050505] px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-400 transition-colors uppercase"
                    >
                      Next Neuron <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-white/40" />
              <h2 className="text-xs uppercase font-bold tracking-widest text-white/60">Mission Briefing</h2>
            </div>
            <h3 className="text-lg font-bold mb-2 italic text-emerald-400">{currentLevel.name}</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              {currentLevel.description}
            </p>
          </div>
        </div>

        {/* Right Column: Controls */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Settings2 className="w-24 h-24" />
            </div>
            
            <div className="flex items-center gap-2 mb-8">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs uppercase font-bold tracking-widest">Parameter Tuning</h2>
            </div>

            <div className="space-y-8">
              {/* Initial Bias (a) */}
              <div id="bias-control" className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <label className="text-[10px] uppercase text-white/40 font-bold tracking-wider">The Origin (a)</label>
                    <p className="text-xs text-white/60">Initial Bias Parameter</p>
                  </div>
                  <span className="text-xl font-bold text-emerald-400 tabular-nums">{a}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1"
                  value={a}
                  onChange={(e) => {
                    setA(Number(e.target.value));
                    resetLevel();
                  }}
                  disabled={isSimulating}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[8px] text-white/20 uppercase font-bold">
                  <span>Zero State</span>
                  <span>High Bias</span>
                </div>
              </div>

              {/* Learning Rate (d) */}
              <div id="pulse-control" className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <label className="text-[10px] uppercase text-white/40 font-bold tracking-wider">The Pulse (d)</label>
                    <p className="text-xs text-white/60">Learning Rate / Step Size</p>
                  </div>
                  <span className="text-xl font-bold text-emerald-400 tabular-nums">{d}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="200" 
                  step="0.5"
                  value={d}
                  onChange={(e) => {
                    setD(Number(e.target.value));
                    resetLevel();
                  }}
                  disabled={isSimulating}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[8px] text-white/20 uppercase font-bold">
                  <span>Vanishing</span>
                  <span>Exploding</span>
                </div>
              </div>

              {/* Adaptive Toggle */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Zap className={`w-4 h-4 ${isAdaptive ? 'text-emerald-400' : 'text-white/20'}`} />
                    <div>
                      <label className="text-[10px] uppercase text-white/40 font-bold tracking-wider">Adaptive Pulse</label>
                      <p className="text-[10px] text-white/20">Dynamic Gradient Scaling</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsAdaptive(!isAdaptive)}
                    disabled={isSimulating}
                    className={`w-10 h-5 rounded-full relative transition-colors ${isAdaptive ? 'bg-emerald-500' : 'bg-white/10'} disabled:opacity-50`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isAdaptive ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12 space-y-3">
              <button 
                id="initiate-btn"
                onClick={runSimulation}
                disabled={isSimulating || gameState === 'success'}
                className="w-full bg-emerald-500 text-[#050505] py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    Initiate Descent
                  </>
                )}
              </button>

              <button 
                onClick={saveGame}
                disabled={isSimulating}
                className="w-full bg-white/5 text-white/80 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition-all border border-white/5"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Neural State Saved
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Neural State
                  </>
                )}
              </button>
              
              <button 
                onClick={resetLevel}
                disabled={isSimulating || steps.length === 0}
                className="w-full bg-white/5 text-white/60 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all disabled:opacity-0"
              >
                Reset Parameters
              </button>
            </div>
          </section>

          <section className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/60 mb-4">Architect's Log</h3>
            <ul className="space-y-3 text-[11px] leading-relaxed text-white/40 mb-6">
              <li className="flex gap-2">
                <span className="text-emerald-500/40">01.</span>
                <span>The <strong className="text-white/60">Origin (a)</strong> sets your starting hypothesis. Start too high, and complexity overwhelms the signal.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500/40">02.</span>
                <span>The <strong className="text-white/60">Pulse (d)</strong> is your learning rate. Small pulses vanish; large pulses explode.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500/40">03.</span>
                <span>Convergence is achieved when the signal matches the <strong className="text-white/60">Target Voltage</strong> within tolerance.</span>
              </li>
            </ul>
            <AnimatePresence mode="wait">
              {!showResetConfirm ? (
                <motion.button 
                  key="reset-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowResetConfirm(true)}
                  disabled={isSimulating}
                  className="w-full bg-red-500/10 text-red-400/60 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-500/20 transition-all border border-red-500/20"
                >
                  Wipe Neural Memory (Reset)
                </motion.button>
              ) : (
                <motion.div 
                  key="confirm-reset"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex gap-2"
                >
                  <button 
                    onClick={clearProgress}
                    className="flex-1 bg-red-500 text-white py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all"
                  >
                    Confirm Wipe
                  </button>
                  <button 
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 bg-white/5 text-white/60 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border border-white/10"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-white/10 p-8 text-center">
        <div className="flex justify-center gap-8 mb-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-white/20 uppercase font-bold mb-1">Architecture</span>
            <span className="text-xs text-white/40">Stochastic Gradient</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-white/20 uppercase font-bold mb-1">Engine</span>
            <span className="text-xs text-white/40">Linear Ascent Core</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-white/20 uppercase font-bold mb-1">Status</span>
            <span className="text-xs text-white/40">Stable</span>
          </div>
        </div>
        <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">© 2026 Neural Logic Systems — All Rights Reserved</p>
      </footer>
    </div>
  );
}
