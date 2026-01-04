export const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:5001';

export const QUIZ_TYPES = [
  { value: 'reading', label: 'Reading' },
  { value: 'dialogue_reordering', label: 'Dialogue Reordering' },
  { value: 'translation', label: 'Translation' },
  { value: 'equivalent', label: 'Equivalent' },
];