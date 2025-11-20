import React, { useEffect, useState } from 'react';
import { PlanetData } from '../types';
import { getPlanetFunFact } from '../services/geminiService';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface PlanetInfoProps {
  planet: PlanetData | null;
  onClose: () => void;
}

export const PlanetInfo: React.FC<PlanetInfoProps> = ({ planet, onClose }) => {
  const [fact, setFact] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (planet) {
      setFact("");
      setLoading(true);
      getPlanetFunFact(planet.name).then((data) => {
        setFact(data);
        setLoading(false);
      });
    }
  }, [planet]);

  if (!planet) return null;

  return (
    <div className="fixed top-4 right-4 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white p-6 rounded-xl shadow-2xl z-50 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          {planet.name}
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Basic Data</p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div className="bg-slate-800/50 p-2 rounded">
              <span className="block text-xs text-slate-500">Orbit Period</span>
              {planet.period} Years
            </div>
            <div className="bg-slate-800/50 p-2 rounded">
              <span className="block text-xs text-slate-500">Distance</span>
              {planet.distance} AU (Scale)
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Description</p>
          <p className="text-slate-300 text-sm mt-1 leading-relaxed">
            {planet.description}
          </p>
        </div>

        <div className="border-t border-slate-700 pt-4">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Sparkles size={16} />
            <span className="text-sm font-bold">Gemini Insight</span>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-3 rounded-lg border border-purple-500/20 min-h-[80px] flex items-center justify-center">
            {loading ? (
              <Loader2 className="animate-spin text-purple-400" size={24} />
            ) : (
              <p className="text-sm italic text-purple-100">
                "{fact}"
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
