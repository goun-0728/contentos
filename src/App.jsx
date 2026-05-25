// src/App.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { C, DS, DS_KEYS, TPL_LABELS, TPL_COMPAT, TASKS, BLOG_TONES, getSys, EXTRA_SECTIONS, getExtraSectSys, mkSec } from './constants'
import { parseBlocks, parseSections, capturePNG, downloadURL } from './utils'
import { generateContent } from './api/generate'
import { generateImage } from './api/images'
import SectionEditor from './components/SectionEditor'
import { FONT_OPTS, SHAPE_DEFS } from './components/SectionTemplates'
import CardNewsView from './components/CardNewsEditor'
import BlogKeywords from './components/BlogKeywords'
import BlogThumbnail from './components/BlogThumbnail'

/* ── 퀴즈 상수 ─────────────────────────────────────── */
const CATEGORIES = ['식품/음료', '뷰티/화장품', '생활용품', '패션/잡화', '건강/이너뷰티', '스포츠/레저', '디지털/가전', '반려동물', '기타']
const PRICE_RANGES = ['~1만원', '1~3만원', '3~5만원', '5~10만원', '10만원이상']
const GENDERS = ['여성', '남성', '무관']
const AGE_GROUPS = ['20대', '30대', '40대', '50대이상', '무관']
const PURCHASE_SITUATIONS = ['일상소비(자주구매하는생필품)', '특별한날(선물/기념일)', '문제해결(불편함/필요에의해)', '자기계발/취미', '건강/관리목적', '트렌드/유행따라']
const PRICE_POSITIONS = ['가성비/저가', '합리적중간가', '프리미엄']
const COMPETITION_TYPES = ['경쟁많은시장', '차별화포지션', '틈새시장']
const DIFF_TYPES = ['원산지/성분', '제조방식', '가격경쟁력', '디자인/패키지', '브랜드스토리', '인증/수상', '편의성/속도']
const PLANNING_STYLES = [
  { key: '문제해결형',   desc: 'Hero → 문제공감 → 해결제안 → 특징강조 → 비교 → CTA' },
  { key: '감성소구형',   desc: 'Hero → 감성스토리 → 사용장면 → 추천대상 → CTA' },
  { key: '전문성강조형', desc: 'Hero → 소재설명 → 특징강조 → 인증/수상 → CTA' },
  { key: '라이프스타일형', desc: 'Hero → 사용장면 → 사용장면2 → 추천대상 → CTA' },
  { key: '비교우위형',   desc: 'Hero → 문제공감 → 비교 → 특징강조 → CTA' },
  { key: '스토리텔링형', desc: 'Hero → 브랜드스토리 → 소재설명 → 사용장면 → CTA' },
]
const BRAND_TONES = ['따뜻한/감성적', '신뢰감/전문적', '힙/트렌디', '레트로/빈티지', '유머/B급', '고급스러운', '친근한/편안한']
const EMPHASIS_POINTS = ['품질/성능', '원산지/성분', '가격/가성비', '편의성', '브랜드스토리', '인증/수상', '환경/윤리', '디자인/패키지']

const PLATFORMS = ['Amazon A+', 'Shopify']
const SECTION_MODES = ['Static Section', 'Interactive Section']
const STATIC_SECTION_TYPES = ['Hero Banner', 'Feature Section', 'Benefit Section', 'Comparison Section', 'Lifestyle Section', 'Trust Section', 'FAQ Section', 'Brand Story Section', 'CTA Section']
const INTERACTIVE_SECTION_TYPES = ['How It Works Section', 'Accordion Section', 'Carousel Section', 'Before After Section', 'Review Slider Section', 'Feature Tabs Section']
const TEMPLATE_LIBRARY = {
  'Hero Banner': ['hero_01', 'hero_02', 'hero_03', 'hero_04', 'hero_05'],
  'Feature Section': ['feature_01', 'feature_02', 'feature_03'],
  'Benefit Section': ['benefit_01', 'benefit_02', 'benefit_03', 'benefit_04', 'benefit_05'],
  'Comparison Section': ['compare_01', 'compare_02', 'compare_03'],
  'Lifestyle Section': ['lifestyle_01', 'lifestyle_02'],
  'Trust Section': ['trust_01', 'trust_02'],
  'FAQ Section': ['faq_static_01', 'faq_static_02'],
  'Brand Story Section': ['brand_story_01', 'brand_story_02'],
  'CTA Section': ['cta_01', 'cta_02'],
  'How It Works Section': ['how_it_works_01', 'step_navigation_01'],
  'Accordion Section': ['accordion_01', 'accordion_02'],
  'Carousel Section': ['carousel_01', 'lifestyle_gallery_01'],
  'Before After Section': ['before_after_01'],
  'Review Slider Section': ['review_slider_01'],
  'Feature Tabs Section': ['feature_tabs_01', 'tabs_01'],
}
const TEMPLATE_META = {
  hero_01: { use: 'Beauty / Supplement', layout: 'Image left, copy right' },
  hero_02: { use: 'Tech / DTC', layout: 'Centered product hero' },
  hero_03: { use: 'Food / Grocery', layout: 'Lifestyle banner' },
  hero_04: { use: 'Fashion / Beauty', layout: 'Editorial split' },
  hero_05: { use: 'Premium Brand', layout: 'Dark studio hero' },
  feature_01: { use: 'Tech / Appliances', layout: 'Feature image + proof blocks' },
  feature_02: { use: 'Beauty / Wellness', layout: 'Detail close-up layout' },
  feature_03: { use: 'DTC Product', layout: 'Feature grid' },
  benefit_01: { use: 'Supplement / Beauty', layout: 'Three benefit cards' },
  benefit_02: { use: 'Home / Lifestyle', layout: 'Icon benefit row' },
  benefit_03: { use: 'Food / Beverage', layout: 'Ingredient-led benefits' },
  benefit_04: { use: 'Tech', layout: 'Spec-led benefits' },
  benefit_05: { use: 'Premium DTC', layout: 'Minimal benefit stack' },
  compare_01: { use: 'Amazon A+', layout: 'Check / X table' },
  compare_02: { use: 'Fiverr Pitch', layout: 'Competitor comparison' },
  compare_03: { use: 'Premium', layout: 'Before vs better' },
  lifestyle_01: { use: 'Lifestyle / DTC', layout: 'Wide lifestyle photo' },
  lifestyle_02: { use: 'Food / Fashion', layout: 'Scene + copy band' },
  trust_01: { use: 'Amazon Proof', layout: 'Trust badges' },
  trust_02: { use: 'Premium Brand', layout: 'Guarantee + proof' },
  faq_static_01: { use: 'Amazon A+', layout: 'FAQ block stack' },
  faq_static_02: { use: 'Support', layout: 'Compact Q&A' },
  brand_story_01: { use: 'Founder Brand', layout: 'Narrative photo section' },
  brand_story_02: { use: 'DTC Brand', layout: 'Mission-led layout' },
  cta_01: { use: 'Conversion', layout: 'Product CTA banner' },
  cta_02: { use: 'Premium Close', layout: 'Dark CTA' },
  how_it_works_01: { use: 'Shopify', layout: 'Step navigation' },
  step_navigation_01: { use: 'Shopify', layout: 'Clickable step panel' },
  accordion_01: { use: 'Shopify FAQ', layout: 'Accordion blocks' },
  accordion_02: { use: 'Ingredients / Specs', layout: 'Accordion list' },
  carousel_01: { use: 'Lifestyle Gallery', layout: 'Image carousel' },
  lifestyle_gallery_01: { use: 'DTC Gallery', layout: 'Gallery slider' },
  before_after_01: { use: 'Beauty / Cleaning', layout: 'Before-after slider' },
  review_slider_01: { use: 'Social Proof', layout: 'Review carousel' },
  feature_tabs_01: { use: 'Shopify PDP', layout: 'Feature tabs' },
  tabs_01: { use: 'Shopify', layout: 'Tabbed content' },
}
const SIZE_PRESETS = {
  amazon_standard_banner: { label: 'Amazon A+ Standard Banner', size: '970 x 300', width: 970, height: 300, platform: 'Amazon A+' },
  amazon_standard_module: { label: 'Amazon A+ Standard Module', size: '970 x 600', width: 970, height: 600, platform: 'Amazon A+' },
  amazon_premium_wide: { label: 'Amazon A+ Premium Wide', size: '1464 x 600', width: 1464, height: 600, platform: 'Amazon A+' },
  shopify_desktop: { label: 'Shopify Desktop Section', size: '1440 x 720', width: 1440, height: 720, platform: 'Shopify' },
  shopify_mobile: { label: 'Shopify Mobile Preview', size: '390 x 720', width: 390, height: 720, platform: 'Shopify' },
}
const SIZE_PRESET_KEYS = Object.keys(SIZE_PRESETS)
const CONCEPT_DIRECTIONS = [
  {
    label: 'Option A',
    name: 'Human Lifestyle',
    layout: 'editorial hero layout with elevated spacing and a premium visual hierarchy',
    copy: 'aspirational but specific premium DTC copy with restrained language',
    image: 'natural human lifestyle advertising photography: a person using the product, realistic hands or partial face only when useful, real-world lighting, no distorted fingers, no fake skin, no overprocessed AI look',
  },
  {
    label: 'Option B',
    name: 'Product Only',
    layout: 'clean modular layout with generous whitespace and simple block structure',
    copy: 'clear, concise, minimalist copy focused on product clarity and trust',
    image: 'product-only commercial studio photography: no people, product and package detail, material texture, premium surface, controlled studio lighting, no CGI or plastic look',
  },
  {
    label: 'Option C',
    name: 'Contextual Scene',
    layout: 'benefit-led conversion layout with prominent proof points and CTA emphasis',
    copy: 'direct conversion copy focused on pain point, benefit, proof, and action',
    image: 'contextual scene photography: product placed naturally in its usage environment, space or softly blurred person may appear in background, product remains the visual anchor',
  },
]

const PRODUCT_CATEGORIES = [
  'Beauty & Personal Care',
  'Health & Supplement',
  'Food & Grocery',
  'Home & Kitchen',
  'Pet Supplies',
  'Baby & Kids',
  'Fashion & Apparel',
  'Electronics & Tech',
  'Sports & Outdoor',
  'Tools & Hardware',
  'Digital Product',
  'Other',
]

const TARGET_CUSTOMER_OPTIONS = [
  'Busy parents',
  'Men in their 40s',
  'Women in their 30s',
  'Athletes',
  'Pet owners',
  'Office workers',
  'Gift buyers',
  'Other',
]

const BRAND_TONE_OPTIONS = [
  'Premium',
  'Clinical',
  'Minimal',
  'Warm',
  'Natural',
  'Bold',
  'Luxury',
  'Technical',
  'Friendly',
  'Other',
]

const GENERATION_GOALS = [
  'Build Trust',
  'Explain Benefits',
  'Premium Brand Look',
  'Comparison / Differentiation',
  'Launch New Product',
  'Improve Conversion',
]

const OUTPUT_STYLES = [
  'Premium',
  'Clean',
  'Human Lifestyle',
  'Product Focused',
  'Conversion Focused',
]

const DEFAULT_SECTION_FLOW = [
  'Hero Banner',
  'Problem Solution Section',
  'Benefit Section',
  'Feature Section',
  'Lifestyle Section',
  'Trust Section',
  'Comparison Section',
  'FAQ Section',
  'CTA Section',
]

const CATEGORY_QUESTIONS = {
  'Food & Grocery': {
    targetCustomer: 'Who is the target buyer?',
    customerPainPoint: 'When do they usually consume this product?',
    buyingMotivation: 'What taste, freshness, origin, or ingredient quality should be highlighted?',
    productBenefits: 'What makes this product different from supermarket alternatives?',
    productFeatures: 'What trust factors matter? Origin, freshness, farming method, certifications, clean ingredients.',
    differentiation: 'What purchase hesitation should be addressed? Sweetness, freshness, shipping damage, storage, shelf life.',
  },
  'Beauty & Personal Care': {
    targetCustomer: 'Who is the target user?',
    customerPainPoint: 'What skin, grooming, or self-care problem does it solve?',
    buyingMotivation: 'What result does the customer want?',
    productBenefits: 'What ingredients, material, or technology should be highlighted?',
    productFeatures: 'Is it for sensitive skin, daily use, premium care, or professional use?',
    differentiation: 'What trust factor matters? Dermatologist-tested, clean ingredients, cruelty-free, clinical tone.',
  },
  'Health & Supplement': {
    targetCustomer: 'Who is the target customer?',
    customerPainPoint: 'What health goal do they have?',
    buyingMotivation: 'What daily problem or discomfort do they want to solve?',
    productBenefits: 'What ingredients or formulation should be highlighted?',
    productFeatures: 'What trust elements matter? GMP, third-party tested, sugar-free, vegan, non-GMO.',
    differentiation: 'What warning or compliance-sensitive wording should be avoided?',
  },
  'Home & Kitchen': {
    targetCustomer: 'Who will use this product?',
    customerPainPoint: 'What household problem does it solve?',
    buyingMotivation: 'What usage scene should be shown?',
    productBenefits: 'What material, durability, size, or convenience feature matters?',
    productFeatures: 'What makes it better than ordinary alternatives?',
    differentiation: 'What objection or comparison point should be addressed?',
  },
  'Electronics & Tech': {
    targetCustomer: 'Who is the product for?',
    customerPainPoint: 'What functional problem does it solve?',
    buyingMotivation: 'What technical specs matter?',
    productBenefits: 'What use case should be visualized?',
    productFeatures: 'What comparison point matters?',
    differentiation: 'What trust factor matters? Warranty, compatibility, performance, safety.',
  },
  'Pet Supplies': {
    targetCustomer: 'What type of pet is this for?',
    customerPainPoint: 'What problem does it solve for the pet or owner?',
    buyingMotivation: 'What safety, comfort, or ingredient factor matters?',
    productBenefits: 'What lifestyle scene should be shown?',
    productFeatures: 'What trust factor matters? Vet recommended, safe material, washable, non-toxic.',
    differentiation: 'What purchase hesitation should be addressed?',
  },
  Other: {
    targetCustomer: 'Target Customer',
    customerPainPoint: 'Customer Pain Point',
    buyingMotivation: 'Buying Motivation',
    productBenefits: 'Product Benefits',
    productFeatures: 'Product Features',
    differentiation: 'Differentiation',
  },
}

const MAX_PRODUCT_IMAGE_BYTES = 850 * 1024

function dataUrlBytes(dataUrl) {
  return Math.ceil((dataUrl || '').length * 0.75)
}

function compressImageFile(file, maxWidth = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Failed to load image file.'))
      img.onload = () => {
        const ratio = Math.min(1, maxWidth / img.width)
        const width = Math.max(1, Math.round(img.width * ratio))
        const height = Math.max(1, Math.round(img.height * ratio))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

const EMPTY_QUIZ = {
  category: '', priceRange: '',
  gender: '', ageGroup: '', purchaseSituation: '',
  pricePosition: '', competition: '',
  differentiator: '', differentiatorTypes: [],
  planningStyle: '',
  brandTone: [],
  emphasis: [],
}

const GRAD_DIRS = [
  { k: 'none',   l: '없음' },
  { k: 'top',    l: '위' },
  { k: 'bottom', l: '아래' },
  { k: 'left',   l: '좌' },
  { k: 'right',  l: '우' },
]
const PRESET_COLORS = ['#ffffff','#111111','#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#0f172a','#fafaf8']
const sLabel = { fontSize:9, fontWeight:700, color:'#B0ADA5', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:4, marginTop:0 }

function TplIcon({ k }) {
  const d = '#9CA3AF', l = '#E5E7EB', a = '#6B7280'
  const base = { borderRadius:2, overflow:'hidden', width:'100%', height:32, position:'relative', flexShrink:0 }
  if (k === 'fullHero') return (
    <div style={{ ...base, background:d }}>
      <div style={{ position:'absolute',bottom:5,left:5,right:5,height:5,background:'rgba(255,255,255,0.35)',borderRadius:1 }} />
      <div style={{ position:'absolute',bottom:12,left:5,width:'55%',height:4,background:'rgba(255,255,255,0.6)',borderRadius:1 }} />
    </div>
  )
  if (k === 'topBottom') return (
    <div style={{ ...base, display:'flex',flexDirection:'column',gap:1 }}>
      <div style={{ flex:1,background:l,display:'flex',alignItems:'center',paddingLeft:4 }}>
        <div style={{ width:'55%',height:3,background:a,borderRadius:1,opacity:0.6 }} />
      </div>
      <div style={{ flex:1,background:d }} />
    </div>
  )
  if (k === 'leftRight') return (
    <div style={{ ...base, display:'flex',gap:1 }}>
      <div style={{ flex:1,background:d }} />
      <div style={{ flex:1,background:l,display:'flex',flexDirection:'column',justifyContent:'center',gap:2,padding:4 }}>
        <div style={{ height:3,background:a,borderRadius:1,opacity:0.7 }} />
        <div style={{ height:2,background:a,borderRadius:1,opacity:0.4 }} />
      </div>
    </div>
  )
  if (k === 'points3icon') return (
    <div style={{ ...base, display:'flex',flexDirection:'column',gap:1 }}>
      <div style={{ flex:2,background:d }} />
      <div style={{ flex:1,display:'flex',gap:1 }}>
        <div style={{ flex:1,background:l }} />
        <div style={{ flex:1,background:l }} />
        <div style={{ flex:1,background:l }} />
      </div>
    </div>
  )
  if (k === 'story') return (
    <div style={{ ...base, background:l,display:'flex',flexDirection:'column',justifyContent:'center',gap:3,padding:'4px 6px' }}>
      <div style={{ height:5,background:d,borderRadius:1,width:'80%' }} />
      <div style={{ height:2,background:a,borderRadius:1,opacity:0.5,width:'95%' }} />
      <div style={{ height:2,background:a,borderRadius:1,opacity:0.5,width:'70%' }} />
    </div>
  )
  if (k === 'howTo') return (
    <div style={{ ...base, display:'flex',flexDirection:'column',gap:1 }}>
      <div style={{ height:10,background:d,display:'flex',alignItems:'center',justifyContent:'center' }}>
        <div style={{ height:3,width:'50%',background:'rgba(255,255,255,0.6)',borderRadius:1 }} />
      </div>
      <div style={{ flex:1,background:'#c5c9d0' }} />
      <div style={{ height:8,background:l,display:'flex',flexDirection:'column',justifyContent:'center',gap:1,padding:'0 4px' }}>
        <div style={{ height:2,background:a,borderRadius:1,opacity:0.5 }} />
      </div>
    </div>
  )
  if (k === 'compare') return (
    <div style={{ ...base, background:l,display:'flex',flexDirection:'column',gap:1,padding:3 }}>
      <div style={{ height:3,background:d,borderRadius:1,width:'55%',margin:'1px auto 3px' }} />
      <div style={{ flex:1,display:'flex',gap:1 }}>
        <div style={{ flex:1,background:'#d1d5db',borderRadius:1 }} />
        <div style={{ flex:1,background:d,borderRadius:1 }} />
      </div>
    </div>
  )
  if (k === 'specTable') return (
    <div style={{ ...base, background:'#FDFAF5',display:'flex',flexDirection:'column',gap:2,padding:3 }}>
      <div style={{ height:4,background:d,borderRadius:1,marginBottom:2 }} />
      {[1,2,3].map(i => (
        <div key={i} style={{ height:4,display:'flex',gap:1 }}>
          <div style={{ width:'30%',background:'#d0c8b8',borderRadius:1 }} />
          <div style={{ flex:1,background:l,borderRadius:1 }} />
        </div>
      ))}
    </div>
  )
  return <div style={{ ...base, background:l }} />
}

function TemplatePreview({ name }) {
  const meta = TEMPLATE_META[name] || { use: 'Commerce', layout: 'Section layout' }
  const isHero = name.startsWith('hero')
  const isBenefit = name.startsWith('benefit')
  const isCompare = name.startsWith('compare') || name.includes('before')
  const isInteractive = name.includes('accordion') || name.includes('tabs') || name.includes('carousel') || name.includes('step') || name.includes('works') || name.includes('slider')

  return (
    <div style={{ height:76, borderRadius:7, overflow:'hidden', background:'#111827', display:'grid', gridTemplateColumns:isHero?'1.15fr .85fr':'1fr', position:'relative' }}>
      {isHero ? (
        <>
          <div style={{ background:'linear-gradient(135deg,#1f2937,#64748b)', position:'relative' }}>
            <div style={{ position:'absolute', left:10, top:12, width:44, height:8, borderRadius:2, background:'#fff', opacity:.9 }} />
            <div style={{ position:'absolute', left:10, top:27, width:72, height:5, borderRadius:2, background:'#fff', opacity:.45 }} />
            <div style={{ position:'absolute', left:10, bottom:12, width:34, height:10, borderRadius:20, background:'#c8a96e' }} />
          </div>
          <div style={{ background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,#d1d5db,#94a3b8)' }} />
          </div>
        </>
      ) : isCompare ? (
        <div style={{ background:'#f8fafc', padding:10 }}>
          {[0,1,2].map(i => <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4, marginBottom:5 }}><div style={{ height:12, borderRadius:3, background:i===0?'#fee2e2':'#e5e7eb' }} /><div style={{ height:12, borderRadius:3, background:i===0?'#dcfce7':'#d1fae5' }} /></div>)}
        </div>
      ) : isBenefit ? (
        <div style={{ background:'#f8fafc', padding:10, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
          {[0,1,2].map(i => <div key={i} style={{ borderRadius:5, background:'#e2e8f0', padding:6 }}><div style={{ width:16, height:16, borderRadius:'50%', background:'#10b981', marginBottom:8 }} /><div style={{ height:5, background:'#334155', borderRadius:2, marginBottom:4 }} /><div style={{ height:4, background:'#94a3b8', borderRadius:2 }} /></div>)}
        </div>
      ) : isInteractive ? (
        <div style={{ background:'#f8fafc', padding:10, display:'grid', gridTemplateColumns:'.85fr 1.15fr', gap:8 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>{[0,1,2].map(i => <div key={i} style={{ height:14, borderRadius:4, background:i===0?'#1d6b45':'#e2e8f0' }} />)}</div>
          <div style={{ borderRadius:6, background:'linear-gradient(135deg,#cbd5e1,#64748b)' }} />
        </div>
      ) : (
        <div style={{ background:'#f8fafc', padding:10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <div><div style={{ height:8, background:'#111827', borderRadius:2, marginBottom:7 }} /><div style={{ height:5, background:'#94a3b8', borderRadius:2, marginBottom:5 }} /><div style={{ height:5, background:'#cbd5e1', borderRadius:2 }} /></div>
          <div style={{ borderRadius:6, background:'linear-gradient(135deg,#d6d3d1,#a8a29e)' }} />
        </div>
      )}
      <div style={{ position:'absolute', right:7, bottom:6, fontSize:8, color:'#fff', background:'rgba(0,0,0,.45)', padding:'1px 5px', borderRadius:10 }}>{meta.use}</div>
    </div>
  )
}

function TemplateCards({ templates, value, onChange }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:8 }}>
      {templates.map(name => {
        const on = value === name
        const meta = TEMPLATE_META[name] || { use:'Commerce', layout:'Section layout' }
        return (
          <button key={name} onClick={() => onChange(name)}
            style={{ textAlign:'left', padding:8, borderRadius:10, border:`2px solid ${on?'#1D6B45':C.bd}`, background:on?'#F0FDF4':C.sur, cursor:'pointer' }}>
            <TemplatePreview name={name} />
            <div style={{ fontSize:12, fontWeight:800, color:on?'#1D6B45':C.tx, marginTop:7 }}>{name}</div>
            <div style={{ fontSize:10.5, color:C.mu, lineHeight:1.45 }}>{meta.layout}</div>
            <div style={{ fontSize:10, color:C.fa, marginTop:3 }}>{meta.use}</div>
          </button>
        )
      })}
    </div>
  )
}

/* ── 미니 컴포넌트 ─────────────────────────────────── */
function Spin() {
  return <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', border: '2px solid #ddd', borderTopColor: '#555', animation: 'sp .6s linear infinite', flexShrink: 0 }} />
}

function CopyBtn({ text, label = '⎘ 복사' }) {
  const [ok, set] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); set(true); setTimeout(() => set(false), 2000) }} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: `1px solid ${C.bd}`, background: ok ? '#f0fdf4' : C.sur, color: ok ? '#15803d' : C.mu, cursor: 'pointer' }}>
      {ok ? '✓ 복사됨' : label}
    </button>
  )
}

function Blk({ title, lines }) {
  const tx = lines.join('\n').trim()
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: C.fa, textTransform: 'uppercase' }}>{title}</span>
        <CopyBtn text={tx} />
      </div>
      <div style={{ background: C.alt, borderRadius: 10, border: `1px solid ${C.bd}`, padding: '14px 16px' }}>
        <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 13.5, lineHeight: 1.9, color: C.tx, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{tx}</pre>
      </div>
    </div>
  )
}

/* ── 섹션 사이 호버 추가 버튼 ────────────────────────── */
function AddBetweenHover({ onClick, loading }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      style={{ height: hov ? 44 : 10, transition:'height .15s', overflow:'hidden', display:'flex', alignItems:'center' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <button onClick={onClick} disabled={loading}
        style={{ width:'100%', height:34, fontSize:12, borderRadius:8, border:'1.5px dashed #3B82F6', background:'rgba(239,246,255,0.95)', color:'#3B82F6', cursor:loading?'not-allowed':'pointer', fontWeight:600 }}>
        {loading ? '생성 중…' : '+ 섹션 추가'}
      </button>
    </div>
  )
}

/* ── Canva 우측 편집 패널 ────────────────────────────── */
function CanvaPanel({ sec, idx, onUpdate, onDelete, activeField, activeOverlay, onAddOverlay, onAddSection, dlAll, onDlAll, onDlSection }) {
  const panelStyle = { width:'100%', height:'calc(100vh - 52px)', background:'#fff', boxShadow:'-4px 0 24px rgba(0,0,0,0.1)', display:'flex', flexDirection:'column', overflow:'hidden' }

  if (sec === null || idx === null) {
    return (
      <div style={{ ...panelStyle, alignItems:'center', justifyContent:'center', gap:12 }}>
        <p style={{ fontSize:12, color:C.mu, textAlign:'center', lineHeight:1.8, margin:0, padding:'0 24px' }}>섹션을 클릭해서<br/>편집하세요</p>
        {onAddSection && (
          <button onClick={onAddSection}
            style={{ padding:'8px 20px', fontSize:12, fontWeight:700, borderRadius:8, border:'1.5px dashed #10b981', background:'#f0fdf4', color:'#059669', cursor:'pointer', marginTop:8 }}>
            + 섹션 추가
          </button>
        )}
      </div>
    )
  }

  const baseT  = DS[sec.designStyle] || Object.values(DS)[0]
  const t      = { ...baseT, ...(sec.customColors || {}) }
  const tplKey = TPL_LABELS.find(x => x.k === sec.template) ? sec.template : (TPL_COMPAT[sec.template] || 'topBottom')
  const grad   = sec.gradient || {}

  const change  = (key, val) => onUpdate(idx, { ...sec, [key]: val })
  const setGrad = (key, val) => change('gradient', { ...grad, [key]: val })

  const hasActive    = activeField || activeOverlay
  const currentStyle = activeField
    ? (sec.textStyles?.[activeField] || {})
    : activeOverlay
      ? ((sec.overlayTexts || []).find(o => o.id === activeOverlay)?.style || {})
      : {}

  const ALL_FIELDS = ['mainCopy','subCopy','description','badge','cta','compareLeft','compareRight']
  const updateTS = (key, val) => {
    if (activeField) {
      change('textStyles', {
        ...(sec.textStyles || {}),
        [activeField]: { ...(sec.textStyles?.[activeField] || {}), [key]: val },
      })
    } else if (activeOverlay) {
      change('overlayTexts', (sec.overlayTexts || []).map(ot =>
        ot.id === activeOverlay ? { ...ot, style: { ...(ot.style || {}), [key]: val } } : ot
      ))
    } else {
      // 선택 없으면 섹션 전체 텍스트에 적용
      const newTS = { ...(sec.textStyles || {}) }
      ALL_FIELDS.forEach(f => { newTS[f] = { ...(newTS[f] || {}), [key]: val } })
      change('textStyles', newTS)
    }
  }

  return (
    <div style={panelStyle}>

      {/* 헤더 */}
      <div style={{ padding:'10px 14px', borderBottom:`1px solid ${C.bd}`, background:'#F8FAFF', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#3b82f6', flexShrink:0 }} />
          <span style={{ fontSize:12, fontWeight:700, color:'#1E40AF' }}>S{idx+1} · {sec.sectionType}</span>
        </div>
      </div>

      {/* 스크롤 컨트롤 영역 */}
      <div style={{ flex:1, overflowY:'auto', padding:'8px 12px 10px' }}>

        {/* 레이아웃 */}
        <p style={sLabel}>레이아웃</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:3, marginBottom:8 }}>
          {TPL_LABELS.map(({k,l}) => {
            const on = tplKey === k
            return (
              <button key={k} onClick={() => change('template', k)}
                style={{ padding:'4px 4px 4px', fontSize:9, borderRadius:6, border:`1.5px solid ${on?'#3b82f6':C.bd}`, background:on?'#EFF6FF':C.sur, color:on?'#1d4ed8':C.mu, cursor:'pointer', fontWeight:on?700:400, textAlign:'center', display:'flex', flexDirection:'column', gap:3, alignItems:'stretch' }}>
                <TplIcon k={k} />
                <span style={{ lineHeight:1.2, marginTop:1 }}>{l}</span>
              </button>
            )
          })}
        </div>

        {/* 색상 테마 */}
        <p style={sLabel}>색상 테마</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:3, marginBottom:8 }}>
          {DS_KEYS.map(s => {
            const on = sec.designStyle === s && !Object.keys(sec.customColors || {}).length; const d = DS[s]
            return (
              <button key={s} onClick={() => onUpdate(idx, { ...sec, designStyle: s, customColors: {} })}
                style={{ borderRadius:7, border:`2px solid ${on?'#3b82f6':'transparent'}`, cursor:'pointer', padding:0, overflow:'hidden', background:'none', outline:'none' }}>
                <div style={{ height:22, background:d.bg, display:'flex', alignItems:'center', justifyContent:'center', gap:3 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:d.ac }} />
                  <div style={{ width:10, height:2, borderRadius:2, background:d.fg, opacity:0.4 }} />
                </div>
                <div style={{ padding:'2px', background:on?'#EFF6FF':C.alt, fontSize:8, color:on?'#1d4ed8':C.mu, fontWeight:on?700:400, textAlign:'center', lineHeight:1.3 }}>{s}</div>
              </button>
            )
          })}
        </div>

        {/* 커스텀 색상 */}
        <p style={sLabel}>커스텀 색상</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, marginBottom:8 }}>
          {[{ label:'배경색', key:'bg' }, { label:'강조색', key:'ac' }, { label:'글자색', key:'fg' }].map(({ label, key }) => (
            <div key={key} style={{ display:'flex', flexDirection:'column', gap:3, alignItems:'center' }}>
              <span style={{ fontSize:9, color:C.mu }}>{label}</span>
              <label style={{ cursor:'pointer', position:'relative' }}>
                <div style={{ width:44, height:24, borderRadius:5, background:(sec.customColors?.[key]) || t[key], border:`1.5px solid ${C.bd}`, cursor:'pointer' }} />
                <input type="color" value={(sec.customColors?.[key]) || t[key] || '#ffffff'}
                  onChange={e => change('customColors', { ...(sec.customColors||{}), [key]: e.target.value })}
                  style={{ position:'absolute', opacity:0, width:0, height:0, top:0, left:0 }} />
              </label>
              {sec.customColors?.[key] && (
                <button onClick={() => { const cc={...(sec.customColors||{})}; delete cc[key]; change('customColors',cc) }}
                  style={{ fontSize:8, color:'#ef4444', border:'none', background:'none', cursor:'pointer', padding:0 }}>초기화</button>
              )}
            </div>
          ))}
        </div>

        {/* 그라데이션 */}
        <p style={sLabel}>그라데이션</p>
        <div style={{ marginBottom:8 }}>
          <div style={{ display:'flex', gap:3, flexWrap:'wrap', marginBottom:6 }}>
            {GRAD_DIRS.map(({k,l}) => {
              const on = (grad.dir || 'none') === k
              return (
                <button key={k} onClick={() => setGrad('dir', k)}
                  style={{ padding:'4px 10px', fontSize:10, borderRadius:5, border:`1.5px solid ${on?'#3b82f6':C.bd}`, background:on?'#EFF6FF':C.sur, color:on?'#1d4ed8':C.mu, cursor:'pointer', fontWeight:on?700:400 }}>
                  {l}
                </button>
              )
            })}
          </div>
          {grad.dir && grad.dir !== 'none' && (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:10, color:C.mu }}>강도</span>
                  <span style={{ fontSize:10, fontWeight:700, color:C.tx }}>{grad.alpha ?? 70}%</span>
                </div>
                <input type="range" min={0} max={100} step={5}
                  value={grad.alpha ?? 70}
                  onChange={e => setGrad('alpha', +e.target.value)}
                  style={{ width:'100%', accentColor:'#3b82f6' }} />
              </div>
              <label style={{ fontSize:9, color:C.mu, display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
                <span>색상</span>
                <input type="color" value={grad.color || t.bg || '#000000'}
                  onChange={e => setGrad('color', e.target.value)}
                  style={{ width:26, height:18, border:'1px solid #ccc', padding:0, cursor:'pointer', borderRadius:3 }} />
                {grad.color && (
                  <button onClick={() => { const g2={...grad}; delete g2.color; change('gradient',g2) }}
                    style={{ fontSize:8, color:'#ef4444', border:'none', background:'none', cursor:'pointer' }}>배경색으로</button>
                )}
              </label>
            </div>
          )}
        </div>

        {/* 폰트 */}
        <p style={sLabel}>폰트 {!hasActive && <span style={{ fontWeight:400, letterSpacing:0, textTransform:'none', color:'#a0a09a' }}>(선택 없으면 전체 적용)</span>}</p>
        {activeOverlay && (
          <div style={{ fontSize:10, color:'#1d4ed8', background:'#EFF6FF', padding:'3px 8px', borderRadius:5, marginBottom:5 }}>
            📌 추가 텍스트 블록 편집 중
          </div>
        )}
        {activeField === 'points' && (
          <div style={{ fontSize:10, color:'#059669', background:'#f0fdf4', padding:'3px 8px', borderRadius:5, marginBottom:5 }}>
            📋 항목 리스트 편집 중
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:3, marginBottom:3 }}>
          {FONT_OPTS.map(f => {
            const on = currentStyle.fontFamily === f.v
            return (
              <button key={f.v} onClick={() => updateTS('fontFamily', f.v)}
                style={{ padding:'6px 8px', fontSize:11, borderRadius:6, border:`1.5px solid ${on?'#3b82f6':C.bd}`, background:on?'#EFF6FF':C.sur, color:on?'#1d4ed8':C.mu, cursor:'pointer', fontWeight:on?700:400, textAlign:'left', fontFamily:f.v, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {f.l}
              </button>
            )
          })}
        </div>
        <button onClick={() => updateTS('bold', !currentStyle.bold)}
          style={{ width:'100%', padding:'5px 0', fontSize:11, borderRadius:6, border:`1.5px solid ${currentStyle.bold?'#3b82f6':C.bd}`, background:currentStyle.bold?'#EFF6FF':C.sur, color:currentStyle.bold?'#1d4ed8':C.mu, cursor:'pointer', fontWeight:currentStyle.bold?700:400, marginBottom:8 }}>
          <strong>B</strong> 굵게
        </button>

        {/* 선택된 텍스트 스타일 */}
        {hasActive && (
          <>
            <div style={{ borderTop:`1px solid ${C.bd}`, margin:'4px 0 12px' }} />
            <p style={sLabel}>선택된 텍스트</p>
            <div style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:10, color:C.mu }}>크기</span>
                <span style={{ fontSize:10, fontWeight:700, color:C.tx }}>{currentStyle.fontSize ?? 24}px</span>
              </div>
              <input type="range" min={12} max={80} step={1}
                value={currentStyle.fontSize ?? 24}
                onChange={e => updateTS('fontSize', +e.target.value)}
                style={{ width:'100%', accentColor:'#3b82f6' }} />
            </div>
            <div style={{ marginBottom:12 }}>
              <span style={{ fontSize:10, color:C.mu, display:'block', marginBottom:5 }}>글자색</span>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap', alignItems:'center' }}>
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => updateTS('color', c)}
                    style={{ width:22, height:22, borderRadius:4, background:c,
                      border: currentStyle.color===c ? '2px solid #3b82f6' : '1px solid #ccc',
                      cursor:'pointer', flexShrink:0 }} />
                ))}
                <input type="color" value={currentStyle.color || '#111111'}
                  onChange={e => updateTS('color', e.target.value)}
                  style={{ width:28, height:22, border:'1px solid #ccc', padding:0, cursor:'pointer', borderRadius:4, flexShrink:0 }} />
              </div>
            </div>
          </>
        )}

        {/* 항목 리스트 스타일 */}
        <div style={{ borderTop:`1px solid ${C.bd}`, margin:'4px 0 8px' }} />
        <p style={sLabel}>항목 리스트 크기</p>
        <div style={{ marginBottom:4 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
            <span style={{ fontSize:10, color:C.mu }}>크기</span>
            <span style={{ fontSize:10, fontWeight:700, color:C.tx }}>{sec.textStyles?.['points']?.fontSize ?? 18}px</span>
          </div>
          <input type="range" min={14} max={36} step={1}
            value={sec.textStyles?.['points']?.fontSize ?? 18}
            onChange={e => change('textStyles', { ...(sec.textStyles||{}), points: { ...(sec.textStyles?.['points']||{}), fontSize: +e.target.value } })}
            style={{ width:'100%', accentColor:'#3b82f6' }} />
        </div>
        <div style={{ marginBottom:8 }}>
          <span style={{ fontSize:10, color:C.mu, display:'block', marginBottom:4 }}>글자색</span>
          <div style={{ display:'flex', gap:3, flexWrap:'wrap', alignItems:'center' }}>
            {PRESET_COLORS.map(c => (
              <button key={c} onClick={() => change('textStyles', { ...(sec.textStyles||{}), points: { ...(sec.textStyles?.['points']||{}), color: c } })}
                style={{ width:20, height:20, borderRadius:3, background:c, border: sec.textStyles?.['points']?.color===c ? '2px solid #3b82f6' : '1px solid #ccc', cursor:'pointer', flexShrink:0 }} />
            ))}
            <input type="color" value={sec.textStyles?.['points']?.color || '#111111'}
              onChange={e => change('textStyles', { ...(sec.textStyles||{}), points: { ...(sec.textStyles?.['points']||{}), color: e.target.value } })}
              style={{ width:26, height:20, border:'1px solid #ccc', padding:0, cursor:'pointer', borderRadius:3, flexShrink:0 }} />
          </div>
        </div>

        {/* 텍스트 추가 */}
        <button onClick={onAddOverlay}
          style={{ width:'100%', padding:'8px 0', fontSize:12, fontWeight:700, borderRadius:7, border:'1.5px dashed #3b82f6', background:'#EFF6FF', color:'#1d4ed8', cursor:'pointer', marginBottom:8 }}>
          + 텍스트 추가
        </button>

        {/* 아이콘 모양 (points3icon) */}
        {tplKey === 'points3icon' && (
          <>
            <div style={{ borderTop:`1px solid ${C.bd}`, margin:'4px 0 12px' }} />
            <p style={sLabel}>아이콘 모양</p>
            <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:10 }}>
              {SHAPE_DEFS.map(({ k, l }) => {
                const on = (sec.pointShape || 'circle') === k
                return (
                  <button key={k} onClick={() => change('pointShape', k)}
                    style={{ padding:'5px 10px', fontSize:10, borderRadius:6, border:`1.5px solid ${on?'#3b82f6':C.bd}`, background:on?'#EFF6FF':C.sur, color:on?'#1d4ed8':C.mu, cursor:'pointer', fontWeight:on?700:400 }}>
                    {l}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* 좌우반전 (leftRight) */}
        {tplKey === 'leftRight' && (
          <>
            <div style={{ borderTop:`1px solid ${C.bd}`, margin:'4px 0 12px' }} />
            <button onClick={() => change('flipped', !sec.flipped)}
              style={{ width:'100%', padding:'8px 0', fontSize:12, borderRadius:7, border:'1px solid #3b82f6', background:'#EFF6FF', color:'#1d4ed8', cursor:'pointer', fontWeight:700, marginBottom:10 }}>
              ⇄ 좌우 반전
            </button>
          </>
        )}

        {/* 섹션 추가 / 삭제 */}
        <div style={{ borderTop:`1px solid ${C.bd}`, margin:'6px 0 8px' }} />
        <button onClick={onAddSection}
          style={{ width:'100%', padding:'8px 0', fontSize:12, fontWeight:700, borderRadius:7, border:'1.5px dashed #10b981', background:'#f0fdf4', color:'#059669', cursor:'pointer', marginBottom:6 }}>
          + 섹션 추가
        </button>
        <button onClick={onDelete}
          style={{ width:'100%', padding:'8px 0', fontSize:12, fontWeight:700, borderRadius:7, border:'1px solid #fca5a5', background:'#fef2f2', color:'#ef4444', cursor:'pointer' }}>
          × 섹션 삭제
        </button>
      </div>

      {/* 하단 PNG 버튼 */}
      <div style={{ borderTop:`1px solid ${C.bd}`, padding:'10px 12px', background:'#F8FAFF', flexShrink:0, display:'flex', gap:6, flexDirection:'column' }}>
        <button onClick={onDlSection}
          style={{ width:'100%', padding:'8px 0', fontSize:11, fontWeight:700, borderRadius:7, border:'1px solid #1d6b45', background:'#f0fdf4', color:'#1d6b45', cursor:'pointer' }}>
          ↓ 선택 PNG
        </button>
        <button onClick={onDlAll} disabled={dlAll}
          style={{ width:'100%', padding:'8px 0', fontSize:11, fontWeight:700, borderRadius:7, border:`1px solid ${dlAll?C.bd:C.bdm}`, background:dlAll?C.alt:C.tx, color:dlAll?C.fa:'#fff', cursor:dlAll?'not-allowed':'pointer' }}>
          {dlAll ? '저장 중…' : '↓ 전체 PNG'}
        </button>
      </div>
    </div>
  )
}

/* ── 선택 버튼 그룹 ─────────────────────────────────── */
function OptionBtns({ options, value, onChange, multi = false, maxSelect = null }) {
  const isSel = opt => multi ? value.includes(opt) : value === opt
  const toggle = opt => {
    if (multi) {
      if (value.includes(opt)) onChange(value.filter(o => o !== opt))
      else if (!maxSelect || value.length < maxSelect) onChange([...value, opt])
    } else {
      onChange(value === opt ? '' : opt)
    }
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(opt => {
        const sel = isSel(opt)
        const maxed = multi && maxSelect && !sel && value.length >= maxSelect
        return (
          <button key={opt} onClick={() => !maxed && toggle(opt)}
            style={{ padding: '7px 13px', borderRadius: 9, border: sel ? '2px solid #1D6B45' : `1.5px solid ${C.bd}`, background: sel ? '#E9F7F0' : C.sur, color: sel ? '#1D6B45' : C.tx, fontSize: 12.5, fontWeight: sel ? 700 : 400, cursor: maxed ? 'not-allowed' : 'pointer', opacity: maxed ? 0.45 : 1, transition: 'all .12s' }}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

/* ── 스텝 카드 ──────────────────────────────────────── */
function StepCard({ stepNum, label, done, children }) {
  return (
    <div style={{ background: C.sur, borderRadius: 14, border: done ? `1.5px solid ${C.bd}` : '1.5px solid #FECACA', marginBottom: 10, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', background: done ? C.alt : '#FFF5F5', borderBottom: `1px solid ${done ? C.bd : '#FECACA'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 22, height: 22, borderRadius: '50%', background: done ? '#1D6B45' : '#EF4444', color: '#fff', fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {done ? '✓' : stepNum}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.tx }}>{stepNum ? `STEP ${stepNum} — ${label}` : label}</span>
        <span style={{ fontSize: 10, color: done ? '#1D6B45' : '#EF4444', marginLeft: 'auto', fontWeight: 600 }}>{done ? '완료' : '필수'}</span>
      </div>
      <div style={{ padding: '14px 16px 6px' }}>{children}</div>
    </div>
  )
}

/* ── 서브 질문 ──────────────────────────────────────── */
function SubQ({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: C.mu, marginBottom: 7, margin: '0 0 7px' }}>{label}</p>
      {children}
    </div>
  )
}

async function generateSectionImages(sections, onProgress, context = {}) {
  const targets = sections.filter(s => s.imagePrompt && (context.uploadedProductPhoto || !s.secImg))
  const next = sections.map(s => ({ ...s }))

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    const idx = next.findIndex(s => s._id === target._id)
    if (idx < 0) continue

    onProgress?.(`AI 이미지 생성 중 (${i + 1}/${targets.length})`)

    try {
      const image = await generateImage({
        prompt: strengthenImagePrompt(target.imagePrompt, {
          ...context,
          sectionType: target.sectionType || context.sectionType,
          imageStrategy: target.imageStrategy,
        }),
        size: '1024x1536',
        quality: 'medium',
      })
      next[idx] = context.uploadedProductPhoto
        ? { ...next[idx], secImg2: image, imageStatus: 'support-generated' }
        : { ...next[idx], secImg: image, imageStatus: 'generated' }
    } catch (e) {
      next[idx] = { ...next[idx], imageStatus: 'failed', imageError: e.message }
      console.error(e)
    }
  }

  onProgress?.('')
  return next
}

function strengthenImagePrompt(prompt, { productName, productCategory, sectionType, uploadedProductPhoto, imageStrategy }) {
  const category = productCategory?.trim() || 'infer the exact product category from the product name'
  const name = productName?.trim() || 'the specified product'
  const lower = `${name} ${category}`.toLowerCase()
  const exclusions = ['smartphone', 'phone', 'unrelated electronics', 'random gadget', 'fake logo', 'watermark', 'text in image']
  if (lower.includes('razor') || lower.includes('shaver') || lower.includes('면도기')) exclusions.push('electric toothbrush', 'remote control', 'computer mouse')
  if (lower.includes('serum') || lower.includes('skincare') || lower.includes('스킨')) exclusions.push('beverage bottle', 'food packaging')
  if (lower.includes('mango') || lower.includes('food') || lower.includes('망고')) exclusions.push('cosmetic bottle', 'electronics')

  return [
    `PRODUCT IDENTITY LOCK: The product is "${name}".`,
    `PRODUCT CATEGORY: ${category}.`,
    `SECTION CONTEXT: ${sectionType}.`,
    imageStrategy ? `IMAGE STRATEGY: ${imageStrategy}.` : '',
    uploadedProductPhoto
      ? 'Use the uploaded product photo as the main product truth. Do not redesign the product. Generate only supporting imagery such as background, lifestyle context, close-up environment, detail surface, or scene direction that can be combined with the uploaded product photo.'
      : 'If exact product appearance is uncertain, create a realistic placeholder composition and leave room to replace with the real product photo.',
    'Before rendering, verify the scene clearly shows the correct product category and not an unrelated object.',
    prompt,
    `Do not show: ${exclusions.join(', ')}.`,
  ].join(' ')
}

/* ── 추가 섹션 AI 출력 파서 ─────────────────────────── */
function parseExtraSection(text, typeInfo) {
  const gf = (k, t) => { const rx = new RegExp(k + ':\\s*([^\\n]+)'); const f = t.match(rx); return f ? f[1].trim() : '' }
  const gb = (k, t) => {
    const rx = new RegExp(k + ':\\s*\\n([\\s\\S]*?)(?=\\n[가-힣A-Za-z]+:|$)')
    const f = t.match(rx); if (!f) return []
    return f[1].split('\n').map(l => l.replace(/^[\s•\-\d\.]+/, '').trim()).filter(l => l.length > 1)
  }
  return mkSec({
    sectionType: typeInfo.label,
    template: typeInfo.template,
    designStyle: typeInfo.designStyle || '크림',
    mainCopy: gf('메인카피', text),
    subCopy:  gf('서브카피', text),
    points:   gb('포인트', text),
  })
}

/* ── 상세페이지 결과 뷰 ─────────────────────────────── */
function DetailView({ result, savedSects, onSectsChange, productInput, quiz }) {
  const top    = parseBlocks(result)
  const rep    = top.find(b => b.title === '기획 보고서')
  const ptMeta = top.find(b => b.title.includes('Page Title'))
  const seo    = top.find(b => b.title.includes('SEO'))

  const ptText   = ptMeta?.lines.join('\n') || ''
  const pageTitle = ptText.match(/Page Title:\s*(.+)/)?.[1]?.trim() || ''
  const metaDesc  = ptText.match(/Meta Description:\s*(.+)/)?.[1]?.trim() || ''
  const [sects,    setSects]    = useState(() => savedSects ?? parseSections(result))
  const [planOpen, setPlanOpen] = useState({})
  const [dlAll,      setDlAll]      = useState(false)
  const [addLoading, setAddLoading] = useState(null)
  const [addModal,   setAddModal]   = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [selectedIdx,  setSelectedIdx]  = useState(() => {
    const s = savedSects ?? parseSections(result)
    return s.length > 0 ? 0 : null
  })
  const [activeField,  setActiveField]  = useState(null)
  const [activeOverlay,setActiveOverlay]= useState(null)
  const sectsInit = useRef(false)

  useEffect(() => {
    if (!sectsInit.current) { sectsInit.current = true; return }
    onSectsChange?.(sects)
  }, [sects])

  const upd = useCallback((i, v) => setSects(p => p.map((s, j) => j === i ? v : s)), [])

  const selectSection = useCallback((idx) => {
    setSelectedIdx(idx)
    setActiveField(null)
    setActiveOverlay(null)
  }, [])

  const deleteSection = useCallback(i => {
    setSects(p => p.filter((_, j) => j !== i))
    setPlanOpen({})
    setSelectedIdx(prev => {
      if (prev === null) return null
      if (prev === i) { setActiveField(null); setActiveOverlay(null); return null }
      return prev > i ? prev - 1 : prev
    })
  }, [])

  const addSection = useCallback(async (typeInfo, insertAfterIdx) => {
    setAddModal(null)
    setAddLoading(typeInfo.type)
    try {
      const text = await generateContent({
        systemPrompt: getExtraSectSys(typeInfo.type),
        userPrompt: productInput?.trim()
          ? `다음 제품 정보를 참고해서 "${typeInfo.label}" 섹션을 만들어줘:\n${productInput}`
          : `"${typeInfo.label}" 섹션 내용을 작성해줘.`,
        model: 'gpt-4o',
        maxTokens: 700,
      })
      const ns = { ...parseExtraSection(text, typeInfo), _userAdded: true }
      setSects(p => { const n = [...p]; n.splice(insertAfterIdx + 1, 0, ns); return n })
    } catch {
      const ns = mkSec({ sectionType: typeInfo.label, template: typeInfo.template, designStyle: typeInfo.designStyle || '크림', _userAdded: true })
      setSects(p => { const n = [...p]; n.splice(insertAfterIdx + 1, 0, ns); return n })
    } finally {
      setAddLoading(null)
    }
  }, [productInput])

  const addOverlay = useCallback(() => {
    if (selectedIdx === null) return
    const id  = Math.random().toString(36).slice(2, 9)
    const newOt = { id, text: '텍스트', x: 10, y: 20, style: { fontSize: 28, color: '#ffffff', fontFamily: "'Nanum Gothic', sans-serif" } }
    const sec = sects[selectedIdx]
    upd(selectedIdx, { ...sec, overlayTexts: [...(sec.overlayTexts || []), newOt] })
    setActiveOverlay(id)
    setActiveField(null)
  }, [selectedIdx, sects, upd])

  const dlAllPNG = async () => {
    setDlAll(true)
    const els = document.querySelectorAll('[data-sect-card]')
    for (let i = 0; i < els.length; i++) {
      try { await capturePNG(els[i], `section_${i + 1}.png`); await new Promise(r => setTimeout(r, 600)) }
      catch (e) { console.error(e) }
    }
    setDlAll(false)
  }

  const dlSectionPNG = async () => {
    if (selectedIdx === null) return
    const els = document.querySelectorAll('[data-sect-card]')
    const el  = els[selectedIdx]
    if (!el) return
    setDlAll(true)
    try { await capturePNG(el, `section_${selectedIdx + 1}.png`) }
    catch (e) { console.error(e) }
    finally { setDlAll(false) }
  }

  return (
    <div>
      {rep && (
        <div style={{ background: '#FFFFFF', padding: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.tx, letterSpacing: '-0.02em' }}>📋 기획 보고서</span>
            <CopyBtn text={rep.lines.join('\n').trim()} />
          </div>
          <div style={{ background: C.alt, borderRadius: 10, border: `1px solid ${C.bd}`, padding: '14px 16px' }}>
            <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 13.5, lineHeight: 1.9, color: C.tx, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{rep.lines.join('\n').trim()}</pre>
          </div>
        </div>
      )}

      {(pageTitle || metaDesc) && (
        <div style={{ background: '#EFF6FF', padding: '20px 0', borderTop: '1px solid #BFDBFE', borderBottom: '1px solid #BFDBFE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#1E40AF', letterSpacing: '-0.02em' }}>🔍 Page Title & Meta Description</span>
            <span style={{ fontSize: 11, color: '#3B82F6' }}>— SEO 최적화</span>
          </div>
          {pageTitle && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF' }}>Page Title</span>
                <CopyBtn text={pageTitle} />
              </div>
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #BFDBFE', padding: '10px 14px', fontSize: 13.5, color: C.tx, lineHeight: 1.7 }}>{pageTitle}</div>
            </div>
          )}
          {metaDesc && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF' }}>Meta Description</span>
                <CopyBtn text={metaDesc} />
              </div>
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #BFDBFE', padding: '10px 14px', fontSize: 13.5, color: C.tx, lineHeight: 1.7 }}>{metaDesc}</div>
            </div>
          )}
        </div>
      )}

      {sects.length > 0 && (
        <div style={{ background: '#FEFCE8', padding: '20px 0 24px', borderTop: '1px solid #FEF08A', borderBottom: '1px solid #FEF08A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#713F12', letterSpacing: '-0.02em' }}>📐 섹션별 기획안</span>
            <span style={{ fontSize: 11, color: '#A16207' }}>— 촬영 가이드 · AI 프롬프트 포함</span>
          </div>
          {sects.map((s, i) => {
            let sp = {}
            try { sp = JSON.parse(s.photoDir || '{}') } catch {}
            return (
              <div key={s._id || i} style={{ marginBottom: 6, border: `1px solid ${C.bd}`, borderRadius: 8, overflow: 'hidden' }}>
                <button onClick={() => setPlanOpen(o => ({ ...o, [i]: !o[i] }))} style={{ width: '100%', padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: planOpen[i] ? '#ECEAE5' : C.sur, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.mu, background: C.alt, padding: '1px 7px', borderRadius: 4, border: `1px solid ${C.bd}` }}>S{i + 1}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.tx }}>{s.sectionType}</span>
                    {s.mainCopy && <span style={{ fontSize: 11, color: C.mu }}>— {s.mainCopy}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700 }}>{planOpen[i] ? '접기' : '열어보기'}</span>
                    {s._userAdded && (
                      <span onClick={e => { e.stopPropagation(); deleteSection(i) }}
                        style={{ fontSize: 12, color: '#ef4444', fontWeight: 700, cursor: 'pointer', padding: '2px 7px', borderRadius: 4, background: '#fef2f2', border: '1px solid #fca5a5', lineHeight: 1 }}>×</span>
                    )}
                  </div>
                </button>
                {planOpen[i] && (
                  <div style={{ padding: '14px 16px', borderTop: `1px solid ${C.bd}` }}>
                    <pre style={{ margin: '0 0 12px', fontFamily: 'inherit', fontSize: 12.5, lineHeight: 1.85, color: C.tx, whiteSpace: 'pre-wrap' }}>
                      {[
                        s.mainCopy && `메인: ${s.mainCopy}`,
                        s.subCopy && `서브: ${s.subCopy}`,
                        s.points?.length && `\n포인트:\n${s.points.map((p, j) => `  ${j + 1}. ${p}`).join('\n')}`,
                      ].filter(Boolean).join('\n')}
                    </pre>
                    {Object.keys(sp).length > 0 && (
                      <div style={{ background: C.alt, borderRadius: 7, padding: '10px 13px', border: `1px solid ${C.bd}`, marginBottom: 10 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: C.fa, marginBottom: 6 }}>📷 촬영 기획</p>
                        {Object.entries(sp).map(([k, v], j) => <div key={j} style={{ fontSize: 12, color: C.tx, marginBottom: 3 }}><span style={{ color: C.mu, fontWeight: 600 }}>{k}:</span> {v}</div>)}
                      </div>
                    )}
                    {false && s.imagePrompt && (
                      <>
                        <div style={{ background: '#111', borderRadius: 7, padding: '9px 12px', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <code style={{ fontSize: 11, color: '#D4D4D4', fontFamily: "'Courier New',monospace", lineHeight: 1.7, flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{s.imagePrompt}</code>
                          <CopyBtn text={s.imagePrompt} />
                        </div>
                        <p style={{ margin: '8px 0 0', fontSize: 11, color: C.mu, lineHeight: 1.8 }}>
                          💡 프롬프트를 복사하고, ChatGPT 또는 미드저니에서<br />
                          여기 업로드한 제품 사진과 함께 사용하세요.<br />
                          사진을 같이 올리면 더 정확한 이미지가 생성됩니다.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {sects.length > 0 && (
        <div style={{ background:'#F5F2ED', paddingTop:32, paddingBottom:60 }}>
          <div style={{ display:'flex', alignItems:'flex-start' }}>
            {/* 캔버스 */}
            <div style={{ flex:1, minWidth:0 }}
              onClick={() => setSelectedIdx(null)}
            >
              <div
                style={{ boxShadow:'0 8px 48px rgba(0,0,0,0.15)' }}
                onClick={e => e.stopPropagation()}
              >
                {sects.map((s, i) => (
                  <SectionEditor
                    key={s._id || i}
                    sec={s} idx={i} onUpdate={upd}
                    isSelected={selectedIdx === i}
                    onSelect={selectSection}
                    activeField={selectedIdx === i ? activeField : null}
                    onActiveFieldChange={f => { setActiveField(f); setActiveOverlay(null) }}
                    activeOverlay={selectedIdx === i ? activeOverlay : null}
                    onActiveOverlayChange={id => { setActiveOverlay(id); setActiveField(null) }}
                  />
                ))}
              </div>
            </div>
            {/* 스티키 편집 패널 */}
            <div style={{ width:340, flexShrink:0, position:'sticky', top:52, alignSelf:'flex-start' }}>
              <CanvaPanel
                sec={selectedIdx !== null ? sects[selectedIdx] : null}
                idx={selectedIdx}
                onUpdate={upd}
                onDelete={() => selectedIdx !== null && setDeleteConfirm(selectedIdx)}
                onAddSection={() => setAddModal(selectedIdx ?? sects.length - 1)}
                activeField={activeField}
                activeOverlay={activeOverlay}
                onAddOverlay={addOverlay}
                dlAll={dlAll}
                onDlAll={dlAllPNG}
                onDlSection={dlSectionPNG}
              />
            </div>
          </div>
        </div>
      )}

      {seo && (
        <div style={{ marginTop: 20 }}>
          <Blk title={seo.title} lines={seo.lines} />
        </div>
      )}

      {addModal !== null && (
        <div onClick={() => setAddModal(null)}
          style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#fff', borderRadius:16, padding:'24px', maxWidth:480, width:'90%', maxHeight:'80vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <span style={{ fontSize:14, fontWeight:700, color:C.tx }}>추가할 섹션 선택</span>
              <button onClick={() => setAddModal(null)}
                style={{ width:28, height:28, borderRadius:'50%', border:'none', background:C.alt, cursor:'pointer', fontSize:18, color:C.mu, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>×</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
              {EXTRA_SECTIONS.map(sec => (
                <button key={sec.type} onClick={() => addSection(sec, addModal)}
                  style={{ padding:'12px 14px', borderRadius:10, border:`1px solid ${C.bd}`, background:C.sur, cursor:'pointer', textAlign:'left', transition:'border-color .12s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='#3b82f6'}
                  onMouseLeave={e => e.currentTarget.style.borderColor=C.bd}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.tx }}>{sec.label}</div>
                  <div style={{ fontSize:11, color:C.fa, marginTop:3 }}>{sec.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {deleteConfirm !== null && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:14, padding:'28px 32px', maxWidth:320, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', textAlign:'center' }}>
            <p style={{ fontSize:15, fontWeight:600, color:C.tx, margin:'0 0 6px' }}>섹션을 삭제하시겠습니까?</p>
            <p style={{ fontSize:12, color:C.fa, margin:'0 0 24px' }}>이 작업은 되돌릴 수 없습니다.</p>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button onClick={() => setDeleteConfirm(null)}
                style={{ padding:'9px 24px', borderRadius:8, border:`1px solid ${C.bd}`, background:C.sur, color:C.mu, cursor:'pointer', fontWeight:600, fontSize:13 }}>취소</button>
              <button onClick={() => { deleteSection(deleteConfirm); setDeleteConfirm(null) }}
                style={{ padding:'9px 24px', borderRadius:8, border:'none', background:'#ef4444', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:13 }}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── 메인 앱 ───────────────────────────────────────── */
export default function App() {
  const [task, setTask] = useState(TASKS[0])
  const [tone, setTone] = useState('생활형')
  const [tabLoading, setTabLoading] = useState({})
  const [error, setError] = useState('')
  const [productName, setProductName] = useState('')
  const [productCategory, setProductCategory] = useState('')
  const [productCategoryDetail, setProductCategoryDetail] = useState('')
  const [platform, setPlatform] = useState('Amazon A+')
  const [sectionMode, setSectionMode] = useState('Static Section')
  const [sectionType, setSectionType] = useState('Hero Banner')
  const [templateVariant, setTemplateVariant] = useState('hero_01')
  const [sizePreset, setSizePreset] = useState('amazon_standard_module')
  const [generateMode, setGenerateMode] = useState('Fast Draft')
  const [generationGoal, setGenerationGoal] = useState('Improve Conversion')
  const [outputStyle, setOutputStyle] = useState('Premium')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [generateAllSectionImages, setGenerateAllSectionImages] = useState(false)
  const [manualSectionSelection, setManualSectionSelection] = useState(false)
  const [targetCustomer, setTargetCustomer] = useState('')
  const [customerPainPoint, setCustomerPainPoint] = useState('')
  const [buyingMotivation, setBuyingMotivation] = useState('')
  const [productBenefits, setProductBenefits] = useState('')
  const [productFeatures, setProductFeatures] = useState('')
  const [brandToneInput, setBrandToneInput] = useState('')
  const [brandToneDetail, setBrandToneDetail] = useState('')
  const [referenceUrl, setReferenceUrl] = useState('')
  const [triedGenerate, setTriedGenerate] = useState(false)

  // 새로고침 시 전체 초기화
  useEffect(() => {
    ;['cos_input','cos_quiz','cos_result_detail','cos_result_blog','cos_result_card',
      'cos_card_data','cos_detail_data','cos_history'].forEach(k => {
      try { localStorage.removeItem(k) } catch {}
    })
  }, [])

  // 공통 제품 정보
  const [sharedInput, setSharedInput] = useState('')

  // 7단계 퀴즈
  const [quiz, setQuiz] = useState({ ...EMPTY_QUIZ })

  const updQuiz = useCallback((key, val) => setQuiz(q => ({ ...q, [key]: val })), [])

  useEffect(() => {
    try { localStorage.setItem('cos_input', sharedInput) } catch {}
  }, [sharedInput])

  useEffect(() => {
    try { localStorage.setItem('cos_quiz', JSON.stringify(quiz)) } catch {}
  }, [quiz])

  const availableSectionTypes = sectionMode === 'Interactive Section' ? INTERACTIVE_SECTION_TYPES : STATIC_SECTION_TYPES
  const availableTemplates = TEMPLATE_LIBRARY[sectionType] || ['custom_01']

  useEffect(() => {
    if (!availableSectionTypes.includes(sectionType)) {
      const nextType = availableSectionTypes[0]
      setSectionType(nextType)
      setTemplateVariant((TEMPLATE_LIBRARY[nextType] || ['custom_01'])[0])
    }
  }, [sectionMode]) // eslint-disable-line

  useEffect(() => {
    const templates = TEMPLATE_LIBRARY[sectionType] || ['custom_01']
    if (!templates.includes(templateVariant)) setTemplateVariant(templates[0])
  }, [sectionType]) // eslint-disable-line

  useEffect(() => {
    const current = SIZE_PRESETS[sizePreset]
    if (platform === 'Shopify' && current?.platform !== 'Shopify') setSizePreset('shopify_desktop')
    if (platform === 'Amazon A+' && current?.platform !== 'Amazon A+') setSizePreset('amazon_standard_module')
  }, [platform]) // eslint-disable-line

  const requiredFields = {
    productName,
    productCategory,
    sharedInput,
    platform,
    generationGoal,
    targetCustomer,
    customerPainPoint,
    buyingMotivation,
    productBenefits,
  }
  const missingFields = Object.entries(requiredFields).filter(([, value]) => !String(value || '').trim()).map(([key]) => key)
  const isMissing = key => triedGenerate && missingFields.includes(key)
  const fieldBorder = key => `1.5px solid ${isMissing(key) ? '#EF4444' : C.bd}`

  const categoryQuestions = CATEGORY_QUESTIONS[productCategory] || CATEGORY_QUESTIONS.Other
  const selectedCategoryText = [productCategory, productCategoryDetail.trim()].filter(Boolean).join(' - ')
  const step1Done = !!(productName.trim() && productCategory.trim() && sharedInput.trim())
  const step2Done = !!(platform && generationGoal)
  const step3Done = !missingFields.some(k => ['targetCustomer','customerPainPoint','buyingMotivation','productBenefits'].includes(k))
  const allDone = missingFields.length === 0
  const step4Done = allDone
  const step5Done = true
  const step6Done = true
  const step7Done = true

  // 탭별 결과
  const [tabResults, setTabResults] = useState(() => {
    const r = {}
    for (const t of TASKS) { r[t.id] = '' }
    return r
  })
  const result = tabResults[task.id] || ''

  const saveResult = useCallback((tid, text) => {
    setTabResults(prev => ({ ...prev, [tid]: text }))
    try { localStorage.setItem(`cos_result_${tid}`, text) } catch {}
  }, [])

  // 카드/섹션 에디터 상태
  const [cardData,   setCardData]   = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [cardGenKey,   setCardGenKey]   = useState(0)
  const [detailGenKey, setDetailGenKey] = useState(0)

  const saveCardData = useCallback((cards) => {
    setCardData(cards)
    try {
      try {
        const dd = localStorage.getItem('cos_detail_data')
        if (dd) {
          const p = JSON.parse(dd)
          if (p.some(s => s.secImg || s.secImg2 || s.secImg3 || s.secImg4))
            localStorage.setItem('cos_detail_data', JSON.stringify(p.map(s => ({ ...s, secImg: null, secImg2: null, secImg3: null, secImg4: null }))))
        }
      } catch {}
      localStorage.setItem('cos_card_data', JSON.stringify(cards))
    } catch {
      try { localStorage.setItem('cos_card_data', JSON.stringify(cards.map(c => ({ ...c, image: null })))) } catch {}
    }
  }, [])

  const saveDetailData = useCallback((sects) => {
    setDetailData(sects)
    try {
      try {
        const cd = localStorage.getItem('cos_card_data')
        if (cd) {
          const p = JSON.parse(cd)
          if (p.some(c => c.image))
            localStorage.setItem('cos_card_data', JSON.stringify(p.map(c => ({ ...c, image: null }))))
        }
      } catch {}
      localStorage.setItem('cos_detail_data', JSON.stringify(sects))
    } catch {
      try { localStorage.setItem('cos_detail_data', JSON.stringify(sects.map(s => ({ ...s, secImg: null, secImg2: null, secImg3: null, secImg4: null })))) } catch {}
    }
  }, [])

  const [keywordContext, setKeywordContext] = useState('')
  const [history, setHistory] = useState([])
  const [histOpen, setHistOpen] = useState(false)
  const [titleHover, setTitleHover] = useState(false)

  const taRef       = useRef(null)
  const diffRef     = useRef(null)
  const resRef      = useRef(null)
  const imgUploadRef = useRef(null)

  // 제품 사진 업로드
  const [productImgs, setProductImgs] = useState([])
  const [autoGenerateImages, setAutoGenerateImages] = useState(true)
  const [imageGenStatus, setImageGenStatus] = useState('')
  const handleProductImgs = async e => {
    const files = Array.from(e.target.files)
    const remaining = 5 - productImgs.length
    setError('')
    for (const f of files.slice(0, remaining)) {
      try {
        const compressed = await compressImageFile(f, 1200, 0.75)
        if (dataUrlBytes(compressed) > MAX_PRODUCT_IMAGE_BYTES) {
          setError('Uploaded images are too large. Please upload smaller images or allow automatic compression.')
          continue
        }
        setProductImgs(prev => prev.length < 5 ? [...prev, compressed] : prev)
      } catch (err) {
        setError(err.message || 'Failed to compress uploaded image.')
      }
    }
    e.target.value = ''
  }

  // textarea 자동 높이
  useEffect(() => {
    if (!taRef.current) return
    taRef.current.style.height = 'auto'
    taRef.current.style.height = Math.max(120, taRef.current.scrollHeight) + 'px'
  }, [sharedInput])

  useEffect(() => {
    if (!diffRef.current) return
    diffRef.current.style.height = 'auto'
    diffRef.current.style.height = Math.max(72, diffRef.current.scrollHeight) + 'px'
  }, [quiz.differentiator])

  useEffect(() => {
    try { localStorage.setItem('cos_history', JSON.stringify(history.slice(0, 20))) } catch {}
  }, [history])

  const sw = t => {
    setTask(t)
    setError('')
  }

  const resetAll = () => {
    setProductName('')
    setProductCategory('')
    setProductCategoryDetail('')
    setSharedInput('')
    setPlatform('Amazon A+')
    setSectionMode('Static Section')
    setSectionType('Hero Banner')
    setTemplateVariant('hero_01')
    setSizePreset('amazon_standard_module')
    setGenerateMode('Fast Draft')
    setGenerationGoal('Improve Conversion')
    setOutputStyle('Premium')
    setAdvancedOpen(false)
    setGenerateAllSectionImages(false)
    setManualSectionSelection(false)
    setTargetCustomer('')
    setCustomerPainPoint('')
    setBuyingMotivation('')
    setProductBenefits('')
    setProductFeatures('')
    setBrandToneInput('')
    setBrandToneDetail('')
    setReferenceUrl('')
    setTriedGenerate(false)
    setQuiz({ ...EMPTY_QUIZ })
    setProductImgs([])
    const empty = {}
    for (const t of TASKS) {
      empty[t.id] = ''
      try { localStorage.removeItem(`cos_result_${t.id}`) } catch {}
    }
    setTabResults(empty)
    setCardData(null);   try { localStorage.removeItem('cos_card_data')   } catch {}
    setDetailData(null); try { localStorage.removeItem('cos_detail_data') } catch {}
    setTask(TASKS[0])
    setError('')
    setKeywordContext('')
    try { localStorage.removeItem('cos_input'); localStorage.removeItem('cos_quiz') } catch {}
  }

  const run = async () => {
    setTriedGenerate(true)
    if (tabLoading[task.id]) return
    if (missingFields.length > 0) {
      setError('')
      return
    }
    const tid = task.id
    setTabLoading(prev => ({ ...prev, [tid]: true }))
    saveResult(tid, '')
    setError('')
    try {
      const userPrompt = [
        `Product Name: ${productName.trim()}`,
        selectedCategoryText && `Product Category: ${selectedCategoryText}`,
        `Product Description: ${sharedInput.trim()}`,
        productImgs.length > 0 && `Product Photo Uploads: ${productImgs.length} uploaded image(s). Treat uploaded product photos as the source of truth for product shape, color, packaging, material, and visual identity.`,
        `Platform: ${platform}`,
        `Primary Goal: ${generationGoal}`,
        `Output Style: ${outputStyle}`,
        `Generation Target: Generate a complete commerce section set, not one selected section.`,
        `Recommended Base Flow: ${DEFAULT_SECTION_FLOW.join(' > ')}`,
        manualSectionSelection && `Manual Advanced Section Hint: prioritize ${sectionType} with template ${templateVariant}, but still produce a complete section set.`,
        targetCustomer && `Target Customer: ${targetCustomer.trim()}`,
        customerPainPoint && `Customer Pain Point: ${customerPainPoint.trim()}`,
        buyingMotivation && `Buying Motivation: ${buyingMotivation.trim()}`,
        productBenefits && `Product Benefits: ${productBenefits.trim()}`,
        productFeatures && `Product Features: ${productFeatures.trim()}`,
        [brandToneInput, brandToneDetail.trim()].filter(Boolean).length > 0 && `Brand Tone: ${[brandToneInput, brandToneDetail.trim()].filter(Boolean).join(' - ')}`,
        quiz.differentiator && `Differentiation: ${quiz.differentiator.trim()}`,
        referenceUrl && `Reference URL or Competitor Link: ${referenceUrl.trim()}`,
        `Category-Specific Questions:
- ${categoryQuestions.targetCustomer}: ${targetCustomer.trim()}
- ${categoryQuestions.customerPainPoint}: ${customerPainPoint.trim()}
- ${categoryQuestions.buyingMotivation}: ${buyingMotivation.trim()}
- ${categoryQuestions.productBenefits}: ${productBenefits.trim()}
- ${categoryQuestions.productFeatures}: ${productFeatures.trim()}
- ${categoryQuestions.differentiation}: ${quiz.differentiator.trim() || '(not provided)'}`,
        'If any input is Korean, translate it internally into natural English before writing copy or image prompts.',
        'Final section copy must be English. Image prompts must be English.',
        'AI must decide the final section sequence and template fit from product category, platform, goal, and tone.',
        'Output 5-9 sections using the required [SECTION n - Section Name] format. Start with Hero and end with CTA. Include or exclude sections based on the product and goal.',
      ].filter(Boolean).join('\n')
      const hasImgs = tid === 'detail' && productImgs.length > 0
      const apiProductImgs = productImgs.slice(0, generateMode === 'Multi Concept' ? 1 : 2)
      const imagePayloadBytes = apiProductImgs.reduce((sum, img) => sum + dataUrlBytes(img), 0)
      if (imagePayloadBytes > 2.4 * 1024 * 1024) {
        const err = new Error('Uploaded images are too large. Please upload smaller images or allow automatic compression.')
        err.code = 'PAYLOAD_TOO_LARGE'
        err.payloadBytes = imagePayloadBytes
        throw err
      }
      const quizOpts = {
        ...quiz,
        platform,
        sectionMode,
        sectionType: manualSectionSelection ? sectionType : 'AI-selected full section set',
        templateVariant: manualSectionSelection ? templateVariant : 'AI-selected per section',
        productName,
        productCategory: selectedCategoryText,
        targetCustomer,
        customerPainPoint,
        buyingMotivation,
        productBenefits,
        productFeatures,
        brandTone: [brandToneInput, brandToneDetail.trim()].filter(Boolean),
        differentiation: quiz.differentiator,
        generationGoal,
        outputStyle,
      }
      const sysBase = getSys(tid, tone, quizOpts)
      const systemPrompt = hasImgs
        ? sysBase + '\n\n업로드된 제품 사진을 분석해서 제품의 외형·색상·패키지 디자인을 파악하고, 각 섹션 AI프롬프트에 실제 제품의 시각적 특성(색상, 형태, 질감, 소재감)을 구체적으로 반영해줘.'
        : sysBase
      const optionCount = generateMode === 'Multi Concept' ? 3 : 1
      const optionTexts = []
      for (let i = 0; i < optionCount; i++) {
        const variant = manualSectionSelection ? (availableTemplates[i % availableTemplates.length] || templateVariant) : 'AI-selected per section'
        const concept = CONCEPT_DIRECTIONS[i] || CONCEPT_DIRECTIONS[0]
        const optionPrompt = optionCount === 1
          ? `${userPrompt}\n\nDesign Generation Mode: Fast Draft\nCreate 1 complete full section set with one coherent copy direction and one practical image direction. Generate the full flow from Hero to CTA. Use only 1-2 representative image directions; remaining sections can use upload slots or placeholders to control cost.\nProduct Photo Policy: ${hasImgs ? 'Use uploaded product photos as the source of truth. Keep the real product shape, color, packaging, material, proportions, and visual identity. Do not redesign the product; use generated imagery for backgrounds, lifestyle context, detail support, or placement direction.' : 'No product photo was uploaded. Create a temporary realistic product placeholder and make the section easy to replace with the real product photo.'}`
          : `${userPrompt}

Design Generation Mode: Multi Concept
${concept.label} - ${concept.name}
- Generate one complete full section set for this concept, from Hero to CTA.
- Choose a section flow that fits this concept, the product category, platform, goal, and tone.
- Layout Direction: ${concept.layout}
- Copy Direction: ${concept.copy}
- Image Direction: ${concept.image}
- Template Selection: ${variant}
- Product Photo Policy: ${hasImgs ? 'Use uploaded product photos as the source of truth. Keep the real product shape, color, packaging, material, proportions, and visual identity. Do not redesign the product; use generated imagery for backgrounds, lifestyle context, detail support, or placement direction.' : 'No product photo was uploaded. Create a temporary realistic product placeholder and make the section easy to replace with the real product photo.'}

This concept must differ from the other options in section flow and at least one of: Layout, Copy, or Image Style.`
        const optionText = await generateContent({
          systemPrompt: getSys(tid, tone, { ...quizOpts, templateVariant: variant }) + (hasImgs ? '\n\nUploaded product photos are the source of truth. Analyze the uploaded images and preserve the real product shape, color, packaging, material, proportions, and visual identity. Do not redesign or invent a different product. Use AI-generated imagery for backgrounds, lifestyle scenes, close-up context, supporting detail shots, or product-photo placement direction.' : ''),
          userPrompt: optionPrompt,
          images: hasImgs ? apiProductImgs : [],
          model: 'gpt-4o',
          maxTokens: tid === 'detail' ? 7000 : 2000,
        })
        optionTexts.push(optionCount === 1 ? optionText : `▼ ${concept.label} - ${concept.name}\n\n${optionText}`)
      }
      const text = optionTexts.join('\n\n')
      saveResult(tid, text)
      if (tid === 'card') {
        setCardData(null); try { localStorage.removeItem('cos_card_data') } catch {}
        setCardGenKey(k => k + 1)
      }
      if (tid === 'detail') {
        setImageGenStatus('')
        const preset = SIZE_PRESETS[sizePreset] || SIZE_PRESETS.amazon_standard_module
        const parsed = optionTexts.flatMap((optionText, optionIdx) => {
          const concept = CONCEPT_DIRECTIONS[optionIdx] || CONCEPT_DIRECTIONS[0]
          return parseSections(optionText).map((s, sectionIdx) => ({
            ...s,
            title: s.title || s.sectionType,
            conceptLabel: generateMode === 'Multi Concept' ? `${concept.label} - ${concept.name}` : 'Full Section Set',
            conceptIndex: optionIdx,
            sectionSetPosition: sectionIdx + 1,
            canvas: { preset: sizePreset, ...preset },
            imageStrategy: generateMode === 'Multi Concept'
              ? `${concept.label} - ${concept.name}: ${concept.image}`
              : 'Fast Draft: one practical commercial product image direction, using uploaded product photos as source of truth when provided.',
            secImg: productImgs[0] || s.secImg,
            uploadedProductPhotos: productImgs,
            productPhotoMode: productImgs[0] ? 'uploaded-main-product' : 'replace-with-real-product-photo',
          }))
        })
        if (autoGenerateImages) {
          const imageTargets = generateAllSectionImages
            ? parsed
            : parsed.map(s => (s.sectionSetPosition <= 2 ? s : { ...s, imagePrompt: '' }))
          const generated = await generateSectionImages(imageTargets, setImageGenStatus, {
            productName,
            productCategory: selectedCategoryText,
            sectionType: 'Full Section Set',
            uploadedProductPhoto: productImgs.length > 0,
          })
          saveDetailData(generated)
        } else {
          saveDetailData(parsed)
        }
        setDetailGenKey(k => k + 1)
      }
      const h = { id: Date.now(), taskId: tid, label: task.label, preview: sharedInput.slice(0, 60), result: text, ts: new Date().toISOString() }
      setHistory(p => [h, ...p].slice(0, 20))
      setTimeout(() => resRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (e) {
      setError('오류: ' + e.message)
    } finally {
      setImageGenStatus('')
      setTabLoading(prev => ({ ...prev, [tid]: false }))
    }
  }

  const topBlocks = result ? parseBlocks(result) : []

  const blogTitle = (() => {
    if (task.id !== 'blog' || !result) return ''
    const block = topBlocks.find(b => b.title.includes('제목'))
    if (!block) return ''
    const line = block.lines.find(l => /^\d[..]/.test(l.trim()))
    return line ? line.replace(/^\d+[..]\s*/, '').trim() : ''
  })()

  const loading = tabLoading[task.id] || false

  const incompletedSteps = [
    !step1Done && 'STEP 1',
    !step2Done && 'STEP 2',
    !step3Done && 'STEP 3',
    !step4Done && 'STEP 4',
    !step5Done && 'STEP 5',
    !step6Done && 'STEP 6',
    !step7Done && 'STEP 7',
  ].filter(Boolean)

  return (
    <>
      {/* ── 고정 네비게이션 ── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, background: 'rgba(245,244,240,0.97)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${C.bd}`, height: 52, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
        <button onClick={() => setHistOpen(o => !o)}
          style={{ width: 32, height: 32, borderRadius: 7, border: 'none', background: histOpen ? C.alt : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.mu, fontSize: 18, flexShrink: 0 }}>
          {histOpen ? '‹' : '≡'}
        </button>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: C.tx, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}>C</div>
        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.04em' }}>ContentOS</span>
        <span style={{ fontSize: 10, color: C.fa, background: '#ECEAE5', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>BETA</span>
      </header>

      {/* ── 사이드바 (히스토리) ── */}
      <aside style={{ position: 'fixed', top: 52, left: 0, bottom: 0, zIndex: 50, width: histOpen ? 260 : 0, transition: 'width .22s ease', background: C.sur, borderRight: histOpen ? `1px solid ${C.bd}` : 'none', overflow: 'hidden' }}>
        <div style={{ width: 260, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${C.bd}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: C.tx }}>히스토리</span>
            {history.length > 0 && <span style={{ fontSize: 10, background: C.alt, color: C.mu, borderRadius: 20, padding: '1px 7px', fontWeight: 600 }}>{history.length}</span>}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px 20px' }}>
            {history.length === 0
              ? <p style={{ fontSize: 12, color: C.fa, textAlign: 'center', marginTop: 32 }}>아직 기록 없음</p>
              : history.map(h => {
                  const tk = TASKS.find(t => t.id === h.taskId) || TASKS[0]
                  return (
                    <button key={h.id} onClick={() => {
                      const tk2 = TASKS.find(t => t.id === h.taskId) || TASKS[0]
                      setTask(tk2)
                      saveResult(h.taskId, h.result)
                      if (h.taskId === 'card') { setCardData(null); try { localStorage.removeItem('cos_card_data') } catch {}; setCardGenKey(k => k + 1) }
                      if (h.taskId === 'detail') { setDetailData(null); try { localStorage.removeItem('cos_detail_data') } catch {}; setDetailGenKey(k => k + 1) }
                      setTimeout(() => resRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
                    }} style={{ width: '100%', textAlign: 'left', padding: '9px 10px', borderRadius: 8, border: `1px solid ${C.bd}`, background: C.sur, cursor: 'pointer', marginBottom: 5, display: 'block' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                        <span style={{ fontSize: 14 }}>{tk.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: tk.col }}>{tk.label}</span>
                        <span style={{ fontSize: 10, color: C.fa, marginLeft: 'auto' }}>{new Date(h.ts).toLocaleString('ko', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.mu, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{h.preview}</div>
                    </button>
                  )
                })}
          </div>
        </div>
      </aside>

      {/* ── 메인 콘텐츠 ── */}
      <div style={{ marginLeft: histOpen ? 260 : 0, transition: 'margin-left .22s ease', paddingTop: 52, minHeight: '100vh', background: C.bg, color: C.tx }}>
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 8px 100px' }}>

          {/* 타이틀 (클릭 시 전체 리셋) */}
          <div onClick={resetAll} onMouseEnter={() => setTitleHover(true)} onMouseLeave={() => setTitleHover(false)}
            style={{ textAlign: 'center', marginBottom: 32, cursor: 'pointer', opacity: titleHover ? 0.6 : 1, transition: 'opacity .15s' }}>
            <h1 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1.2, margin: '0 0 8px' }}>AI Commerce Section Builder</h1>
            <p style={{ fontSize: 13, color: C.mu, lineHeight: 1.75, margin: 0 }}>Amazon A+ static sections and Shopify interactive sections</p>
          </div>

          {/* ── STEP 1: Product basics ── */}
          <StepCard stepNum={1} label="Product Basics" done={step1Done}>
            <SubQ label="Product Name">
              <input value={productName} onChange={e => setProductName(e.target.value)}
                placeholder="예) 제주 애플망고 / Ceramic pour-over set / Hydrating face serum"
                style={{ width: '100%', padding: '12px 14px', border: fieldBorder('productName'), borderRadius: 10, outline: 'none', fontSize: 14, color: C.tx, background: C.alt, fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </SubQ>

            <SubQ label="Product Category">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:7, marginBottom:8 }}>
                {PRODUCT_CATEGORIES.map(cat => {
                  const on = productCategory === cat
                  return (
                    <button key={cat} onClick={() => setProductCategory(cat)}
                      style={{ padding:'9px 10px', borderRadius:9, border:`1.5px solid ${isMissing('productCategory') ? '#EF4444' : (on ? '#1D6B45' : C.bd)}`, background:on?'#F0FDF4':C.sur, color:on?'#1D6B45':C.tx, fontSize:11.5, fontWeight:on?800:650, cursor:'pointer', textAlign:'left' }}>
                      {cat}
                    </button>
                  )
                })}
              </div>
              <input value={productCategoryDetail} onChange={e => setProductCategoryDetail(e.target.value)}
                placeholder="Additional Category Detail: Jeju-grown premium apple mango / Men's shaving razor for sensitive skin"
                style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${C.bd}`, borderRadius: 10, outline: 'none', fontSize: 13.5, color: C.tx, background: C.alt, fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </SubQ>

            <SubQ label="Product Description">
              <textarea ref={taRef} value={sharedInput} onChange={e => setSharedInput(e.target.value)}
                placeholder="제품 특징, 소재, 가격대, 고객, 차별점, 사용 상황을 자유롭게 적어주세요."
                style={{ width: '100%', minHeight: 120, padding: '12px 14px', border: fieldBorder('sharedInput'), borderRadius: 10, outline: 'none', resize: 'none', fontSize: 14, lineHeight: 1.85, color: C.tx, background: C.alt, fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .15s' }}
              />
            </SubQ>

            <SubQ label="Product Photos (optional, up to 5)">
              <input ref={imgUploadRef} type="file" accept="image/*" multiple onChange={handleProductImgs} style={{ display: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => imgUploadRef.current?.click()} disabled={productImgs.length >= 5}
                  style={{ padding: '5px 12px', fontSize: 11, borderRadius: 7, border: `1px solid ${C.bd}`, background: C.sur, color: productImgs.length >= 5 ? C.fa : C.mu, cursor: productImgs.length >= 5 ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                  📷 사진 추가 ({productImgs.length}/5)
                </button>
                {productImgs.map((img, i) => (
                  <div key={i} style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 7, border: `1px solid ${C.bd}`, display: 'block' }} />
                    <button onClick={() => setProductImgs(p => p.filter((_, j) => j !== i))}
                      style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: '#fff', border: '2px solid #fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, padding: 0 }}>×</button>
                  </div>
                ))}
              </div>
            </SubQ>

            <SubQ label="AI Image Generation">
              <label style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:12.5, color:C.tx, cursor:'pointer', userSelect:'none' }}>
                <input
                  type="checkbox"
                  checked={autoGenerateImages}
                  onChange={e => setAutoGenerateImages(e.target.checked)}
                  style={{ width:16, height:16, accentColor:'#1D6B45' }}
                />
                Generate supporting section images automatically
              </label>
              <p style={{ margin:'6px 0 0', fontSize:11, color:C.fa, lineHeight:1.6 }}>
                Prompts stay internal. Uploaded product photos remain the source of product truth.
              </p>
            </SubQ>
          </StepCard>

          {/* ── STEP 2: Platform and section mode ── */}
          <StepCard stepNum={2} label="Platform & Goal" done={step2Done}>
            <SubQ label="Platform">
              <OptionBtns options={PLATFORMS} value={platform} onChange={setPlatform} />
            </SubQ>
            <SubQ label="Goal">
              <OptionBtns options={GENERATION_GOALS} value={generationGoal} onChange={setGenerationGoal} />
            </SubQ>
            <SubQ label="Output Style">
              <OptionBtns options={OUTPUT_STYLES} value={outputStyle} onChange={setOutputStyle} />
            </SubQ>
          </StepCard>

          {/* ── STEP 3: Section and template ── */}
          <div style={{ marginBottom: 10 }}>
            <button onClick={() => setAdvancedOpen(o => !o)}
              style={{ width:'100%', padding:'12px 16px', borderRadius:12, border:`1.5px solid ${C.bd}`, background:C.sur, color:C.tx, fontSize:13, fontWeight:800, textAlign:'left', cursor:'pointer' }}>
              Advanced Settings {advancedOpen ? '▲' : '▼'}
            </button>
          </div>
          {advancedOpen && (
          <StepCard stepNum={0} label="Advanced Settings" done={true}>
            <SubQ label="Section">
              <OptionBtns options={availableSectionTypes} value={sectionType} onChange={setSectionType} />
            </SubQ>
            <SubQ label="Template">
              <TemplateCards templates={availableTemplates} value={templateVariant} onChange={setTemplateVariant} />
            </SubQ>
            <SubQ label="Canvas Size Preset">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:8 }}>
                {SIZE_PRESET_KEYS.map(k => {
                  const p = SIZE_PRESETS[k]
                  const on = sizePreset === k
                  return (
                    <button key={k} onClick={() => setSizePreset(k)}
                      style={{ padding:'10px 12px', textAlign:'left', borderRadius:10, border:`2px solid ${on?'#1D6B45':C.bd}`, background:on?'#F0FDF4':C.sur, cursor:'pointer' }}>
                      <div style={{ fontSize:12, fontWeight:800, color:on?'#1D6B45':C.tx }}>{p.label}</div>
                      <div style={{ fontSize:11, color:C.mu, marginTop:3 }}>{p.size}</div>
                    </button>
                  )
                })}
              </div>
            </SubQ>
            {false && <SubQ label="Generate Mode">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:8 }}>
                {[
                  { key:'Fast Draft', title:'Fast Draft', desc:'1 Design Concept · 1 Copy Direction · 1 Image Direction', sub:'빠른 테스트용 / 비용 최소화' },
                  { key:'Multi Concept', title:'Multi Concept', desc:'3 Design Concepts · 3 Copy Directions · 3 Image Directions', sub:'고객 제안용 / Fiverr Presentation용' },
                ].map(mode => {
                  const on = generateMode === mode.key
                  return (
                    <button key={mode.key} onClick={() => setGenerateMode(mode.key)}
                      style={{ padding:'12px 14px', borderRadius:10, border:`2px solid ${on?'#1D6B45':C.bd}`, background:on?'#F0FDF4':C.sur, textAlign:'left', cursor:'pointer' }}>
                      <div style={{ fontSize:13, fontWeight:800, color:on?'#1D6B45':C.tx }}>{mode.title}</div>
                      <div style={{ fontSize:11, color:C.mu, lineHeight:1.5, marginTop:4 }}>{mode.desc}</div>
                      <div style={{ fontSize:10.5, color:C.fa, marginTop:4 }}>{mode.sub}</div>
                    </button>
                  )
                })}
              </div>
              {generateMode === 'Multi Concept' && (
                <div style={{ marginTop:8, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:6 }}>
                  {CONCEPT_DIRECTIONS.map(c => (
                    <div key={c.label} style={{ padding:'8px 10px', border:`1px solid ${C.bd}`, borderRadius:8, background:C.alt }}>
                      <div style={{ fontSize:11, fontWeight:800, color:C.tx }}>{c.label}</div>
                      <div style={{ fontSize:10.5, color:C.mu, marginTop:2 }}>{c.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </SubQ>}
          </StepCard>
          )}

          {/* ── STEP 4: Conversion context ── */}
          <StepCard stepNum={3} label="Customer & Offer" done={step3Done}>
            {triedGenerate && !step4Done && (
              <div style={{ padding:'10px 12px', background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:9, color:'#c2410c', fontSize:12, fontWeight:700, marginBottom:12 }}>
                Please complete all required fields before generating your section.
              </div>
            )}
            <SubQ label={categoryQuestions.targetCustomer}>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                {TARGET_CUSTOMER_OPTIONS.map(opt => (
                  <button key={opt} onClick={() => setTargetCustomer(opt === 'Other' ? '' : opt)}
                    style={{ padding:'5px 9px', borderRadius:999, border:`1px solid ${targetCustomer === opt ? '#1D6B45' : C.bd}`, background:targetCustomer === opt?'#F0FDF4':C.sur, color:targetCustomer === opt?'#1D6B45':C.mu, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                    {opt}
                  </button>
                ))}
              </div>
              <input value={targetCustomer} onChange={e => setTargetCustomer(e.target.value)}
                placeholder="예) busy parents, Amazon shoppers comparing premium options"
                style={{ width: '100%', padding: '10px 13px', border: fieldBorder('targetCustomer'), borderRadius: 10, outline: 'none', fontSize: 13.5, color: C.tx, background: C.alt, fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </SubQ>
            <SubQ label={categoryQuestions.customerPainPoint}>
              <input value={customerPainPoint} onChange={e => setCustomerPainPoint(e.target.value)}
                placeholder="구매자가 해결하고 싶은 불편함"
                style={{ width: '100%', padding: '10px 13px', border: fieldBorder('customerPainPoint'), borderRadius: 10, outline: 'none', fontSize: 13.5, color: C.tx, background: C.alt, fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </SubQ>
            <SubQ label={categoryQuestions.buyingMotivation}>
              <input value={buyingMotivation} onChange={e => setBuyingMotivation(e.target.value)}
                placeholder="왜 지금 구매해야 하는지"
                style={{ width: '100%', padding: '10px 13px', border: fieldBorder('buyingMotivation'), borderRadius: 10, outline: 'none', fontSize: 13.5, color: C.tx, background: C.alt, fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </SubQ>
            <SubQ label={categoryQuestions.productBenefits}>
              <textarea value={productBenefits} onChange={e => setProductBenefits(e.target.value)}
                placeholder="전환에 중요한 benefit을 적어주세요."
                style={{ width: '100%', minHeight: 64, padding: '10px 13px', border: fieldBorder('productBenefits'), borderRadius: 10, outline: 'none', resize: 'vertical', fontSize: 13.5, lineHeight: 1.7, color: C.tx, background: C.alt, fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </SubQ>
            <SubQ label={categoryQuestions.productFeatures}>
              <textarea value={productFeatures} onChange={e => setProductFeatures(e.target.value)}
                placeholder="소재, 기능, 구성품, 사양 등 구체적인 feature"
                style={{ width: '100%', minHeight: 64, padding: '10px 13px', border: `1.5px solid ${C.bd}`, borderRadius: 10, outline: 'none', resize: 'vertical', fontSize: 13.5, lineHeight: 1.7, color: C.tx, background: C.alt, fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </SubQ>
            <SubQ label={categoryQuestions.differentiation}>
              <textarea ref={diffRef} value={quiz.differentiator} onChange={e => updQuiz('differentiator', e.target.value)}
                placeholder="경쟁 제품과 다르게 말할 수 있는 사실 기반 차별점"
                style={{ width: '100%', minHeight: 72, padding: '10px 13px', border: `1.5px solid ${C.bd}`, borderRadius: 10, outline: 'none', resize: 'vertical', fontSize: 13.5, lineHeight: 1.8, color: C.tx, background: C.alt, fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .15s' }}
              />
            </SubQ>
            <SubQ label="Brand Tone">
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                {BRAND_TONE_OPTIONS.map(opt => (
                  <button key={opt} onClick={() => setBrandToneInput(opt === 'Other' ? '' : opt)}
                    style={{ padding:'5px 9px', borderRadius:999, border:`1px solid ${brandToneInput === opt ? '#1D6B45' : C.bd}`, background:brandToneInput === opt?'#F0FDF4':C.sur, color:brandToneInput === opt?'#1D6B45':C.mu, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                    {opt}
                  </button>
                ))}
              </div>
              <input value={brandToneInput} onChange={e => setBrandToneInput(e.target.value)}
                placeholder="예) premium clinical, warm DTC, technical, minimalist"
                style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${C.bd}`, borderRadius: 10, outline: 'none', fontSize: 13.5, color: C.tx, background: C.alt, fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </SubQ>
            <SubQ label="Additional Tone Detail">
              <input value={brandToneDetail} onChange={e => setBrandToneDetail(e.target.value)}
                placeholder="Premium but not too cold. Natural and trustworthy."
                style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${C.bd}`, borderRadius: 10, outline: 'none', fontSize: 13.5, color: C.tx, background: C.alt, fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </SubQ>
            <SubQ label="Reference URL or Competitor Link">
              <input value={referenceUrl} onChange={e => setReferenceUrl(e.target.value)}
                placeholder="Amazon listing, Shopify store, competitor page, or mood reference"
                style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${C.bd}`, borderRadius: 10, outline: 'none', fontSize: 13.5, color: C.tx, background: C.alt, fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </SubQ>
          </StepCard>

          <StepCard stepNum={4} label="Generate" done={step4Done}>
            <SubQ label="Generation Mode">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:8 }}>
                {[
                  { key:'Fast Draft', title:'Fast Draft', desc:'1 full section set', sub:'Text/layout first, 1-2 representative images to control cost' },
                  { key:'Multi Concept', title:'Multi Concept', desc:'3 full section set directions', sub:'Higher cost, better for Fiverr/client presentation' },
                ].map(mode => {
                  const on = generateMode === mode.key
                  return (
                    <button key={mode.key} onClick={() => setGenerateMode(mode.key)}
                      style={{ padding:'12px 14px', borderRadius:10, border:`2px solid ${on?'#1D6B45':C.bd}`, background:on?'#F0FDF4':C.sur, textAlign:'left', cursor:'pointer' }}>
                      <div style={{ fontSize:13, fontWeight:800, color:on?'#1D6B45':C.tx }}>{mode.title}</div>
                      <div style={{ fontSize:11, color:C.mu, lineHeight:1.5, marginTop:4 }}>{mode.desc}</div>
                      <div style={{ fontSize:10.5, color:C.fa, marginTop:4 }}>{mode.sub}</div>
                    </button>
                  )
                })}
              </div>
              {generateMode === 'Multi Concept' && (
                <div style={{ marginTop:8, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:6 }}>
                  {CONCEPT_DIRECTIONS.map(c => (
                    <div key={c.label} style={{ padding:'8px 10px', border:`1px solid ${C.bd}`, borderRadius:8, background:C.alt }}>
                      <div style={{ fontSize:11, fontWeight:800, color:C.tx }}>{c.label}</div>
                      <div style={{ fontSize:10.5, color:C.mu, marginTop:2 }}>{c.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </SubQ>
            <SubQ label="Image Cost Control">
              <label style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:12.5, color:C.tx, cursor:'pointer' }}>
                <input type="checkbox" checked={generateAllSectionImages} onChange={e => setGenerateAllSectionImages(e.target.checked)} style={{ width:16, height:16, accentColor:'#1D6B45' }} />
                Generate images for all sections
              </label>
              <p style={{ margin:'6px 0 0', fontSize:11, color:C.fa, lineHeight:1.6 }}>
                Off by default. ContentOS generates only representative images and uses upload slots/placeholders for the rest.
              </p>
            </SubQ>
          </StepCard>

          {false && <StepCard stepNum={5} label="기획 방식 — 섹션 구성 순서 결정" done={step5Done}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
              {PLANNING_STYLES.map(ps => {
                const sel = quiz.planningStyle === ps.key
                return (
                  <button key={ps.key} onClick={() => updQuiz('planningStyle', sel ? '' : ps.key)}
                    style={{ padding: '12px 14px', borderRadius: 10, border: sel ? '2px solid #1D6B45' : `1.5px solid ${C.bd}`, background: sel ? '#E9F7F0' : C.sur, textAlign: 'left', cursor: 'pointer', transition: 'all .12s' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: sel ? '#1D6B45' : C.tx, marginBottom: 4 }}>{ps.key}</div>
                    <div style={{ fontSize: 10.5, color: sel ? '#2D8A5E' : C.fa, lineHeight: 1.55 }}>{ps.desc}</div>
                  </button>
                )
              })}
            </div>
          </StepCard>}

          {false && <StepCard stepNum={6} label="브랜드 톤" done={step6Done}>
            <p style={{ fontSize: 11, color: C.fa, margin: '0 0 8px' }}>최대 2개 선택 ({quiz.brandTone.length}/2)</p>
            <OptionBtns multi maxSelect={2} options={BRAND_TONES} value={quiz.brandTone} onChange={v => updQuiz('brandTone', v)} />
          </StepCard>}

          {false && <StepCard stepNum={7} label="강조 포인트" done={step7Done}>
            <p style={{ fontSize: 11, color: C.fa, margin: '0 0 8px' }}>최대 2개 선택 ({quiz.emphasis.length}/2)</p>
            <OptionBtns multi maxSelect={2} options={EMPHASIS_POINTS} value={quiz.emphasis} onChange={v => updQuiz('emphasis', v)} />
          </StepCard>}

          {/* ── Generate section ── */}
          <div style={{ background: '#EFF6FF', borderRadius: 16, border: `1.5px solid ${allDone ? '#BFDBFE' : '#FECACA'}`, overflow: 'hidden', marginBottom: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '10px 16px', background: '#DBEAFE', borderBottom: '1px solid #BFDBFE' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF' }}>Generate Full Section Set</span>
            </div>
            <div style={{ display: 'none', gridTemplateColumns: `repeat(${TASKS.length},1fr)`, gap: 8, padding: '10px 14px', borderBottom: `1px solid ${C.bd}` }}>
              {TASKS.map(t => {
                const on = task.id === t.id
                const hasResult = !!(tabResults[t.id])
                return (
                  <button key={t.id} onClick={() => sw(t)}
                    style={{ padding: '11px 8px', borderRadius: 10, border: on ? `2px solid ${t.col}` : `1.5px solid ${C.bd}`, background: on ? t.li : C.sur, cursor: 'pointer', textAlign: 'center', position: 'relative' }}>
                    {hasResult && !on && <span style={{ position: 'absolute', top: 5, right: 7, width: 6, height: 6, borderRadius: '50%', background: t.col, opacity: 0.7 }} />}
                    <div style={{ fontSize: 18, marginBottom: 3, color: on ? t.col : C.fa }}>{t.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: on ? t.col : C.tx, letterSpacing: '-0.02em' }}>{t.label}</div>
                    <div style={{ fontSize: 10, color: on ? t.col + '99' : C.fa, marginTop: 1 }}>{t.sub}</div>
                  </button>
                )
              })}
            </div>

            {false && task.id === 'blog' && (
              <div style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${C.bd}`, background: '#F8F8FF' }}>
                <BlogKeywords onKeywordsChange={setKeywordContext} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: C.mu, fontWeight: 600 }}>블로그 말투</span>
                  {BLOG_TONES.map(t => (
                    <button key={t} onClick={() => setTone(t)}
                      style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: tone === t ? `1.5px solid ${TASKS[1].col}` : `1.5px solid ${C.bd}`, background: tone === t ? TASKS[1].li : C.sur, color: tone === t ? TASKS[1].col : C.mu, cursor: 'pointer' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 상태 + 생성 버튼 */}
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {allDone
                  ? <p style={{ fontSize: 11, color: '#1D6B45', fontWeight: 700, margin: 0 }}>✓ Ready — AI will generate a full {platform} section set</p>
                  : <p style={{ fontSize: 11, color: '#EF4444', margin: 0 }}>미완료: {incompletedSteps.join(', ')}</p>
                }
              </div>
              <button onClick={run} disabled={loading}
                style={{ padding: '10px 24px', borderRadius: 9, border: 'none', background: loading ? '#ECEAE5' : C.tx, color: loading ? C.fa : '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0, transition: 'background .12s' }}>
                {loading ? <><Spin />Generating…</> : '✦ Generate Full Section Set'}
              </button>
            </div>
          </div>

          {/* 에러 */}
          {error && <div style={{ padding: '12px 15px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, fontSize: 13, color: '#b91c1c', marginBottom: 14 }}>{error}</div>}
          {triedGenerate && missingFields.length > 0 && (
            <div style={{ padding: '12px 15px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 9, fontSize: 13, color: '#c2410c', marginBottom: 14 }}>
              Please complete all required fields before generating your section.
            </div>
          )}

          {/* 로딩 */}
          {loading && (
            <div style={{ background: C.sur, borderRadius: 14, border: `1.5px solid ${C.bd}`, padding: '28px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 22, color: C.mu, fontSize: 13 }}>
                <Spin />{imageGenStatus || 'Generating commerce section…'}
              </div>
              {[95, 75, 85, 60, 90, 50].map((w, i) => <div key={i} style={{ height: 10, background: C.alt, borderRadius: 5, width: `${w}%`, marginBottom: 9, animation: `pl 1.5s ease ${i * .12}s infinite` }} />)}
            </div>
          )}

          {/* 결과 */}
          {result && !loading && (
            task.id === 'detail' ? (
              <div ref={resRef}>
                <DetailView key={detailGenKey} result={result} savedSects={detailData} onSectsChange={saveDetailData} productInput={sharedInput} quiz={quiz} />
              </div>
            ) : (
              <div ref={resRef} style={{ background: C.sur, borderRadius: 16, border: `1.5px solid ${C.bd}`, boxShadow: '0 4px 28px rgba(0,0,0,0.06)', overflow: 'hidden', animation: 'fi .25s ease' }}>
                <div style={{ padding: '12px 20px 10px', borderBottom: `1px solid ${C.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: task.col, background: task.li, padding: '2px 9px', borderRadius: 20 }}>{task.label}</span>
                    <span style={{ fontSize: 11, color: '#15803d', background: '#f0fdf4', padding: '2px 8px', borderRadius: 20 }}>✓ 완성</span>
                  </div>
                  <CopyBtn text={result} />
                </div>
                <div style={{ padding: '16px 20px' }}>
                  {task.id === 'card'
                    ? <CardNewsView key={cardGenKey} result={result} savedCards={cardData} onCardsChange={saveCardData} />
                    : <>
                        {topBlocks.map((b, i) => <Blk key={i} title={b.title} lines={b.lines} />)}
                        {task.id === 'blog' && <BlogThumbnail key={result.slice(0, 40)} blogTitle={blogTitle} />}
                      </>
                  }
                </div>
              </div>
            )
          )}

        </main>
      </div>
    </>
  )
}
