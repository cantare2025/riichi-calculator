import { FuroSet, Tile, Wind, parseTileKey } from '../stores/gameStore';
import { HandDecomposition, isYaochu, isTerminal, WaitType } from './handDecomposer';

export interface FuCalculationParams {
  isMenzen: boolean;
  isTsumo: boolean;
  furoSets: FuroSet[];
  bestDecomp: HandDecomposition | null;
  roundWind: Wind;
  seatWind: Wind;
  isTanki: boolean;
  hasPinfu: boolean;
  isChiitoitsu: boolean;
  waitType: WaitType;
}

export interface FuBreakdownItem {
  label: string;
  fu: number;
}

export interface FuResult {
  totalFu: number;
  baseFu: number;
  breakdown: FuBreakdownItem[];
}

// 判断是否为幺九牌（用于符数计算中的中张/幺九区分）
const isYaochuFu = (tile: Omit<Tile, 'id'>): boolean => {
  return isYaochu(tile);
};

export const calculateFu = (params: FuCalculationParams): FuResult => {
  const breakdown: FuBreakdownItem[] = [];

  // 七对子：固定25符
  if (params.isChiitoitsu) {
    return { totalFu: 25, baseFu: 25, breakdown: [{ label: '七对子（固定25符）', fu: 25 }] };
  }

  // 平和：荣和30符，自摸20符
  if (params.hasPinfu) {
    if (params.isTsumo) {
      return { totalFu: 20, baseFu: 20, breakdown: [{ label: '平和自摸（固定20符）', fu: 20 }] };
    } else {
      return { totalFu: 30, baseFu: 30, breakdown: [{ label: '平和荣和（基础20符+门清荣和10符）', fu: 30 }] };
    }
  }

  // 基础符20
  let totalFu = 20;
  breakdown.push({ label: '基础符', fu: 20 });

  // 门清荣和+10符
  if (params.isMenzen && !params.isTsumo) {
    totalFu += 10;
    breakdown.push({ label: '门清荣和（+10符）', fu: 10 });
  }

  // 自摸+2符
  if (params.isTsumo) {
    totalFu += 2;
    breakdown.push({ label: '自摸（+2符）', fu: 2 });
  }

  // 副露组符数
  for (const set of params.furoSets) {
    const tile = set.tiles[0];
    const isYao = isYaochuFu(tile);

    if (set.type === 'chi') {
      // 顺子0符
    } else if (set.type === 'pon') {
      // 明刻：中张2符，幺九4符
      const fu = isYao ? 4 : 2;
      totalFu += fu;
      breakdown.push({ label: `明刻${isYao ? '（幺九）' : '（中张）'}（+${fu}符）`, fu });
    } else if (set.type === 'minkan') {
      // 明杠：中张8符，幺九16符
      const fu = isYao ? 16 : 8;
      totalFu += fu;
      breakdown.push({ label: `明杠${isYao ? '（幺九）' : '（中张）'}（+${fu}符）`, fu });
    } else if (set.type === 'ankan') {
      // 暗杠：中张16符，幺九32符
      const fu = isYao ? 32 : 16;
      totalFu += fu;
      breakdown.push({ label: `暗杠${isYao ? '（幺九）' : '（中张）'}（+${fu}符）`, fu });
    }
  }

  // 手牌中的暗刻（从最佳分解结果获取）
  if (params.bestDecomp) {
    const decomp = params.bestDecomp;

    for (const meld of decomp.menzenMelds) {
      if (meld.type === 'koutsu') {
        // 暗刻：中张4符，幺九8符
        const isYao = isYaochuFu(meld.tiles[0]);
        const fu = isYao ? 8 : 4;
        totalFu += fu;
        breakdown.push({ label: `暗刻${isYao ? '（幺九）' : '（中张）'}（+${fu}符）`, fu });
      }
    }

    // 雀头（对子）符数
    const pairTile = decomp.pair.tiles[0];
    let pairFu = 0;
    if (pairTile.suit === 'yuan') {
      pairFu += 2; // 三元牌雀头
    }
    if (pairTile.suit === 'feng') {
      if (pairTile.value === params.roundWind) pairFu += 2; // 场风雀头
      if (pairTile.value === params.seatWind) pairFu += 2;  // 自风雀头
    }
    if (pairFu > 0) {
      totalFu += pairFu;
      const labels: string[] = [];
      if (pairTile.suit === 'yuan') labels.push('三元牌');
      if (pairTile.suit === 'feng' && pairTile.value === params.roundWind) labels.push('场风');
      if (pairTile.suit === 'feng' && pairTile.value === params.seatWind) labels.push('自风');
      breakdown.push({ label: `雀头（${labels.join('+')}）（+${pairFu}符）`, fu: pairFu });
    }
  }

  // 听牌形式符数
  if (params.waitType === 'tanki') {
    totalFu += 2;
    breakdown.push({ label: '单骑听牌（+2符）', fu: 2 });
  } else if (params.waitType === 'kanchan') {
    totalFu += 2;
    breakdown.push({ label: '嵌张听牌（+2符）', fu: 2 });
  } else if (params.waitType === 'penchan') {
    totalFu += 2;
    breakdown.push({ label: '边张听牌（+2符）', fu: 2 });
  }
  // ryanmen和shanpon不加符

  // 进位到10的倍数
  const roundedFu = Math.ceil(totalFu / 10) * 10;
  if (roundedFu !== totalFu) {
    breakdown.push({ label: `进位（${totalFu}→${roundedFu}符）`, fu: roundedFu - totalFu });
    totalFu = roundedFu;
  }

  return { totalFu, baseFu: 20, breakdown };
};