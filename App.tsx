import React, { useState, useEffect, useRef, Component, ErrorInfo } from 'react';
import { SolarSystemScene } from './components/SolarSystem';
import { PlanetInfo } from './components/PlanetInfo';
import { PlanetData } from './types';
import { Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';

// Error Boundary to catch crashes (like texture loading failures)
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-900 text-white p-8 text-center">
          <AlertTriangle size={64} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Simulation Error</h2>
          <p className="text-slate-400 mb-4 max-w-md">
            The 3D engine encountered a critical error (likely a texture loading issue or WebGL context loss).
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-500 transition-colors"
          >
            Reload Simulation
          </button>
          <pre className="mt-8 p-4 bg-black/50 rounded text-xs text-left text-red-400 overflow-auto max-w-full">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const [daysElapsed, setDaysElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1); // Simulation speed multiplier
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      
      // Limit huge delta times (e.g. user switches tabs) to prevent jumps
      const cappedDelta = Math.min(deltaTime, 100);

      if (isPlaying) {
        // 1 second real time = 'speed' days in simulation
        setDaysElapsed((prev) => {
            // If NaN, reset to 0
            if (isNaN(prev)) return 0;
            const next = prev + (speed * (cappedDelta / 16));
            return next;
        }); 
      }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, speed]);

  const handleReset = () => {
    setDaysElapsed(0);
    setIsPlaying(false);
  };

  // Calculate a display date (Approximate starting from Jan 1 2024)
  const displayDate = new Date(2024, 0, 1);
  const safeDays = isNaN(daysElapsed) ? 0 : Math.floor(daysElapsed);
  displayDate.setDate(displayDate.getDate() + safeDays);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* 3D Scene Layer - z-0 */}
      <div className="absolute inset-0 z-0">
        <SolarSystemScene 
          daysElapsed={isNaN(daysElapsed) ? 0 : daysElapsed} 
          onPlanetClick={setSelectedPlanet}
        />
      </div>

      {/* HUD Layer - Top - Higher Z-Index */}
      <div className="absolute top-0 left-0 w-full p-4 md:p-6 pointer-events-none flex justify-between items-start z-50">
        <div className="pointer-events-auto">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                Solar<span className="text-blue-500">System</span>
            </h1>
            <p className="text-blue-200 text-xs md:text-sm mt-1 opacity-90 font-mono drop-shadow-md">
                Interactive Orbital Simulation
            </p>
        </div>
        
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md p-3 md:p-4 rounded-lg border border-slate-600 text-white font-mono text-right shadow-xl">
            <div className="text-xl md:text-2xl font-bold text-blue-400">
                {displayDate.toLocaleDateString()}
            </div>
            <div className="text-[10px] md:text-xs text-slate-400">
                Simulation Day: {safeDays}
            </div>
        </div>
      </div>

      {/* Bottom Controls - Higher Z-Index */}
      <div className="absolute bottom-0 left-0 w-full p-4 pb-8 z-50 pointer-events-none flex justify-center">
        <div className="pointer-events-auto w-full max-w-2xl bg-slate-900/90 backdrop-blur-md border border-slate-600 rounded-2xl p-4 shadow-2xl flex flex-col gap-4">
            
            {/* Timeline Slider */}
            <div className="w-full flex items-center gap-4">
                <span className="text-xs text-slate-400 font-mono w-10">TIME</span>
                <input 
                    type="range" 
                    min="0" 
                    max="10000" 
                    value={isNaN(daysElapsed) ? 0 : daysElapsed} 
                    onChange={(e) => setDaysElapsed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg hover:shadow-blue-500/40 border border-blue-400/30"
                    >
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    </button>
                    
                    <button 
                        onClick={handleReset}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all border border-slate-500"
                        title="Reset Time"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700">
                    <span className="text-xs text-slate-400 uppercase font-bold hidden sm:inline">Speed</span>
                    <input 
                        type="range" 
                        min="0.1" 
                        max="10" 
                        step="0.1"
                        value={speed} 
                        onChange={(e) => setSpeed(parseFloat(e.target.value))}
                        className="w-24 sm:w-32 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <span className="text-xs text-white font-mono w-8 text-right">{speed.toFixed(1)}x</span>
                </div>
            </div>
        </div>
      </div>
        
      {/* Side Panel Info */}
      <PlanetInfo 
        planet={selectedPlanet} 
        onClose={() => setSelectedPlanet(null)} 
      />

      {/* Hint */}
      {!selectedPlanet && (
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none opacity-70 text-white text-xs animate-pulse drop-shadow-md whitespace-nowrap">
              Click on a planet for AI insights
          </div>
      )}
    </div>
  );
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;