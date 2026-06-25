import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { yakuList } from '../utils/yakuData';

export const Rules = () => {
  const navigate = useNavigate();

  const yakumanYaku = yakuList.filter(y => y.isYakuman);
  const doubleYakumanYaku = yakuList.filter(y => y.isDoubleYakuman);
  const han6Yaku = yakuList.filter(y => !y.isYakuman && !y.isDoubleYakuman && y.han === 6);
  const han3Yaku = yakuList.filter(y => !y.isYakuman && !y.isDoubleYakuman && y.han === 3);
  const han2Yaku = yakuList.filter(y => y.han === 2);
  const han1Yaku = yakuList.filter(y => y.han === 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft size={20} />
            返回首页
          </button>
          <h1 className="text-3xl font-bold text-green-800">规则说明</h1>
        </header>

        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">番种说明</h2>
            
            {doubleYakumanYaku.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-red-600 mb-3">双倍役满</h3>
                <div className="space-y-2">
                  {doubleYakumanYaku.map(yaku => (
                    <div key={yaku.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <span className="font-bold text-red-600">{yaku.name}</span>
                      <span className="text-gray-600">{yaku.description}</span>
                      {yaku.requiresMenzen && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">门清限定</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {yakumanYaku.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-red-500 mb-3">役满</h3>
                <div className="space-y-2">
                  {yakumanYaku.map(yaku => (
                    <div key={yaku.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <span className="font-bold text-red-500">{yaku.name}</span>
                      <span className="text-gray-600">{yaku.description}</span>
                      {yaku.requiresMenzen && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">门清限定</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {han6Yaku.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-orange-600 mb-3">6番</h3>
                <div className="space-y-2">
                  {han6Yaku.map(yaku => (
                    <div key={yaku.id} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                      <span className="font-bold text-orange-600">{yaku.name}</span>
                      <span className="text-gray-600">{yaku.description}</span>
                      {yaku.requiresMenzen && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">门清限定</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {han3Yaku.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-purple-600 mb-3">3番</h3>
                <div className="space-y-2">
                  {han3Yaku.map(yaku => (
                    <div key={yaku.id} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <span className="font-bold text-purple-600">{yaku.name}</span>
                      <span className="text-gray-600">{yaku.description}</span>
                      {yaku.requiresMenzen && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">门清限定</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {han2Yaku.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-blue-600 mb-3">2番</h3>
                <div className="space-y-2">
                  {han2Yaku.map(yaku => (
                    <div key={yaku.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <span className="font-bold text-blue-600">{yaku.name}</span>
                      <span className="text-gray-600">{yaku.description}</span>
                      {yaku.requiresMenzen && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">门清限定</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {han1Yaku.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-green-600 mb-3">1番</h3>
                <div className="space-y-2">
                  {han1Yaku.map(yaku => (
                    <div key={yaku.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <span className="font-bold text-green-600">{yaku.name}</span>
                      <span className="text-gray-600">{yaku.description}</span>
                      {yaku.requiresMenzen && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">门清限定</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">符数计算规则</h2>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-lg">
                <h3 className="font-bold text-amber-800 mb-2">基础符</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• 门清自摸：20符</li>
                  <li>• 副露或吃胡：30符</li>
                  <li>• 平和（门清）：固定30符</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-2">加符项</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• 明刻：中张+2符，幺九+4符</li>
                  <li>• 暗刻：中张+4符，幺九+8符</li>
                  <li>• 明杠：中张+8符，幺九+16符</li>
                  <li>• 暗杠：中张+16符，幺九+32符</li>
                  <li>• 雀头为三元牌/场风/自风：+2符</li>
                  <li>• 单骑/嵌张/边张听牌：+2符</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-bold text-green-800 mb-2">计算规则</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• 符数最小为20符，最大为120符</li>
                  <li>• 计算结果向上取整到10的倍数</li>
                  <li>• 平和牌型不计加符项，固定30符</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">点数计算规则</h2>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-bold text-purple-800 mb-2">基本点数公式</h3>
                <p className="text-gray-600 mb-2">基本点数 = 符数 × 2^(番数+2)</p>
                <p className="text-gray-600">1-4番计算结果超过2000时视为满贯；最终支付点数向上取整到百位</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-2">固定基本点数</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• 满贯（5番）：2,000点</li>
                  <li>• 跳满（6-7番）：3,000点</li>
                  <li>• 倍满（8-10番）：4,000点</li>
                  <li>• 三倍满（11-12番）：6,000点</li>
                  <li>• 役满（13番+）：8,000点</li>
                </ul>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-bold text-red-800 mb-2">役满处理</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• 单役满：基本点数 = 8,000点</li>
                  <li>• 双倍役满：基本点数 = 16,000点</li>
                  <li>• 多倍役满：基本点数 = 8,000 × 倍数</li>
                  <li>• 累计13番以上：视同役满（8,000点）</li>
                </ul>
              </div>

              <div className="p-4 bg-indigo-50 rounded-lg">
                <h3 className="font-bold text-indigo-800 mb-2">支付规则</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• 闲家荣和：放铳者支付 基本点数 × 4</li>
                  <li>• 庄家荣和：放铳者支付 基本点数 × 6</li>
                  <li>• 闲家自摸：庄家支付 基本点数 × 2，闲家支付 基本点数 × 1</li>
                  <li>• 庄家自摸：每位闲家支付 基本点数 × 2</li>
                </ul>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-bold text-orange-800 mb-2">本场加成</h3>
                <p className="text-gray-600">荣和时每本场放铳者多付300点；自摸时每本场各家多付100点</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};