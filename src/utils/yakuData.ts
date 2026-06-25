export interface Yaku {
  id: string;
  name: string;
  han: number;
  openHan: number; // 副露时的番数（-1表示门清限定）
  isYakuman: boolean;
  isDoubleYakuman: boolean;
  description: string;
  requiresMenzen: boolean;
}

export const yakuList: Yaku[] = [
  // 役满
  { id: 'daisushi', name: '大四喜', han: 13, openHan: 13, isYakuman: true, isDoubleYakuman: false, description: '四风牌各成刻子或杠子', requiresMenzen: false },
  { id: 'suanko', name: '四暗刻', han: 13, openHan: -1, isYakuman: true, isDoubleYakuman: false, description: '四组暗刻或暗杠', requiresMenzen: true },
  { id: 'tsuiso', name: '字一色', han: 13, openHan: 13, isYakuman: true, isDoubleYakuman: false, description: '全由字牌组成', requiresMenzen: false },
  { id: 'sukantsu', name: '四杠子', han: 13, openHan: 13, isYakuman: true, isDoubleYakuman: false, description: '四个杠子', requiresMenzen: false },
  { id: 'ryuiso', name: '绿一色', han: 13, openHan: 13, isYakuman: true, isDoubleYakuman: false, description: '全由绿色牌组成', requiresMenzen: false },
  { id: 'chinroutou', name: '清老头', han: 13, openHan: 13, isYakuman: true, isDoubleYakuman: false, description: '全由老头牌组成', requiresMenzen: false },
  { id: 'kokushi_musou', name: '国士无双', han: 13, openHan: -1, isYakuman: true, isDoubleYakuman: false, description: '十三幺牌各一张', requiresMenzen: true },
  { id: 'churen_poutou', name: '九莲宝灯', han: 13, openHan: -1, isYakuman: true, isDoubleYakuman: false, description: '同花色1112345678999', requiresMenzen: true },
  { id: 'daisangen', name: '大三元', han: 13, openHan: 13, isYakuman: true, isDoubleYakuman: false, description: '中、发、白各成刻子或杠子', requiresMenzen: false },
  { id: 'shousushi', name: '小四喜', han: 13, openHan: 13, isYakuman: true, isDoubleYakuman: false, description: '三风牌成刻子，一风牌成对子', requiresMenzen: false },

  // 双倍役满
  { id: 'suanko_tanki', name: '四暗刻单骑', han: 26, openHan: -1, isYakuman: false, isDoubleYakuman: true, description: '四暗刻单骑听牌', requiresMenzen: true },
  { id: 'kokushi_musou_jyusanmen', name: '国士无双十三面', han: 26, openHan: -1, isYakuman: false, isDoubleYakuman: true, description: '国士无双十三面听牌', requiresMenzen: true },
  { id: 'junsei_churen_poutou', name: '纯正九莲宝灯', han: 26, openHan: -1, isYakuman: false, isDoubleYakuman: true, description: '纯正九莲宝灯', requiresMenzen: true },

  // 6番
  { id: 'chini', name: '清一色', han: 6, openHan: 5, isYakuman: false, isDoubleYakuman: false, description: '仅一种花色', requiresMenzen: false },

  // 3番
  { id: 'honi', name: '混一色', han: 3, openHan: 2, isYakuman: false, isDoubleYakuman: false, description: '一种花色加字牌', requiresMenzen: false },
  { id: 'junchan', name: '纯全带幺九', han: 3, openHan: 2, isYakuman: false, isDoubleYakuman: false, description: '所有面子包含老头牌，不含字牌', requiresMenzen: false },
  { id: 'ryanpeikou', name: '两杯口', han: 3, openHan: -1, isYakuman: false, isDoubleYakuman: false, description: '两组相同的顺子×2', requiresMenzen: true },

  // 2番
  { id: 'chiitoitsu', name: '七对子', han: 2, openHan: -1, isYakuman: false, isDoubleYakuman: false, description: '七组对子', requiresMenzen: true },
  { id: 'ittsu', name: '一气通贯', han: 2, openHan: 1, isYakuman: false, isDoubleYakuman: false, description: '同花色123/456/789顺子', requiresMenzen: false },
  { id: 'toitoi', name: '对对和', han: 2, openHan: 2, isYakuman: false, isDoubleYakuman: false, description: '四组刻子或杠子', requiresMenzen: false },
  { id: 'sanshoku_doujun', name: '三色同顺', han: 2, openHan: 1, isYakuman: false, isDoubleYakuman: false, description: '万条筒各一组相同数字的顺子', requiresMenzen: false },
  { id: 'sanshoku_doukou', name: '三色同刻', han: 2, openHan: 2, isYakuman: false, isDoubleYakuman: false, description: '万条筒各一组相同数字的刻子', requiresMenzen: false },
  { id: 'sanankou', name: '三暗刻', han: 2, openHan: 2, isYakuman: false, isDoubleYakuman: false, description: '三组暗刻或暗杠', requiresMenzen: false },
  { id: 'san_kantsu', name: '三杠子', han: 2, openHan: 2, isYakuman: false, isDoubleYakuman: false, description: '三个杠子', requiresMenzen: false },
  { id: 'shousangen', name: '小三元', han: 2, openHan: 2, isYakuman: false, isDoubleYakuman: false, description: '三元牌中两种成刻子，一种成对子', requiresMenzen: false },
  { id: 'honroutou', name: '混老头', han: 2, openHan: 2, isYakuman: false, isDoubleYakuman: false, description: '由幺九牌和字牌组成', requiresMenzen: false },
  { id: 'honchun_tanyao', name: '混全带幺九', han: 2, openHan: 1, isYakuman: false, isDoubleYakuman: false, description: '所有面子都含有幺九牌', requiresMenzen: false },
  { id: 'double_riichi', name: '两立直', han: 2, openHan: -1, isYakuman: false, isDoubleYakuman: false, description: '第一巡即宣布立直', requiresMenzen: true },

  // 1番
  { id: 'riichi', name: '立直', han: 1, openHan: -1, isYakuman: false, isDoubleYakuman: false, description: '门清状态下宣布听牌', requiresMenzen: true },
  { id: 'ippatsu', name: '一发', han: 1, openHan: -1, isYakuman: false, isDoubleYakuman: false, description: '立直后一巡内胡牌', requiresMenzen: true },
  { id: 'menzen_tsumo', name: '门前清自摸和', han: 1, openHan: -1, isYakuman: false, isDoubleYakuman: false, description: '门清状态下自摸胡牌', requiresMenzen: true },
  { id: 'pinfu', name: '平和', han: 1, openHan: -1, isYakuman: false, isDoubleYakuman: false, description: '四组顺子，雀头不是役牌', requiresMenzen: true },
  { id: 'tanyao', name: '断么九', han: 1, openHan: 1, isYakuman: false, isDoubleYakuman: false, description: '不含幺九牌和字牌', requiresMenzen: false },
  { id: 'yakuhai', name: '役牌', han: 1, openHan: 1, isYakuman: false, isDoubleYakuman: false, description: '场风、自风或三元牌成刻子', requiresMenzen: false },
  { id: 'iipeikou', name: '一杯口', han: 1, openHan: -1, isYakuman: false, isDoubleYakuman: false, description: '两组相同的顺子', requiresMenzen: true },
  { id: 'rinshan', name: '岭上开花', han: 1, openHan: 1, isYakuman: false, isDoubleYakuman: false, description: '杠后摸牌自摸胡牌', requiresMenzen: false },
  { id: 'chankan', name: '抢杠', han: 1, openHan: 1, isYakuman: false, isDoubleYakuman: false, description: '抢别人的杠胡牌', requiresMenzen: false },
  { id: 'haitei', name: '海底摸月', han: 1, openHan: 1, isYakuman: false, isDoubleYakuman: false, description: '最后一张牌自摸', requiresMenzen: false },
  { id: 'houtei', name: '河底捞鱼', han: 1, openHan: 1, isYakuman: false, isDoubleYakuman: false, description: '最后一张牌吃胡', requiresMenzen: false },
];

export const getYakuById = (id: string): Yaku | undefined => {
  return yakuList.find(yaku => yaku.id === id);
};

// 获取役种的番数（根据是否门清）
export const getYakuHan = (id: string, isMenzen: boolean): number => {
  const yaku = getYakuById(id);
  if (!yaku) return 0;
  if (yaku.isYakuman || yaku.isDoubleYakuman) return yaku.han;
  if (isMenzen) return yaku.han;
  if (yaku.openHan === -1) return 0; // 门清限定
  return yaku.openHan;
};