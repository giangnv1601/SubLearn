/* --HELPERS FOR QUIZ DATA -- */

// Chuyển đổi đáp án chỉ số sang chữ
export const toLabel = (i) => ['A', 'B', 'C', 'D'][i] ?? 'A';

// Chuyển đổi đáp án chữ sang chỉ số
export const toIndex = (ans) => {
  if (Number.isInteger(ans)) return ans;
  const map = { A: 0, B: 1, C: 2, D: 3 };
  return map[String(ans || '').trim().toUpperCase()] ?? 0;
};

// Chuẩn hóa dữ liệu Quiz gen từ AI 
export const normalizeAI = (arr) => (Array.isArray(arr) ? arr : []).map((qz) => ({
  passage: qz.passage ?? null,
  questions: (qz.questions || []).map((q) => ({
    question: q.question || '',
    options: (q.options || []).slice(0, 4).map((s) => String(s || '').trim().replace(/^[A-Za-z]\.\s*/i, '')),
    answer: toIndex(q.answer),
    explanation: q.explanation || '',
    quote: q.quote || '',
  })),
}));

// Chuẩn hóa dữ liệu Quiz để lưu vào DB
export const buildPayloads = (movieId, quizType, result) => {
  if (!movieId || !quizType) throw new Error('Chọn phim và loại quiz trước khi lưu dữ liệu.')
  return (Array.isArray(result) ? result : []).map(item => ({
    movieId,
    quizType,
    passage: item.passage ?? null,
    questions: (item.questions || []).map(q => {
      const opts = (q.options || []).slice(0, 4);
      const ansIdx = toIndex(q.answer);
      return {
        question: q.question || '',
        answer: toLabel(ansIdx),
        explanation: q.explanation || '',
        quote: q.quote || '',
        options: opts.map((content, i) => ({ label: toLabel(i), content: String(content || '') })),
      };
    }),
  }));
};

/* --HELPERS FOR SUBTITLE-- */

// Convert SRT text to cues array có dạng { start, end, text }
export function srtToCues(srtText = '') {
  const text = srtText.replace(/\r/g, '').replace(/^\uFEFF/, '')
  const blocks = text.split(/\n\n+/).filter(Boolean)
  const toSec = (t) => {
    const [h, m, sMs] = t.split(':')
    const [s, ms] = sMs.split(/[,.]/)
    return (+h) * 3600 + (+m) * 60 + (+s) + (+ms || 0) / 1000
  }
  const cues = []
  for (const block of blocks) {
    const lines = block.split('\n').filter(Boolean)
    if (lines.length < 2) continue
    const timeIdx = /^\d+$/.test(lines[0]) ? 1 : 0
    const m = lines[timeIdx].match(
      /(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/
    )
    if (!m) continue
    const start = toSec(m[1])
    const end = toSec(m[2])
    const textLines = lines.slice(timeIdx + 1).join('\n')
    cues.push({ start, end, text: textLines })
  }
  console.log(cues)
  return cues.sort((a, b) => a.start - b.start)
}

// Kết hợp phụ đề EN & VI vào cùng 1 mảng có dạng { start, end, en, vi }
export function pairCues(en = [], vi = []) {
  const max = Math.max(en.length, vi.length)
  const items = []
  for (let i = 0; i < max; i++) {
    const e = en[i],
      v = vi[i]
    if (!e && !v) continue
    items.push({
      start: e?.start ?? v?.start ?? 0,
      end: e?.end ?? v?.end ?? 0,
      en: e?.text || '',
      vi: v?.text || '',
    })
  }
  return items
}

// Làm sạch phụ đề
export function sanitizeSubtitle(s = '') {
  let out = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  out = out.replace(/&lt;(\/?)?(i|b|u)&gt;/gi, '<$1$2>').replace(/\n/g, '<br/>')
  return out
}

// Định dạng thời gian dạng HH:MM:SS
export function fmtTime(totalSec = 0) {
  const sec = Math.max(0, Math.floor(totalSec))
  const h = String(Math.floor(sec / 3600)).padStart(2, '0')
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

// Tìm chỉ số phụ đề đang active tại thời điểm t (giây)
export function findActiveIndex(cues, t, eps = 0.05) {
  let low = 0,
    high = cues.length - 1
  while (low <= high) {
    const mid = (low + high) >> 1,
      c = cues[mid]
    if (t < c.start - eps) high = mid - 1
    else if (t > c.end + eps) low = mid + 1
    else return mid
  }
  return -1
}

// Hàm lấy index cue cuối cùng trước thời gian t - segmentDuration
export function findSegmentBeforeTime(cues, t, segmentDuration = 300) {
  for (let i = cues.length - 1; i >= 0; i--) {
    if (cues[i].end < t - segmentDuration) {
      return i
    }
  }
  return -1
}
