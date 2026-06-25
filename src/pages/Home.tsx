import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import { TileInput } from '../components/TileInput';
import { OptionsPanel } from '../components/OptionsPanel';
import { ResultDisplay } from '../components/ResultDisplay';

export const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-2">
            立直麻将点数计算助手
          </h1>
          <p className="text-green-600 mb-4">
            输入手牌信息，自动检测役种并计算番数、符数和应支付的点数
          </p>
          <Link
            to="/rules"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-green-700 font-medium"
          >
            <Info size={20} />
            查看规则说明
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TileInput />
          </div>

          <div className="space-y-6">
            <OptionsPanel />
            <ResultDisplay />
          </div>
        </div>
      </div>
    </div>
  );
};
