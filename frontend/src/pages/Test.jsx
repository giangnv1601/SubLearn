import { useEffect, useState } from 'react'
import { fetchMoviesApi, fetchSubtitlesByMovie, createExercisesFromAI, createQuizApi } from '../api';

// == Helpers toàn cục ==
const toLabel = (i) => ['A', 'B', 'C', 'D'][i] ?? 'A';
const toIndex = (ans) => {
  if (Number.isInteger(ans)) return ans;
  const map = { A: 0, B: 1, C: 2, D: 3 };
  return map[String(ans || '').trim().toUpperCase()] ?? 0;
};

const QUIZ_TYPES = [
  { value: 'reading', label: 'Reading' },
  { value: 'dialogue_reordering', label: 'Dialogue Reordering' },
  { value: 'translation', label: 'Translation (EN→VI options)' },
  { value: 'equivalent', label: 'Equivalent (VI→EN options)' },
];
const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function OptionRow({ idx, value, isCorrect, onChange, onChooseCorrect, onRemove, canRemove }) {
  return (
    <div className="flex items-center gap-2">
      <input type="radio" checked={isCorrect} onChange={() => onChooseCorrect(idx)} title="Đánh dấu đáp án đúng" />
      <span className="w-6 text-[#E4D161] font-semibold">{toLabel(idx)}.</span>
      <input value={value} onChange={e => onChange(idx, e.target.value)}
        className="flex-1 bg-[#0f1620] border border-white/10 rounded px-2 py-1 text-sm outline-none"
        placeholder={`Nội dung phương án ${toLabel(idx)}`}
      />
      {canRemove && (
        <button type="button" onClick={() => onRemove(idx)} className="text-xs px-2 py-1 rounded bg-red-600/80 hover:bg-red-600" title="Xóa phương án">Xóa</button>
      )}
    </div>
  );
}

function QuestionCard({ q, onUpdate, onDelete, displayIndex }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => ({
    question: q.question || '',
    options: Array.isArray(q.options) ? [...q.options] : ['', '', '', ''],
    answer: Number.isInteger(q.answer) ? q.answer : 0,
    explanation: q.explanation || '',
    quote: q.quote || '',
  }));

  useEffect(() => {
    setForm({
      question: q.question || '',
      options: Array.isArray(q.options) ? [...q.options] : ['', '', '', ''],
      answer: Number.isInteger(q.answer) ? q.answer : 0,
      explanation: q.explanation || '',
      quote: q.quote || '',
    });
    setEditing(false);
  }, [q]);

  const setField = (k, v) => setForm(s => ({ ...s, [k]: v }));
  const changeOption = (i, v) => setForm(s => { const next = [...s.options]; next[i] = v; return { ...s, options: next }; });
  const addOption = () => setForm(s => (s.options.length >= 4 ? s : { ...s, options: [...s.options, ''] }));
  const removeOption = (i) => setForm(s => {
    if (s.options.length <= 2) return s;
    const next = s.options.filter((_, idx) => idx !== i);
    let ans = s.answer;
    if (i === ans) ans = 0;
    if (i < ans) ans = Math.max(0, ans - 1);
    return { ...s, options: next, answer: ans };
  });
  const save = () => { onUpdate({ question: form.question.trim(), options: form.options.slice(0, 4).map(x => String(x || '')), answer: form.answer, explanation: form.explanation, quote: form.quote }); setEditing(false); };
  const cancel = () => { setForm({ question: q.question || '', options: Array.isArray(q.options) ? [...q.options] : ['', '', '', ''], answer: Number.isInteger(q.answer) ? q.answer : 0, explanation: q.explanation || '', quote: q.quote || '' }); setEditing(false); };

  if (!editing) {
    return (
      <div className="bg-[#0f1620] rounded p-3 border border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-medium"><span className="text-[#E4D161] mr-2">Q{displayIndex}.</span>{q.question || '(Chưa có nội dung câu hỏi)'}</div>
            {Array.isArray(q.options) && q.options.length > 0 && (
              <ul className="list-disc ml-6 mt-2 text-gray-200 space-y-1">
                {q.options.map((op, i) => (
                  <li key={i}>{op || <span className="opacity-50">(trống)</span>} {q.answer === i && <span className="text-emerald-400">(Correct)</span>}</li>
                ))}
              </ul>
            )}
            {(q.explanation || q.quote) && (
              <div className="mt-2 text-sm text-gray-300">
                {q.explanation && (<div><span className="text-gray-400">Explanation: </span>{q.explanation}</div>)}
                {q.quote && <div className="italic text-gray-400">Quote: {q.quote}</div>}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(true)} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20">Edit</button>
            <button type="button" onClick={onDelete} className="text-xs px-2 py-1 rounded bg-red-600/80 hover:bg-red-600">Delete</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-[#0f1620] rounded p-3 space-y-2 border border-white/10">
      <div className="text-[#E4D161] font-semibold">Q{displayIndex}</div>
      <textarea value={form.question} onChange={e => setField('question', e.target.value)} className="w-full bg-[#0b121a] border border-white/10 rounded p-2 text-sm outline-none" placeholder="Nội dung câu hỏi..." rows={2} />
      <div className="grid gap-2">
        {form.options.map((op, i) => (
          <OptionRow key={i} idx={i} value={op} isCorrect={form.answer === i} onChange={changeOption} onChooseCorrect={idx => setField('answer', idx)} onRemove={idx => removeOption(idx)} canRemove={form.options.length > 2} />
        ))}
      </div>
      {form.options.length < 4 && (<button type="button" onClick={addOption} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20">+ Thêm phương án</button>)}
      <div className="grid md:grid-cols-2 gap-2">
        <input value={form.explanation} onChange={e => setField('explanation', e.target.value)} className="bg-[#0b121a] border border-white/10 rounded px-2 py-1 text-sm outline-none" placeholder="Giải thích (tuỳ chọn)" />
        <input value={form.quote} onChange={e => setField('quote', e.target.value)} className="bg-[#0b121a] border border-white/10 rounded px-2 py-1 text-sm outline-none" placeholder="Quote (tuỳ chọn)" />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={cancel} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-sm">Cancel</button>
        <button type="button" onClick={save} className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-sm">Save</button>
      </div>
    </div>
  );
}

// Gộp hàm chuẩn hóa dữ liệu
const buildPayloads = (movieId, quizType, raw) => {
  if (!movieId || !quizType) throw new Error('movie_id và quiz_type là bắt buộc khi lưu quiz')
  return (Array.isArray(raw) ? raw : []).map(item => ({
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

// Normalize kết quả AI
const normalizeAI = (arr) => (Array.isArray(arr) ? arr : []).map((qz) => ({
  passage: qz.passage ?? null,
  questions: (qz.questions || []).map((q) => ({
    question: q.question || '',
    options: (q.options || []).slice(0, 4).map((s) => String(s || '')),
    answer: toIndex(q.answer),
    explanation: q.explanation || '',
    quote: q.quote || '',
  })),
}));

// ==== Main page ==== //
export default function CreateQuizTester() {
  // --- State --- //
  const [quizType, setQuizType] = useState('reading');
  const [result, setResult] = useState(null); // [{passage, questions}^{...}]
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [movies, setMovies] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [subList, setSubList] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [error, setError] = useState(null);
  const [saveMsg, setSaveMsg] = useState('');

  // --- Effect: fetch movies --- //
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchMoviesApi();
        // data may be an array or { data: [...] } depending backend; normalize:
        const list = Array.isArray(res) ? res : (res?.data || []);
        setMovies(list);
      } catch { setError('Không tải được danh sách phim.'); }
    })();
  }, []);

  // --- Subtitles logic --- //
  const resetSubs = () => { setSubList([]); setSelectedLang(''); setSubtitle(''); };
  const loadSubtitles = async () => {
    setError(null); setSaveMsg(''); setResult(null); resetSubs();
    if (!selectedMovieId) return setError('Hãy chọn một phim trước.');
    setSubsLoading(true);
    try {
      const res = await fetchSubtitlesByMovie(selectedMovieId, 1);
      const list = res?.data || (Array.isArray(res) ? res : []);
      setSubList(list);
      if (!list.length) setError('Phim này chưa có phụ đề trong DB.');
    } catch (e) {
      setError(e?.response?.data?.message || e.message); 
    } finally {
      setSubsLoading(false);
    }
  };
  const chooseSub = (lang) => {
    setSelectedLang(lang);
    const found = subList.find(x => x.language === lang);
    setSubtitle(found?.srtContent || '');
    setResult(null);
    setSaveMsg('');
    setError(null);
  };

  // --- CRUD quiz block --- //
  const deleteQuiz = (quizIdx) => {
    if (!Array.isArray(result)) return;
    if (!window.confirm(`Xóa toàn bộ Bài ${quizIdx + 1}?`)) return;
    const next = result.filter((_, i) => i !== quizIdx);
    setResult(next.length ? next : null);
  };
  const updateQuestion = (quizIdx, qIdx, nextQ) => {
    const next = [...result];
    next[quizIdx].questions[qIdx] = nextQ; setResult(next);
  };
  const deleteQuestion = (quizIdx, qIdx) => {
    const next = [...result];
    next[quizIdx].questions.splice(qIdx, 1); setResult(next);
  };
  const addQuestion = (quizIdx) => {
    const draft = { question: '', options: ['', '', '', ''], answer: 0, explanation: '', quote: '' };
    const next = [...result];
    next[quizIdx].questions.push(draft);
    setResult(next);
  };

  // --- Quiz từ AI --- //
  const createFromAI = async () => {
    if (!subtitle.trim()) return setError('Chọn phim → Tải phụ đề → Chọn 1 phụ đề trước.');
    setLoading(true); setError(null); setSaveMsg('');
    try {
      const res = await createExercisesFromAI({ subtitle, quizType });
      const normalized = normalizeAI(res?.data ?? res);
      setResult(prev => (Array.isArray(prev) ? [...prev, ...normalized] : normalized));
    } catch (e) { setError(e?.response?.data?.message || e.message); }
    finally { setLoading(false); }
  };
  // --- Thêm quiz thủ công --- //
  const addQuizManually = () => {
    setResult(prev => (Array.isArray(prev) ? [...prev, { passage: '', questions: [] }] : [{ passage: '', questions: [] }]));
  };
  // --- Save --- //
  const saveAllToDB = async () => {
    if (!selectedMovieId) return setError('Hãy chọn phim trước khi lưu.');
    if (!Array.isArray(result) || !result.length) return setError('Không có dữ liệu quiz để lưu.');
    setSaving(true); setError(null); setSaveMsg('');
    try {
      const payloads = buildPayloads(selectedMovieId, quizType, result);
      await Promise.all(payloads.map(p => createQuizApi(p)));
      setSaveMsg(`Đã lưu thành công ${payloads.length} quiz vào database!`);
      setResult(null); setSubtitle(''); setSelectedLang(''); setSubList([]);
    } catch (e) { setError(`Lỗi khi lưu: ${e?.response?.data?.message || e.message}`); }
    finally { setSaving(false); }
  };

  // ------- UI -------- //
  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-[#E4D161] mb-4">Create Quiz</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT BAR */}
          <div className="lg:col-span-1">
            <div className="bg-[#1B2A36] p-4 rounded-md border border-white/10 space-y-4">
              {/* Chọn loại bài */}
              <div>
                <label className="block text-sm mb-1">Chọn loại bài:</label>
                <select value={quizType} onChange={e => setQuizType(e.target.value)} className="w-full bg-[#14202A] text-white px-3 py-2 rounded-md focus:outline-none">
                  {QUIZ_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              {/* Tìm/chọn phim */}
              <div className="space-y-2">
                <label className="block text-sm">Chọn phim:</label>
                <select value={selectedMovieId} onChange={e => setSelectedMovieId(e.target.value)} className="w-full bg-[#14202A] text-white px-3 py-2 rounded-md focus:outline-none">
                  <option value="">-- Chọn phim --</option>
                  {movies.map(m => (
                    <option key={m._id || m.id} value={m._id || m.id}>{m.title}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={loadSubtitles} disabled={!selectedMovieId || subsLoading} className="mt-2 px-3 py-2 bg-[#E4D161] text-black rounded-md font-semibold disabled:opacity-60">
                    {subsLoading ? 'Đang tải phụ đề…' : 'Tải phụ đề'}
                  </button>
                </div>
              </div>
              {/* Chọn phụ đề */}
              {!!subList.length && (
              <div className="space-y-2">
                <label className="block text-sm">Chọn phụ đề (ngôn ngữ):</label>
                <div className="flex flex-wrap gap-2">
                  {subList.map(s => (
                    <button key={s._id} type="button" onClick={() => chooseSub(s.language)} className={`px-3 py-1 rounded-md border ${selectedLang === s.language ? 'bg-[#E4D161] text-black border-transparent' : 'bg-[#14202A] text-white border-white/10'}`} title={`Cập nhật: ${new Date(s.updatedAt).toLocaleString()}`}>{s.language?.toUpperCase?.() || '—'}</button>
                  ))}
                </div>
              </div>
              )}
              {/* Preview phụ đề */}
              <div>
                <label className="block text-sm mb-1">Preview phụ đề đã chọn:</label>
                <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} rows={8} placeholder="Chọn phụ đề để tự điền nội dung…" className="w-full bg-[#14202A] text-gray-100 rounded-md p-3 focus:outline-none"/>
              </div>
              {/* Các hành động */}
              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={createFromAI} disabled={loading} className="px-4 py-2 bg-[#E4D161] text-black rounded-md font-semibold disabled:opacity-60">{loading ? 'Đang tạo...' : 'Tạo Quiz'}</button>
                <button onClick={addQuizManually} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-semibold">+ Thêm bài thủ công</button>
                {Array.isArray(result) && !!result.length && (
                  <button onClick={saveAllToDB} disabled={saving} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-md font-semibold disabled:opacity-60">{saving ? 'Đang lưu…' : 'Lưu bài tập'}</button>
                )}
              </div>
              {/* Thông báo lỗi & lưu */}
              {error && <div className="text-red-300 text-sm">{error}</div>}
              {saveMsg && (<div className="mt-2 p-3 bg-green-900/20 border border-green-500/30 rounded text-green-300 text-sm">{saveMsg}</div>)}
            </div>
          </div>

          {/* PHẦN CHỈNH SỬA BÀI & CÂU HỎI */}
          <div className="lg:col-span-2">
            <div className="bg-[#1B2A36] p-4 rounded-md border border-white/10 min-h-[400px]">
              <h2 className="text-lg font-semibold mb-3">Kết quả</h2>
              {!Array.isArray(result) || !result.length ? (
                <p className="text-gray-400">Chưa có kết quả. Bạn có thể <b>Tải phụ đề → Tạo Quiz</b>.</p>
              ) : (
                <div className="space-y-6">
                  {result.map((qz, idx) => (
                    <div key={idx} className="border border-white/10 rounded-md">
                      <div className="px-4 py-2 bg-white/5 font-semibold flex items-center justify-between gap-2">
                        <span>Bài {idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => addQuestion(idx)} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20">+ Thêm câu hỏi</button>
                          <button type="button" onClick={() => deleteQuiz(idx)} className="text-xs px-2 py-1 rounded bg-red-600/80 hover:bg-red-600" title="Xóa toàn bộ bài này">Xóa bài</button>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <div className="text-sm text-gray-300 mb-1">Passage:</div>
                          <textarea className="w-full bg-[#0f1620] rounded p-3 text-gray-100 whitespace-pre-wrap outline-none border border-white/10" rows={4} value={qz.passage ?? ''} onChange={e => { const next = [...result]; next[idx].passage = e.target.value; setResult(next) }} placeholder="Nhập đoạn Passage cho bài này (tuỳ chọn)..." />
                        </div>
                        {(qz.questions || []).map((qs, i2) => (
                          <QuestionCard key={i2} q={qs} displayIndex={i2 + 1} onUpdate={nq => updateQuestion(idx, i2, nq)} onDelete={() => deleteQuestion(idx, i2)} />
                        ))}
                        {(!qz.questions || qz.questions.length === 0) && (
                          <div className="text-xs text-gray-400">Bài chưa có câu hỏi. Hãy bấm “+ Thêm câu hỏi”.</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
