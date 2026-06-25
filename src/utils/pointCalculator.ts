export interface PointCalculationParams {
  totalHan: number;
  fu: number;
  yakumanCount: number;
  roundCount: number;
  isTsumo: boolean;
  isDealer: boolean;
  doraCount: number;
  uradoraCount: number;
}

export interface PointResult {
  totalHan: number;
  totalFu: number;
  doraHan: number;
  uradoraHan: number;
  yakumanCount: number;
  basePoints: number;
  tsumoDealerPay: number;
  tsumoNonDealerPay: number;
  tsumoDealerWinPay: number;
  tsumoTotal: number;
  ronPoints: number;
  roundBonus: number;
  description: string;
}

const roundUp100 = (v: number): number => Math.ceil(v / 100) * 100;

export const calculatePoints = (params: PointCalculationParams): PointResult => {
  const { totalHan, fu, yakumanCount, roundCount, isTsumo, isDealer, doraCount, uradoraCount } = params;

  let basePoints = 0;

  if (yakumanCount > 0) {
    basePoints = yakumanCount * 8000;
  } else if (totalHan >= 13) {
    basePoints = 8000;
  } else if (totalHan >= 11) {
    basePoints = 6000;
  } else if (totalHan >= 8) {
    basePoints = 4000;
  } else if (totalHan >= 6) {
    basePoints = 3000;
  } else if (totalHan >= 5) {
    basePoints = 2000;
  } else {
    basePoints = fu * Math.pow(2, totalHan + 2);
    basePoints = Math.min(basePoints, 2000); // 1-4番计算值超过2000视为满贯
  }

  const tsumoBonus = 100 * roundCount;
  const ronBonus = 300 * roundCount;

  // 闲家自摸：庄家支付 basePoints×2，每位闲家支付 basePoints×1
  // 庄家自摸：每位闲家支付 basePoints×2
  const tsumoDealerPay = roundUp100(basePoints * 2) + tsumoBonus; // 闲家自摸时庄家支付
  const tsumoNonDealerPay = roundUp100(basePoints * 1) + tsumoBonus; // 闲家自摸时闲家支付
  const tsumoDealerWinPay = roundUp100(basePoints * 2) + tsumoBonus; // 庄家自摸时每位闲家支付
  const tsumoTotal = isDealer
    ? 3 * tsumoDealerWinPay
    : tsumoDealerPay + 2 * tsumoNonDealerPay;

  const ronPoints = roundUp100(isDealer ? basePoints * 6 : basePoints * 4) + ronBonus;

  let description = '';
  if (yakumanCount > 0) {
    const labels = ['', '役满', '双倍役满', '三倍役满', '四倍役满', '五倍役满', '六倍役满'];
    description = yakumanCount < labels.length ? labels[yakumanCount] : `${yakumanCount}倍役满`;
  } else if (totalHan >= 13) {
    description = `${totalHan}番（累计役满）`;
  } else if (totalHan >= 11) {
    description = `${totalHan}番（三倍满）`;
  } else if (totalHan >= 8) {
    description = `${totalHan}番（倍满）`;
  } else if (totalHan >= 6) {
    description = `${totalHan}番（跳满）`;
  } else if (totalHan >= 5) {
    description = `${totalHan}番（满贯）`;
  } else if (basePoints >= 2000) {
    description = `${totalHan}番 ${fu}符（满贯）`;
  } else {
    description = `${totalHan}番 ${fu}符`;
  }

  return {
    totalHan,
    totalFu: fu,
    doraHan: doraCount,
    uradoraHan: uradoraCount,
    yakumanCount,
    basePoints,
    tsumoDealerPay,
    tsumoNonDealerPay,
    tsumoDealerWinPay,
    tsumoTotal,
    ronPoints,
    roundBonus: isTsumo ? tsumoBonus : ronBonus,
    description,
  };
};