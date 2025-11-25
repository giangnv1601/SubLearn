import { useEffect, useState } from 'react'
import OptionRow from './OptionRow/OptionRow.jsx';

const QuestionCard = ({ q, onUpdate, onDelete, displayIndex }) => {
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
            <div className="font-medium">
              <span className="text-[#E4D161] mr-2">Q{displayIndex}.</span>{q.question || '(Chưa có nội dung câu hỏi)'}
            </div>
            {Array.isArray(q.options) && q.options.length > 0 && (
              <ul className="list-disc ml-6 mt-2 text-gray-200 space-y-1">
                {q.options.map((op, i) => (
                  <li key={i}>
                    {op || <span className="opacity-50">(trống)</span>} {q.answer === i && <span className="text-emerald-400">(Correct)</span>}
                  </li>
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
      <textarea 
        value={form.question} 
        onChange={e => setField('question', e.target.value)} 
        className="w-full bg-[#0b121a] border border-white/10 rounded p-2 text-sm outline-none" 
        placeholder="Nội dung câu hỏi..." 
        rows={2} 
      />
      <div className="grid gap-2">
        {form.options.map((op, i) => (
          <OptionRow 
            key={i} 
            idx={i} 
            value={op} 
            isCorrect={form.answer === i} 
            onChange={changeOption} 
            onChooseCorrect={idx => setField('answer', idx)} onRemove={idx => removeOption(idx)} 
            canRemove={form.options.length > 2} />
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

export default QuestionCard