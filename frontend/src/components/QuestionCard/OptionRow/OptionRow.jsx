import { toLabel } from '@/utils/helpers.js';

const OptionRow = ({ idx, value, isCorrect, onChange, onChooseCorrect, onRemove, canRemove }) => {
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

export default OptionRow