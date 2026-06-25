import { Minus, Plus } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';

export const RoundSettings = () => {
  const { roundCount, setRoundCount } = useGameStore();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">本场数设置</h2>
      
      <div className="flex items-center gap-3">
        <button
          onClick={() => setRoundCount(roundCount - 1)}
          disabled={roundCount === 0}
          className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 transition-colors flex items-center justify-center"
        >
          <Minus size={20} />
        </button>
        <span className="text-2xl font-bold text-gray-800 w-12 text-center">{roundCount}</span>
        <button
          onClick={() => setRoundCount(roundCount + 1)}
          className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <Plus size={20} />
        </button>
        <span className="text-gray-600">本场</span>
      </div>

      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-blue-700 text-sm">
          本场加成：每本场增加 100 点
        </p>
      </div>
    </div>
  );
};