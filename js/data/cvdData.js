/**
 * cvdData.js
 * Comprehensive Color Vision Deficiency (CVD) educational and statistical dataset
 */

export const CVD_DATA = {
  'R': {
    name: '적색 색각이상 (Protanopia / Protanomaly)',
    color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200',
    cones: { L: 'bad', M: 'ok', S: 'ok' },
    prevalence: { male: 1.0, female: 0.02 },
    confusions: [
      { label: '익은 사과 vs 잎', a: '#CC2200', b: '#2D4A1E' },
      { label: '빨강 vs 짙은 갈색', a: '#EE1111', b: '#3A1A00' },
      { label: '주황 vs 황록', a: '#FF6600', b: '#8B8B00' },
    ],
    desc: '빨간색을 감지하는 장파장(L형) 원추세포에 이상이 생긴 상태입니다. 빨간색이 매우 어둡거나 검은색에 가깝게 보이며, 선명한 붉은색과 짙은 갈색·카키색 구분이 거의 불가능합니다.',
    types: ['1형 색맹 (Protanopia): L형 원추세포 완전 결여', '1형 색약 (Protanomaly): L형 원추세포 감도 저하', '남성 유병률 ~1%, 여성 ~0.02%']
  },
  'G': {
    name: '녹색 색각이상 (Deuteranopia / Deuteranomaly)',
    color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200',
    cones: { L: 'ok', M: 'bad', S: 'ok' },
    prevalence: { male: 6.0, female: 0.4 },
    confusions: [
      { label: '잔디 vs 낙엽', a: '#228B22', b: '#B8860B' },
      { label: '초록 vs 노랑', a: '#32CD32', b: '#FFD700' },
      { label: '빨강 vs 황갈', a: '#DC143C', b: '#B8860B' },
    ],
    desc: '녹색을 감지하는 중파장(M형) 원추세포에 이상이 생긴 유형으로, 색각이상 중 가장 흔합니다. 녹색이 황색·베이지색처럼 보이고 붉은 색조와 혼동되는 경우가 많습니다.',
    types: ['2형 색맹 (Deuteranopia): M형 원추세포 완전 결여', '2형 색약 (Deuteranomaly): M형 원추세포 감도 저하', '남성 유병률 ~6%, 여성 ~0.4%']
  },
  'B': {
    name: '청색 색각이상 (Tritanopia / Tritanomaly)',
    color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200',
    cones: { L: 'ok', M: 'ok', S: 'bad' },
    prevalence: { male: 0.01, female: 0.01 },
    confusions: [
      { label: '파랑 vs 초록', a: '#1E90FF', b: '#228B22' },
      { label: '노랑 vs 분홍', a: '#FFD700', b: '#FF69B4' },
      { label: '보라 vs 빨강', a: '#8B008B', b: '#CC0000' },
    ],
    desc: '파란색을 감지하는 단파장(S형) 원추세포에 이상이 있는 유형입니다. 하늘과 흰 구름 경계가 불분명하고 파랑↔초록, 노랑↔분홍 혼동이 특징입니다.',
    types: ['3형 색맹 (Tritanopia): S형 원추세포 완전 결여', '3형 색약 (Tritanomaly): S형 원추세포 감도 저하', '유병률 남녀 동일 ~0.01%']
  },
  'RG': {
    name: '적녹 색각이상 (Red-Green CVD)',
    color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200',
    cones: { L: 'bad', M: 'bad', S: 'ok' },
    prevalence: { male: 8.0, female: 0.5 },
    confusions: [
      { label: '신호등 적·녹', a: '#FF2200', b: '#00BB00' },
      { label: '빨강 vs 카키', a: '#CC0000', b: '#6B6B00' },
      { label: '초록 vs 주황', a: '#228B22', b: '#FF8C00' },
    ],
    desc: '색각이상 중 가장 많은 비율을 차지하는 유형으로, 전 세계 남성의 약 8%, 여성의 약 0.5%가 해당합니다.',
    types: ['Protanopia/Protanomaly: L형 이상', 'Deuteranopia/Deuteranomaly: M형 이상', '이시하라 검사로 가장 잘 감별되는 유형']
  },
  'RB': {
    name: '적청 색각이상 (Red-Blue CVD)',
    color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200',
    cones: { L: 'bad', M: 'ok', S: 'bad' },
    prevalence: { male: 0.005, female: 0.005 },
    confusions: [
      { label: '보라 vs 주황', a: '#800080', b: '#FF8C00' },
      { label: '분홍 vs 하늘', a: '#FF69B4', b: '#87CEEB' },
      { label: '자주 vs 황록', a: '#8B0057', b: '#9ACD32' },
    ],
    desc: '빨간색과 파란색 계통을 동시에 구분하기 어려운 매우 드문 복합 유형입니다.',
    types: ['L형 + S형 원추세포 동시 이상', '혼동 색상: 보라↔주황, 분홍↔하늘색', '후천성 원인이 많음']
  },
  'GB': {
    name: '녹청 색각이상 (Green-Blue CVD)',
    color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200',
    cones: { L: 'ok', M: 'bad', S: 'bad' },
    prevalence: { male: 0.003, female: 0.003 },
    confusions: [
      { label: '청록 vs 파랑', a: '#00CED1', b: '#0000CD' },
      { label: '에메랄드 vs 하늘', a: '#50C878', b: '#87CEEB' },
      { label: '올리브 vs 청록', a: '#808000', b: '#20B2AA' },
    ],
    desc: '녹색과 파란색 계통을 구분하기 어려운 유형으로, 차가운 색상 스펙트럼 전반에서 혼동이 발생합니다.',
    types: ['M형 + S형 원추세포 동시 이상', '자연·수중 이미지에서 혼동 빈도 높음', '선천성은 매우 희귀']
  },
  'RGB': {
    name: '전색맹 (Achromatopsia)',
    color: 'text-stone-700', bg: 'bg-stone-100', border: 'border-stone-300',
    cones: { L: 'bad', M: 'bad', S: 'bad' },
    prevalence: { male: 0.003, female: 0.003 },
    confusions: [
      { label: '빨강 vs 녹색', a: '#CC0000', b: '#228B22' },
      { label: '파랑 vs 노랑', a: '#0000CC', b: '#FFD700' },
      { label: '보라 vs 주황', a: '#6600CC', b: '#FF8C00' },
    ],
    desc: '세 종류의 원추세포(L·M·S형) 모두가 기능하지 않아 세상이 흑백 사진처럼 밝기 차이로만 느껴집니다.',
    types: ['완전 전색맹: 색상 인식 완전 불가', '동반 증상: 광과민증, 중심 시력 저하']
  }
};
