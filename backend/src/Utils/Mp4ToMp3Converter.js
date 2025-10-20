import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { Readable } from 'stream'; // Import Readable for type checking/hinting

// Cấu hình fluent-ffmpeg để sử dụng binary từ ffmpeg-static
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Checks if a given string is a valid URL.
 * @param {string} str The string to check.
 * @returns {boolean} True if the string is a valid URL, false otherwise.
 */
function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Converts an MP4 file (from a local path or URL) or a ReadableStream to an MP3 file.
 * @param {string|Readable} input - The path to the input MP4 file, a URL, or a ReadableStream.
 * @param {string} outputPath - The desired path for the output MP3 file.
 * @returns {Promise<string>} A promise that resolves with the outputPath if successful,
 *   or rejects with an error if the conversion fails.
 */
const convertMp4ToMp3=async(input, outputPath) => {
  return new Promise((resolve, reject) => {
    // fluent-ffmpeg có thể xử lý cả đường dẫn file cục bộ, URL và ReadableStream trực tiếp
    ffmpeg(input)
      .noVideo() // Chỉ giữ lại audio
      .audioCodec('libmp3lame') // Mã hóa audio sang MP3
      .on('end', () => {
        const inputDescription = input instanceof Readable ? 'stream' : input;
        console.log(`Conversion of "${inputDescription}" to "${outputPath}" finished.`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        const inputDescription = input instanceof Readable ? 'stream' : input;
        console.error(`Conversion of "${inputDescription}" failed: ${err.message}`);
        reject(new Error(`Conversion failed: ${err.message}`));
      })
      .save(outputPath);
  });
}

export default convertMp4ToMp3;
