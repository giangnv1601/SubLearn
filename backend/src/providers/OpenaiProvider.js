import OpenAI from 'openai';
import { env } from '../config/environment.js';

const apiKey = env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY is missing!');
}

// Khởi tạo OpenAI client
const openai = new OpenAI({ apiKey });
const MODEL = 'gpt-4.1';

// Các loại quiz
const QUIZ_TYPES = {
  READING: 'reading',
  DIALOGUE_REORDERING: 'dialogue_reordering',
  TRANSLATION: 'translation',
  EQUIVALENT: 'equivalent'
};

// Hàm tạo prompt dựa trên loại quiz và phụ đề
const getPromptFromSubtitle = (quizType, subtitle) => { 
  const prompts = {
    [QUIZ_TYPES.READING]: `
      Bạn là một giáo viên luyện thi TOEIC chuyên nghiệp.

      Dưới đây là nội dung phụ đề phim:

      [START OF MOVIE SUBTITLES]
      ${subtitle}
      [END OF MOVIE SUBTITLES]

      ===> Nhiệm vụ:
      Tạo 2 bài đọc hiểu tiếng anh theo dạng TOEIC Part 7:
      - Mỗi bài là một đoạn văn tóm tắt nội dung phim (khoảng 300 đến 350 từ)
      - Mỗi bài có 5 câu hỏi trắc nghiệm bằng tiếng anh
      - Trong 5 câu hỏi, bắt buộc phải có ít nhất 1 câu hỏi về từ đồng nghĩa (synonym) với format:
        * Câu hỏi: "The word 'X' in line Y, paragraph Z is closest in meaning to"
        * 4 lựa chọn là các từ/cụm từ tiếng Anh có nghĩa tương đương
        * Đáp án đúng và giải thích chi tiết
        * Trích dẫn câu chứa từ đó từ phụ đề
      - Các câu hỏi còn lại có thể là:
        * Câu hỏi về ý chính
        * Câu hỏi về chi tiết
        * Câu hỏi về suy luận
        * Câu hỏi về từ vựng khác

      ===> Output format:
      TRẢ VỀ DUY NHẤT MỘT MẢNG JSON KHÔNG CÓ BẤT KỲ KÝ TỰ ĐẶC BIỆT NÀO KHÁC.
      KHÔNG THÊM \`\`\`json, \`\`\` HOẶC BẤT KỲ ĐỊNH DẠNG MARKDOWN NÀO.
      KHÔNG THÊM BẤT KỲ CHÚ THÍCH HOẶC VĂN BẢN NÀO KHÁC.

      [
        {
          "passage": "Đoạn văn bài đọc 5",
          "questions": [
            {
              "question": "The word 'determined' in line 3, paragraph 1 is closest in meaning to",
              "options": ["A. decided", "B. confused", "C. worried", "D. excited"],
              "answer": "A",
              "explanation": "Trong ngữ cảnh này, 'determined' có nghĩa là 'đã quyết định' (decided), thể hiện sự kiên định trong quyết định của nhân vật",
              "quote": "Trích dẫn từ phụ đề liên quan"
            },
            {
              "question": "Câu hỏi thông thường khác?",
              "options": ["A. Lựa chọn A", "B. Lựa chọn B", "C. Lựa chọn C", "D. Lựa chọn D"],
              "answer": "B",
              "explanation": "Giải thích tại sao B là đáp án đúng",
              "quote": "Trích dẫn từ phụ đề liên quan"
            }
          ]
        }
      ]
    `,
    [QUIZ_TYPES.DIALOGUE_REORDERING]: `
      Bạn là một giáo viên luyện thi TOEIC chuyên nghiệp.

      Dưới đây là nội dung phụ đề phim:

      [START OF MOVIE SUBTITLES]
      ${subtitle}
      [END OF MOVIE SUBTITLES]

      ===> Nhiệm vụ:
      Tạo 5 bài tập sắp xếp hội thoại:
      - Mỗi bài là một đoạn hội thoại hoàn chỉnh từ phim (khoảng 5-7 câu) giữa 2 người trở lên
      - Các đoạn hội thoại phải:
        + Dựa trên nội dung từ phim nhưng được viết lại để tự nhiên và hấp dẫn hơn
        + Thêm các yếu tố giao tiếp tự nhiên như (well, actually, you know...), cảm thán ngắn (Really? Wow! ...), câu hỏi đuôi...
        + Giữ nguyên bối cảnh/ý chính, tiếng Anh chuẩn TOEIC
      - Mỗi câu được đánh số (1..n), sau đó ĐẢO LỘN thứ tự
      - Tạo 5 câu hỏi trắc nghiệm kiểm tra thứ tự đúng (4 lựa chọn là chuỗi số), kèm đáp án và giải thích

      ===> Output format:
      TRẢ VỀ DUY NHẤT MỘT MẢNG JSON, KHÔNG THÊM BẤT KỲ VĂN BẢN NÀO KHÁC.

      [
        {
          "passage": "1. Emma: ...\\n2. James: ...\\n3. Emma: ...\\n4. James: ...\\n5. Emma: ...",
          "questions": [
            {
              "question": "Sắp xếp các câu hội thoại theo thứ tự đúng:",
              "options": ["A. 2,1,3,4,5", "B. 1,2,3,4,5", "C. 3,2,1,4,5", "D. 1,3,2,4,5"],
              "answer": "B",
              "explanation": "Giải thích tại sao thứ tự 1,2,3,4,5 là đúng",
              "quote": "Trích dẫn từ phụ đề liên quan"
            }
          ]
        }
      ]
    `,
    [QUIZ_TYPES.TRANSLATION]: `
      Bạn là một giáo viên luyện thi TOEIC chuyên nghiệp.

      [START OF MOVIE SUBTITLES]
      ${subtitle}
      [END OF MOVIE SUBTITLES]

      ===> Nhiệm vụ:
      Tạo 5 bài tập dịch câu:
      - Chọn 5 câu tiếng Anh từ phụ đề
      - Mỗi câu tạo 4 lựa chọn dịch tiếng Việt (1 đúng), kèm giải thích

      ===> Output format:
      CHỈ TRẢ VỀ MẢNG JSON.

      [
        {
          "passage": null,
          "questions": [
            {
              "question": "Dịch câu sau: 'I have been waiting for you for hours.'",
              "options": ["A. Tôi đã đợi bạn nhiều giờ", "B. Tôi đang đợi bạn nhiều giờ", "C. Tôi sẽ đợi bạn nhiều giờ", "D. Tôi đã đợi bạn"],
              "answer": "A",
              "explanation": "Giải thích về thì và cách dịch",
              "quote": "I have been waiting for you for hours."
            }
          ]
        },
        ...
      ]
    `,
    [QUIZ_TYPES.EQUIVALENT]: `
      Bạn là một giáo viên luyện thi TOEIC chuyên nghiệp.

      [START OF MOVIE SUBTITLES]
      ${subtitle}
      [END OF MOVIE SUBTITLES]

      ===> Nhiệm vụ:
      Tạo 5 bài tập chọn câu tương đương:
      - Chọn 5 câu tiếng Việt (từ phụ đề/diễn giải)
      - Mỗi câu tạo 4 lựa chọn tiếng Anh tương đương (1 đúng), kèm giải thích

      ===> Output format:
      CHỈ TRẢ VỀ MẢNG JSON.

      [
        {
          "passage": null,
          "questions": [
            {
              "question": "Chọn câu tiếng Anh tương đương với: 'Tôi đã đợi bạn nhiều giờ.'",
              "options": ["A. I am waiting for you for hours", "B. I have been waiting for you for hours", "C. I will wait for you for hours", "D. I waited for you for hours"],
              "answer": "B",
              "explanation": "Giải thích về thì và cách dịch",
              "quote": "Tôi đã đợi bạn nhiều giờ."
            }
          ]
        },
        ...
      ]
    `,
  };
  return prompts[quizType];
};

const getPromptForMovieInteraction = (segmentSubtitle, mcqNum, fill_blankNum, true_falseNum) => `
Bạn là chuyên gia tạo bài tập tiếng Anh từ một đoạn phụ đề phim.

Nhiệm vụ của bạn: tạo ra **đúng ${mcqNum + fill_blankNum + true_falseNum} câu hỏi tương tác** từ đoạn phụ đề cung cấp.  
Trong đó:

1. Có ${mcqNum} câu "mcq" — trắc nghiệm 4 lựa chọn  
2. Có ${fill_blankNum} câu "fill_blank" — điền từ vào chỗ trống (che đúng 1 từ)  
3. Có ${true_falseNum} câu "true_false" — câu đúng / sai  

==============================
YÊU CẦU SỐ LƯỢNG VÀ CẤU TRÚC
==============================
- Tổng cộng **${mcqNum + fill_blankNum + true_falseNum} câu hỏi**.
- Phân bố bắt buộc:
  - ${mcqNum} câu type "mcq"
  - ${fill_blankNum} câu type "fill_blank"
  - ${true_falseNum} câu type "true_false"

==============================
YÊU CẦU CHUNG
==============================
- Mọi câu hỏi đều phải bám sát nội dung phụ đề.
- KHÔNG được bịa thêm các sự kiện không có trong đoạn phim.
- Ngắn gọn, rõ ràng, phù hợp người học tiếng Anh.
- Câu hỏi phải có độ khó vừa phải, phù hợp với người học tiếng Anh trung bình.

==============================
YÊU CẦU THEO TỪNG LOẠI
==============================

### Loại "mcq" (Multiple Choice Question)
- "question": câu hỏi bằng tiếng Anh về nội dung phim
- "options": mảng đúng 4 chuỗi (không có A/B/C/D prefix)
- "answer": nội dung của đáp án đúng (KHÔNG phải "A", "B", "C", "D")
- "explanation": giải thích tại sao đáp án đúng (bằng tiếng Việt)

Ví dụ:
{
  "type": "mcq",
  "question": "What was the main reason for the Cardinal War?",
  "options": [
    "Power struggle between kingdoms",
    "Religious conflict",
    "Territory expansion",
    "Economic crisis"
  ],
  "answer": "Power struggle between kingdoms",
  "explanation": "Theo phụ đề, cuộc chiến Cardinal là cuộc tranh giành quyền lực giữa các vương quốc."
}

### Loại "fill_blank" (Fill in the Blank)
- "sentence": câu tiếng Anh lấy từ phụ đề, che **chính xác 1 từ** bằng "______" (6 dấu gạch dưới)
- "answer": từ bị che (chỉ 1 từ đơn, viết thường)
- "explanation": giải thích nghĩa của từ và vai trò trong câu (bằng tiếng Việt)
- Không che động từ to be, mạo từ, giới từ đơn giản
- Ưu tiên che danh từ, động từ chính, tính từ quan trọng

Ví dụ:
{
  "type": "fill_blank",
  "sentence": "The conflict reached a bloody and ______ conclusion.",
  "answer": "decisive",
  "explanation": "'Decisive' nghĩa là 'quyết định', mô tả kết cục của cuộc chiến là dứt khoát, không còn tranh cãi."
}

### Loại "true_false" (True/False Statement)
- "statement": câu khẳng định bằng tiếng Anh về nội dung phim
- "answer": "True" hoặc "False" (viết hoa chữ cái đầu)
- "explanation": giải thích tại sao đúng/sai dựa trên phụ đề (bằng tiếng Việt)
- Nếu thông tin không rõ ràng trong phụ đề → "False"

Ví dụ:
{
  "type": "true_false",
  "statement": "King Konrad ruled with absolute power after winning the war.",
  "answer": "True",
  "explanation": "Phụ đề nói rõ 'his power absolute' - quyền lực của ông là tuyệt đối sau khi thắng trận."
}

==============================
CHỈ TRẢ VỀ JSON THUẦN
==============================
- KHÔNG được trả markdown
- KHÔNG được dùng \`\`\`json hoặc \`\`\`
- KHÔNG có giải thích, chỉ có JSON
- KHÔNG có text ngoài JSON
- PHẢI đảm bảo JSON hợp lệ, có thể parse được

Cấu trúc JSON bắt buộc:

{
  "questions": [
    {
      "type": "mcq",
      "question": "câu hỏi tiếng Anh?",
      "options": ["option1", "option2", "option3", "option4"],
      "answer": "option đúng (không phải A/B/C/D)",
      "explanation": "giải thích tiếng Việt"
    },
    {
      "type": "fill_blank",
      "sentence": "Câu có ______ cần điền.",
      "answer": "từ cần điền",
      "explanation": "giải thích tiếng Việt"
    },
    {
      "type": "true_false",
      "statement": "Câu khẳng định tiếng Anh.",
      "answer": "True",
      "explanation": "giải thích tiếng Việt"
    }
  ]
}

==============================
ĐOẠN PHỤ ĐỀ DÙNG ĐỂ TẠO CÂU HỎI
==============================

[START OF SUBTITLE]
${segmentSubtitle}
[END OF SUBTITLE]

LƯU Ý QUAN TRỌNG:
- Phải có đúng ${mcqNum} câu mcq, ${fill_blankNum} câu fill_blank, ${true_falseNum} câu true_false
- Tổng số câu hỏi: ${mcqNum + fill_blankNum + true_falseNum}
- Không được thiếu hoặc thừa câu nào
`;

// Hàm tạo quiz bằng OpenAI
const generateQuiz = async (subtitle, quizType = QUIZ_TYPES.READING, {
  model = MODEL,
  temperature = 0.7, // độ sáng tạo
  top_p = 0.95, // lọc theo xác suất
  max_tokens = 8000, // giới hạn token
} = {}) => {

  try {
    const prompt = getPromptFromSubtitle(quizType, subtitle);

    const resp = await openai.chat.completions.create({
      model,
      temperature,
      top_p,
      max_tokens,
      messages: [
        { role: 'system', content: 'You are a helpful assistant that ONLY replies with valid JSON when asked.' },
        { role: 'user', content: prompt },
      ],
    });

    let text = resp?.choices?.[0]?.message?.content ?? '';
    // Xóa các đoạn `json ...` kèm theo khoảng trắng nếu có
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    // parse JSON
    const data = JSON.parse(text);
    return data;
  } catch (err) {
    const msg = err?.response?.data?.error?.message || err.message || 'OpenAI error';
    throw new Error(`Lỗi tạo quiz (OpenAI): ${msg}`);
  }
}

// Hàm tạo bài tập tương tác phim
const generateInteractiveQuiz = async (segmentSubtitle, mcqNum, fill_blankNum, true_falseNum, {
  model = MODEL,
  temperature = 0.7,
  top_p = 0.95,
  max_tokens = 4000,
} = {}) => {
  try {
    const prompt = getPromptForMovieInteraction(segmentSubtitle, mcqNum, fill_blankNum, true_falseNum);

    const resp = await openai.chat.completions.create({
      model,
      temperature,
      top_p,
      max_tokens,
      messages: [
        {
          role: 'system',
          content: `You are a JSON-only engine. Reply ONLY with valid JSON. No markdown. No commentary. No backticks.`
        },
        { role: 'user', content: prompt }
      ],
    });

    let text = resp?.choices?.[0]?.message?.content ?? '';

    // Remove markdown code blocks
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    // Extract JSON safely
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Không tìm thấy JSON hợp lệ trong response.");
    }

    const data = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error("Response không có trường 'questions' hoặc không phải mảng.");
    }

    // Validate số lượng câu hỏi
    const expectedTotal = mcqNum + fill_blankNum + true_falseNum;
    if (data.questions.length !== expectedTotal) {
      throw new Error(`Sai số lượng câu hỏi — cần đúng ${expectedTotal} câu, nhận được ${data.questions.length} câu.`);
    }

    // Validate từng loại câu hỏi
    const mcqCount = data.questions.filter(q => q.type === 'mcq').length;
    const fillBlankCount = data.questions.filter(q => q.type === 'fill_blank').length;
    const trueFalseCount = data.questions.filter(q => q.type === 'true_false').length;

    if (mcqCount !== mcqNum) {
      throw new Error(`Sai số lượng câu MCQ — cần ${mcqNum}, nhận được ${mcqCount}`);
    }
    if (fillBlankCount !== fill_blankNum) {
      throw new Error(`Sai số lượng câu Fill Blank — cần ${fill_blankNum}, nhận được ${fillBlankCount}`);
    }
    if (trueFalseCount !== true_falseNum) {
      throw new Error(`Sai số lượng câu True/False — cần ${true_falseNum}, nhận được ${trueFalseCount}`);
    }

    // Validate structure của từng câu hỏi
    for (const q of data.questions) {
      if (q.type === 'mcq') {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.answer || !q.explanation) {
          throw new Error(`Câu MCQ không hợp lệ: thiếu trường bắt buộc hoặc options không đủ 4`);
        }
      } else if (q.type === 'fill_blank') {
        if (!q.sentence || !q.answer || !q.explanation) {
          throw new Error(`Câu Fill Blank không hợp lệ: thiếu trường bắt buộc`);
        }
        if (!q.sentence.includes('______')) {
          throw new Error(`Câu Fill Blank phải có "______"`);
        }
      } else if (q.type === 'true_false') {
        if (!q.statement || !q.answer || !q.explanation) {
          throw new Error(`Câu True/False không hợp lệ: thiếu trường bắt buộc`);
        }
        if (q.answer !== 'True' && q.answer !== 'False') {
          throw new Error(`Câu True/False answer phải là "True" hoặc "False"`);
        }
      } else {
        throw new Error(`Loại câu hỏi không hợp lệ: ${q.type}`);
      }
    }

    return data;

  } catch (err) {
    const msg = err?.response?.data?.error?.message || err.message;
    throw new Error(`Lỗi tạo câu hỏi tương tác phim: ${msg}`);
  }
};

export const OpenaiProvider = { generateQuiz, generateInteractiveQuiz };
