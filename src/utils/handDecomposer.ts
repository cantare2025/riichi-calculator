import { Tile, TileSuit, TileValue, FuroSet, FuroType, parseTileKey, Wind } from '../stores/gameStore';

export type MeldType = 'shuntsu' | 'koutsu' | 'kan' | 'pair';
export type WaitType = 'tanki' | 'kanchan' | 'penchan' | 'ryanmen' | 'shanpon';

export interface DecomposedMeld {
  type: MeldType;
  suit: TileSuit;
  value: TileValue;
  tiles: Tile[];
  isConcealed: boolean;
}

export interface HandDecomposition {
  menzenMelds: DecomposedMeld[];
  pair: DecomposedMeld;
  furoMelds: DecomposedMeld[];
  allMelds: DecomposedMeld[];
}

export const isYaochu = (tile: Omit<Tile, 'id'>): boolean => {
  return tile.value === '1' || tile.value === '9' || tile.suit === 'feng' || tile.suit === 'yuan';
};

export const isHonor = (tile: Omit<Tile, 'id'>): boolean => {
  return tile.suit === 'feng' || tile.suit === 'yuan';
};

export const isTerminal = (tile: Omit<Tile, 'id'>): boolean => {
  return (tile.value === '1' || tile.value === '9') && (tile.suit === 'wan' || tile.suit === 'tiao' || tile.suit === 'tong');
};

const countTiles = (tiles: Tile[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  tiles.forEach(t => { counts[parseTileKey(t)] = (counts[parseTileKey(t)] || 0) + 1; });
  return counts;
};

// 回溯法：找出一个花色的所有可能分解
const decomposeSuitAll = (
  counts: Record<string, number>
): { type: 'shuntsu' | 'koutsu'; value: string }[][] => {
  // 找到最小非零值
  let lowest = -1;
  for (let i = 1; i <= 9; i++) {
    if ((counts[`${i}`] || 0) > 0) { lowest = i; break; }
  }
  if (lowest === -1) return [[]]; // 基础情况：全部用完

  const results: { type: 'shuntsu' | 'koutsu'; value: string }[][] = [];

  // 尝试刻子
  if ((counts[`${lowest}`] || 0) >= 3) {
    counts[`${lowest}`] -= 3;
    const subResults = decomposeSuitAll(counts);
    for (const sub of subResults) {
      results.push([{ type: 'koutsu', value: `${lowest}` }, ...sub]);
    }
    counts[`${lowest}`] += 3;
  }

  // 尝试顺子
  if (lowest <= 7 && (counts[`${lowest}`] || 0) > 0 && (counts[`${lowest + 1}`] || 0) > 0 && (counts[`${lowest + 2}`] || 0) > 0) {
    counts[`${lowest}`]--;
    counts[`${lowest + 1}`]--;
    counts[`${lowest + 2}`]--;
    const subResults = decomposeSuitAll(counts);
    for (const sub of subResults) {
      results.push([{ type: 'shuntsu', value: `${lowest}` }, ...sub]);
    }
    counts[`${lowest}`]++;
    counts[`${lowest + 1}`]++;
    counts[`${lowest + 2}`]++;
  }

  return results;
};

// 检测七对子
export const checkChiitoitsu = (menzenTiles: Tile[], furoSets: FuroSet[]): boolean => {
  if (furoSets.length > 0) return false;
  if (menzenTiles.length !== 14) return false;
  const counts = countTiles(menzenTiles);
  const values = Object.values(counts);
  return values.length === 7 && values.every(v => v === 2);
};

// 检测国士无双
export const checkKokushi = (menzenTiles: Tile[], furoSets: FuroSet[]): boolean => {
  if (furoSets.length > 0) return false;
  if (menzenTiles.length !== 14) return false;
  const counts = countTiles(menzenTiles);
  const neededKeys = [
    'wan-1', 'wan-9', 'tiao-1', 'tiao-9', 'tong-1', 'tong-9',
    'feng-东', 'feng-南', 'feng-西', 'feng-北',
    'yuan-中', 'yuan-发', 'yuan-白',
  ];
  let pairCount = 0;
  for (const key of neededKeys) {
    if (!counts[key] || counts[key] === 0) return false;
    if (counts[key] === 2) pairCount++;
  }
  return pairCount === 1;
};

// 找出所有可能的分解（4面子+1对子）
const MAX_DECOMPOSITIONS = 30;

export const findAllDecompositions = (
  menzenTiles: Tile[],
  furoSets: FuroSet[]
): HandDecomposition[] => {
  const results: HandDecomposition[] = [];
  const counts = countTiles(menzenTiles);

  // 构建副露面子
  const furoMelds: DecomposedMeld[] = furoSets.map(s => {
    if (s.type === 'minkan' || s.type === 'ankan') {
      return { type: 'kan' as const, suit: s.tiles[0].suit, value: s.tiles[0].value, tiles: s.tiles, isConcealed: s.type === 'ankan' };
    }
    if (s.type === 'pon') {
      return { type: 'koutsu' as const, suit: s.tiles[0].suit, value: s.tiles[0].value, tiles: s.tiles, isConcealed: false };
    }
    // chi
    const values = s.tiles.map(t => parseInt(t.value)).sort((a, b) => a - b);
    return { type: 'shuntsu' as const, suit: s.tiles[0].suit, value: String(values[0]) as TileValue, tiles: s.tiles, isConcealed: false };
  });

  // 尝试每种可能的对子
  const pairCandidates = new Set<string>();
  Object.entries(counts).forEach(([key, count]) => {
    if (count >= 2) pairCandidates.add(key);
  });

  for (const pairKey of pairCandidates) {
    if (results.length >= MAX_DECOMPOSITIONS) break;

    const [suitStr, valueStr] = pairKey.split('-');
    const suit = suitStr as TileSuit;
    const value = valueStr as TileValue;

    // 移除对子
    counts[pairKey] -= 2;

    // 分解剩余牌（找所有可能）
    const allDecompositions = decomposeRemainingAll(counts);

    for (const melds of allDecompositions) {
      if (results.length >= MAX_DECOMPOSITIONS) break;

      const menzenMelds: DecomposedMeld[] = melds.map(m => ({
        type: m.type, suit: m.suit, value: m.value as TileValue, tiles: m.tiles, isConcealed: true,
      }));

      const pair: DecomposedMeld = {
        type: 'pair', suit, value,
        tiles: [{ id: '', suit, value }, { id: '', suit, value }],
        isConcealed: true,
      };

      results.push({
        menzenMelds, pair, furoMelds,
        allMelds: [...menzenMelds, pair, ...furoMelds],
      });
    }

    // 恢复对子
    counts[pairKey] += 2;
  }

  return results;
};

// 分解剩余牌（不含对子），返回所有可能的分解
const decomposeRemainingAll = (
  counts: Record<string, number>
): { type: 'shuntsu' | 'koutsu'; suit: TileSuit; value: string; tiles: Tile[] }[][] => {
  const suits: TileSuit[] = ['wan', 'tiao', 'tong', 'feng', 'yuan'];

  // 当前累积的结果（每个元素是一种完整的分解）
  let currentResults: { type: 'shuntsu' | 'koutsu'; suit: TileSuit; value: string; tiles: Tile[] }[][] = [[]];

  for (const suit of suits) {
    // 收集该花色的牌数
    const suitCounts: Record<string, number> = {};
    let hasTiles = false;

    if (suit === 'feng' || suit === 'yuan') {
      // 字牌：遍历所有键找匹配的花色
      for (const [key, count] of Object.entries(counts)) {
        if (count > 0 && key.startsWith(`${suit}-`)) {
          const value = key.split('-')[1];
          suitCounts[value] = count;
          hasTiles = true;
        }
      }
    } else {
      // 数牌：1-9
      for (let i = 1; i <= 9; i++) {
        const key = `${suit}-${i}`;
        if ((counts[key] || 0) > 0) {
          suitCounts[`${i}`] = counts[key];
          hasTiles = true;
        }
      }
    }
    if (!hasTiles) continue;

    // 找出该花色的所有分解
    let suitDecompositions: { type: 'shuntsu' | 'koutsu'; suit: TileSuit; value: string; tiles: Tile[] }[][];

    if (suit === 'feng' || suit === 'yuan') {
      // 字牌只能成刻子
      const values = Object.keys(suitCounts);
      let valid = true;
      const melds: { type: 'shuntsu' | 'koutsu'; suit: TileSuit; value: string; tiles: Tile[] }[] = [];
      for (const v of values) {
        if (suitCounts[v] === 3) {
          melds.push({
            type: 'koutsu', suit, value: v,
            tiles: Array(3).fill(null).map(() => ({ id: '', suit, value: v as TileValue })),
          });
        } else { valid = false; break; }
      }
      suitDecompositions = valid ? [melds] : [];
    } else {
      // 数牌：用回溯法找所有分解
      const allDecomps = decomposeSuitAll({ ...suitCounts });
      suitDecompositions = allDecomps.map(decomp =>
        decomp.map(d => ({
          type: d.type, suit, value: d.value,
          tiles: d.type === 'koutsu'
            ? Array(3).fill(null).map(() => ({ id: '', suit, value: d.value as TileValue }))
            : [parseInt(d.value), parseInt(d.value) + 1, parseInt(d.value) + 2].map(v => ({ id: '', suit, value: String(v) as TileValue })),
        }))
      );
    }

    // 与已有结果做笛卡尔积
    const newResults: typeof currentResults = [];
    for (const prev of currentResults) {
      for (const suitDecomp of suitDecompositions) {
        newResults.push([...prev, ...suitDecomp]);
        if (newResults.length >= MAX_DECOMPOSITIONS) break;
      }
      if (newResults.length >= MAX_DECOMPOSITIONS) break;
    }
    currentResults = newResults;

    if (currentResults.length === 0) return [];
  }

  return currentResults;
};

// 检测听牌形式
export const detectWaitType = (
  menzenTiles: Tile[],
  winningTileId: string | null,
  decomp: HandDecomposition
): WaitType => {
  if (!winningTileId) return 'ryanmen';
  const winningTile = menzenTiles.find(t => t.id === winningTileId);
  if (!winningTile) return 'ryanmen';
  const winKey = parseTileKey(winningTile);

  // 单骑：胡牌是对子
  if (decomp.pair.tiles.some(t => parseTileKey(t) === winKey)) return 'tanki';

  // 检查手牌面子
  for (const meld of decomp.menzenMelds) {
    if (meld.type === 'koutsu') {
      // 刻子胡牌 = 双碰（shanpon）
      if (meld.tiles.some(t => parseTileKey(t) === winKey)) return 'shanpon';
    }
    if (meld.type === 'shuntsu') {
      if (meld.tiles.some(t => parseTileKey(t) === winKey)) {
        const startValue = parseInt(meld.value);
        const winValue = parseInt(winningTile.value);
        if (winValue === startValue + 1) return 'kanchan'; // 嵌张：中间那张
        if (winValue === startValue && startValue === 1) return 'penchan'; // 边张：12吃3
        if (winValue === startValue + 2 && startValue === 7) return 'penchan'; // 边张：89吃7
        return 'ryanmen'; // 两面
      }
    }
  }

  return 'ryanmen';
};

// 验证手牌是否可以胡牌
export const validateHand = (
  menzenTiles: Tile[],
  furoSets: FuroSet[],
  winningTileId: string | null
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const kanCount = furoSets.filter(s => s.tiles.length === 4).length;
  const totalTiles = menzenTiles.length + furoSets.reduce((acc, s) => acc + s.tiles.length, 0);
  const expectedTotal = 14 + kanCount;

  if (totalTiles !== expectedTotal) {
    errors.push(`牌数不正确：当前${totalTiles}张，需要${expectedTotal}张`);
  }

  if (!winningTileId && menzenTiles.length > 0) {
    errors.push('请点击一张牌标记为胡牌');
  }

  if (totalTiles === expectedTotal) {
    const hasDecomp = findAllDecompositions(menzenTiles, furoSets).length > 0;
    const hasChiitoitsu = checkChiitoitsu(menzenTiles, furoSets);
    const hasKokushi = checkKokushi(menzenTiles, furoSets);
    if (!hasDecomp && !hasChiitoitsu && !hasKokushi) {
      errors.push('手牌无法组成胡牌形状');
    }
  }

  return { isValid: errors.length === 0, errors };
};