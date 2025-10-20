import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import convertMp4ToMp3 from './Utils/Mp4ToMp3Converter.js';

// Trong ES Modules, __dirname không còn khả dụng.
// Chúng ta tạo ra __dirname bằng cách sử dụng import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runTest = async () => {
  const inputMp4Path = path.resolve(__dirname, 'Assets', 'input.mp4');
  const outputMp3Path = path.resolve(__dirname, 'Assets', 'output.mp3');

  console.log(`Starting conversion test for: ${inputMp4Path}`);
  console.log(`Output will be saved to: ${outputMp3Path}`);

  try {
    // Kiểm tra xem file input.mp4 có tồn tại không
    if (!fs.existsSync(inputMp4Path)) {
      console.error(`Error: Input file not found at ${inputMp4Path}`);
      console.error("Please make sure 'input.mp4' exists in the 'backend/src/Assets' directory.");
      return;
    }

    // Tạo một ReadableStream từ file MP4 đầu vào
    const readStream = fs.createReadStream(inputMp4Path);

    // Thực hiện chuyển đổi
    const resultPath = await convertMp4ToMp3(readStream, outputMp3Path);
    console.log(`Test successful! MP3 saved to: ${resultPath}`);
  } catch (error) {
    console.error(`Test failed: ${error.message}`);
  }
};

runTest();
