/* Helpers for quiz */
  
// Chuyển đổi đáp án chỉ số sang chữ
export const toLabel = (i) => ['A', 'B', 'C', 'D'][i] ?? 'A';

// Chuyển đổi đáp án chữ sang chỉ số
export const toIndex = (ans) => {
  if (Number.isInteger(ans)) return ans;
  const map = { A: 0, B: 1, C: 2, D: 3 };
  return map[String(ans || '').trim().toUpperCase()] ?? 0;
};

/* Helpers for subtitle */

// Định dạng thời gian từ HH:MM:SS,MMM sang giây (bao gồm mili giây)
export const timeToSeconds = (timeString) => {
  const [hours, minutes, secondsWithMs] = timeString.split(':')
  const [secs, ms = '0'] = secondsWithMs.split(/[,.]/)
  
  const totalSeconds = parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseInt(secs, 10)
  const milliseconds = parseInt(ms.padEnd(3, '0').slice(0, 3), 10) / 1000
  
  return totalSeconds + milliseconds
}

// Phân tích phụ đề từ văn bản SRT thành mảng { startTime, endTime, text }
export const parseSubtitlesFromText = (subtitleContent) => {
  if (!subtitleContent) return []

  const blocks = subtitleContent
    .replace(/\r/g, '') // Loại bỏ ký tự carriage return
    .replace(/^\uFEFF/, '') // Loại bỏ BOM nếu có
    .split(/\n\s*\n/)
    .filter((block) => block.trim())

  const subtitles = []

  for (const block of blocks) {
    const lines = block.trim().split('\n').filter(Boolean)
    if (lines.length < 2) continue

    // Bỏ dòng index nếu có
    const hasIndexLine = /^\d+$/.test(lines[0])
    const timeLine = (hasIndexLine ? lines[1] : lines[0]).trim()
    const times = timeLine.split('-->')
    if (times.length !== 2) continue

    const startTime = timeToSeconds(times[0].trim())
    const endTime = timeToSeconds(times[1].trim())
    if (Number.isNaN(startTime) || Number.isNaN(endTime)) continue

    const textLines = lines.slice(hasIndexLine ? 2 : 1)
    const text = textLines.join('\n').trim()
    if (!text) continue

    subtitles.push({ startTime, endTime, text })
  }

  return subtitles
}

// Kết hợp phụ đề song ngữ vào mảng { startTime, endTime, enText, viText }
export const mergeBiSubs = (enSubs = [], viSubs = []) => {
  const len = Math.max(enSubs.length, viSubs.length)
  const result = []

  for (let i = 0; i < len; i += 1) {
    const en = enSubs[i]
    const vi = viSubs[i]

    if (!en && !vi) continue

    result.push({
      startTime: en?.startTime ?? vi?.startTime ?? 0,
      endTime: en?.endTime ?? vi?.endTime ?? 0,
      enText: en?.text || '',
      viText: vi?.text || '',
    })
  }

  return result
}

// Định dạng thời gian từ giây sang HH:MM:SS
export const formatTime = (timeInSeconds = 0) => {
  const safeSeconds = Math.max(0, Math.floor(timeInSeconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = Math.floor(safeSeconds % 60)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// Tìm index phụ đề đang hoạt động theo thời gian hiện tại
export const findActiveIndex = (subs, timeCurrent) => {
  if (subs.length === 0) return -1
  
  // Binary search tìm câu cuối cùng có startTime <= timeCurrent
  let left = 0
  let right = subs.length - 1
  let result = -1
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    
    if (subs[mid].startTime <= timeCurrent) {
      result = mid
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  
  return result
}


/* Helpers for add quiz */

// Xử lý bỏ timestamp, số thứ tự
export const cleanSrtContent = (srtContent) => {
  if (!srtContent || typeof srtContent !== 'string') return '';

  // Regex để tách các subtitle entry
  const subtitleRegex = /\d+\s+\d{2}:\d{2}:\d{2},\d{3}\s+-->\s+\d{2}:\d{2}:\d{2},\d{3}\s+([\s\S]*?)(?=\n\d+\s+\d{2}:\d{2}:\d{2}|$)/g;
  
  const matches = [...srtContent.matchAll(subtitleRegex)];
  
  // Chỉ lấy phần text, loại bỏ dòng trống
  const textLines = matches
    .map(match => match[1].trim())
    .filter(line => line.length > 0);

  return textLines.join('\n');
};

// Cắt ngắn phụ đề xuống một độ dài tối đa
export const truncateSubtitle = (subtitle, maxLength = 15000) => {
  if (subtitle.length <= maxLength) return subtitle;
  
  // Cắt tại dấu xuống dòng gần nhất để không cắt ngang câu
  const truncated = subtitle.substring(0, maxLength);
  const lastNewline = truncated.lastIndexOf('\n');
  
  return lastNewline > 0 
    ? truncated.substring(0, lastNewline) 
    : truncated;
};

export const processSubtitle = (srtContent, maxLength = 70000) => {
  const cleaned = cleanSrtContent(srtContent);
  return truncateSubtitle(cleaned, maxLength);
};