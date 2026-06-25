import { useRef, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { useGameStore, TileSuit, TileValue, parseTileKey } from '../stores/gameStore';
import { validateHand } from '../utils/handDecomposer';

const suits: { suit: TileSuit; name: string; values: TileValue[] }[] = [
  { suit: 'wan', name: '万', values: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] },
  { suit: 'tiao', name: '条', values: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] },
  { suit: 'tong', name: '筒', values: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] },
  { suit: 'feng', name: '风', values: ['东', '南', '西', '北'] },
  { suit: 'yuan', name: '三元', values: ['白', '发', '中'] },
];

const suitColors: Record<TileSuit, string> = {
  wan: 'text-red-600', tiao: 'text-green-600', tong: 'text-blue-600',
  feng: 'text-gray-700', yuan: 'text-purple-600',
};

// 牌面图片路径映射
const tileImageMap: Record<string, string> = {};
const fengValueToZ: Record<string, string> = { '东': '1z', '南': '2z', '西': '3z', '北': '4z' };
const yuanValueToZ: Record<string, string> = { '白': '5z', '发': '6z', '中': '7z' };

const getTileImagePath = (suit: TileSuit, value: TileValue): string => {
  let filename: string;
  if (suit === 'wan') filename = `${value}m`;
  else if (suit === 'tong') filename = `${value}p`;
  else if (suit === 'tiao') filename = `${value}s`;
  else if (suit === 'feng') filename = fengValueToZ[value];
  else filename = yuanValueToZ[value];
  return `/tiles/${filename}.png`;
};

const valueDisplay = (value: TileValue): string => {
  if (parseInt(value)) return ['一', '二', '三', '四', '五', '六', '七', '八', '九'][parseInt(value) - 1];
  return value;
};

const useLongPress = (onLongPress: () => void, onClick: () => void, ms = 500) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef(false);
  const isTouchRef = useRef(false);

  const start = useCallback(() => {
    triggeredRef.current = false;
    timerRef.current = setTimeout(() => { triggeredRef.current = true; onLongPress(); }, ms);
  }, [onLongPress, ms]);

  const clear = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (!triggeredRef.current) onClick();
  }, [onClick]);

  return {
    onTouchStart: (e: React.TouchEvent) => {
      isTouchRef.current = true;
      e.preventDefault();
      start();
    },
    onMouseDown: () => {
      if (isTouchRef.current) return;
      start();
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      clear();
      isTouchRef.current = false;
    },
    onTouchCancel: () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      isTouchRef.current = false;
    },
    onMouseUp: () => {
      if (isTouchRef.current) return;
      clear();
    },
    onMouseLeave: () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } },
  };
};

const TileCard = ({
  suit, value, isWinning, small, onClick, onLongPress, onDelete, showDelete,
}: {
  suit: TileSuit; value: TileValue; isWinning?: boolean; small?: boolean;
  onClick?: () => void; onLongPress?: () => void; onDelete?: () => void; showDelete?: boolean;
}) => {
  const handlers = useLongPress(() => onLongPress?.(), () => onClick?.());
  const cls = small ? 'w-8 h-12' : 'w-10 h-14';
  const imgPath = getTileImagePath(suit, value);
  return (
    <div
      className={`relative ${cls} bg-white border-2 rounded-md flex items-center justify-center cursor-pointer select-none transition-all overflow-hidden ${
        isWinning ? 'border-red-500 ring-2 ring-red-300' : 'border-gray-300 hover:border-gray-400'
      }`}
      {...handlers}
    >
      <img src={imgPath} alt={valueDisplay(value)} className="w-full h-full object-contain" draggable={false} />
      {showDelete && onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600 z-10"
        >×</button>
      )}
    </div>
  );
};

export const TileInput = () => {
  const {
    menzenTiles, furoSets, winningTileId, activeTarget, pendingKanType, pendingFuroTiles,
    addTile, removeMenzenTile, removeFuroTile, clearMenzenTiles, clearFuroSets,
    setActiveTarget, setPendingKan, cancelPendingKan, setWinningTileId,
    moveTileToFuro, moveTileToHand, removePendingFuroTile, reset,
  } = useGameStore();

  const getTileCount = (suit: TileSuit, value: TileValue): number => {
    const key = parseTileKey({ suit, value });
    const inHand = menzenTiles.filter(t => parseTileKey(t) === key).length;
    const inFuro = furoSets.reduce((acc, s) => acc + s.tiles.filter(t => parseTileKey(t) === key).length, 0);
    const inPending = pendingFuroTiles.filter(t => parseTileKey(t) === key).length;
    return inHand + inFuro + inPending;
  };

  const kanCount = furoSets.filter(s => s.tiles.length === 4).length;
  const totalTiles = menzenTiles.length + furoSets.reduce((acc, s) => acc + s.tiles.length, 0) + pendingFuroTiles.length;
  const expectedTotal = 14 + kanCount;
  const isMenzen = furoSets.length === 0 || furoSets.every(s => s.type === 'ankan');

  // 实时验证
  const validation = validateHand(menzenTiles, furoSets, winningTileId);

  const zoneClass = (target: 'hand' | 'furo') => {
    const base = 'min-h-[70px] p-2 rounded-md border-2 transition-all cursor-pointer flex flex-wrap gap-1 items-start';
    if (activeTarget === target) return `${base} border-green-500 bg-green-50 ring-2 ring-green-200`;
    return `${base} border-dashed border-gray-300 bg-gray-50 hover:border-gray-400`;
  };

  const furoTypeLabel = (type: string): string => {
    const labels: Record<string, string> = { chi: '吃', pon: '碰', minkan: '明杠', ankan: '暗杠' };
    return labels[type] || type;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">手牌输入</h2>
        <button
          onClick={reset}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <RotateCcw size={14} />
          重置
        </button>
      </div>

      <div className="mb-3 text-sm text-gray-600">
        门清：{isMenzen ? '是' : '否'} | 牌数：{totalTiles}/{expectedTotal}
        {pendingKanType && <span className="ml-2 text-orange-600 font-medium">（点击牌面添加{pendingKanType === 'minkan' ? '明杠' : '暗杠'}，一次4张）</span>}
        {pendingFuroTiles.length > 0 && <span className="ml-2 text-orange-600 font-medium">（副露添加中：{pendingFuroTiles.length}/3）</span>}
      </div>

      {/* 验证信息 */}
      {totalTiles > 0 && (
        <div className="mb-3">
          {validation.isValid ? (
            <div className="text-sm text-green-600 font-medium">牌数正确，可以组成胡牌形状</div>
          ) : (
            <div className="text-sm text-red-500">
              {validation.errors.map((err, i) => <div key={i}>{err}</div>)}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 mb-4">
        {/* 手牌区 */}
        <div className="flex items-start gap-2">
          <button
            onClick={() => setActiveTarget('hand')}
            className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all mt-1 ${
              activeTarget === 'hand' ? 'bg-green-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >手牌</button>
          <div onClick={() => setActiveTarget('hand')} className={zoneClass('hand') + ' flex-1'}>
            {menzenTiles.length === 0 ? (
              <span className="text-xs text-gray-400 self-center">点击激活后，点下方牌面添加（点击牌面标记胡牌，长按移动到副露）</span>
            ) : (
              menzenTiles.map((tile) => (
                <TileCard
                  key={tile.id} suit={tile.suit} value={tile.value}
                  isWinning={winningTileId === tile.id}
                  showDelete
                  onDelete={() => removeMenzenTile(tile.id)}
                  onClick={() => setWinningTileId(winningTileId === tile.id ? null : tile.id)}
                  onLongPress={() => moveTileToFuro(tile.id)}
                />
              ))
            )}
          </div>
          {menzenTiles.length > 0 && (
            <button onClick={clearMenzenTiles} className="shrink-0 text-xs text-gray-400 hover:text-red-500 mt-1">清空</button>
          )}
        </div>

        {/* 副露区 */}
        <div className="flex items-start gap-2">
          <button
            onClick={() => setActiveTarget('furo')}
            className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all mt-1 ${
              activeTarget === 'furo' ? 'bg-orange-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >副露</button>
          <div onClick={() => setActiveTarget('furo')} className={zoneClass('furo') + ' flex-1 flex-col'}>
            {furoSets.length === 0 && pendingFuroTiles.length === 0 ? (
              <span className="text-xs text-gray-400 self-center">点击激活后，点下方牌面一张张添加（3张组成顺子/刻子），或点「添加明杠/暗杠」一次4张（长按移回手牌）</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {furoSets.map((set) => (
                  <div
                    key={set.id}
                    className={`inline-flex items-center gap-1 p-1.5 rounded-md border ${
                      set.type === 'ankan' ? 'border-gray-300 bg-gray-50' :
                      set.type === 'minkan' ? 'border-orange-300 bg-orange-50' :
                      'border-blue-300 bg-blue-50'
                    }`}
                  >
                    <span className={`text-xs font-medium ${
                      set.type === 'ankan' ? 'text-gray-500' :
                      set.type === 'minkan' ? 'text-orange-600' : 'text-blue-600'
                    }`}>{furoTypeLabel(set.type)}</span>
                    <div className="flex gap-0.5">
                      {set.tiles.map((tile) => (
                        <TileCard
                          key={tile.id} suit={tile.suit} value={tile.value} small
                          showDelete
                          onDelete={() => removeFuroTile(set.id, tile.id)}
                          onLongPress={() => moveTileToHand(set.id, tile.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {pendingFuroTiles.length > 0 && (
                  <div className="inline-flex items-center gap-1 p-1.5 rounded-md border-2 border-dashed border-orange-400 bg-orange-50">
                    <span className="text-xs font-medium text-orange-600">添加中 ({pendingFuroTiles.length}/3)</span>
                    <div className="flex gap-0.5">
                      {pendingFuroTiles.map((tile) => (
                        <TileCard key={tile.id} suit={tile.suit} value={tile.value} small showDelete onDelete={() => removePendingFuroTile(tile.id)} />
                      ))}
                      {Array.from({ length: 3 - pendingFuroTiles.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-8 h-12 border-2 border-dashed border-gray-300 rounded-md" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {furoSets.length > 0 && (
            <button onClick={clearFuroSets} className="shrink-0 text-xs text-gray-400 hover:text-red-500 mt-1">清空</button>
          )}
        </div>
      </div>

      {/* 杠牌按钮 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setPendingKan('minkan')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            pendingKanType === 'minkan' ? 'bg-orange-500 text-white shadow-md' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
          }`}
        >添加明杠</button>
        <button
          onClick={() => setPendingKan('ankan')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            pendingKanType === 'ankan' ? 'bg-gray-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >添加暗杠</button>
        {pendingKanType && (
          <button onClick={cancelPendingKan} className="px-3 py-2 text-xs text-gray-500 hover:text-red-500">取消</button>
        )}
      </div>

      {/* 牌面选择区 */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">选择牌</h3>
        <div className="space-y-2">
          {suits.map(({ suit, name, values }) => (
            <div key={suit}>
              <div className="text-xs font-medium mb-1 text-gray-500">{name}</div>
              <div className="flex flex-wrap gap-1.5">
                {values.map((value) => {
                  const count = getTileCount(suit, value);
                  const full = count >= 4;
                  return (
                    <button
                      key={value} onClick={() => addTile({ suit, value })} disabled={full}
                      className="relative group" title={full ? '已满4张' : '点击添加'}
                    >
                      <TileCard suit={suit} value={value} />
                      {count > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-600 text-white text-xs rounded-full flex items-center justify-center">{count}</div>
                      )}
                      {full && <div className="absolute inset-0 bg-gray-200/50 rounded-md" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};