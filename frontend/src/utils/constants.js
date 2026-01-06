export const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:5001';

export const QUIZ_TYPES = [
  { value: 'reading', label: 'Đọc hiểu' },
  { value: 'dialogue_reordering', label: 'Sắp xếp hội thoại' },
  { value: 'translation', label: 'Dịch thuật' },
  { value: 'equivalent', label: 'Câu tương đương' },
];