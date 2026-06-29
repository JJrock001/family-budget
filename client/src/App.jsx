import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from 'recharts';
import {
  LayoutDashboard, List as ListIcon, Plus, Settings as SettingsIcon, Wallet, TrendingUp, TrendingDown,
  Camera, Trash2, Pencil, X, ChevronLeft, ChevronRight, Download, Upload, Check, Image as ImageIcon,
  Utensils, Home, Zap, Wifi, Fuel, Car, GraduationCap, Activity, ShoppingBag, Music, CreditCard, Gift,
  MoreHorizontal, Briefcase, AlertCircle, Loader2, Sparkles, RotateCcw, Crown, ShieldCheck, Lock,
} from 'lucide-react';

/* ---------------- theme ---------------- */
const T = {
  bg: '#F5F4F0', surface: '#FFFFFF', ink: '#1C1B19', sub: '#6B6862',
  brand: '#0F5C54', brand2: '#16746A', gold: '#C99A2E', goldSoft: '#E7C66B',
  income: '#15803D', expense: '#C2410C', line: '#E8E6E0', faint: '#FAF9F6',
};
const CAT_COLORS = ['#0F5C54','#C2410C','#C99A2E','#3F6F8F','#7C6A9C','#5B8C5A','#B5654A','#4E8D8A','#A87C4F','#8A6FA3','#D08C3E','#6B8E9E','#9AA0A6'];

const TH_FULL = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const TH_SHORT = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

const EXP_ICON = {
  'อาหาร & เครื่องดื่ม': Utensils, 'ของใช้ในบ้าน': Home, 'สาธารณูปโภค (น้ำ/ไฟ/แก๊ส)': Zap,
  'อินเทอร์เน็ต/มือถือ': Wifi, 'เดินทาง/น้ำมัน': Fuel, 'รถยนต์ (ผ่อน/ซ่อม/ประกัน)': Car,
  'การศึกษา': GraduationCap, 'สุขภาพ/รักษาพยาบาล': Activity, 'ช้อปปิ้ง/เสื้อผ้า': ShoppingBag,
  'สังสรรค์/บันเทิง/ท่องเที่ยว': Music, 'ผ่อน/หนี้/ประกัน': CreditCard, 'บริจาค/ทำบุญ': Gift, 'อื่น ๆ': MoreHorizontal,
};
const INC_ICON = {
  'เงินเดือน': Wallet, 'โบนัส': Gift, 'รายได้ธุรกิจ/SMI': Briefcase, 'ดอกเบี้ย/เงินปันผล': TrendingUp,
  'ค่าเช่า': Home, 'รายได้อื่น ๆ': Plus,
};

const DEFAULTS = {
  members: ['Oh','JJ','Jenny','Kea','ส่วนกลาง'],
  expCats: ['อาหาร & เครื่องดื่ม','ของใช้ในบ้าน','สาธารณูปโภค (น้ำ/ไฟ/แก๊ส)','อินเทอร์เน็ต/มือถือ','เดินทาง/น้ำมัน','รถยนต์ (ผ่อน/ซ่อม/ประกัน)','การศึกษา','สุขภาพ/รักษาพยาบาล','ช้อปปิ้ง/เสื้อผ้า','สังสรรค์/บันเทิง/ท่องเที่ยว','ผ่อน/หนี้/ประกัน','บริจาค/ทำบุญ','อื่น ๆ'],
  incCats: ['เงินเดือน','โบนัส','รายได้ธุรกิจ/SMI','ดอกเบี้ย/เงินปันผล','ค่าเช่า','รายได้อื่น ๆ'],
  pays: ['เงินสด','โอน/PromptPay','บัตรเครดิต','บัตรเดบิต','e-Wallet'],
  admin: 'Kea',
  budgets: {},
  recurring: [
    { id:'rec_o',  type:'income', who:'Oh',    category:'เงินเดือน', merchant:'เงินเดือน', amount:78390,    pay:'', note:'', dayOfMonth:1 },
    { id:'rec_k',  type:'income', who:'Kea',   category:'เงินเดือน', merchant:'เงินเดือน', amount:69708.33, pay:'', note:'', dayOfMonth:1 },
    { id:'rec_jj', type:'income', who:'JJ',    category:'เงินเดือน', merchant:'เงินเดือน', amount:14550,    pay:'', note:'', dayOfMonth:1 },
    { id:'rec_jn', type:'income', who:'Jenny', category:'เงินเดือน', merchant:'เงินเดือน', amount:14550,    pay:'', note:'', dayOfMonth:1 },
  ],
  tx: [],
};

/* ---------------- helpers ---------------- */
const baht = (n) => '฿' + new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(Math.round(n || 0));
const baht2 = (n) => '฿' + new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso) => { const d = new Date(iso + 'T00:00:00'); return `${d.getDate()} ${TH_SHORT[d.getMonth()]} ${d.getFullYear()}`; };
const catColor = (cats, name) => { const i = cats.indexOf(name); return i >= 0 ? CAT_COLORS[i % CAT_COLORS.length] : '#9AA0A6'; };

function compressImage(file, maxW = 1000, q = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', q));
      };
      img.onerror = reject; img.src = e.target.result;
    };
    reader.onerror = reject; reader.readAsDataURL(file);
  });
}

/* ---------------- API storage (replaces window.storage) ---------------- */
const MEK = 'smibudget_me_v2';

async function fetchData() {
  try {
    const r = await fetch('/api/family-data');
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

async function saveData(data) {
  try {
    const r = await fetch('/api/family-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return r.ok;
  } catch (e) { console.error(e); return false; }
}

async function getPhoto(id) {
  try {
    const r = await fetch(`/api/photos/${id}`);
    if (!r.ok) return null;
    const d = await r.json();
    return d?.data ?? null;
  } catch { return null; }
}

async function savePhoto(id, data) {
  try {
    await fetch(`/api/photos/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
  } catch (e) { console.error(e); }
}

async function deletePhoto(id) {
  try { await fetch(`/api/photos/${id}`, { method: 'DELETE' }); } catch {}
}

async function deleteAllPhotos() {
  try { await fetch('/api/photos', { method: 'DELETE' }); } catch {}
}

async function meGet() { return localStorage.getItem(MEK); }
async function meSet(v) { localStorage.setItem(MEK, v); }

/* ---------------- CSV statement import helpers ---------------- */
function splitCSVLine(line) {
  const result = []; let cur = '', inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === ',' && !inQ) { result.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  result.push(cur.trim()); return result;
}

function thaiDateToISO(str) {
  str = (str || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    let [, d, mo, y] = m;
    if (parseInt(y) > 2400) y = String(parseInt(y) - 543);
    return `${y}-${mo.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  return null;
}

function parseNum(str) {
  if (!str) return 0;
  return parseFloat(String(str).replace(/,/g,'').replace(/[^0-9.-]/g,'')) || 0;
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

function guessCategory(desc, expCats) {
  const d = desc.toLowerCase();
  if (/อาหาร|food|restaurant|coffee|cafe|7-11|eleven|lotus|tops|villa|makro|big c|gourmet|ร้านอาหาร|foodpanda|grab food|lineman/.test(d)) return 'อาหาร & เครื่องดื่ม';
  if (/น้ำมัน|ptt|shell|caltex|esso|bangchak|บางจาก|pt gas/.test(d)) return 'เดินทาง/น้ำมัน';
  if (/grab|uber|bolt|taxi|bts|mrt|airport|สนามบิน/.test(d)) return 'เดินทาง/น้ำมัน';
  if (/ไฟฟ้า|ประปา|electric|pea |mea |pwa |water bill|แก๊ส/.test(d)) return 'สาธารณูปโภค (น้ำ/ไฟ/แก๊ส)';
  if (/dtac|ais|true move|nt |internet|wifi|โทรศัพท์/.test(d)) return 'อินเทอร์เน็ต/มือถือ';
  if (/โรงพยาบาล|hospital|clinic|คลินิก|pharmacy|dental|dentist/.test(d)) return 'สุขภาพ/รักษาพยาบาล';
  if (/school|โรงเรียน|มหาวิทยาลัย|university|tutor/.test(d)) return 'การศึกษา';
  if (/insurance|ประกัน/.test(d)) return 'ผ่อน/หนี้/ประกัน';
  if (/toyota|honda|isuzu|mazda|bmw|mercedes|car service|ซ่อมรถ/.test(d)) return 'รถยนต์ (ผ่อน/ซ่อม/ประกัน)';
  return expCats.includes('อื่น ๆ') ? 'อื่น ๆ' : (expCats[expCats.length - 1] || '');
}

function parseStatementCSV(text, expCats) {
  text = text.replace(/^﻿/, '');
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const DATE_KW = ['วันที่', 'date', 'txn date', 'transaction date', 'posting date', 'value date'];
  let headerIdx = -1;
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const cols = splitCSVLine(lines[i]).map(c => c.toLowerCase());
    if (DATE_KW.some(k => cols.some(c => c.includes(k)))) { headerIdx = i; break; }
  }
  if (headerIdx === -1) throw new Error('ไม่พบหัวตาราง กรุณาใช้ไฟล์ Statement CSV จากธนาคาร');

  const headers = splitCSVLine(lines[headerIdx]).map(c => c.toLowerCase().trim());
  const fc = (...kws) => headers.findIndex(h => kws.some(k => h.includes(k)));

  const dateCol   = fc('วันที่', 'date', 'txn date', 'posting', 'value date');
  const descCol   = fc('รายละเอียด', 'รายการ', 'description', 'transaction', 'channel', 'detail', 'remark', 'memo', 'particulars', 'narration');
  const debitCol  = fc('ถอน', 'debit', 'withdrawal', 'เดบิต', 'จ่าย', 'credit(thb)' /* Bangkok Bank uses reversed naming */);
  const creditCol = fc('ฝาก', 'credit', 'deposit', 'เครดิต', 'รับ');
  const amtCol    = (debitCol === -1 && creditCol === -1) ? fc('จำนวนเงิน', 'amount', 'เงิน') : -1;

  if (dateCol === -1) throw new Error('ไม่พบคอลัมน์วันที่ในไฟล์นี้');

  const results = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    if (cols.length < 2) continue;

    const isoDate = thaiDateToISO(cols[dateCol] || '');
    if (!isoDate) continue;

    let amount = 0;
    if (amtCol !== -1) {
      amount = parseNum(cols[amtCol]);
    } else {
      const cr = parseNum(cols[creditCol] ?? '');
      const dr = parseNum(cols[debitCol] ?? '');
      if (cr > 0) amount = cr;
      else if (dr > 0) amount = -dr;
    }
    if (amount === 0) continue;

    const description = ((descCol !== -1 ? cols[descCol] : '') || '').trim();
    const category = guessCategory(description, expCats);
    const id = 'imp_' + hashStr(`${isoDate}_${amount}_${description.slice(0,30)}`);

    results.push({ id, date: isoDate, description, amount, category });
  }

  return results;
}

function parseStatementText(text, expCats) {
  text = text.replace(/^﻿/, '');
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const rows = [];
  let prevBalance = null;

  for (const line of lines) {
    const dateMatch = line.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (!dateMatch) continue;

    const isoDate = thaiDateToISO(dateMatch[0]);
    if (!isoDate) continue;

    const afterDate = line.slice(dateMatch.index + dateMatch[0].length);
    const numMatches = [...afterDate.matchAll(/[\d,]+\.\d{2}/g)];
    if (numMatches.length === 0) continue;

    const nums = numMatches.map(m => parseFloat(m[0].replace(/,/g, '')));
    const balance = nums[nums.length - 1];

    let amount = 0;
    let isIncome = false;

    if (prevBalance !== null) {
      const diff = balance - prevBalance;
      amount = Math.abs(diff);
      isIncome = diff > 0;
    } else if (nums.length >= 2) {
      amount = nums[nums.length - 2];
      const ll = line.toLowerCase();
      isIncome = /รับ|ฝาก|deposit|credit/.test(ll);
    }

    prevBalance = balance;
    if (amount < 0.01) continue;

    const firstNumIdx = numMatches[0].index;
    const description = afterDate.slice(0, firstNumIdx).replace(/\d{2}:\d{2}(:\d{2})?/, '').trim();

    const category = guessCategory(description, expCats);
    const id = 'imp_' + hashStr(`${isoDate}_${Math.round(amount * 100)}_${description.slice(0, 20)}`);

    rows.push({ id, date: isoDate, description, amount: isIncome ? amount : -amount, category });
  }

  return rows;
}

/* ---------------- recurring auto-fill ---------------- */
function applyRecurring(data) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const mm = String(m + 1).padStart(2, '0');
  const recurring = data.recurring || [];
  if (recurring.length === 0) return data;

  let changed = false;
  const tx = [...data.tx];

  for (const rec of recurring) {
    const already = tx.some(t =>
      t.recurringId === rec.id &&
      new Date(t.date + 'T00:00:00').getFullYear() === y &&
      new Date(t.date + 'T00:00:00').getMonth() === m
    );
    if (!already) {
      const day = String(Math.min(rec.dayOfMonth || 1, 28)).padStart(2, '0');
      tx.unshift({
        id: `${rec.id}_${y}_${m}`,
        recurringId: rec.id,
        type: rec.type,
        date: `${y}-${mm}-${day}`,
        who: rec.who,
        category: rec.category,
        merchant: rec.merchant,
        amount: rec.amount,
        pay: rec.pay || '',
        note: rec.note || '',
        hasPhoto: false,
      });
      changed = true;
    }
  }

  return changed ? { ...data, tx } : data;
}

/* ---------------- small UI atoms ---------------- */
function Chip({ active, onClick, children, color }) {
  return (
    <button onClick={onClick} className="px-3 py-2 rounded-full text-sm font-medium transition-colors"
      style={{
        background: active ? (color || T.brand) : '#FFFFFF',
        color: active ? '#FFFFFF' : T.ink,
        border: `1.5px solid ${active ? (color || T.brand) : T.line}`,
      }}>
      {children}
    </button>
  );
}
function Section({ title, children, right }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-base font-semibold" style={{ color: T.ink, fontFamily: 'Kanit, sans-serif' }}>{title}</h3>
        {right}
      </div>
      <div className="rounded-2xl p-4" style={{ background: T.surface, border: `1px solid ${T.line}` }}>{children}</div>
    </div>
  );
}
function ScopeToggle({ scope, setScope, me }) {
  return (
    <div className="flex p-1 rounded-full" style={{ background: T.faint, border: `1px solid ${T.line}` }}>
      {[['me', `ของ ${me}`], ['all', 'ทั้งครอบครัว']].map(([v, l]) => (
        <button key={v} onClick={() => setScope(v)} className="flex-1 py-2 rounded-full text-sm font-semibold transition-colors"
          style={{ background: scope === v ? T.brand : 'transparent', color: scope === v ? '#fff' : T.sub }}>
          {l}
        </button>
      ))}
    </div>
  );
}

/* ---------------- main ---------------- */
export default function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(DEFAULTS);
  const [view, setView] = useState('dashboard');
  const now = new Date();
  const [period, setPeriod] = useState({ y: now.getFullYear(), m: now.getMonth() }); // m: 0-11
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [me, setMe] = useState(null);
  const [scope, setScope] = useState('me');

  useEffect(() => {
    (async () => {
      const raw = await fetchData();
      if (raw) {
        try {
          const applied = applyRecurring(raw);
          setData(applied);
          if (applied !== raw) saveData(applied);
        } catch { setData(DEFAULTS); }
      } else {
        const applied = applyRecurring(DEFAULTS);
        await saveData(applied);
        setData(applied);
      }
      const savedMe = await meGet();
      if (savedMe) setMe(savedMe);
      setLoading(false);
    })();
  }, []);

  const update = (nd) => {
    setData(nd);
    saveData(nd).then(ok => {
      if (!ok) {
        setToast('⚠️ บันทึกไม่สำเร็จ — ตรวจสอบว่า server ทำงานอยู่');
        setTimeout(() => setToast(null), 3500);
      }
    });
  };
  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 1800); };
  const pickMe = (name) => { setMe(name); meSet(name); };

  const admin = data.admin || 'Kea';
  const isAdmin = me === admin;
  const canEditTx = (t) => isAdmin || me === t.who;
  const inScope = (t) => scope === 'all' || t.who === me;

  const inPeriod = (t) => { const d = new Date(t.date + 'T00:00:00'); return d.getFullYear() === period.y && d.getMonth() === period.m; };
  const periodTx = useMemo(() => data.tx.filter(t => inPeriod(t) && inScope(t)), [data.tx, period, scope, me]);
  const income = useMemo(() => periodTx.filter(t => t.type === 'income').reduce((s, t) => s + (+t.amount || 0), 0), [periodTx]);
  const expense = useMemo(() => periodTx.filter(t => t.type === 'expense').reduce((s, t) => s + (+t.amount || 0), 0), [periodTx]);
  const balance = income - expense;
  const savingRate = income > 0 ? balance / income : null;

  const byCat = useMemo(() => {
    const m = {};
    periodTx.filter(t => t.type === 'expense').forEach(t => { m[t.category] = (m[t.category] || 0) + (+t.amount || 0); });
    return Object.entries(m).map(([name, value]) => ({ name, value, color: catColor(data.expCats, name) })).sort((a, b) => b.value - a.value);
  }, [periodTx, data.expCats]);

  const byPerson = useMemo(() => {
    const m = {};
    periodTx.filter(t => t.type === 'expense').forEach(t => { m[t.who] = (m[t.who] || 0) + (+t.amount || 0); });
    return data.members.map(who => ({ who, value: m[who] || 0 })).filter(x => x.value > 0).sort((a, b) => b.value - a.value);
  }, [periodTx, data.members]);

  const monthly = useMemo(() => {
    const arr = TH_SHORT.map((lbl) => ({ lbl, รายรับ: 0, รายจ่าย: 0 }));
    data.tx.forEach(t => { const d = new Date(t.date + 'T00:00:00'); if (d.getFullYear() === period.y && (scope === 'all' || t.who === me)) { const mi = d.getMonth(); if (t.type === 'income') arr[mi]['รายรับ'] += (+t.amount || 0); else arr[mi]['รายจ่าย'] += (+t.amount || 0); } });
    return arr;
  }, [data.tx, period.y, scope, me]);

  const shiftMonth = (dir) => {
    let m = period.m + dir, y = period.y;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setPeriod({ y, m });
  };

  const saveTx = async (tx, photoData) => {
    let nd;
    if (data.tx.some(t => t.id === tx.id)) nd = { ...data, tx: data.tx.map(t => t.id === tx.id ? tx : t) };
    else nd = { ...data, tx: [tx, ...data.tx] };
    update(nd);
    if (photoData) await savePhoto(tx.id, photoData);
    flash('บันทึกแล้ว');
  };
  const removeTx = async (tx) => {
    update({ ...data, tx: data.tx.filter(t => t.id !== tx.id) });
    if (tx.hasPhoto) await deletePhoto(tx.id);
    setDetail(null);
    flash('ลบแล้ว');
  };

  const [showImport, setShowImport] = useState(false);
  const importTx = (txList) => {
    const existingIds = new Set(data.tx.map(t => t.id));
    const newTx = txList.filter(t => !existingIds.has(t.id));
    if (newTx.length === 0) { flash('ไม่มีรายการใหม่ (นำเข้าแล้วทั้งหมด)'); return 0; }
    update({ ...data, tx: [...newTx, ...data.tx] });
    flash(`นำเข้า ${newTx.length} รายการแล้ว`);
    return newTx.length;
  };

  if (loading) return (
    <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'IBM Plex Sans Thai, sans-serif', color: T.sub }}>
      กำลังโหลดข้อมูล…
    </div>
  );

  if (!me || !data.members.includes(me)) return <IdentityPicker members={data.members} admin={admin} onPick={pickMe} />;

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: 'IBM Plex Sans Thai, sans-serif', color: T.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600&display=swap');
        * { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 0; height: 0; }
        @keyframes fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .screen { animation: fade .28s ease both; }
        @media (prefers-reduced-motion: reduce) { .screen { animation: none; } }
        input, select, textarea { font-family: inherit; }
      `}</style>

      <div className="mx-auto" style={{ maxWidth: 440, paddingBottom: 92 }}>
        {view === 'dashboard' && <Dashboard {...{ period, shiftMonth, income, expense, balance, savingRate, byCat, byPerson, monthly, periodTx, data, setView, setDetail, me, onSwitchUser: () => setMe(null), scope, setScope }} />}
        {view === 'add' && <AddScreen {...{ data, saveTx, setView, editing, me, clearEdit: () => setEditing(null), defaultDate: period.y === now.getFullYear() ? today() : `${period.y}-${String(period.m + 1).padStart(2, '0')}-01` }} />}
        {view === 'list' && <ListScreen {...{ data, period, shiftMonth, setDetail, me, scope, setScope }} />}
        {view === 'settings' && <SettingsScreen {...{ data, update, flash, me, admin, isAdmin, onSwitchUser: () => setMe(null), onImport: () => setShowImport(true) }} />}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-20" style={{ background: 'rgba(255,255,255,0.96)', borderTop: `1px solid ${T.line}`, backdropFilter: 'blur(8px)' }}>
        <div className="mx-auto flex items-center justify-around" style={{ maxWidth: 440, padding: '8px 8px calc(8px + env(safe-area-inset-bottom))' }}>
          <NavBtn icon={LayoutDashboard} label="ภาพรวม" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavBtn icon={ListIcon} label="รายการ" active={view === 'list'} onClick={() => setView('list')} />
          <button onClick={() => { setEditing(null); setView('add'); }} aria-label="เพิ่มรายการ" className="flex flex-col items-center gap-0.5 px-2 py-1" style={{ minWidth: 56 }}>
            <span className="flex items-center justify-center rounded-full active:scale-95 transition-transform" style={{ width: 38, height: 38, background: T.brand, color: '#fff' }}><Plus size={22} strokeWidth={2.4} /></span>
            <span className="font-medium" style={{ fontSize: 11, color: view === 'add' ? T.brand : '#9A958C' }}>เพิ่ม</span>
          </button>
          <NavBtn icon={SettingsIcon} label="ตั้งค่า" active={view === 'settings'} onClick={() => setView('settings')} />
        </div>
      </nav>

      {showImport && <StatementImportSheet data={data} importTx={importTx} me={me} onClose={() => setShowImport(false)} />}

      {detail && detail._catFilter && <CategorySheet name={detail._catFilter} data={data} onClose={() => setDetail(null)} />}
      {detail && !detail._catFilter && (
        <TxDetailSheet t={detail} data={data} onClose={() => setDetail(null)} removeTx={removeTx} canEdit={canEditTx(detail)}
          onEdit={() => { setEditing(detail); setDetail(null); setView('add'); }} />
      )}

      {toast && (
        <div className="fixed left-0 right-0 flex justify-center z-50" style={{ bottom: 104 }}>
          <div className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2" style={{ background: toast.startsWith('⚠️') ? T.expense : T.ink, color: '#fff', maxWidth: 340, textAlign: 'center' }}>
            {toast.startsWith('⚠️') ? <AlertCircle size={16} /> : <Check size={16} />} {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 px-2 py-1" style={{ color: active ? T.brand : '#9A958C', minWidth: 56 }}>
      <Icon size={22} strokeWidth={active ? 2.4 : 1.9} />
      <span className="font-medium" style={{ fontSize: 11 }}>{label}</span>
    </button>
  );
}

/* ---------------- Identity picker ---------------- */
function IdentityPicker({ members, admin, onPick }) {
  const AV = ['#0F5C54', '#C99A2E', '#C2410C', '#3F6F8F', '#5B8C5A', '#7C6A9C', '#B5654A', '#4E8D8A'];
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'IBM Plex Sans Thai, sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(165deg, #11635A 0%, #0C4742 52%, #0A3531 100%)' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600&display=swap');
        @keyframes pop { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } } .pop { animation: pop .45s ease both; }
        @media (prefers-reduced-motion: reduce) { .pop { animation: none; } }`}</style>
      <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: 'rgba(231,198,107,0.14)', top: -130, right: -90 }} />
      <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', background: 'rgba(231,198,107,0.07)', bottom: -110, left: -70 }} />

      <div className="mx-auto w-full px-6 pop" style={{ maxWidth: 410, position: 'relative' }}>
        <div className="text-center mb-7">
          <div className="mx-auto mb-4 flex items-center justify-center rounded-2xl" style={{ width: 66, height: 66, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(231,198,107,0.5)' }}>
            <Wallet size={32} color={T.goldSoft} />
          </div>
          <h1 className="font-bold" style={{ fontFamily: 'Kanit, sans-serif', fontSize: 28, color: '#fff', letterSpacing: 0.3 }}>บัญชีครอบครัว</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>เลือกผู้ใช้เพื่อเข้าสู่บัญชี</p>
        </div>

        <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 22px 55px rgba(0,0,0,0.38)' }}>
          <p className="px-5 pt-4 pb-1 font-semibold" style={{ color: T.sub, fontSize: 11, letterSpacing: 0.6 }}>ใครกำลังใช้งาน?</p>
          {members.map((m, i) => {
            const col = AV[i % AV.length]; const isAdm = m === admin;
            return (
              <button key={m} onClick={() => onPick(m)} className="w-full flex items-center gap-3 px-5 py-3.5 active:bg-gray-100 transition-colors" style={{ borderTop: i === 0 ? 'none' : `1px solid ${T.line}` }}>
                <span className="flex items-center justify-center rounded-full font-semibold" style={{ width: 50, height: 50, background: col, color: '#fff', fontFamily: 'Kanit, sans-serif', fontSize: 21, flexShrink: 0, boxShadow: isAdm ? `0 0 0 3px #fff, 0 0 0 5px ${T.gold}` : 'none' }}>
                  {m.slice(0, 1)}
                </span>
                <div className="flex-1 text-left">
                  <p className="font-semibold" style={{ fontSize: 16, color: T.ink }}>{m}</p>
                  <p className="text-xs flex items-center gap-1" style={{ color: isAdm ? '#9A6A00' : T.sub }}>
                    {isAdm ? <><Crown size={12} /> แอดมิน · แก้หลังบ้านได้</> : 'ผู้ใช้'}
                  </p>
                </div>
                <ChevronRight size={20} color="#C9C6BF" />
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.55)' }}>เปลี่ยนผู้ใช้ได้ภายหลังที่หน้าตั้งค่า</p>
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard({ period, shiftMonth, income, expense, balance, savingRate, byCat, byPerson, monthly, data, setView, setDetail, me, onSwitchUser, scope, setScope }) {
  const isAdmin = me === (data.admin || 'Kea');
  return (
    <div className="screen px-4 pt-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs" style={{ color: T.sub }}>สวัสดี</p>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Kanit, sans-serif', color: T.ink }}>{me}</h1>
        </div>
        <button onClick={onSwitchUser} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full active:scale-95 transition-transform" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
          <span className="flex items-center justify-center rounded-full font-semibold" style={{ width: 30, height: 30, background: isAdmin ? T.brand : T.faint, color: isAdmin ? '#fff' : T.ink, fontFamily: 'Kanit, sans-serif', fontSize: 14 }}>{me.slice(0, 1)}</span>
          {isAdmin && <Crown size={13} color={T.gold} />}
          <ChevronRight size={15} color={T.sub} />
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold" style={{ color: T.sub, fontFamily: 'Kanit, sans-serif' }}>ภาพรวมการเงิน</h2>
        <div className="flex items-center gap-1 rounded-full px-1 py-1" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
          <button onClick={() => shiftMonth(-1)} className="p-1.5 rounded-full active:bg-gray-100" aria-label="เดือนก่อน"><ChevronLeft size={18} color={T.sub} /></button>
          <span className="text-sm font-semibold px-1" style={{ minWidth: 96, textAlign: 'center', fontFamily: 'Kanit, sans-serif' }}>{TH_FULL[period.m]} {period.y}</span>
          <button onClick={() => shiftMonth(1)} className="p-1.5 rounded-full active:bg-gray-100" aria-label="เดือนถัดไป"><ChevronRight size={18} color={T.sub} /></button>
        </div>
      </div>

      <div className="mb-4">
        <ScopeToggle scope={scope} setScope={setScope} me={me} />
      </div>

      <div className="rounded-3xl p-5 mb-3 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brand2} 55%, #1C8A7E 100%)`, color: '#fff' }}>
        <div className="absolute" style={{ width: 180, height: 180, borderRadius: '50%', background: 'rgba(231,198,107,0.18)', top: -60, right: -40 }} />
        <p className="text-sm" style={{ opacity: 0.85 }}>เงินคงเหลือเดือนนี้</p>
        <div className="flex items-end justify-between mt-1">
          <p className="font-bold leading-none" style={{ fontFamily: 'Kanit, sans-serif', fontSize: 38 }}>{baht(balance)}</p>
          <div className="px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1" style={{ background: 'rgba(231,198,107,0.22)', color: T.goldSoft }}>
            <TrendingUp size={15} /> ออม {savingRate === null ? '—' : (savingRate * 100).toFixed(1) + '%'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard label="รายรับ" value={income} color={T.income} icon={TrendingUp} />
        <StatCard label="รายจ่าย" value={expense} color={T.expense} icon={TrendingDown} />
      </div>

      <Section title="เงินไปไหน" right={<span className="text-xs" style={{ color: T.sub }}>แตะหมวดเพื่อดูรายการ</span>}>
        {byCat.length === 0 ? (
          <Empty text="ยังไม่มีรายจ่ายในเดือนนี้" />
        ) : (
          <>
            <div className="relative" style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCat} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={62} outerRadius={92} paddingAngle={2} stroke="none"
                    onClick={(d) => setDetail({ _catFilter: (d && (d.name || (d.payload && d.payload.name))) })}>
                    {byCat.map((e, i) => <Cell key={i} fill={e.color} cursor="pointer" />)}
                  </Pie>
                  <Tooltip formatter={(v) => baht(v)} contentStyle={{ borderRadius: 12, border: `1px solid ${T.line}`, fontFamily: 'IBM Plex Sans Thai' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs" style={{ color: T.sub }}>รายจ่ายรวม</span>
                <span className="font-bold" style={{ fontFamily: 'Kanit, sans-serif', fontSize: 22, color: T.ink }}>{baht(expense)}</span>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {byCat.slice(0, 6).map((c, i) => {
                const budget = data.budgets?.[c.name] || 0;
                const over = budget > 0 && c.value > budget;
                return (
                  <button key={i} onClick={() => setDetail({ _catFilter: c.name })} className="w-full py-1 active:opacity-60">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2" style={{ color: T.ink }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color }} /> {c.name}
                      </span>
                      <span className="font-semibold" style={{ fontFamily: 'Kanit, sans-serif', color: over ? T.expense : T.ink }}>
                        {baht(c.value)}
                        {budget > 0 && <span className="text-xs font-normal" style={{ color: over ? T.expense : T.sub }}> / {baht(budget)}</span>}
                        {budget === 0 && <span className="text-xs font-normal" style={{ color: T.sub }}> ({((c.value / expense) * 100).toFixed(0)}%)</span>}
                      </span>
                    </div>
                    {budget > 0 && (
                      <div style={{ height: 4, borderRadius: 3, background: T.faint }}>
                        <div style={{ height: 4, borderRadius: 3, width: `${Math.min(c.value / budget * 100, 100)}%`, background: over ? T.expense : c.color, transition: 'width .4s' }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </Section>

      <Section title={`รายรับ–รายจ่าย รายเดือน · ${period.y}`}>
        <div style={{ height: 210 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ top: 6, right: 0, left: -18, bottom: 0 }} barGap={2}>
              <CartesianGrid vertical={false} stroke={T.line} />
              <XAxis dataKey="lbl" tick={{ fontSize: 10, fill: T.sub }} axisLine={false} tickLine={false} interval={0} />
              <YAxis tick={{ fontSize: 10, fill: T.sub }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? (v / 1000) + 'k' : v} />
              <Tooltip formatter={(v) => baht(v)} contentStyle={{ borderRadius: 12, border: `1px solid ${T.line}`, fontFamily: 'IBM Plex Sans Thai' }} />
              <Bar dataKey="รายรับ" fill={T.income} radius={[3, 3, 0, 0]} />
              <Bar dataKey="รายจ่าย" fill={T.expense} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-1 text-xs" style={{ color: T.sub }}>
          <span className="flex items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: 3, background: T.income }} /> รายรับ</span>
          <span className="flex items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: 3, background: T.expense }} /> รายจ่าย</span>
        </div>
      </Section>

      {scope === 'all' && (
        <Section title="ใครใช้เท่าไหร่">
          {byPerson.length === 0 ? <Empty text="ยังไม่มีข้อมูล" /> : (
            <div className="space-y-3">
              {byPerson.map((p, i) => {
                const max = byPerson[0].value || 1;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: T.ink }}>{p.who}</span>
                      <span className="font-semibold" style={{ fontFamily: 'Kanit, sans-serif' }}>{baht(p.value)}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 6, background: T.faint }}>
                      <div style={{ height: 8, borderRadius: 6, width: `${(p.value / max) * 100}%`, background: T.brand, transition: 'width .4s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ width: 24, height: 24, borderRadius: 8, background: color + '1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color={color} />
        </span>
        <span className="text-xs" style={{ color: T.sub }}>{label}</span>
      </div>
      <p className="font-bold" style={{ fontFamily: 'Kanit, sans-serif', fontSize: 21, color }}>{baht(value)}</p>
    </div>
  );
}
function Empty({ text }) {
  return <div className="py-8 text-center text-sm" style={{ color: T.sub }}>{text}</div>;
}

/* ---------------- Add / Edit ---------------- */
function AddScreen({ data, saveTx, setView, editing, clearEdit, defaultDate, me }) {
  const e = editing;
  const [type, setType] = useState(e ? e.type : 'expense');
  const [amount, setAmount] = useState(e ? String(e.amount) : '');
  const [date, setDate] = useState(e ? e.date : defaultDate);
  const [who, setWho] = useState(e ? e.who : (me && data.members.includes(me) ? me : data.members[0]));
  const [category, setCategory] = useState(e ? e.category : '');
  const [merchant, setMerchant] = useState(e ? e.merchant : '');
  const [pay, setPay] = useState(e ? e.pay : data.pays[1]);
  const [note, setNote] = useState(e ? e.note : '');
  const [photo, setPhoto] = useState(null);
  const [existingPhoto, setExistingPhoto] = useState(null);
  const [err, setErr] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState('');
  const [scanOk, setScanOk] = useState(false);
  const camRef = useRef();
  const scanRef = useRef();

  useEffect(() => { if (e && e.hasPhoto) getPhoto(e.id).then(setExistingPhoto); }, []);

  const cats = type === 'expense' ? data.expCats : data.incCats;
  const iconMap = type === 'expense' ? EXP_ICON : INC_ICON;

  const scanReceipt = async (ev) => {
    const f = ev.target.files && ev.target.files[0];
    ev.target.value = '';
    if (!f) return;
    setScanMsg(''); setErr(''); setScanOk(false);

    let dataUrl;
    try { dataUrl = await compressImage(f, 1600, 0.72); }
    catch { setScanMsg('❌ เปิดไฟล์รูปไม่สำเร็จ (รองรับ JPG / PNG)'); return; }
    setPhoto(dataUrl); setExistingPhoto(null);

    setScanning(true);
    try {
      const b64 = dataUrl.split(',')[1];
      if (!b64) throw new Error('แปลงรูปเป็นข้อมูลไม่สำเร็จ');

      let res;
      try {
        res = await fetch('/api/scan-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: b64, categories: data.expCats }),
        });
      } catch (netErr) {
        throw new Error('เชื่อมต่อ server ไม่ได้ — ' + (netErr.message || ''));
      }
      if (!res.ok) {
        let d = ''; try { d = (await res.text()).slice(0, 160); } catch {}
        throw new Error(`AI ตอบกลับ error ${res.status}. ${d}`);
      }
      const json = await res.json();
      if (json.error || json.type === 'error') throw new Error('AI: ' + ((json.error && json.error.message) || JSON.stringify(json).slice(0, 160)));
      const txt = (json.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
      if (!txt) throw new Error('AI ไม่ได้ส่งข้อความกลับมา');

      let r;
      try {
        let clean = txt.replace(/```json/gi, '').replace(/```/g, '').trim();
        const m = clean.match(/\{[\s\S]*\}/);
        r = JSON.parse(m ? m[0] : clean);
      } catch {
        throw new Error('AI ตอบผิดรูปแบบ: ' + txt.slice(0, 120));
      }

      const filled = [];
      if (r.amount !== undefined && r.amount !== '' && !isNaN(parseFloat(r.amount)) && parseFloat(r.amount) > 0) { setAmount(String(parseFloat(r.amount))); filled.push('จำนวนเงิน'); }
      if (r.merchant) { setMerchant(String(r.merchant)); filled.push('ร้านค้า'); }
      if (r.date && /^\d{4}-\d{2}-\d{2}$/.test(r.date)) { setDate(r.date); filled.push('วันที่'); }
      if (r.category && data.expCats.includes(r.category)) { setCategory(r.category); filled.push('หมวด'); }
      if (r.items) setNote((prev) => prev || String(r.items));

      // Duplicate check against existing transactions
      const scanAmt = parseFloat(r.amount) || 0;
      const scanDate = (r.date && /^\d{4}-\d{2}-\d{2}$/.test(r.date)) ? r.date : '';
      const scanMerch = (r.merchant || '').toLowerCase().trim();
      const dupTx = scanAmt > 0 ? data.tx.find(t => {
        if (Math.abs((+t.amount) - scanAmt) > 0.01) return false;
        if (scanDate && t.date !== scanDate) return false;
        if (!scanMerch) return !!scanDate;
        const tm = (t.merchant || '').toLowerCase().trim();
        return tm && (scanMerch.includes(tm) || tm.includes(scanMerch));
      }) : null;

      if (dupTx) {
        setScanOk(false);
        setScanMsg(`⚠️ อาจซ้ำ — มีรายการ "${dupTx.merchant}" ${baht(dupTx.amount)} วันที่ ${fmtDate(dupTx.date)} อยู่แล้ว ตรวจสอบก่อนกดบันทึก`);
      } else {
        setScanOk(true);
        setScanMsg(filled.length ? `✓ AI อ่านแล้ว (${filled.join(' · ')}) — ตรวจความถูกต้องแล้วกดบันทึก` : '⚠️ อ่านรูปได้แต่ไม่พบข้อมูลชัดเจน ลองถ่ายให้ชัดขึ้น หรือกรอกเอง');
      }
    } catch (er) {
      setScanMsg('❌ ' + (er.message || 'อ่านใบเสร็จไม่สำเร็จ'));
    } finally { setScanning(false); }
  };

  const submit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setErr('กรอกจำนวนเงินให้ถูกต้อง'); return; }
    if (!category) { setErr('เลือกหมวด'); return; }
    const id = e ? e.id : uid();
    const tx = { id, type, date, who, category, merchant: merchant.trim(), amount: amt, pay: type === 'expense' ? pay : '', note: note.trim(), hasPhoto: !!(photo || (e && e.hasPhoto)) };
    await saveTx(tx, photo);
    clearEdit(); setView('dashboard');
  };

  return (
    <div className="screen px-4 pt-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Kanit, sans-serif' }}>{e ? 'แก้ไขรายการ' : 'เพิ่มรายการ'}</h1>
        <button onClick={() => { clearEdit(); setView('dashboard'); }} className="p-2 rounded-full active:bg-gray-100"><X size={22} color={T.sub} /></button>
      </div>

      <div className="flex p-1 rounded-2xl mb-4" style={{ background: T.faint, border: `1px solid ${T.line}` }}>
        {[['expense', 'รายจ่าย', T.expense], ['income', 'รายรับ', T.income]].map(([v, l, c]) => (
          <button key={v} onClick={() => { setType(v); setCategory(''); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: type === v ? '#fff' : 'transparent', color: type === v ? c : T.sub, boxShadow: type === v ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
            {l}
          </button>
        ))}
      </div>

      {type === 'expense' && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brand2} 100%)`, color: '#fff' }}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} color={T.goldSoft} />
            <p className="font-semibold" style={{ fontFamily: 'Kanit, sans-serif' }}>ให้ AI อ่านใบเสร็จให้</p>
          </div>
          <p className="text-xs mb-3" style={{ opacity: 0.85 }}>ถ่ายรูป หรือเลือกไฟล์ใบเสร็จ เดี๋ยวเติมจำนวนเงิน ร้านค้า วันที่ และหมวดให้อัตโนมัติ</p>
          {(photo || existingPhoto) && (
            <div className="relative mb-3">
              <img src={photo || existingPhoto} alt="ใบเสร็จ" className="w-full rounded-xl" style={{ maxHeight: 240, objectFit: 'contain', background: 'rgba(0,0,0,0.15)' }} />
              <button onClick={() => { setPhoto(null); setExistingPhoto(null); setScanOk(false); setScanMsg(''); }} className="absolute top-2 right-2 p-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.6)' }}><X size={16} color="#fff" /></button>
            </div>
          )}
          {scanning ? (
            <div className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              <Loader2 size={18} className="animate-spin" /> กำลังอ่านใบเสร็จ…
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => camRef.current && camRef.current.click()}
                className="py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                style={{ background: '#fff', color: T.brand }}>
                <Camera size={18} /> ถ่ายรูป
              </button>
              <button onClick={() => scanRef.current && scanRef.current.click()}
                className="py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.5)' }}>
                <Upload size={18} /> เลือกไฟล์
              </button>
            </div>
          )}
          {scanMsg && (
            <div className="mt-2 text-xs leading-relaxed" style={{ color: scanOk ? T.goldSoft : '#FFD9CC', wordBreak: 'break-word' }}>
              {scanMsg}
            </div>
          )}
          <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={scanReceipt} className="hidden" />
          <input ref={scanRef} type="file" accept="image/*" onChange={scanReceipt} className="hidden" />
        </div>
      )}

      <div className="rounded-2xl p-4 mb-4 text-center" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
        <p className="text-xs mb-1" style={{ color: T.sub }}>จำนวนเงิน (บาท)</p>
        <input value={amount} onChange={(ev) => { setAmount(ev.target.value); setErr(''); }} inputMode="decimal" placeholder="0"
          className="w-full text-center bg-transparent outline-none font-bold" style={{ fontFamily: 'Kanit, sans-serif', fontSize: 40, color: type === 'expense' ? T.expense : T.income }} />
      </div>

      <Field label="วันที่">
        <input type="date" value={date} onChange={(ev) => setDate(ev.target.value)} className="w-full bg-transparent outline-none text-sm" style={{ color: T.ink }} />
      </Field>

      <Field label={type === 'expense' ? 'ผู้จ่าย' : 'ผู้รับ'}>
        <div className="flex flex-wrap gap-2">{data.members.map(m => <Chip key={m} active={who === m} onClick={() => setWho(m)}>{m}</Chip>)}</div>
      </Field>

      <Field label="หมวด">
        <div className="grid grid-cols-3 gap-2">
          {cats.map(c => {
            const Ic = iconMap[c] || MoreHorizontal; const on = category === c; const col = type === 'expense' ? catColor(data.expCats, c) : T.income;
            return (
              <button key={c} onClick={() => { setCategory(c); setErr(''); }} className="flex flex-col items-center gap-1 py-2.5 rounded-xl transition-colors"
                style={{ background: on ? col : '#fff', border: `1.5px solid ${on ? col : T.line}` }}>
                <Ic size={20} color={on ? '#fff' : col} />
                <span className="leading-tight text-center px-1" style={{ fontSize: 11, color: on ? '#fff' : T.ink }}>{c}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <Field label={type === 'expense' ? 'ร้านค้า / รายการ' : 'รายละเอียด / แหล่งที่มา'}>
        <input value={merchant} onChange={(ev) => setMerchant(ev.target.value)} placeholder={type === 'expense' ? 'เช่น Tops, การไฟฟ้า' : 'เช่น เงินเดือน SMI'}
          className="w-full bg-transparent outline-none text-sm" style={{ color: T.ink }} />
      </Field>

      {type === 'expense' && (
        <Field label="วิธีชำระ">
          <div className="flex flex-wrap gap-2">{data.pays.map(p => <Chip key={p} active={pay === p} onClick={() => setPay(p)} color={T.brand2}>{p}</Chip>)}</div>
        </Field>
      )}

      <Field label="หมายเหตุ">
        <input value={note} onChange={(ev) => setNote(ev.target.value)} placeholder="(ไม่บังคับ)" className="w-full bg-transparent outline-none text-sm" style={{ color: T.ink }} />
      </Field>

      {err && <div className="flex items-center gap-2 text-sm mb-3 px-1" style={{ color: T.expense }}><AlertCircle size={16} /> {err}</div>}

      <button onClick={submit} className="w-full py-3.5 rounded-2xl font-semibold text-white active:scale-95 transition-transform mb-2"
        style={{ background: T.brand, fontFamily: 'Kanit, sans-serif', fontSize: 16 }}>
        {e ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-medium mb-1.5 px-1" style={{ color: T.sub }}>{label}</p>
      <div className="rounded-2xl p-3" style={{ background: T.surface, border: `1px solid ${T.line}` }}>{children}</div>
    </div>
  );
}

/* ---------------- List ---------------- */
function ListScreen({ data, period, shiftMonth, setDetail, me, scope, setScope }) {
  const [typeF, setTypeF] = useState('all');
  const rows = useMemo(() => {
    return data.tx.filter(t => { const d = new Date(t.date + 'T00:00:00'); return d.getFullYear() === period.y && d.getMonth() === period.m; })
      .filter(t => scope === 'all' ? true : t.who === me)
      .filter(t => typeF === 'all' ? true : t.type === typeF)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data.tx, period, typeF, scope, me]);

  return (
    <div className="screen px-4 pt-5">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Kanit, sans-serif' }}>รายการ</h1>
        <div className="flex items-center gap-1 rounded-full px-1 py-1" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
          <button onClick={() => shiftMonth(-1)} className="p-1.5 rounded-full active:bg-gray-100"><ChevronLeft size={18} color={T.sub} /></button>
          <span className="text-sm font-semibold px-1" style={{ minWidth: 90, textAlign: 'center', fontFamily: 'Kanit, sans-serif' }}>{TH_FULL[period.m]} {period.y}</span>
          <button onClick={() => shiftMonth(1)} className="p-1.5 rounded-full active:bg-gray-100"><ChevronRight size={18} color={T.sub} /></button>
        </div>
      </div>

      <div className="mb-3"><ScopeToggle scope={scope} setScope={setScope} me={me} /></div>

      <div className="flex gap-2 mb-4">
        {[['all', 'ทั้งหมด'], ['expense', 'รายจ่าย'], ['income', 'รายรับ']].map(([v, l]) => <Chip key={v} active={typeF === v} onClick={() => setTypeF(v)}>{l}</Chip>)}
      </div>

      {rows.length === 0 ? <Empty text="ยังไม่มีรายการในเดือนนี้" /> : (
        <div className="space-y-2">
          {rows.map(t => {
            const exp = t.type === 'expense'; const Ic = (exp ? EXP_ICON : INC_ICON)[t.category] || MoreHorizontal;
            const col = exp ? catColor(data.expCats, t.category) : T.income;
            return (
              <button key={t.id} onClick={() => setDetail(t)} className="w-full flex items-center gap-3 p-3 rounded-2xl active:opacity-70" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, background: col + '1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Ic size={20} color={col} />
                </span>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: T.ink }}>{t.merchant || t.category}</p>
                  <p className="text-xs truncate" style={{ color: T.sub }}>{t.who} · {fmtDate(t.date)}{exp && t.pay ? ' · ' + t.pay : ''}</p>
                </div>
                <div className="text-right flex items-center gap-1.5 flex-shrink-0">
                  {t.hasPhoto && <ImageIcon size={14} color={T.sub} />}
                  <span className="font-semibold text-sm" style={{ fontFamily: 'Kanit, sans-serif', color: exp ? T.expense : T.income }}>{exp ? '-' : '+'}{baht(t.amount)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- Category filter sheet ---------------- */
function CategorySheet({ name, data, onClose }) {
  const rows = data.tx.filter(t => t.type === 'expense' && t.category === name).sort((a, b) => b.date.localeCompare(a.date));
  const total = rows.reduce((s, t) => s + (+t.amount || 0), 0);
  return (
    <Sheet onClose={onClose}>
      <h2 className="text-lg font-bold mb-1" style={{ fontFamily: 'Kanit, sans-serif' }}>{name}</h2>
      <p className="text-sm mb-4" style={{ color: T.sub }}>รวมทั้งหมด <b style={{ color: T.expense }}>{baht(total)}</b> · {rows.length} รายการ</p>
      <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '50vh' }}>
        {rows.map(t => (
          <div key={t.id} className="flex justify-between items-center p-3 rounded-xl" style={{ background: T.faint }}>
            <div><p className="text-sm font-medium">{t.merchant || '-'}</p><p className="text-xs" style={{ color: T.sub }}>{t.who} · {fmtDate(t.date)}</p></div>
            <span className="font-semibold text-sm" style={{ fontFamily: 'Kanit, sans-serif', color: T.expense }}>{baht(t.amount)}</span>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

/* ---------------- Transaction detail sheet ---------------- */
function TxDetailSheet({ t, data, onClose, removeTx, onEdit, canEdit }) {
  const [photo, setPhoto] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const exp = t.type === 'expense';
  useEffect(() => { if (t.hasPhoto) getPhoto(t.id).then(setPhoto); }, [t.id]);
  const col = exp ? catColor(data.expCats, t.category) : T.income;
  const Ic = (exp ? EXP_ICON : INC_ICON)[t.category] || MoreHorizontal;

  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center gap-3 mb-4">
        <span style={{ width: 48, height: 48, borderRadius: 14, background: col + '1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic size={24} color={col} /></span>
        <div>
          <p className="text-base font-semibold">{t.merchant || t.category}</p>
          <p className="text-xs" style={{ color: T.sub }}>{exp ? 'รายจ่าย' : 'รายรับ'} · {t.category}</p>
        </div>
      </div>
      <p className="font-bold mb-4" style={{ fontFamily: 'Kanit, sans-serif', fontSize: 32, color: exp ? T.expense : T.income }}>{exp ? '-' : '+'}{baht2(t.amount)}</p>

      <div className="space-y-2 mb-4 text-sm">
        <Row k={exp ? 'ผู้จ่าย' : 'ผู้รับ'} v={t.who} />
        <Row k="วันที่" v={fmtDate(t.date)} />
        {exp && t.pay && <Row k="วิธีชำระ" v={t.pay} />}
        {t.note && <Row k="หมายเหตุ" v={t.note} />}
      </div>

      {t.hasPhoto && (photo ? <img src={photo} alt="ใบเสร็จ" className="w-full rounded-xl mb-4" /> : <div className="py-6 text-center text-sm mb-4" style={{ color: T.sub }}>กำลังโหลดรูป…</div>)}

      {!canEdit ? (
        <div className="rounded-xl p-3 flex items-center gap-2 text-sm" style={{ background: T.faint, color: T.sub }}>
          <Lock size={16} /> รายการนี้แก้ได้เฉพาะ {t.who} หรือแอดมิน ({data.admin || 'Kea'})
        </div>
      ) : !confirm ? (
        <div className="flex gap-2">
          <button onClick={onEdit} className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2" style={{ background: T.faint, color: T.ink, border: `1px solid ${T.line}` }}><Pencil size={17} /> แก้ไข</button>
          <button onClick={() => setConfirm(true)} className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2" style={{ background: '#FCEBE6', color: T.expense }}><Trash2 size={17} /> ลบ</button>
        </div>
      ) : (
        <div className="rounded-xl p-3" style={{ background: '#FCEBE6' }}>
          <p className="text-sm mb-2" style={{ color: T.expense }}>ลบรายการนี้ถาวร?</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirm(false)} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: '#fff', border: `1px solid ${T.line}` }}>ยกเลิก</button>
            <button onClick={() => removeTx(t)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: T.expense }}>ลบเลย</button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
function Row({ k, v }) { return <div className="flex justify-between"><span style={{ color: T.sub }}>{k}</span><span className="font-medium text-right" style={{ color: T.ink }}>{v}</span></div>; }
function Sheet({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full rounded-t-3xl p-5 screen" style={{ maxWidth: 440, background: T.surface, maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: T.line }} />
        {children}
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */
function SettingsScreen({ data, update, flash, me, admin, isAdmin, onSwitchUser, onImport }) {
  const exportCSV = () => {
    const head = ['วันที่', 'ประเภท', 'ผู้เกี่ยวข้อง', 'หมวด', 'รายการ', 'จำนวนเงิน', 'วิธีชำระ', 'หมายเหตุ'];
    const lines = data.tx.slice().sort((a, b) => a.date.localeCompare(b.date)).map(t =>
      [t.date, t.type === 'expense' ? 'รายจ่าย' : 'รายรับ', t.who, t.category, t.merchant, t.amount, t.pay, t.note]
        .map(x => `"${String(x ?? '').replace(/"/g, '""')}"`).join(','));
    const csv = '﻿' + [head.join(','), ...lines].join('\n');
    dl(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'family-budget.csv');
    flash('ส่งออก CSV แล้ว');
  };
  const exportJSON = () => { dl(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'family-budget-backup.json'); flash('สำรองข้อมูลแล้ว'); };
  const importJSON = (ev) => {
    const f = ev.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (e) => { try { const d = JSON.parse(e.target.result); if (d.tx && d.members) { update(d); flash('นำเข้าข้อมูลแล้ว'); } else flash('ไฟล์ไม่ถูกต้อง'); } catch { flash('อ่านไฟล์ไม่สำเร็จ'); } };
    r.readAsText(f);
  };
  const dl = (blob, name) => { const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = name; a.click(); URL.revokeObjectURL(u); };
  const impRef = useRef();
  const [resetting, setResetting] = useState(false);
  const resetAll = async () => {
    await deleteAllPhotos();
    update(JSON.parse(JSON.stringify(DEFAULTS)));
    setResetting(false);
    flash('รีเซ็ตข้อมูลแล้ว');
  };

  return (
    <div className="screen px-4 pt-5">
      <h1 className="text-xl font-bold mb-4" style={{ fontFamily: 'Kanit, sans-serif' }}>ตั้งค่า</h1>

      <Section title="ผู้ใช้งาน">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center rounded-full font-semibold" style={{ width: 44, height: 44, background: isAdmin ? T.brand : T.faint, color: isAdmin ? '#fff' : T.ink, fontFamily: 'Kanit, sans-serif', fontSize: 18 }}>{me.slice(0, 1)}</span>
          <div className="flex-1">
            <p className="font-semibold" style={{ color: T.ink }}>{me}</p>
            <p className="text-xs flex items-center gap-1" style={{ color: isAdmin ? '#9A6A00' : T.sub }}>
              {isAdmin ? <><Crown size={12} /> แอดมิน — แก้หลังบ้านได้</> : <><ShieldCheck size={12} /> ผู้ใช้ทั่วไป</>}
            </p>
          </div>
          <button onClick={onSwitchUser} className="px-3 py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform" style={{ background: T.faint, color: T.brand, border: `1px solid ${T.line}` }}>เปลี่ยนผู้ใช้</button>
        </div>
      </Section>

      {isAdmin ? (
        <>
          <Section title="แอดมิน (ผู้ที่แก้หลังบ้านได้)" right={<Crown size={15} color={T.gold} />}>
            <p className="text-xs mb-2" style={{ color: T.sub }}>เลือกได้ทีละคน — แอดมินแก้หมวด/สมาชิก/ตั้งค่าได้</p>
            <div className="flex flex-wrap gap-2">
              {data.members.map(m => <Chip key={m} active={admin === m} onClick={() => update({ ...data, admin: m })}>{m}</Chip>)}
            </div>
          </Section>

          <EditList title="สมาชิก" items={data.members} onChange={(v) => update({ ...data, members: v })} />
          <EditList title="หมวดรายจ่าย" items={data.expCats} onChange={(v) => update({ ...data, expCats: v })} />
          <EditList title="หมวดรายรับ" items={data.incCats} onChange={(v) => update({ ...data, incCats: v })} />
          <EditList title="วิธีชำระ" items={data.pays} onChange={(v) => update({ ...data, pays: v })} />
          <BudgetSettings data={data} update={update} />
          <RecurringSettings data={data} update={update} />

          <Section title="ข้อมูล & สำรอง">
            <div className="space-y-2">
              <ActionRow icon={Upload} label="นำเข้า Statement ธนาคาร (.csv)" onClick={onImport} />
              <ActionRow icon={Download} label="ส่งออกเป็น CSV (เปิดใน Excel/M365)" onClick={exportCSV} />
              <ActionRow icon={Download} label="สำรองข้อมูลทั้งหมด (.json)" onClick={exportJSON} />
              <ActionRow icon={Upload} label="นำเข้าข้อมูลจากไฟล์สำรอง (.json)" onClick={() => impRef.current?.click()} />
              <input ref={impRef} type="file" accept="application/json" onChange={importJSON} className="hidden" />
            </div>
          </Section>

          <Section title="รีเซ็ต">
            {!resetting ? (
              <button onClick={() => setResetting(true)} className="w-full flex items-center gap-3 py-2.5 active:opacity-60">
                <span style={{ width: 36, height: 36, borderRadius: 10, background: '#FCEBE6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RotateCcw size={18} color={T.expense} /></span>
                <span className="text-sm flex-1 text-left font-medium" style={{ color: T.expense }}>รีเซ็ตข้อมูลทั้งหมด (เริ่มต้นใหม่)</span>
              </button>
            ) : (
              <div className="rounded-xl p-3" style={{ background: '#FCEBE6' }}>
                <p className="text-sm mb-2" style={{ color: T.expense }}>ลบทุกรายการและรูป กลับสู่ค่าเริ่มต้น (เงินเดือน 4 คน)? กู้คืนไม่ได้</p>
                <div className="flex gap-2">
                  <button onClick={() => setResetting(false)} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: '#fff', border: `1px solid ${T.line}` }}>ยกเลิก</button>
                  <button onClick={resetAll} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: T.expense }}>รีเซ็ตเลย</button>
                </div>
              </div>
            )}
          </Section>
        </>
      ) : (
        <>
          <div className="rounded-2xl p-4 mb-5 flex items-start gap-2 text-sm" style={{ background: T.faint, color: T.sub, border: `1px solid ${T.line}` }}>
            <Lock size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>การแก้หมวด สมาชิก และตั้งค่า ทำได้เฉพาะ <b style={{ color: T.ink }}>แอดมิน ({admin})</b> — โอ๋เพิ่ม/แก้/ลบ <b style={{ color: T.ink }}>รายการของตัวเอง</b> ได้ตามปกติ</span>
          </div>
          <EditList title="หมวดรายจ่าย" items={data.expCats} readOnly />
          <EditList title="หมวดรายรับ" items={data.incCats} readOnly />
          <Section title="ข้อมูล">
            <div className="space-y-2">
              <ActionRow icon={Upload} label="นำเข้า Statement ธนาคาร (.csv)" onClick={onImport} />
              <ActionRow icon={Download} label="ส่งออกเป็น CSV (สำรองไว้ใน OneDrive)" onClick={exportCSV} />
            </div>
          </Section>
        </>
      )}

      <div className="rounded-2xl p-4 mb-5 text-xs leading-relaxed" style={{ background: '#FFF8EC', border: `1px solid ${T.goldSoft}`, color: '#7A5C16' }}>
        <b>หมายเหตุ:</b> ระบบผู้ใช้นี้เป็นแบบเลือกชื่อ (กันแก้ผิดในครอบครัว) ไม่ใช่ระบบ login ที่กันได้จริง · ข้อมูลเก็บในฐานข้อมูลบนเครื่องของคุณ (SQLite) · แนะนำกด "ส่งออก CSV" เป็นระยะเพื่อสำรองไว้ใน OneDrive
      </div>
    </div>
  );
}
function ActionRow({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-2.5 active:opacity-60">
      <span style={{ width: 36, height: 36, borderRadius: 10, background: T.faint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={18} color={T.brand} /></span>
      <span className="text-sm flex-1 text-left" style={{ color: T.ink }}>{label}</span>
      <ChevronRight size={18} color={T.sub} />
    </button>
  );
}
function EditList({ title, items, onChange, readOnly }) {
  const [val, setVal] = useState('');
  return (
    <Section title={title} right={!readOnly && <span className="text-xs" style={{ color: T.sub }}>แตะ ✕ เพื่อลบ</span>}>
      <div className="flex flex-wrap gap-2" style={{ marginBottom: readOnly ? 0 : 12 }}>
        {items.map((it, i) => (
          <span key={i} className="flex items-center gap-1.5 py-1.5 rounded-full text-sm" style={{ paddingLeft: 12, paddingRight: readOnly ? 12 : 6, background: T.faint, border: `1px solid ${T.line}` }}>
            {it}
            {!readOnly && (
              <button onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`ลบ ${it}`}
                className="flex items-center justify-center rounded-full active:scale-90 transition-transform" style={{ width: 20, height: 20, background: '#FCEBE6' }}>
                <X size={13} color={T.expense} />
              </button>
            )}
          </span>
        ))}
        {items.length === 0 && <span className="text-sm" style={{ color: T.sub }}>ยังไม่มีรายการ</span>}
      </div>
      {!readOnly && (
        <div className="flex gap-2">
          <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="พิมพ์เพื่อเพิ่มใหม่"
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none" style={{ background: T.faint, border: `1px solid ${T.line}`, color: T.ink }} />
          <button onClick={() => { const v = val.trim(); if (v && !items.includes(v)) { onChange([...items, v]); setVal(''); } }}
            className="px-4 rounded-xl text-white text-sm font-medium active:scale-95 transition-transform" style={{ background: T.brand }}>เพิ่ม</button>
        </div>
      )}
    </Section>
  );
}

/* ---------------- Budget Settings ---------------- */
function BudgetSettings({ data, update }) {
  const [vals, setVals] = useState(() => {
    const r = {};
    data.expCats.forEach(c => { r[c] = data.budgets?.[c] ? String(data.budgets[c]) : ''; });
    return r;
  });

  const saveVal = (cat, val) => {
    const budgets = { ...(data.budgets || {}) };
    const n = parseFloat(val);
    if (n > 0) budgets[cat] = n; else delete budgets[cat];
    update({ ...data, budgets });
  };

  return (
    <Section title="งบประมาณรายหมวด (บาท/เดือน)">
      <div className="space-y-2.5">
        {data.expCats.map(c => {
          const Ic = EXP_ICON[c] || MoreHorizontal;
          const col = catColor(data.expCats, c);
          return (
            <div key={c} className="flex items-center gap-2">
              <span style={{ width: 32, height: 32, borderRadius: 8, background: col + '1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ic size={15} color={col} />
              </span>
              <span className="flex-1 text-sm truncate" style={{ color: T.ink }}>{c}</span>
              <input
                value={vals[c] || ''}
                onChange={e => setVals(prev => ({ ...prev, [c]: e.target.value }))}
                onBlur={e => saveVal(c, e.target.value)}
                inputMode="numeric"
                placeholder="ไม่จำกัด"
                className="w-24 text-right px-2 py-1.5 rounded-xl text-sm outline-none"
                style={{ background: T.faint, border: `1px solid ${T.line}`, color: T.ink, fontFamily: 'Kanit, sans-serif' }}
              />
            </div>
          );
        })}
      </div>
      <p className="text-xs mt-3" style={{ color: T.sub }}>ปล่อยว่าง = ไม่จำกัด · บันทึกอัตโนมัติเมื่อออกจากช่อง</p>
    </Section>
  );
}

/* ---------------- Recurring Settings ---------------- */
function RecurringSettings({ data, update }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ type: 'income', who: data.members[0] || '', category: '', merchant: '', amount: '', dayOfMonth: '1' });
  const recurring = data.recurring || [];
  const cats = form.type === 'expense' ? data.expCats : data.incCats;

  const addRec = () => {
    const amt = parseFloat(form.amount);
    if (!amt || !form.category || !form.who) return;
    const newRec = {
      id: 'rec_' + uid(),
      type: form.type,
      who: form.who,
      category: form.category,
      merchant: form.merchant.trim() || form.category,
      amount: amt,
      pay: '',
      note: '',
      dayOfMonth: parseInt(form.dayOfMonth) || 1,
    };
    update({ ...data, recurring: [...recurring, newRec] });
    setAdding(false);
    setForm({ type: 'income', who: data.members[0] || '', category: '', merchant: '', amount: '', dayOfMonth: '1' });
  };

  const removeRec = (id) => update({ ...data, recurring: recurring.filter(r => r.id !== id) });

  return (
    <Section title="รายการประจำ (เพิ่มทุกต้นเดือนอัตโนมัติ)" right={<RotateCcw size={15} color={T.sub} />}>
      <div className="space-y-2 mb-3">
        {recurring.length === 0 && <p className="text-sm text-center py-2" style={{ color: T.sub }}>ยังไม่มีรายการประจำ</p>}
        {recurring.map(r => (
          <div key={r.id} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: T.faint }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: T.ink }}>{r.merchant || r.category}</p>
              <p className="text-xs" style={{ color: T.sub }}>{r.who} · {r.type === 'income' ? 'รายรับ' : 'รายจ่าย'} · วันที่ {r.dayOfMonth} ของทุกเดือน</p>
            </div>
            <span className="text-sm font-semibold flex-shrink-0" style={{ fontFamily: 'Kanit, sans-serif', color: r.type === 'income' ? T.income : T.expense }}>
              {r.type === 'income' ? '+' : '-'}{baht(r.amount)}
            </span>
            <button onClick={() => removeRec(r.id)} className="p-1 rounded-full flex-shrink-0" style={{ background: '#FCEBE6' }}>
              <X size={14} color={T.expense} />
            </button>
          </div>
        ))}
      </div>
      {!adding ? (
        <button onClick={() => setAdding(true)} className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
          style={{ background: T.faint, color: T.brand, border: `1.5px dashed ${T.brand}` }}>
          <Plus size={16} /> เพิ่มรายการประจำ
        </button>
      ) : (
        <div className="rounded-xl p-3 space-y-2" style={{ background: T.faint, border: `1px solid ${T.line}` }}>
          <div className="flex gap-2">
            {[['income','รายรับ'],['expense','รายจ่าย']].map(([v,l]) => (
              <button key={v} onClick={() => setForm(f => ({...f, type:v, category:''}))} className="flex-1 py-1.5 rounded-lg text-sm font-medium"
                style={{ background: form.type===v ? T.brand : '#fff', color: form.type===v ? '#fff' : T.sub, border: `1px solid ${form.type===v ? T.brand : T.line}` }}>
                {l}
              </button>
            ))}
          </div>
          <select value={form.who} onChange={e => setForm(f => ({...f, who:e.target.value}))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background:'#fff', border:`1px solid ${T.line}`, color:T.ink }}>
            {data.members.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={form.category} onChange={e => setForm(f => ({...f, category:e.target.value}))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background:'#fff', border:`1px solid ${T.line}`, color:T.ink }}>
            <option value="">เลือกหมวด</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={form.merchant} onChange={e => setForm(f => ({...f, merchant:e.target.value}))} placeholder="ชื่อรายการ (ถ้าไม่ใส่ใช้ชื่อหมวด)"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background:'#fff', border:`1px solid ${T.line}`, color:T.ink }} />
          <div className="flex gap-2">
            <input value={form.amount} onChange={e => setForm(f => ({...f, amount:e.target.value}))} inputMode="numeric" placeholder="จำนวนเงิน (บาท)"
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ background:'#fff', border:`1px solid ${T.line}`, color:T.ink }} />
            <input value={form.dayOfMonth} onChange={e => setForm(f => ({...f, dayOfMonth:e.target.value}))} inputMode="numeric" placeholder="วันที่"
              className="w-16 px-3 py-2 rounded-lg text-sm outline-none text-center" style={{ background:'#fff', border:`1px solid ${T.line}`, color:T.ink }} />
          </div>
          <p className="text-xs" style={{ color: T.sub }}>วันที่ = วันในเดือนที่จะเพิ่มรายการ (1–28)</p>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setAdding(false)} className="flex-1 py-2 rounded-lg text-sm" style={{ background:'#fff', border:`1px solid ${T.line}`, color:T.sub }}>ยกเลิก</button>
            <button onClick={addRec} className="flex-1 py-2 rounded-lg text-sm font-medium text-white" style={{ background:T.brand }}>เพิ่มเลย</button>
          </div>
        </div>
      )}
    </Section>
  );
}

/* ---------------- Statement Import Sheet ---------------- */
function StatementImportSheet({ data, importTx, me, onClose }) {
  const [step, setStep] = useState('upload');
  const [who, setWho] = useState(me);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [cats, setCats] = useState({});
  const [error, setError] = useState('');
  const fileRef = useRef();
  const existingIds = useMemo(() => new Set(data.tx.map(t => t.id)), [data.tx]);

  const [parsing, setParsing] = useState(false);
  const [needPassword, setNeedPassword] = useState(false);
  const [pdfB64, setPdfB64] = useState('');
  const [pdfPassword, setPdfPassword] = useState('');

  const applyParsed = (parsed) => {
    if (parsed.length === 0) { setError('ไม่พบข้อมูลในไฟล์ หรือทุกรายการมียอด 0'); return; }
    const initSel = new Set();
    const initCats = {};
    parsed.forEach((r, i) => {
      if (!existingIds.has(r.id)) initSel.add(i);
      initCats[i] = r.category;
    });
    setRows(parsed);
    setSelected(initSel);
    setCats(initCats);
    setStep('preview');
  };

  const parsePDF = async (b64, password = '') => {
    setParsing(true);
    setError('');
    try {
      const resp = await fetch('/api/parse-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData: b64, password }),
      });
      const json = await resp.json();
      if (json.encrypted) { setNeedPassword(true); setPdfB64(b64); return; }
      if (json.error) throw new Error(json.error);
      const parsed = parseStatementText(json.text, data.expCats);
      setNeedPassword(false);
      applyParsed(parsed);
    } catch (err) {
      setError('อ่าน PDF ไม่สำเร็จ: ' + err.message);
    } finally {
      setParsing(false);
    }
  };

  const handleFile = async (ev) => {
    const f = ev.target.files?.[0];
    if (!f) return;
    setError(''); setNeedPassword(false); setPdfPassword('');
    const isPDF = f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf';
    if (isPDF) {
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = (e) => res(e.target.result.split(',')[1]);
        r.onerror = rej;
        r.readAsDataURL(f);
      });
      await parsePDF(b64);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try { applyParsed(parseStatementCSV(e.target.result, data.expCats)); }
        catch (err) { setError(err.message); }
      };
      reader.readAsText(f, 'UTF-8');
    }
  };

  const toggleRow = (i) => {
    setSelected(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });
  };

  const toggleAll = () => {
    const newable = rows.map((_, i) => i).filter(i => !existingIds.has(rows[i].id));
    setSelected(selected.size < newable.length ? new Set(newable) : new Set());
  };

  const confirm = () => {
    const txList = [];
    rows.forEach((r, i) => {
      if (!selected.has(i)) return;
      txList.push({
        id: r.id,
        type: r.amount > 0 ? 'income' : 'expense',
        date: r.date,
        who,
        category: cats[i] || r.category,
        merchant: r.description || (r.amount > 0 ? 'รายรับ' : 'รายจ่าย'),
        amount: Math.abs(r.amount),
        pay: r.amount < 0 ? 'โอน/PromptPay' : '',
        note: 'นำเข้าจาก Statement',
        hasPhoto: false,
      });
    });
    importTx(txList);
    onClose();
  };

  const newableCount = rows.filter((_, i) => !existingIds.has(rows[i]?.id)).length;
  const selectedCount = [...selected].filter(i => !existingIds.has(rows[i]?.id)).length;
  const dupCount = rows.filter(r => existingIds.has(r.id)).length;
  const allCats = [...data.expCats, ...data.incCats].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <Sheet onClose={onClose}>
      <h2 className="text-lg font-bold mb-1" style={{ fontFamily: 'Kanit, sans-serif' }}>นำเข้า Statement ธนาคาร</h2>

      {step === 'upload' && (
        <>
          <p className="text-sm mb-4" style={{ color: T.sub }}>รองรับ KBank · SCB · Krungthai · Bangkok Bank · ไฟล์ .csv หรือ .pdf</p>

          <div className="mb-4">
            <p className="text-xs font-medium mb-2" style={{ color: T.sub }}>Statement ของใคร?</p>
            <div className="flex flex-wrap gap-2">
              {data.members.map(m => <Chip key={m} active={who === m} onClick={() => setWho(m)}>{m}</Chip>)}
            </div>
          </div>

          <button onClick={() => fileRef.current?.click()} disabled={parsing}
            className="w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2"
            style={{ background: parsing ? T.line : T.brand, color: '#fff' }}>
            {parsing ? <><Loader2 size={20} className="animate-spin" /> กำลังอ่าน PDF…</> : <><Upload size={20} /> เลือกไฟล์ CSV หรือ PDF</>}
          </button>
          <input ref={fileRef} type="file" accept=".csv,.pdf,text/csv,application/pdf" onChange={handleFile} className="hidden" />

          {needPassword && (
            <div className="mt-3 rounded-xl p-3 space-y-2" style={{ background: '#FFF8EC', border: `1px solid ${T.goldSoft}` }}>
              <p className="text-sm font-medium" style={{ color: '#7A5C16' }}>🔒 PDF นี้ถูกล็อกด้วยรหัสผ่าน</p>
              <p className="text-xs" style={{ color: '#7A5C16' }}>
                SCB: วันเกิด <b>DDMMYYYY</b> (เช่น 15051990) หรือเลขบัญชี 10 หลักสุดท้าย
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={pdfPassword}
                  onChange={e => setPdfPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && parsePDF(pdfB64, pdfPassword)}
                  placeholder="กรอกรหัสผ่าน PDF"
                  className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ border: `1px solid ${T.goldSoft}`, background: '#fff' }}
                />
                <button onClick={() => parsePDF(pdfB64, pdfPassword)} disabled={parsing || !pdfPassword}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: pdfPassword ? T.brand : T.line }}>
                  {parsing ? '…' : 'ลอง'}
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-sm mt-3 text-center rounded-xl p-2" style={{ color: T.expense, background: '#FCEBE6' }}>{error}</p>}

          <div className="mt-4 rounded-xl p-3 text-xs leading-relaxed" style={{ background: T.faint, color: T.sub }}>
            <b style={{ color: T.ink }}>วิธีดาวน์โหลด Statement:</b><br />
            • <b>KBank:</b> K Plus → บัญชี → ดูรายการ → ส่งออก (.csv)<br />
            • <b>SCB:</b> SCB Easy → บัญชี → ประวัติ → Export (.pdf)<br />
            • <b>Krungthai:</b> Krungthai NEXT → Statement → ดาวน์โหลด (.csv)<br />
            • <b>Bangkok Bank:</b> Bualuang mBanking → บัญชี → Statement (.pdf/.csv)
          </div>
        </>
      )}

      {step === 'preview' && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm" style={{ color: T.sub }}>
              {rows.length} รายการ
              {dupCount > 0 && <span> · <span style={{ color: T.sub }}>{dupCount} ซ้ำ</span></span>}
              {' · '}<span style={{ color: T.brand }}>{selectedCount} เลือก</span>
            </p>
            <button onClick={toggleAll} className="text-xs font-medium px-2 py-1 rounded-lg"
              style={{ color: T.brand, background: T.brand + '10' }}>
              {selectedCount < newableCount ? 'เลือกทั้งหมด' : 'ยกเลิกทั้งหมด'}
            </button>
          </div>

          <div className="space-y-1.5 overflow-y-auto mb-4" style={{ maxHeight: '44vh' }}>
            {rows.map((r, i) => {
              const isDup = existingIds.has(r.id);
              const isSel = selected.has(i);
              return (
                <div key={i} onClick={() => !isDup && toggleRow(i)}
                  className="flex items-start gap-2 p-2.5 rounded-xl transition-colors"
                  style={{
                    background: isDup ? T.faint : isSel ? T.brand + '0D' : '#fff',
                    border: `1px solid ${isDup ? T.line : isSel ? T.brand + '55' : T.line}`,
                    opacity: isDup ? 0.55 : 1,
                    cursor: isDup ? 'default' : 'pointer',
                  }}>
                  <div className="flex-shrink-0 mt-0.5">
                    {isDup ? (
                      <span className="text-xs px-1 py-0.5 rounded" style={{ background: T.line, color: T.sub }}>ซ้ำ</span>
                    ) : (
                      <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${isSel ? T.brand : T.line}`, background: isSel ? T.brand : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isSel && <Check size={11} color="#fff" strokeWidth={3} />}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <p className="text-xs" style={{ color: T.sub }}>{fmtDate(r.date)}</p>
                      <span className="text-sm font-semibold flex-shrink-0" style={{ fontFamily: 'Kanit, sans-serif', color: r.amount > 0 ? T.income : T.expense }}>
                        {r.amount > 0 ? '+' : ''}{baht(Math.abs(r.amount))}
                      </span>
                    </div>
                    <p className="text-sm truncate" style={{ color: T.ink }}>{r.description || '—'}</p>
                    {!isDup && isSel && (
                      <select value={cats[i] || ''} onChange={e => { e.stopPropagation(); setCats(prev => ({...prev, [i]: e.target.value})); }}
                        onClick={e => e.stopPropagation()}
                        className="mt-1 w-full text-xs px-2 py-1 rounded-lg outline-none"
                        style={{ background: '#fff', border: `1px solid ${T.line}`, color: T.sub, fontFamily: 'IBM Plex Sans Thai, sans-serif' }}>
                        {allCats.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setStep('upload'); setRows([]); setSelected(new Set()); setError(''); setParsing(false); setNeedPassword(false); setPdfPassword(''); setPdfB64(''); }}
              className="flex-1 py-3 rounded-xl text-sm font-medium"
              style={{ background: T.faint, color: T.ink, border: `1px solid ${T.line}` }}>
              เปลี่ยนไฟล์
            </button>
            <button onClick={confirm} disabled={selectedCount === 0}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: selectedCount > 0 ? T.brand : T.line }}>
              นำเข้า {selectedCount} รายการ
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}
