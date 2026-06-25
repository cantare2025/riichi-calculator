import { useGameStore } from '../stores/gameStore';
import { Wind } from '../stores/gameStore';

const winds: Wind[] = ['东', '南', '西', '北'];

export const OptionsPanel = () => {
  const {
    furoSets,
    isTsumo,
    roundWind,
    seatWind,
    roundCount,
    doraCount,
    uradoraCount,
    isRiichi,
    isDoubleRiichi,
    isIppatsu,
    isRinshan,
    isChankan,
    isHaitei,
    isHoutei,
    setIsTsumo,
    setRoundWind,
    setSeatWind,
    setRoundCount,
    setDoraCount,
    setUradoraCount,
    setIsRiichi,
    setIsDoubleRiichi,
    setIsIppatsu,
    setIsRinshan,
    setIsChankan,
    setIsHaitei,
    setIsHoutei,
  } = useGameStore();

  const isMenzen = furoSets.length === 0 || furoSets.every(s => s.type === 'ankan');

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">选项设置</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">胡牌方式</label>
          <div className="flex gap-2">
            <button
              onClick={() => setIsTsumo(true)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                isTsumo ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >自摸</button>
            <button
              onClick={() => setIsTsumo(false)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                !isTsumo ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >荣和</button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">场风</label>
          <div className="flex gap-2">
            {winds.map(w => (
              <button
                key={w}
                onClick={() => setRoundWind(w)}
                className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all ${
                  roundWind === w ? 'bg-blue-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >{w}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">自风</label>
          <div className="flex gap-2">
            {winds.map(w => (
              <button
                key={w}
                onClick={() => setSeatWind(w)}
                className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all ${
                  seatWind === w ? 'bg-blue-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >{w}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">本场数</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setRoundCount(Math.max(0, roundCount - 1))} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 font-bold">-</button>
            <span className="text-lg font-bold text-gray-800 w-12 text-center">{roundCount}</span>
            <button onClick={() => setRoundCount(roundCount + 1)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 font-bold">+</button>
            <span className="text-sm text-gray-500">本场</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">宝牌数量</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setDoraCount(Math.max(0, doraCount - 1))} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 font-bold">-</button>
            <span className="text-lg font-bold text-gray-800 w-12 text-center">{doraCount}</span>
            <button onClick={() => setDoraCount(doraCount + 1)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 font-bold">+</button>
            <span className="text-sm text-gray-500">张</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">里宝牌数量</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUradoraCount(Math.max(0, uradoraCount - 1))}
              disabled={!isMenzen}
              className={`w-8 h-8 rounded-md text-gray-700 font-bold ${isMenzen ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 text-gray-300'}`}
            >-</button>
            <span className="text-lg font-bold text-gray-800 w-12 text-center">{uradoraCount}</span>
            <button
              onClick={() => setUradoraCount(uradoraCount + 1)}
              disabled={!isMenzen}
              className={`w-8 h-8 rounded-md text-gray-700 font-bold ${isMenzen ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 text-gray-300'}`}
            >+</button>
            <span className="text-sm text-gray-500">张</span>
          </div>
          {!isMenzen && <p className="text-xs text-gray-400 mt-1">里宝牌仅在门清状态有效</p>}
        </div>

        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">特殊役种</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setIsRiichi(!isRiichi); if (!isRiichi) setIsDoubleRiichi(false); }}
              disabled={!isMenzen}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isRiichi ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300'
              }`}
            >立直</button>
            <button
              onClick={() => { setIsDoubleRiichi(!isDoubleRiichi); if (!isDoubleRiichi) setIsRiichi(false); }}
              disabled={!isMenzen}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isDoubleRiichi ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300'
              }`}
            >两立直</button>
            <button
              onClick={() => setIsIppatsu(!isIppatsu)}
              disabled={!isMenzen}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isIppatsu ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300'
              }`}
            >一发</button>
            <button
              onClick={() => setIsRinshan(!isRinshan)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isRinshan ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >岭上开花</button>
            <button
              onClick={() => setIsChankan(!isChankan)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isChankan ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >抢杠</button>
            <button
              onClick={() => setIsHaitei(!isHaitei)}
              disabled={!isTsumo}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isHaitei ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300'
              }`}
            >海底摸月</button>
            <button
              onClick={() => setIsHoutei(!isHoutei)}
              disabled={isTsumo}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isHoutei ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300'
              }`}
            >河底捞鱼</button>
          </div>
        </div>
      </div>
    </div>
  );
};