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
  if (!movieId || !quizType) throw new Error('movie_id và quiz_type là bắt buộc khi lưu quiz')
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
