import 'dotenv/config'
import fs from "fs";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const createSubtitle = async () => {
  const resp = await client.audio.transcriptions.create({
    file: fs.createReadStream("./src/eng.mp3"), // hoặc sample.mp4
    model: "whisper-1",
    response_format: "srt" // trả về file .srt
  });

  fs.writeFileSync("sample_en.srt", resp);
  console.log("Đã tạo xong sample_en.srt");
}

createSubtitle();
