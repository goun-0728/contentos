// src/constants.js

export const C = {
  bg: '#F5F4F0', sur: '#FFF', alt: '#FAFAF8',
  bd: '#E4E2DC', bdm: '#CCC9C0',
  tx: '#18170F', mu: '#78766E', fa: '#B0ADA5',
}

export const TASKS = [
  { id: 'detail', label: 'Section Builder', sub: 'Amazon / Shopify', icon: '◫', col: '#1D6B45', li: '#E9F7F0' },
]

export const BLOG_TONES = ['생활형', '후기형', '공감형', '정보형', '전문가형']

export const DS = {
  '프리미엄블랙': { bg: '#18170F', fg: '#F5F4F0', ac: '#C8A96E', sub: '#272420', bd: '#3A3828' },
  '딥네이비':     { bg: '#0D1B2A', fg: '#E8F0F8', ac: '#7EB8D4', sub: '#162436', bd: '#243548' },
  '포레스트그린': { bg: '#1A3020', fg: '#F0FFF8', ac: '#5B9E6E', sub: '#243828', bd: '#2E4835' },
  '버건디':       { bg: '#2D0A0A', fg: '#FFF0EE', ac: '#C0614A', sub: '#3D1212', bd: '#501A1A' },
  '슬레이트':     { bg: '#2D3748', fg: '#F7FAFC', ac: '#90CDF4', sub: '#3D4A5C', bd: '#4A5568' },
  '웜베이지':     { bg: '#FAF3E0', fg: '#2D2000', ac: '#8B6914', sub: '#F0E8CC', bd: '#DDD0A0' },
  '로즈':         { bg: '#FDF2F2', fg: '#2D0808', ac: '#C0404A', sub: '#F8E8E8', bd: '#E8C0C0' },
  '올리브':       { bg: '#2A2E1A', fg: '#F8F8E8', ac: '#8B9E3A', sub: '#383C28', bd: '#484C38' },
  '크림':         { bg: '#FDFAF5', fg: '#2A2010', ac: '#A0784A', sub: '#F5F0E8', bd: '#E0D8C8' },
  '민트':         { bg: '#F0FDF9', fg: '#0D3A2A', ac: '#10B981', sub: '#D8F5EC', bd: '#A7E8D2' },
  '라벤더':       { bg: '#F6F3FF', fg: '#2E1A5C', ac: '#7C3AED', sub: '#EDE8FF', bd: '#C9B8F5' },
  '피치':         { bg: '#FFF5F0', fg: '#3A1205', ac: '#F97316', sub: '#FFE8DA', bd: '#F5C8A8' },
}
export const DS_KEYS = Object.keys(DS)

export const AUTO_DS = {
  HERO: '크림', '문제 공감': '크림', '해결 제안': '크림',
  '특징 강조': '크림', '사용 상황': '크림', '비교': '크림',
  '추천 대상': '크림', CTA: '크림', '브랜드 스토리': '크림',
  '소재설명': '크림', '인증/수상': '크림', '사용 장면': '크림',
  'Hero Banner': '프리미엄블랙', 'Feature Section': '크림', 'Benefit Section': '민트',
  'Comparison Section': '슬레이트', 'Lifestyle Section': '웜베이지',
  'Trust Section': '딥네이비', 'FAQ Section': '크림', 'Brand Story Section': '올리브',
  'CTA Section': '프리미엄블랙', 'How It Works Section': '크림',
  'Accordion Section': '크림', 'Carousel Section': '웜베이지',
  'Before After Section': '슬레이트', 'Review Slider Section': '크림',
}

export const AUTO_TPL = {
  HERO: 'fullHero', '문제 공감': 'story', '해결 제안': 'points3icon',
  '특징 강조': 'leftRight', '사용 상황': 'topBottom', '비교': 'compare',
  '추천 대상': 'howTo', CTA: 'fullHero',
  'Hero Banner': 'fullHero', 'Feature Section': 'leftRight', 'Benefit Section': 'points3icon',
  'Comparison Section': 'compare', 'Lifestyle Section': 'topBottom',
  'Trust Section': 'story', 'FAQ Section': 'howTo', 'Brand Story Section': 'story',
  'CTA Section': 'fullHero', 'How It Works Section': 'howTo',
  'Accordion Section': 'howTo', 'Carousel Section': 'topBottom',
  'Before After Section': 'compare', 'Review Slider Section': 'story',
}

export const TPL_LABELS = [
  { k: 'fullHero',    l: '풀이미지형' },
  { k: 'topBottom',   l: '상하분할형' },
  { k: 'leftRight',   l: '좌우분할형' },
  { k: 'points3icon', l: '포인트3단형' },
  { k: 'story',       l: '스토리형' },
  { k: 'howTo',       l: '활용법형' },
  { k: 'compare',     l: '비교형' },
  { k: 'specTable',   l: '제품상세표시' },
]

// 구버전 template 키 → 신버전 호환 매핑
export const TPL_COMPAT = {
  hero: 'fullHero', material: 'topBottom', detail2col: 'leftRight',
  scene: 'fullHero', target: 'howTo', cta: 'topBottom',
  points3: 'points3icon',
}

// 추가 가능한 섹션 목록
export const EXTRA_SECTIONS = [
  { type: 'Hero Banner',          label: 'Hero Banner',          sub: 'Premium first-view section',       template: 'hero',       designStyle: '프리미엄블랙' },
  { type: 'Feature Section',      label: 'Feature Section',      sub: 'Product details and proof points', template: 'detail2col', designStyle: '크림' },
  { type: 'Benefit Section',      label: 'Benefit Section',      sub: '3 benefit blocks',                 template: 'points3',    designStyle: '민트' },
  { type: 'Comparison Section',   label: 'Comparison Section',   sub: 'Check / X comparison rows',        template: 'compare',    designStyle: '슬레이트' },
  { type: 'Lifestyle Section',    label: 'Lifestyle Section',    sub: 'Use case and lifestyle visual',    template: 'material',   designStyle: '웜베이지' },
  { type: 'Trust Section',        label: 'Trust Section',        sub: 'Credentials, guarantees, proof',   template: 'points3',    designStyle: '딥네이비' },
  { type: 'FAQ Section',          label: 'FAQ Section',          sub: 'Question and answer blocks',       template: 'target',     designStyle: '크림' },
  { type: 'Brand Story Section',  label: 'Brand Story Section',  sub: 'Founder or brand narrative',       template: 'story',      designStyle: '올리브' },
  { type: 'CTA Section',          label: 'CTA Section',          sub: 'Conversion-focused close',         template: 'hero',       designStyle: '프리미엄블랙' },
  { type: 'How It Works Section', label: 'How It Works Section', sub: 'Interactive step blocks',          template: 'target',     designStyle: '크림' },
]

// 추가 섹션 AI 시스템 프롬프트
export function getExtraSectSys(typeKey) {
  if (typeKey === '제품상세표시') {
    return `당신은 스마트스토어 상세페이지 전문가입니다.
제품 정보를 참고하여 법적 필수 표시 정보를 작성하세요.
:: 구분자로 항목명과 값을 구분합니다. 값을 최대한 구체적으로 추정해서 채워주세요.
반드시 아래 형식만 출력:
메인카피: 제품 상세 정보
서브카피: 상품 구매 전 필독 사항
포인트:
• 제품명::
• 식품유형::
• 업소명::
• 소재지::
• 유통기한::
• 중량::
• 원재료::
• 보관방법::
• 주의사항::`
  }
  return `당신은 스마트스토어 상세페이지 전문 기획자입니다.
제품 정보를 참고하여 섹션 내용을 간결하게 작성하세요.
반드시 아래 형식만 출력:
메인카피: (15자 이내)
서브카피: (1줄)
포인트:
• 항목1
• 항목2
• 항목3`
}

export const AUTO_ICONS = ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ'] // 하위호환용, 실제는 SectionTemplates의 ROMAN 사용

// 섹션 데이터 기본 스키마
export const mkSec = (o = {}) => ({
  _id: Math.random().toString(36).slice(2, 9),
  sectionType: '', title: '', mainCopy: '', subCopy: '',
  points: [], description: '', designStyle: '크림',
  template: 'topBottom', photoDir: '{}', imagePrompt: '', cta: '',
  secImg: null, secImg2: null, secImg3: null, secImg4: null,
  textStyles: {}, customColors: {},
  ...o,
})

// ── 상세페이지 섹션 템플릿 빌더 ────────────────────────
const _NO = '--no illustration, cartoon, CGI, Western appearance, blonde hair, blue eyes, oversaturated, plastic look, stock photo, ai generated look, dramatic, extreme emotion'

const _S = {
  HERO: n => `[SECTION ${n} - HERO]
메인카피: (15자 이내)
서브카피: (1줄)
포인트:
•
•
•
촬영기획:
  - 장면: (어떤 장면)
  - 분위기: (조명·배경)
  - 구도: (카메라 앵글)
AI프롬프트: (제품 단독 메인샷 — product photography, [제품] on [배경], [조명], shot on Sony A7 35mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '문제 공감': n => `[SECTION ${n} - 문제 공감]
메인카피: (15자 이내)
서브카피: (20자 이내)
내용: (50자 이내, 제품 관련 공감 설명 1문장)
포인트:
•
•
•
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트: (불편함·문제 상황 장면 — lifestyle photography, [불편한 상황 묘사], [배경/환경], natural lighting from [방향], shot on Canon 5D Mark IV 50mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '해결 제안': n => `[SECTION ${n} - 해결 제안]
메인카피: (15자 이내)
서브카피: (20자 이내)
내용: (50자 이내, 제품이 제공하는 해결책 설명 1문장)
포인트:
•
•
•
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트: (제품 사용으로 해결되는 순간 — lifestyle photography, [해결 장면 묘사], [배경/환경], soft studio lighting, shot on Sony A7 85mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '특징 강조': n => `[SECTION ${n} - 특징 강조]
메인카피: (15자 이내)
서브카피: (20자 이내)
내용: (50자 이내, 제품 핵심 특징을 담은 설명 1문장)
포인트:
•
•
•
•
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트: (제품 디테일 클로즈업 — product photography, extreme close-up of [제품 특징 부위], [배경/소재], soft studio lighting diffused from top, shot on Sony A7 100mm macro lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '사용 상황': n => `[SECTION ${n} - 사용 상황]
메인카피: (15자 이내)
서브카피: (20자 이내)
내용: (50자 이내, 제품 사용 상황과 효과 설명 1문장)
포인트:
•
•
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트: (실제 사용 라이프스타일 장면 — lifestyle photography, [사용 중인 구체적 장면], [생활공간 배경], natural lighting from [방향], shot on Canon 5D Mark IV 35mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '비교': n => `[SECTION ${n} - 비교]
메인카피: (15자 이내)
서브카피: (20자 이내)
포인트:
• 일반제품: / 이제품:
• 일반제품: / 이제품:
• 일반제품: / 이제품:
AI프롬프트: (비교 또는 before/after 장면 — lifestyle photography, [before/after 또는 나란히 비교 장면], [깔끔한 중성 배경], soft studio lighting, shot on Sony A7 50mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '추천 대상': n => `[SECTION ${n} - 추천 대상]
메인카피: (15자 이내)
서브카피: (20자 이내)
내용: (50자 이내, 이 제품이 잘 맞는 사람 설명 1문장)
포인트:
•
•
•
•
AI프롬프트: (타겟 고객 라이프스타일 장면 — lifestyle photography, [타겟이 제품을 쓰는 구체적 상황], [타겟 생활환경 배경], natural lighting, shot on Canon 5D Mark IV 35mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '브랜드 스토리': n => `[SECTION ${n} - 브랜드 스토리]
메인카피: (15자 이내)
서브카피: (20자 이내)
내용: (50자 이내, 브랜드 철학/역사 핵심 1문장)
포인트:
•
•
•
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트: (브랜드 철학·스토리 감성 장면 — lifestyle photography, [브랜드 가치와 진정성을 담은 장면], [자연스럽고 따뜻한 배경], natural lighting from side, shot on Canon 5D Mark IV 35mm lens, shallow depth of field, warm authentic tones, ${_NO})`,

  CTA: n => `[SECTION ${n} - CTA]
메인카피: (15자 이내)
서브카피: (20자 이내)
버튼문구: (5자)
AI프롬프트: (구매욕구 자극 감성샷 — product photography, [제품을 가장 매력적으로 보여주는 구도], [고급스러운 배경/소품], soft studio lighting with [빛의 방향], shot on Sony A7 50mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '소재설명': n => `[SECTION ${n} - 소재설명]
메인카피: (15자 이내)
서브카피: (20자 이내)
내용: (50자 이내, 소재/성분의 품질과 특징 설명 1문장)
포인트:
•
•
•
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트: (소재·성분·원료 클로즈업 — product photography, extreme close-up of [소재/원료], [자연스러운 배경], soft studio lighting diffused from above, shot on Sony A7 100mm macro lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '인증/수상': n => `[SECTION ${n} - 인증/수상]
메인카피: (15자 이내)
서브카피: (20자 이내)
내용: (50자 이내, 인증/수상 내용과 신뢰 근거 설명)
포인트:
•
•
•
AI프롬프트: (신뢰·인증 강조 장면 — product photography, [제품과 인증서/수상 배지 배치], [깔끔한 밝은 배경], soft studio lighting, shot on Sony A7 50mm lens, shallow depth of field, [색감/분위기], ${_NO})`,

  '사용 장면': n => `[SECTION ${n} - 사용 장면]
메인카피: (15자 이내)
서브카피: (20자 이내)
내용: (50자 이내, 제품 활용 장면과 효과 설명 1문장)
포인트:
•
•
촬영기획:
  - 장면:
  - 분위기:
  - 구도:
AI프롬프트: (제품 활용 라이프스타일 장면 2 — lifestyle photography, [사용 중인 두 번째 구체적 장면], [생활 공간 배경], natural lighting from [방향], shot on Canon 5D Mark IV 35mm lens, shallow depth of field, [색감/분위기], ${_NO})`,
}

function _buildSections(opts = {}) {
  const { planningStyle } = opts
  let order
  switch (planningStyle) {
    case '문제해결형':   order = ['HERO', '문제 공감', '해결 제안', '특징 강조', '비교', 'CTA']; break
    case '감성소구형':   order = ['HERO', '브랜드 스토리', '사용 상황', '추천 대상', 'CTA']; break
    case '전문성강조형': order = ['HERO', '소재설명', '특징 강조', '인증/수상', 'CTA']; break
    case '라이프스타일형': order = ['HERO', '사용 상황', '사용 장면', '추천 대상', 'CTA']; break
    case '비교우위형':   order = ['HERO', '문제 공감', '비교', '특징 강조', 'CTA']; break
    case '스토리텔링형': order = ['HERO', '브랜드 스토리', '소재설명', '사용 상황', 'CTA']; break
    default: order = ['HERO', '문제 공감', '해결 제안', '특징 강조', '사용 상황', '비교', '추천 대상', 'CTA']
  }
  return order.map((name, i) => _S[name](i + 1)).join('\n\n')
}

const _TONE_MAP = {
  '따뜻한/감성적': '따뜻하고 감성적인 문체, 공감과 위로 중심, 부드러운 어휘',
  '신뢰감/전문적': '전문적·신뢰감 있는 문체, 근거·수치 중심, 권위 있는 어조',
  '힙/트렌디': 'MZ세대 감성, 짧고 임팩트 있는 카피, 세련되고 현대적인 표현',
  '레트로/빈티지': '레트로·빈티지 감성, 향수와 정서를 자극하는 클래식한 어휘',
  '유머/B급': 'B급 감성과 유머, 재치 있는 표현, 예상치 못한 웃음 포인트',
  '고급스러운': '고급스럽고 세련된 문체, 품격 있는 어조, 감각적인 표현',
  '친근한/편안한': '친근하고 편안한 문체, 가까운 친구처럼 이야기하는 어조',
}
const _EMPH_MAP = {
  '품질/성능': '품질과 성능의 차별점을 구체적 근거와 함께 강조',
  '원산지/성분': '원산지·성분의 품질과 안전성을 구체적으로 강조',
  '가격/가성비': '가격 대비 우수한 가치와 실용성을 명확한 근거로 제시',
  '편의성': '사용 편리성·시간 절약·간편함을 전면에 강조',
  '브랜드스토리': '브랜드의 철학·역사·스토리를 중심으로 신뢰와 감성 구축',
  '인증/수상': '인증·수상 이력을 근거로 품질 신뢰 강조',
  '환경/윤리': '친환경·윤리적 생산·지속가능성 가치를 강조',
  '디자인/패키지': '디자인과 패키지의 감성과 차별점 강조',
}

function _buildCustomBlock(opts = {}) {
  const {
    category, priceRange,
    gender, ageGroup, purchaseSituation,
    pricePosition, competition,
    differentiator, differentiatorTypes = [],
    planningStyle, brandTone = [], emphasis = [],
  } = opts
  const lines = ['━━━ 맞춤 기획 설정 ━━━']

  if (category || priceRange) {
    const parts = [category, priceRange].filter(Boolean)
    lines.push(`■ 제품 카테고리/가격대: ${parts.join(' / ')}`)
  }

  const targetParts = [gender, ageGroup].filter(Boolean)
  if (targetParts.length || purchaseSituation) {
    if (targetParts.length) lines.push(`■ 타겟 고객: ${targetParts.join(' ')} 중심`)
    if (purchaseSituation) lines.push(`  구매 상황: ${purchaseSituation}`)
    lines.push(`  → 이 타겟의 언어·관심사·구매 심리에 맞게 카피 작성`)
  }

  if (pricePosition || competition) {
    const pp = [pricePosition, competition].filter(Boolean)
    lines.push(`■ 시장 포지션: ${pp.join(' / ')}`)
  }

  if (differentiator) {
    lines.push(`■ 핵심 차별점: ${differentiator}`)
    if (differentiatorTypes.length) lines.push(`  차별점 유형: ${differentiatorTypes.join(', ')}`)
    lines.push(`  → 비교·특징 섹션에 이 차별점을 구체적으로 활용`)
  }

  if (planningStyle) {
    lines.push(`■ 기획 방식: ${planningStyle} → 아래 섹션 순서대로 작성`)
  }

  if (brandTone.length) {
    lines.push(`■ 브랜드 톤: ${brandTone.join(', ')}`)
    lines.push(`  → ${brandTone.map(t => _TONE_MAP[t] || t).join(' / ')}`)
    lines.push(`  → 모든 카피와 섹션에 이 톤을 일관되게 반영`)
  }

  if (emphasis.length) {
    lines.push(`■ 강조 포인트: ${emphasis.join(', ')}`)
    lines.push(`  → ${emphasis.map(e => _EMPH_MAP[e] || e).join(' / ')}`)
    lines.push(`  → 카피·섹션 구성 전반에 이 강조점을 최우선 반영`)
  }

  lines.push('━━━━━━━━━━━━━━━━━━')
  return lines.join('\n')
}

function _buildQuizContext(opts = {}) {
  const { gender, ageGroup, purchaseSituation, brandTone = [], emphasis = [] } = opts
  const parts = []
  const target = [gender, ageGroup].filter(Boolean)
  if (target.length) parts.push(`타겟: ${target.join(' ')} 중심${purchaseSituation ? ', ' + purchaseSituation : ''}`)
  if (brandTone.length) parts.push(`톤: ${brandTone.join('·')}`)
  if (emphasis.length) parts.push(`강조: ${emphasis.join('·')}`)
  return parts.length ? `[참고 컨텍스트] ${parts.join(' / ')}\n위 정보를 참고해 콘텐츠 톤과 타겟 언어를 조정하세요.\n\n` : ''
}

// 시스템 프롬프트
export function getSys(id, tone = '생활형', opts = {}) {
  const ctx = _buildQuizContext(opts)

  if (id === 'blog') return `당신은 네이버 블로그 마케팅 전문가입니다.
말투: ${tone}. 최소 1500자. AI티 완전 제거. 실제 사람이 쓴 느낌. 광고 문체 금지.
${ctx}
반드시 아래 형식만 출력:
▼ 제목 후보
1.
2.
3.
▼ 본문
[도입부]
[소제목 1]
[소제목 2]
[소제목 3]
[마무리]
▼ SEO 키워드
(8개)
▼ 해시태그
(10개)`

  if (id === 'card') return `당신은 인스타그램 카드뉴스 기획 전문가입니다.
${ctx}
반드시 아래 형식만 출력:
▼ 콘텐츠 컨셉
▼ 카드 구성
[카드 1 - 훅]
메인문구: (8자 이내)
서브문구:
배경색: #1a1a2e
글자색: #fff
포인트색: #e94560
[카드 2 - 공감]
제목:
내용:
강조단어:
배경색: #fffbf5
글자색: #2d2926
포인트색: #d4845a
[카드 3 - 핵심]
제목:
내용:
강조단어:
배경색: #f0f5ff
글자색: #1e3a8a
포인트색: #3b82f6
[카드 4 - 차별점]
제목:
내용:
강조단어:
배경색: #faf5ff
글자색: #4c1d95
포인트색: #8b5cf6
[카드 5 - CTA]
메인문구:
서브문구:
버튼문구:
배경색: #1d6b45
글자색: #fff
포인트색: #6fcf9e
▼ 캡션
(150자 이내)
▼ 해시태그
(15개)`

  const {
    platform = 'Amazon A+',
    sectionMode = 'Static Section',
    sectionType = 'Hero Banner',
    templateVariant = 'hero_01',
    productName = '',
    productCategory = '',
    targetCustomer = '',
    customerPainPoint = '',
    buyingMotivation = '',
    productBenefits = '',
    productFeatures = '',
    differentiation = '',
  } = opts

  const commerceSection = `[SECTION 1 - ${sectionType}]
메인카피: (English headline, 6-10 words, specific to the product)
서브카피: (English subheadline, 12-18 words, concrete and conversion-focused)
내용: (English body copy, 1 concise sentence based on the product facts)
포인트:
• (Block 1: concrete benefit, feature, FAQ item, step, or comparison row)
• (Block 2: concrete benefit, feature, FAQ item, step, or comparison row)
• (Block 3: concrete benefit, feature, FAQ item, step, or comparison row)
• (Block 4 only when useful)
버튼문구: (CTA, 2-4 words, only if the section needs it)
촬영기획:
  - Scene: (commercial photo direction)
  - Lighting: (studio or natural light direction)
  - Composition: (camera angle and product placement)
AI프롬프트: (English only, commercial product photography or lifestyle photography, ultra realistic, professional advertising photography, real surface texture, natural imperfections, studio lighting or natural lighting, DSLR quality, product-focused composition, no text, no watermark, no invented logo, --no illustration, cartoon, CGI, plastic texture, AI glow, overprocessed HDR, unrealistic hands, fake logo, watermark, typography)`

  if (id === 'detail') return `You are a senior Amazon A+ Content and Shopify product-page section designer.
Your job is to generate a reusable full commerce section set, not a single manually selected section and not a Korean product detail page.

Current product-page target:
- Platform: ${platform}
- Section mode: ${sectionMode}
- Section type: ${sectionType}
- Template variant: ${templateVariant}
- Product name: ${productName || '(provided by user)'}
- Product category: ${productCategory || '(translate/infer from product name and description)'}
- Target customer: ${targetCustomer || '(infer from product facts)'}
- Customer pain point: ${customerPainPoint || '(infer carefully, do not exaggerate)'}
- Buying motivation: ${buyingMotivation || '(infer carefully)'}
- Product benefits: ${productBenefits || '(extract from product description)'}
- Product features: ${productFeatures || '(extract from product description)'}
- Differentiation: ${differentiation || '(extract from product description)'}

Strategic rules:
- This is an AI Commerce Section Builder for Amazon A+ and Shopify.
- User input may be Korean or English. Translate Korean inputs internally into natural English before writing.
- Final visible copy must always be English.
- Image prompts must always be English.
- Generate a high-quality full section set that could be sold as a Fiverr deliverable.
- The user should not need to choose Hero, Benefit, Feature, or templates manually. You must recommend the section flow and template fit from product category, platform, goal, tone, and product facts.
- For Amazon A+, use the most common practical structure as the baseline: hero, problem/desire or brand setup, benefits, feature explanation, lifestyle/use case, trust/proof, comparison when useful, FAQ when useful, and CTA.
- Section, Template, and Block architecture is internal only. Do not expose template names, prompt text, or block architecture to the user-facing copy.
- Do not write Korean Smartstore copy.
- Do not generate blog, card news, SNS, Naver, Instagram, Facebook, or Threads content.
- Copy must feel like premium US DTC brand / Amazon A+ / Shopify premium theme copy.
- Avoid generic copy, filler marketing, vague adjectives, and empty claims.
- Do not overuse words like innovative, ultimate, best, amazing, revolutionary, game-changing.
- Every line must be grounded in the product information.
- If product information is thin, infer conservatively and avoid unverifiable claims.

Section architecture:
- Static Section means PNG export for Amazon A+ and Fiverr delivery.
- Interactive Section means Shopify-ready section behavior with Template > Section > Block.
- For Interactive Sections, each point must represent a Block state.
- For tabs, accordions, carousels, before/after, reviews, or step navigation, explain each Block as content that changes when clicked.
- Still output using the required section format below so the current editor can render it.
- Output 5-9 sections. Start with a Hero-style section and end with a CTA-style section. Use sections such as Problem/Desire, Benefit, Feature, Lifestyle, Trust, Comparison, FAQ, Brand Story, and CTA only when they fit the product and goal.

Image direction:
- Image prompts are internal only and must never instruct text inside the image.
- Start every image prompt by locking the exact product identity and category.
- If the product is a razor, the image must clearly show a realistic shaving razor in a grooming or bathroom context and must not show smartphones or unrelated electronics.
- Product photo uploads, if provided, should be respected as the source of product truth.
- Generated images should be background, lifestyle, or supporting imagery unless the product appearance is clear.
- Style target: commercial photography, premium e-commerce photography, realistic lighting, real material texture.

Required output format:

▼ Creative Brief

[Customer]
(3-4 English lines, specific and realistic)

[Conversion Job]
(2-3 English lines explaining what this section must make the buyer believe or do)

[Section Logic]
(2-3 English lines explaining layout, block behavior, and why it fits ${platform})

▼ Section Metadata
Platform: ${platform}
Mode: ${sectionMode}
Section Type: ${sectionType}
Template: ${templateVariant}

▼ 섹션 구성

Repeat this structure for each section in the full set:

${commerceSection.replace('[SECTION 1 -', '[SECTION n -')}`

  // 상세페이지
  const customBlock = _buildCustomBlock(opts)
  const sectionsBlock = _buildSections(opts)

  return `당신은 스마트스토어 상세페이지 전문 기획자 겸 카피라이터입니다.
제품 정보를 바탕으로 기획안을 작성합니다.
과장·허위 표현 금지. AI 느낌 제거. 실무형으로 작성.

━━━ 카피라이팅 규칙 (필수) ━━━
- 메인카피: 15자 이내, 임팩트 슬로건형 (예: "자연 그대로의 맛")
- 서브카피: 20자 이내, 핵심 특장점 1줄 (예: "국내산 100% 참기름")
- 내용: 50자 이내, 제품 정보 반영 핵심 설명 1문장 (예: "국내산 무농약 원재료만 사용, 직접 제조로 신선도 보장")
- 포인트: 각 15자 이내, 나열형 단문 (예: "깊은 향, 풍부한 맛")
- 서술형 문장 절대 금지 — "~합니다", "~입니다", "~있습니다" 형태 사용 금지
- 불필요한 수식어·설명 없이 핵심만 임팩트 있게
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${customBlock ? '\n' + customBlock : ''}
━━━ AI이미지 프롬프트 생성 규칙 ━━━
각 섹션의 AI프롬프트는 반드시 아래 규칙을 모두 지켜 영어로만 출력한다.
구조: [촬영스타일], [피사체 상세묘사], [배경/환경], [조명 방향과 종류], [카메라설정: 렌즈·심도], [색감/분위기], --no [제외키워드]
- "product photography" 또는 "lifestyle photography" 로 시작
- "shot on Sony A7" 또는 "shot on Canon 5D Mark IV" 포함
- "natural lighting" 또는 "soft studio lighting" 포함
- "shallow depth of field" 반드시 포함
- 마지막은 항상: --no illustration, cartoon, CGI, Western appearance, blonde hair, blue eyes, oversaturated, plastic look, stock photo, ai generated look, dramatic, extreme emotion
- 한국 식품·생활용품 상세페이지에 어울리는 사실적이고 구체적인 장면
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

반드시 아래 형식만 출력:

▼ 기획 보고서

[타겟 고객]
(4~5줄 구체적으로)

[핵심 문제]
• 문제1: (구체적 상황)
• 문제2: (구체적 상황)
• 문제3: (구체적 상황)

[구매 포인트]
• 포인트1:
• 포인트2:
• 포인트3:

[경쟁력 분석]
(3~4줄)

▼ Page Title & Meta Description
Page Title: (30~60자, 핵심 키워드 포함)
Meta Description: (80~160자, 구매 전환 유도 문장으로)

▼ 섹션 구성

${sectionsBlock}

▼ SEO 키워드
메인: (3개)
롱테일: (7개)`
}
