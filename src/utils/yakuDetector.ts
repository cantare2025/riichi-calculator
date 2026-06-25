import { Tile, TileSuit, TileValue, FuroSet, parseTileKey, Wind } from '../stores/gameStore';
import {
  findAllDecompositions, checkChiitoitsu, checkKokushi, detectWaitType,
  HandDecomposition, DecomposedMeld, WaitType,
  isYaochu, isHonor, isTerminal,
} from './handDecomposer';
import { getYakuHan } from './yakuData';

const yuanValues: TileValue[] = ['中', '发', '白'];
const fengValues: TileValue[] = ['东', '南', '西', '北'];
const allSuits: TileSuit[] = ['wan', 'tiao', 'tong'];

export interface DetectionParams {
  menzenTiles: Tile[];
  furoSets: FuroSet[];
  winningTileId: string | null;
  isTsumo: boolean;
  roundWind: Wind;
  seatWind: Wind;
  isRiichi: boolean;
  isDoubleRiichi: boolean;
  isIppatsu: boolean;
  isRinshan: boolean;
  isChankan: boolean;
  isHaitei: boolean;
  isHoutei: boolean;
}

export interface DetectionResult {
  detectedYakuIds: string[];
  isTanki: boolean;
  isYaochuPair: boolean;
  hasPinfu: boolean;
  openKanCount: number;
  closedKanCount: number;
  isMenzen: boolean;
  bestDecomp: HandDecomposition | null;
  isChiitoitsu: boolean;
  waitType: WaitType;
  yakumanCount: number; // 役满倍数（1=役满, 2=双倍役满, 3=三倍役满...）
}

const getAllTiles = (params: DetectionParams): Tile[] => {
  const all: Tile[] = [...params.menzenTiles];
  params.furoSets.forEach(set => set.tiles.forEach(t => all.push(t)));
  return all;
};

// ============ 役种检测函数 ============

const checkYakuhai = (params: DetectionParams, decomp: HandDecomposition): string[] => {
  const result: string[] = [];
  for (const meld of decomp.allMelds) {
    if (meld.type !== 'koutsu' && meld.type !== 'kan') continue;
    const tile = meld.tiles[0];
    if (tile.suit === 'feng') {
      if (tile.value === params.roundWind) result.push('场风');
      if (tile.value === params.seatWind) result.push('自风');
    }
    if (tile.suit === 'yuan') result.push('三元牌');
  }
  return result;
};

const checkPinfu = (params: DetectionParams, decomp: HandDecomposition, waitType: WaitType): boolean => {
  if (waitType !== 'ryanmen') return false; // 平和必须是两面听牌
  if (decomp.furoMelds.some(m => !m.isConcealed)) return false;
  if (!decomp.menzenMelds.every(m => m.type === 'shuntsu')) return false;
  const pairTile = decomp.pair.tiles[0];
  if (pairTile.suit === 'feng') {
    if (pairTile.value === params.roundWind || pairTile.value === params.seatWind) return false;
  }
  if (pairTile.suit === 'yuan') return false;
  return true;
};

const checkTanyao = (decomp: HandDecomposition): boolean => {
  return decomp.allMelds.every(m => {
    if (m.type === 'shuntsu') return m.value !== '1' && m.value !== '7';
    return !isYaochu(m.tiles[0]);
  });
};

const checkHoni = (decomp: HandDecomposition): boolean => {
  const numberSuits = new Set<TileSuit>();
  let hasHonor = false;
  for (const meld of decomp.allMelds) {
    if (isHonor(meld.tiles[0])) { hasHonor = true; }
    else { numberSuits.add(meld.suit); }
  }
  return numberSuits.size === 1 && hasHonor;
};

const checkChini = (decomp: HandDecomposition): boolean => {
  const numberSuits = new Set<TileSuit>();
  for (const meld of decomp.allMelds) {
    if (isHonor(meld.tiles[0])) return false;
    numberSuits.add(meld.suit);
  }
  return numberSuits.size === 1;
};

const checkToitoi = (decomp: HandDecomposition): boolean => {
  const nonPair = decomp.allMelds.filter(m => m.type !== 'pair');
  return nonPair.every(m => m.type === 'koutsu' || m.type === 'kan');
};

const checkSanankou = (decomp: HandDecomposition): boolean => {
  let count = 0;
  for (const meld of decomp.menzenMelds) { if (meld.type === 'koutsu') count++; }
  for (const meld of decomp.furoMelds) { if (meld.type === 'kan' && meld.isConcealed) count++; }
  return count >= 3;
};

const checkSuanko = (decomp: HandDecomposition): boolean => {
  let count = 0;
  for (const meld of decomp.menzenMelds) { if (meld.type === 'koutsu') count++; }
  for (const meld of decomp.furoMelds) { if (meld.type === 'kan' && meld.isConcealed) count++; }
  return count >= 4;
};

const checkTsuiso = (decomp: HandDecomposition): boolean => {
  return decomp.allMelds.every(m => isHonor(m.tiles[0]));
};

const checkSukantsu = (params: DetectionParams): boolean => {
  return params.furoSets.filter(s => s.tiles.length === 4).length >= 4;
};

const checkSankantsu = (params: DetectionParams): boolean => {
  return params.furoSets.filter(s => s.tiles.length === 4).length >= 3;
};

const checkRyuuiisou = (decomp: HandDecomposition): boolean => {
  const greenValues: TileValue[] = ['2', '3', '4', '6', '8'];
  return decomp.allMelds.every(m => {
    if (m.suit === 'tiao' && greenValues.includes(m.value)) return true;
    if (m.suit === 'yuan' && m.value === '发') return true;
    return false;
  });
};

const checkChinroutou = (decomp: HandDecomposition): boolean => {
  return decomp.allMelds.every(m => isTerminal(m.tiles[0]));
};

const checkHonroutou = (decomp: HandDecomposition): boolean => {
  return decomp.allMelds.every(m => isYaochu(m.tiles[0]));
};

const checkDaisushi = (decomp: HandDecomposition): boolean => {
  const fengKoutsu = new Set<string>();
  for (const meld of decomp.allMelds) {
    if ((meld.type === 'koutsu' || meld.type === 'kan') && meld.suit === 'feng') fengKoutsu.add(meld.value);
  }
  return fengValues.every(v => fengKoutsu.has(v));
};

const checkShousushi = (decomp: HandDecomposition): boolean => {
  const fengKoutsu = new Set<string>();
  let fengPair = false;
  for (const meld of decomp.allMelds) {
    if ((meld.type === 'koutsu' || meld.type === 'kan') && meld.suit === 'feng') fengKoutsu.add(meld.value);
    if (meld.type === 'pair' && meld.suit === 'feng') fengPair = true;
  }
  return fengKoutsu.size === 3 && fengPair;
};

const checkDaisangen = (decomp: HandDecomposition): boolean => {
  const yuanKoutsu = new Set<string>();
  for (const meld of decomp.allMelds) {
    if ((meld.type === 'koutsu' || meld.type === 'kan') && meld.suit === 'yuan') yuanKoutsu.add(meld.value);
  }
  return yuanValues.every(v => yuanKoutsu.has(v));
};

const checkShousangen = (decomp: HandDecomposition): boolean => {
  const yuanKoutsu = new Set<string>();
  let yuanPair = false;
  for (const meld of decomp.allMelds) {
    if ((meld.type === 'koutsu' || meld.type === 'kan') && meld.suit === 'yuan') yuanKoutsu.add(meld.value);
    if (meld.type === 'pair' && meld.suit === 'yuan') yuanPair = true;
  }
  return yuanKoutsu.size === 2 && yuanPair;
};

const checkIttsu = (decomp: HandDecomposition): boolean => {
  for (const suit of allSuits) {
    const shuntsu = decomp.allMelds.filter(m => m.type === 'shuntsu' && m.suit === suit);
    const startValues = new Set(shuntsu.map(m => m.value));
    if (startValues.has('1') && startValues.has('4') && startValues.has('7')) return true;
  }
  return false;
};

const checkSanshokuDoujun = (decomp: HandDecomposition): boolean => {
  for (let i = 1; i <= 7; i++) {
    const v = String(i) as TileValue;
    const suits = new Set<TileSuit>();
    for (const meld of decomp.allMelds) {
      if (meld.type === 'shuntsu' && meld.value === v) suits.add(meld.suit);
    }
    if (suits.size === 3) return true;
  }
  return false;
};

const checkSanshokuDoukou = (decomp: HandDecomposition): boolean => {
  for (let i = 1; i <= 9; i++) {
    const v = String(i) as TileValue;
    const suits = new Set<TileSuit>();
    for (const meld of decomp.allMelds) {
      if ((meld.type === 'koutsu' || meld.type === 'kan') && meld.value === v) suits.add(meld.suit);
    }
    if (suits.size === 3) return true;
  }
  return false;
};

const checkIipeikou = (decomp: HandDecomposition): boolean => {
  const shuntsuKeys: string[] = [];
  for (const meld of decomp.menzenMelds) {
    if (meld.type === 'shuntsu') shuntsuKeys.push(`${meld.suit}-${meld.value}`);
  }
  const seen = new Set<string>();
  for (const key of shuntsuKeys) {
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
};

// 两杯口：2组相同的顺子×2（共4个顺子，2对相同）
const checkRyanpeikou = (decomp: HandDecomposition): boolean => {
  const shuntsuKeys: string[] = [];
  for (const meld of decomp.menzenMelds) {
    if (meld.type === 'shuntsu') shuntsuKeys.push(`${meld.suit}-${meld.value}`);
  }
  if (shuntsuKeys.length !== 4) return false;
  // 统计每种顺子出现的次数
  const counts: Record<string, number> = {};
  for (const key of shuntsuKeys) { counts[key] = (counts[key] || 0) + 1; }
  // 两杯口：恰好2种顺子，每种出现2次
  const entries = Object.entries(counts);
  return entries.length === 2 && entries.every(([, count]) => count === 2);
};

const checkHonchantaiyaochuu = (decomp: HandDecomposition): boolean => {
  const allHaveYaochu = decomp.allMelds.every(m => {
    if (m.type === 'shuntsu') return m.value === '1' || m.value === '7';
    return isYaochu(m.tiles[0]);
  });
  if (!allHaveYaochu) return false;
  return decomp.allMelds.some(m => isHonor(m.tiles[0]));
};

const checkJunchan = (decomp: HandDecomposition): boolean => {
  const allHaveTerminal = decomp.allMelds.every(m => {
    if (m.type === 'shuntsu') return m.value === '1' || m.value === '7';
    return isTerminal(m.tiles[0]);
  });
  if (!allHaveTerminal) return false;
  return decomp.allMelds.every(m => !isHonor(m.tiles[0]));
};

const checkChuren = (params: DetectionParams): boolean => {
  const isMenzen = params.furoSets.length === 0 || params.furoSets.every(s => s.type === 'ankan');
  if (!isMenzen) return false;
  const allTiles = getAllTiles(params);
  for (const suit of allSuits) {
    const suitTiles = allTiles.filter(t => t.suit === suit);
    if (suitTiles.length !== 14) continue;
    const counts: Record<string, number> = {};
    suitTiles.forEach(t => { counts[t.value] = (counts[t.value] || 0) + 1; });
    const base: Record<string, number> = { '1': 3, '2': 1, '3': 1, '4': 1, '5': 1, '6': 1, '7': 1, '8': 1, '9': 3 };
    let valid = true;
    let extra = 0;
    for (let i = 1; i <= 9; i++) {
      const v = String(i);
      const diff = (counts[v] || 0) - base[v];
      if (diff < 0) { valid = false; break; }
      extra += diff;
    }
    if (valid && extra === 1) return true;
  }
  return false;
};

// ============ 基于原始牌的役种检测（用于七对子复合） ============

const checkTanyaoOnTiles = (tiles: Tile[]): boolean => {
  return tiles.every(t => !isYaochu(t));
};

const checkHoniOnTiles = (tiles: Tile[]): boolean => {
  const numberSuits = new Set<TileSuit>();
  let hasHonor = false;
  for (const t of tiles) {
    if (isHonor(t)) hasHonor = true;
    else numberSuits.add(t.suit);
  }
  return numberSuits.size === 1 && hasHonor;
};

const checkChiniOnTiles = (tiles: Tile[]): boolean => {
  const numberSuits = new Set<TileSuit>();
  for (const t of tiles) {
    if (isHonor(t)) return false;
    numberSuits.add(t.suit);
  }
  return numberSuits.size === 1;
};

const checkHonroutouOnTiles = (tiles: Tile[]): boolean => {
  return tiles.every(t => isYaochu(t));
};

const checkTsuisoOnTiles = (tiles: Tile[]): boolean => {
  return tiles.every(t => isHonor(t));
};

// ============ 对单个分解检测所有役种 ============

const detectYakuForDecomp = (params: DetectionParams, decomp: HandDecomposition): { yakuIds: string[]; yakumanCount: number } => {
  const yaku: string[] = [];
  let yakumanCount = 0;

  // 先计算听牌形式（平和检测需要）
  const waitType = detectWaitType(params.menzenTiles, params.winningTileId, decomp);

  // 役满
  if (checkDaisushi(decomp)) { yaku.push('daisushi'); yakumanCount++; }
  if (checkTsuiso(decomp)) { yaku.push('tsuiso'); yakumanCount++; }
  if (checkChinroutou(decomp)) { yaku.push('chinroutou'); yakumanCount++; }
  if (checkDaisangen(decomp)) { yaku.push('daisangen'); yakumanCount++; }
  if (checkSuanko(decomp)) {
    const isTanki = decomp.pair.tiles.some(t => {
      if (!params.winningTileId) return false;
      const wt = params.menzenTiles.find(x => x.id === params.winningTileId);
      return wt && parseTileKey(t) === parseTileKey(wt);
    });
    if (isTanki) { yaku.push('suanko_tanki'); yakumanCount += 2; }
    else { yaku.push('suanko'); yakumanCount++; }
  }
  if (checkSukantsu(params)) { yaku.push('sukantsu'); yakumanCount++; }
  if (checkRyuuiisou(decomp)) { yaku.push('ryuiso'); yakumanCount++; }
  if (checkShousushi(decomp)) { yaku.push('shousushi'); yakumanCount++; }
  if (checkKokushi(params.menzenTiles, params.furoSets)) { yaku.push('kokushi_musou'); yakumanCount++; }
  if (checkChuren(params)) { yaku.push('churen_poutou'); yakumanCount++; }

  // 有役满就不再检测其他
  if (yakumanCount > 0) return { yakuIds: yaku, yakumanCount };

  // 常规役种
  if (checkChini(decomp)) yaku.push('chini');
  if (checkHoni(decomp)) yaku.push('honi');
  if (checkJunchan(decomp)) yaku.push('junchan');
  if (checkHonchantaiyaochuu(decomp)) yaku.push('honchun_tanyao');
  if (checkHonroutou(decomp)) yaku.push('honroutou');
  if (checkIttsu(decomp)) yaku.push('ittsu');
  if (checkToitoi(decomp)) yaku.push('toitoi');
  if (checkSanshokuDoujun(decomp)) yaku.push('sanshoku_doujun');
  if (checkSanshokuDoukou(decomp)) yaku.push('sanshoku_doukou');
  if (checkSanankou(decomp)) yaku.push('sanankou');
  if (checkSankantsu(params)) yaku.push('san_kantsu');
  if (checkShousangen(decomp)) yaku.push('shousangen');
  if (checkTanyao(decomp)) yaku.push('tanyao');
  // 两杯口和一杯口互斥
  if (checkRyanpeikou(decomp)) yaku.push('ryanpeikou');
  else if (checkIipeikou(decomp)) yaku.push('iipeikou');
  if (checkYakuhai(params, decomp).length > 0) yaku.push('yakuhai');
  if (checkPinfu(params, decomp, waitType)) yaku.push('pinfu');

  return { yakuIds: yaku, yakumanCount: 0 };
};

// 计算一个分解的总番数
const calcTotalHan = (yakuIds: string[], isMenzen: boolean): number => {
  let total = 0;
  for (const id of yakuIds) {
    total += getYakuHan(id, isMenzen);
  }
  return total;
};

// ============ 主检测函数 ============

export const detectYaku = (params: DetectionParams): DetectionResult => {
  const isMenzen = params.furoSets.length === 0 || params.furoSets.every(s => s.type === 'ankan');
  const decompositions = findAllDecompositions(params.menzenTiles, params.furoSets);
  const isChiitoitsu = checkChiitoitsu(params.menzenTiles, params.furoSets);

  const openKanCount = params.furoSets.filter(s => s.type === 'minkan').length;
  const closedKanCount = params.furoSets.filter(s => s.type === 'ankan').length;

  // 对每种分解检测役种，计算番数，选最优
  let bestYakuIds: string[] = [];
  let bestHan = 0;
  let bestYakumanCount = 0;
  let bestDecomp: HandDecomposition | null = null;
  let bestIsChiitoitsu = false;

  // 七对子 + 可复合的役种
  if (isChiitoitsu) {
    const allTiles = getAllTiles(params);
    const chiitoitsuYaku: string[] = ['chiitoitsu'];
    if (checkTanyaoOnTiles(allTiles)) chiitoitsuYaku.push('tanyao');
    if (checkHoniOnTiles(allTiles)) chiitoitsuYaku.push('honi');
    if (checkChiniOnTiles(allTiles)) chiitoitsuYaku.push('chini');
    if (checkHonroutouOnTiles(allTiles)) chiitoitsuYaku.push('honroutou');
    if (checkTsuisoOnTiles(allTiles)) chiitoitsuYaku.push('tsuiso');
    const han = calcTotalHan(chiitoitsuYaku, isMenzen);
    if (han > bestHan) {
      bestHan = han;
      bestYakuIds = chiitoitsuYaku;
      bestYakumanCount = chiitoitsuYaku.includes('tsuiso') ? 1 : 0;
      bestIsChiitoitsu = true;
    }
  }

  // 标准分解
  for (const decomp of decompositions) {
    const { yakuIds, yakumanCount } = detectYakuForDecomp(params, decomp);
    const han = yakumanCount > 0 ? yakumanCount * 13 : calcTotalHan(yakuIds, isMenzen);
    // 当番数相同时，优先选择标准分解（符数通常更高，点数更高）
    if (yakumanCount > bestYakumanCount || (yakumanCount === bestYakumanCount && han >= bestHan)) {
      bestHan = han;
      bestYakuIds = yakuIds;
      bestYakumanCount = yakumanCount;
      bestDecomp = decomp;
      bestIsChiitoitsu = false;
    }
  }

  // 添加特殊役种（与分解无关）
  if (bestYakumanCount === 0) {
    if (params.isDoubleRiichi && isMenzen) bestYakuIds.push('double_riichi');
    else if (params.isRiichi && isMenzen) bestYakuIds.push('riichi');
    if (params.isIppatsu && isMenzen) bestYakuIds.push('ippatsu');
    if (isMenzen && params.isTsumo) bestYakuIds.push('menzen_tsumo');
  }
  if (params.isRinshan) bestYakuIds.push('rinshan');
  if (params.isChankan) bestYakuIds.push('chankan');
  if (params.isHaitei && params.isTsumo) bestYakuIds.push('haitei');
  if (params.isHoutei && !params.isTsumo) bestYakuIds.push('houtei');

  // 去重
  const detectedYakuIds = [...new Set(bestYakuIds)];

  // 判断听牌形式和雀头
  const isTanki = bestIsChiitoitsu || (bestDecomp ? bestDecomp.pair.tiles.some(t => {
    if (!params.winningTileId) return false;
    const wt = params.menzenTiles.find(x => x.id === params.winningTileId);
    return wt && parseTileKey(t) === parseTileKey(wt);
  }) : false);

  const isYaochuPair = bestDecomp ? isYaochu(bestDecomp.pair.tiles[0]) : false;
  const hasPinfu = detectedYakuIds.includes('pinfu');
  const waitType = bestDecomp
    ? detectWaitType(params.menzenTiles, params.winningTileId, bestDecomp)
    : (bestIsChiitoitsu ? 'tanki' : 'ryanmen');

  return {
    detectedYakuIds,
    isTanki,
    isYaochuPair,
    hasPinfu,
    openKanCount,
    closedKanCount,
    isMenzen,
    bestDecomp,
    isChiitoitsu: bestIsChiitoitsu,
    waitType,
    yakumanCount: bestYakumanCount,
  };
};