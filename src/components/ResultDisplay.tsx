import { useMemo } from 'react';
import { Trophy, Coins, Calculator, Sparkles, FileText, RotateCcw } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { detectYaku } from '../utils/yakuDetector';
import { calculateFu } from '../utils/fuCalculator';
import { calculatePoints } from '../utils/pointCalculator';
import { getYakuById, getYakuHan } from '../utils/yakuData';
import { validateHand } from '../utils/handDecomposer';

export const ResultDisplay = () => {
  const {
    menzenTiles, furoSets, winningTileId,
    isTsumo, isRiichi, isDoubleRiichi, roundWind, seatWind,
    roundCount, doraCount, uradoraCount,
    isIppatsu, isRinshan, isChankan, isHaitei, isHoutei,
    isCalculated, calculate, recalculate,
  } = useGameStore();

  const isDealer = seatWind === '东';

  const validation = useMemo(() =>
    validateHand(menzenTiles, furoSets, winningTileId),
    [menzenTiles, furoSets, winningTileId]
  );

  const { pointResult, detectedYakuList, fuResult } = useMemo(() => {
    if (!isCalculated || !validation.isValid) {
      return { pointResult: null, detectedYakuList: [], fuResult: null };
    }

    const detection = detectYaku({
      menzenTiles, furoSets, winningTileId,
      isTsumo, roundWind, seatWind,
      isRiichi, isDoubleRiichi, isIppatsu,
      isRinshan, isChankan, isHaitei, isHoutei,
    });

    const isMenzen = detection.isMenzen;
    const finalYakuIds = [...detection.detectedYakuIds];
    const yakumanCount = detection.yakumanCount;

    let totalHan = 0;

    const yakuList = finalYakuIds.map(id => {
      const yaku = getYakuById(id);
      if (!yaku) return null;
      const han = getYakuHan(id, isMenzen);
      if (!yaku.isYakuman && !yaku.isDoubleYakuman) totalHan += han;
      return { id, name: yaku.name, han, isYakuman: yaku.isYakuman, isDoubleYakuman: yaku.isDoubleYakuman };
    }).filter(Boolean) as { id: string; name: string; han: number; isYakuman: boolean; isDoubleYakuman: boolean }[];

    totalHan += doraCount + uradoraCount;

    const fu = calculateFu({
      isMenzen, isTsumo, furoSets,
      bestDecomp: detection.bestDecomp,
      roundWind, seatWind,
      isTanki: detection.isTanki,
      hasPinfu: detection.hasPinfu,
      isChiitoitsu: detection.isChiitoitsu,
      waitType: detection.waitType,
    });

    const points = calculatePoints({
      totalHan, fu: fu.totalFu, yakumanCount,
      roundCount, isTsumo, isDealer, doraCount, uradoraCount,
    });

    return { pointResult: points, detectedYakuList: yakuList, fuResult: fu };
  }, [
    isCalculated, validation.isValid,
    menzenTiles, furoSets, winningTileId,
    isTsumo, isRiichi, isDoubleRiichi, roundWind, seatWind,
    roundCount, doraCount, uradoraCount,
    isIppatsu, isRinshan, isChankan, isHaitei, isHoutei, isDealer,
  ]);

  const hasHand = menzenTiles.length > 0 || furoSets.length > 0;

  return (
    <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={24} />
        <h2 className="text-xl font-bold">计算结果</h2>
      </div>

      {!isCalculated ? (
        <div className="text-center py-8">
          <button
            onClick={calculate}
            disabled={!validation.isValid}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all shadow-md ${
              validation.isValid
                ? 'bg-white text-green-700 hover:bg-green-50'
                : 'bg-white/30 text-white/50 cursor-not-allowed'
            }`}
          >
            开始计算
          </button>
          {!validation.isValid && hasHand && (
            <div className="mt-3 text-sm text-white/60">
              {validation.errors.map((err, i) => <div key={i}>{err}</div>)}
            </div>
          )}
        </div>
      ) : !validation.isValid ? (
        <div className="text-center py-8 text-white/70">
          {validation.errors.map((err, i) => <div key={i}>{err}</div>)}
        </div>
      ) : pointResult ? (
        <>
          {/* 第一部分：番数、符数、点数 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={20} />
                <span className="text-sm opacity-80">番数</span>
              </div>
              <div className="text-3xl font-bold">
                {pointResult.yakumanCount > 0
                  ? pointResult.description
                  : `${pointResult.totalHan}番`}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins size={20} />
                <span className="text-sm opacity-80">符数</span>
              </div>
              <div className="text-3xl font-bold">{pointResult.totalFu}符</div>
            </div>
          </div>

          {/* 点数 */}
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <div className="text-sm opacity-80 mb-3">
              {isTsumo ? '自摸' : '荣和'} · {isDealer ? '庄家' : '闲家'}（自风：{seatWind}）
            </div>
            {isTsumo ? (
              <>
                {isDealer ? (
                  <div className="flex justify-between items-center">
                    <span>每位闲家支付</span>
                    <span className="font-bold text-2xl">{pointResult.tsumoDealerWinPay.toLocaleString()}点</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span>庄家支付</span>
                      <span className="font-bold text-2xl">{pointResult.tsumoDealerPay.toLocaleString()}点</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>每位闲家支付</span>
                      <span className="font-bold text-2xl">{pointResult.tsumoNonDealerPay.toLocaleString()}点</span>
                    </div>
                  </>
                )}
                <div className="border-t border-white/20 mt-3 pt-3 flex justify-between items-center">
                  <span>合计收入</span>
                  <span className="font-bold text-xl">{pointResult.tsumoTotal.toLocaleString()}点</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center">
                <span>放铳者支付</span>
                <span className="font-bold text-2xl">{pointResult.ronPoints.toLocaleString()}点</span>
              </div>
            )}
            {roundCount > 0 && (
              <div className="border-t border-white/20 mt-3 pt-3 text-xs opacity-60">
                本场加成已包含（{roundCount}本场，+{pointResult.roundBonus}点）
              </div>
            )}
          </div>

          {/* 第二部分：役种列表 */}
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={20} />
              <span className="text-sm opacity-80">检测到的役种</span>
            </div>
            {detectedYakuList.length > 0 ? (
              <div className="space-y-1">
                {detectedYakuList.map((yaku, index) => (
                  <div key={index} className="flex justify-between items-center py-1 border-b border-white/10 last:border-0">
                    <span className="text-sm">{yaku.name}</span>
                    <span className="font-bold text-sm">
                      {yaku.isDoubleYakuman ? '双倍役满' : yaku.isYakuman ? '役满' : `${yaku.han}番`}
                    </span>
                  </div>
                ))}
                {(doraCount > 0 || uradoraCount > 0) && (
                  <div className="border-t border-white/20 pt-2 mt-2">
                    {doraCount > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm">宝牌</span>
                        <span className="font-bold text-sm">{doraCount}张（+{doraCount}番）</span>
                      </div>
                    )}
                    {uradoraCount > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm">里宝牌</span>
                        <span className="font-bold text-sm">{uradoraCount}张（+{uradoraCount}番）</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm opacity-60">未检测到役种</div>
            )}
          </div>

          {/* 第三部分：符数计算明细 */}
          {fuResult && (
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={20} />
                <span className="text-sm opacity-80">符数计算明细</span>
              </div>
              <div className="space-y-1">
                {fuResult.breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-1 text-sm border-b border-white/10 last:border-0">
                    <span className="opacity-80">{item.label}</span>
                    <span className="font-medium">{item.fu}符</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 font-bold">
                  <span>合计</span>
                  <span>{fuResult.totalFu}符</span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* 重新计算按钮 */}
      {isCalculated && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <button
            onClick={recalculate}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold text-lg transition-all"
          >
            <RotateCcw size={20} />
            重新计算
          </button>
        </div>
      )}
    </div>
  );
};