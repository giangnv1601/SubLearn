import { useEffect, useState } from 'react'
import { fetchMoviesApi, fetchSubtitlesByMovie, gentoratorQuizApi, createQuizApi } from '@/api';
import { QUIZ_TYPES } from '@/utils/constants';
import { normalizeAI, buildPayloads } from '@/utils/helpers';
import QuestionCard from '@/components/QuestionCard/QuestionCard';

const CreateQuizPage = () => {
  const [quizType, setQuizType] = useState('reading');
  const [result, setResult] = useState([]);
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

  // Fetch movies
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchMoviesApi();
        setMovies(res);
      } catch { 
        setError('Không tải được danh sách phim.'); 
      }
    })();
  }, []);

  // Các hàm xử lý phụ đề
  const resetSubs = () => { 
    setSubList([]); 
    setSelectedLang(''); 
    setSubtitle(''); 
  };
  const loadSubtitles = async () => {
    setError(null); setSaveMsg(''); setResult(null); resetSubs();
    if (!selectedMovieId) return setError('Hãy chọn một phim trước.');
    setSubsLoading(true);
    try {
      const res = await fetchSubtitlesByMovie(selectedMovieId, 1);
      const list = res?.data || (Array.isArray(res) ? res : []);
      setSubList(list);
      if (!list.length) setError('Phim này chưa có phụ đề trong DB.');
    } catch (error) {
      setError(error?.response?.data?.message || error.message); 
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

  // Hàm CRUD khối câu hỏi
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

  // Hàm tự sinh quiz từ phụ đề
  const gentoratorQuiz = async () => {
    if (!subtitle.trim()) return setError('Hãy chọn phụ đề trước khi tự sinh quiz.');
    setLoading(true); 
    setError(null); 
    setSaveMsg('');
    try {
      const dataGenQuiz = await gentoratorQuizApi({ subtitle, quizType });
      const normalized = normalizeAI(dataGenQuiz);
      setResult(prev => (Array.isArray(prev) ? [...prev, ...normalized] : normalized));
    } 
    catch (error) { 
      setError(error?.response?.data?.message || error.message); 
    }
    finally { 
      setLoading(false); 
    }
  };

  // Hàm thêm quiz thủ công
  const addQuizManually = () => {
    setResult(prev => (
      Array.isArray(prev) ? [...prev, { passage: '', questions: [] }] : [{ passage: '', questions: [] }]
    ));
  };

  // Hàm lưu các quiz vào DB
  const saveAllToDB = async () => {
    if (!selectedMovieId) return setError('Hãy chọn phim trước khi lưu.');
    if (!Array.isArray(result) || !result.length) return setError('Không có dữ liệu quiz để lưu.');
    setSaving(true); setError(null); setSaveMsg('');
    try {
      const payloads = buildPayloads(selectedMovieId, quizType, result);
      await Promise.all(payloads.map(p => createQuizApi(p)));
      setSaveMsg(`Đã lưu thành công ${payloads.length} quizzes`);
      setResult(null); setSubtitle(''); setSelectedLang(''); setSubList([]);
    } catch (error) { 
      setError(`Lỗi khi lưu: ${error?.response?.data?.message || error.message}`); 
    }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-[#E4D161] mb-4">Create Quiz</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT BAR */}
          <div className="lg:col-span-1">
            <div className="bg-[#1B2A36] p-4 rounded-md border border-white/10 space-y-4">
              {/* Chọn loại bài tập */}
              <div>
                <label className="block text-sm mb-1">Chọn loại bài tập:</label>
                <select value={quizType} onChange={e => setQuizType(e.target.value)} className="w-full bg-[#14202A] text-white px-3 py-2 rounded-md focus:outline-none">
                  {QUIZ_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              {/* Chọn phim */}
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
                <button onClick={gentoratorQuiz} disabled={loading} className="px-4 py-2 bg-[#E4D161] text-black rounded-md font-semibold disabled:opacity-60">{loading ? 'Đang tạo...' : 'Sinh Quiz'}</button>
                <button onClick={addQuizManually} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-semibold">Tạo Quiz</button>
                {Array.isArray(result) && !!result.length && (
                  <button onClick={saveAllToDB} disabled={saving} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-md font-semibold disabled:opacity-60">{saving ? 'Đang lưu…' : 'Lưu Quiz'}</button>
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
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-t-transparent border-white/40 rounded-full mr-3" />
                  <span className="text-gray-300">Đang tạo quiz…</span>
                </div>
              ) : (!Array.isArray(result) || !result.length) ? (
                <p className="text-gray-400">Chưa có kết quả. Bạn có thể <b>Tải phụ đề → Sinh Quiz/ Tạo Quiz</b>.</p>
              ) : (
                <div className="space-y-6">
                  {result.map((quiz, idx) => (
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
                          <textarea 
                            className="w-full bg-[#0f1620] rounded p-3 text-gray-100 whitespace-pre-wrap outline-none border border-white/10" 
                            rows={4} 
                            value={quiz.passage ?? ''} 
                            onChange={e => { const next = [...result]; next[idx].passage = e.target.value; setResult(next) }} 
                            placeholder="Nhập đoạn Passage cho bài này (tuỳ chọn)..." />
                        </div>
                        {(quiz.questions || []).map((qs, i2) => (
                          <QuestionCard 
                            key={i2} 
                            q={qs} 
                            displayIndex={i2 + 1} 
                            onUpdate={nq => updateQuestion(idx, i2, nq)} 
                            onDelete={() => deleteQuestion(idx, i2)} 
                          />
                        ))}
                        {(!quiz.questions || quiz.questions.length === 0) && (
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

export default CreateQuizPage;