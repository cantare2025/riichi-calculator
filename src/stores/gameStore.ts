import { create } from 'zustand';

export type TileSuit = 'wan' | 'tiao' | 'tong' | 'feng' | 'yuan';
export type TileValue = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '东' | '南' | '西' | '北' | '中' | '发' | '白';
export type Wind = '东' | '南' | '西' | '北';

export interface Tile {
  id: string;
  suit: TileSuit;
  value: TileValue;
}

export type FuroType = 'chi' | 'pon' | 'minkan' | 'ankan';
export type InputTarget = 'hand' | 'furo';

export interface FuroSet {
  id: string;
  type: FuroType;
  tiles: Tile[];
}

export interface GameState {
  menzenTiles: Tile[];
  furoSets: FuroSet[];
  winningTileId: string | null;

  activeTarget: InputTarget;
  pendingKanType: 'minkan' | 'ankan' | null;
  pendingFuroTiles: Tile[];

  isTsumo: boolean;
  roundWind: Wind;
  seatWind: Wind;
  roundCount: number;
  doraCount: number;
  uradoraCount: number;

  isRiichi: boolean;
  isDoubleRiichi: boolean;
  isIppatsu: boolean;
  isRinshan: boolean;
  isChankan: boolean;
  isHaitei: boolean;
  isHoutei: boolean;

  isCalculated: boolean;

  setActiveTarget: (target: InputTarget) => void;
  setPendingKan: (type: 'minkan' | 'ankan' | null) => void;
  cancelPendingKan: () => void;

  addTile: (tile: Omit<Tile, 'id'>) => void;
  removeMenzenTile: (id: string) => void;
  removeFuroTile: (furoSetId: string, tileId: string) => void;
  clearMenzenTiles: () => void;
  clearFuroSets: () => void;

  setWinningTileId: (id: string | null) => void;

  moveTileToFuro: (id: string) => void;
  moveTileToHand: (furoSetId: string, tileId: string) => void;
  removePendingFuroTile: (id: string) => void;

  setIsTsumo: (value: boolean) => void;
  setRoundWind: (value: Wind) => void;
  setSeatWind: (value: Wind) => void;
  setRoundCount: (count: number) => void;
  setDoraCount: (count: number) => void;
  setUradoraCount: (count: number) => void;

  setIsRiichi: (value: boolean) => void;
  setIsDoubleRiichi: (value: boolean) => void;
  setIsIppatsu: (value: boolean) => void;
  setIsRinshan: (value: boolean) => void;
  setIsChankan: (value: boolean) => void;
  setIsHaitei: (value: boolean) => void;
  setIsHoutei: (value: boolean) => void;

  calculate: () => void;
  recalculate: () => void;
  reset: () => void;
}

export const tileKey = (suit: TileSuit, value: TileValue): string => `${suit}-${value}`;
export const parseTileKey = (tile: Omit<Tile, 'id'>) => tileKey(tile.suit, tile.value);

let idCounter = 0;
const nextId = () => `id-${++idCounter}`;

const getTileCount = (state: GameState, key: string): number => {
  const inHand = state.menzenTiles.filter(t => parseTileKey(t) === key).length;
  const inFuro = state.furoSets.reduce((acc, s) => acc + s.tiles.filter(t => parseTileKey(t) === key).length, 0);
  const inPending = state.pendingFuroTiles.filter(t => parseTileKey(t) === key).length;
  return inHand + inFuro + inPending;
};

// 正确的手牌上限计算
// 总牌数 = 14 + 杠数
// 手牌上限 = 14 + 杠数 - 副露牌数 - 待定副露牌数
const calcMaxHand = (furoSets: FuroSet[], pendingFuroTiles: Tile[]): number => {
  const kanCount = furoSets.filter(s => s.tiles.length === 4).length;
  const furoTileCount = furoSets.reduce((acc, s) => acc + s.tiles.length, 0);
  return 14 + kanCount - furoTileCount - pendingFuroTiles.length;
};

// 修改牌时自动取消计算状态
const uncalculate = (state: GameState): Partial<GameState> => {
  if (state.isCalculated) return { isCalculated: false };
  return {};
};

export const useGameStore = create<GameState>((set, get) => ({
  menzenTiles: [],
  furoSets: [],
  winningTileId: null,

  activeTarget: 'hand',
  pendingKanType: null,
  pendingFuroTiles: [],

  isTsumo: false,
  roundWind: '东',
  seatWind: '东',
  roundCount: 0,
  doraCount: 0,
  uradoraCount: 0,

  isRiichi: false,
  isDoubleRiichi: false,
  isIppatsu: false,
  isRinshan: false,
  isChankan: false,
  isHaitei: false,
  isHoutei: false,

  isCalculated: false,

  setActiveTarget: (target) => set({ activeTarget: target, pendingKanType: null }),

  setPendingKan: (type) => set({ pendingKanType: type, activeTarget: 'furo', pendingFuroTiles: [] }),

  cancelPendingKan: () => set({ pendingKanType: null }),

  addTile: (tile) => {
    const state = get();
    const key = parseTileKey(tile);
    const totalSame = getTileCount(state, key);
    if (totalSame >= 4) return;

    // 杠模式：一次添加4张
    if (state.pendingKanType) {
      const tiles: Tile[] = [];
      for (let i = 0; i < 4; i++) tiles.push({ ...tile, id: nextId() });
      set({
        furoSets: [...state.furoSets, { id: nextId(), type: state.pendingKanType, tiles }],
        pendingKanType: null,
        ...uncalculate(state),
      });
      return;
    }

    // 副露模式：一张一张添加
    if (state.activeTarget === 'furo') {
      const newPending = [...state.pendingFuroTiles, { ...tile, id: nextId() }];
      if (newPending.length === 3) {
        const allSame = newPending.every(t => parseTileKey(t) === parseTileKey(newPending[0]));
        const type: FuroType = allSame ? 'pon' : 'chi';
        set({
          furoSets: [...state.furoSets, { id: nextId(), type, tiles: newPending }],
          pendingFuroTiles: [],
          ...uncalculate(state),
        });
      } else {
        set({ pendingFuroTiles: newPending, ...uncalculate(state) });
      }
      return;
    }

    // 手牌模式
    if (state.activeTarget === 'hand') {
      const maxHand = calcMaxHand(state.furoSets, state.pendingFuroTiles);
      if (state.menzenTiles.length >= maxHand) return;
      set({ menzenTiles: [...state.menzenTiles, { ...tile, id: nextId() }], ...uncalculate(state) });
    }
  },

  removeMenzenTile: (id) => {
    const state = get();
    const newMenzen = state.menzenTiles.filter(t => t.id !== id);
    const newWinning = state.winningTileId === id ? null : state.winningTileId;
    set({ menzenTiles: newMenzen, winningTileId: newWinning, ...uncalculate(state) });
  },

  removeFuroTile: (furoSetId, tileId) => {
    const state = get();
    const furoSet = state.furoSets.find(s => s.id === furoSetId);
    if (!furoSet) return;
    const newTiles = furoSet.tiles.filter(t => t.id !== tileId);
    if (newTiles.length === 0) {
      set({ furoSets: state.furoSets.filter(s => s.id !== furoSetId), ...uncalculate(state) });
    } else {
      set({ furoSets: state.furoSets.map(s => s.id === furoSetId ? { ...s, tiles: newTiles } : s), ...uncalculate(state) });
    }
  },

  clearMenzenTiles: () => {
    const state = get();
    set({ menzenTiles: [], winningTileId: null, ...uncalculate(state) });
  },

  clearFuroSets: () => {
    const state = get();
    set({ furoSets: [], pendingFuroTiles: [], ...uncalculate(state) });
  },

  setWinningTileId: (id) => set({ winningTileId: id }),

  moveTileToFuro: (id) => {
    const state = get();
    if (state.pendingKanType) return;
    const tile = state.menzenTiles.find(t => t.id === id);
    if (!tile) return;
    const newMenzen = state.menzenTiles.filter(t => t.id !== id);
    const newWinning = state.winningTileId === id ? null : state.winningTileId;
    const newPending = [...state.pendingFuroTiles, tile];
    if (newPending.length === 3) {
      const allSame = newPending.every(t => parseTileKey(t) === parseTileKey(newPending[0]));
      const type: FuroType = allSame ? 'pon' : 'chi';
      set({
        menzenTiles: newMenzen, winningTileId: newWinning,
        furoSets: [...state.furoSets, { id: nextId(), type, tiles: newPending }],
        pendingFuroTiles: [],
        ...uncalculate(state),
      });
    } else {
      set({ menzenTiles: newMenzen, winningTileId: newWinning, pendingFuroTiles: newPending, ...uncalculate(state) });
    }
  },

  moveTileToHand: (furoSetId, tileId) => {
    const state = get();
    const furoSet = state.furoSets.find(s => s.id === furoSetId);
    if (!furoSet) return;
    const tile = furoSet.tiles.find(t => t.id === tileId);
    if (!tile) return;
    const newFuroTiles = furoSet.tiles.filter(t => t.id !== tileId);
    const newFuroSets = newFuroTiles.length === 0
      ? state.furoSets.filter(s => s.id !== furoSetId)
      : state.furoSets.map(s => s.id === furoSetId ? { ...s, tiles: newFuroTiles } : s);
    const maxHand = calcMaxHand(newFuroSets, state.pendingFuroTiles);
    if (state.menzenTiles.length >= maxHand) return;
    set({ furoSets: newFuroSets, menzenTiles: [...state.menzenTiles, tile], ...uncalculate(state) });
  },

  removePendingFuroTile: (id) => {
    const state = get();
    const newPending = state.pendingFuroTiles.filter(t => t.id !== id);
    set({ pendingFuroTiles: newPending, ...uncalculate(state) });
  },

  setIsTsumo: (value) => set({ isTsumo: value }),
  setRoundWind: (value) => set({ roundWind: value }),
  setSeatWind: (value) => set({ seatWind: value }),
  setRoundCount: (count) => set({ roundCount: Math.max(0, count) }),
  setDoraCount: (count) => set({ doraCount: Math.max(0, count) }),
  setUradoraCount: (count) => set({ uradoraCount: Math.max(0, count) }),

  setIsRiichi: (value) => set({ isRiichi: value }),
  setIsDoubleRiichi: (value) => set({ isDoubleRiichi: value, isRiichi: value ? false : get().isRiichi }),
  setIsIppatsu: (value) => set({ isIppatsu: value }),
  setIsRinshan: (value) => set({ isRinshan: value }),
  setIsChankan: (value) => set({ isChankan: value }),
  setIsHaitei: (value) => set({ isHaitei: value }),
  setIsHoutei: (value) => set({ isHoutei: value }),

  calculate: () => set({ isCalculated: true }),

  recalculate: () => {
    idCounter = 0;
    set({
      menzenTiles: [], furoSets: [], winningTileId: null,
      activeTarget: 'hand', pendingKanType: null, pendingFuroTiles: [],
      isTsumo: false, roundWind: '东', seatWind: '东',
      roundCount: 0, doraCount: 0, uradoraCount: 0,
      isRiichi: false, isDoubleRiichi: false, isIppatsu: false,
      isRinshan: false, isChankan: false, isHaitei: false, isHoutei: false,
      isCalculated: false,
    });
  },

  reset: () => {
    idCounter = 0;
    set({
      menzenTiles: [], furoSets: [], winningTileId: null,
      activeTarget: 'hand', pendingKanType: null, pendingFuroTiles: [],
      isTsumo: false, roundWind: '东', seatWind: '东',
      roundCount: 0, doraCount: 0, uradoraCount: 0,
      isRiichi: false, isDoubleRiichi: false, isIppatsu: false,
      isRinshan: false, isChankan: false, isHaitei: false, isHoutei: false,
      isCalculated: false,
    });
  },
}));