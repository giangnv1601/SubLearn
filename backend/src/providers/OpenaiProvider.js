import OpenAI from 'openai';
import { env } from '../config/environment.js';

const apiKey = env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY is missing!');
}

// Khởi tạo OpenAI client
const openai = new OpenAI({ apiKey });
const MODEL = 'gpt-4.1';

// Thêm định nghĩa QUIZ_TYPES
const QUIZ_TYPES = {
  READING: 'reading',
  DIALOGUE_REORDERING: 'dialogue_reordering',
  TRANSLATION: 'translation',
  EQUIVALENT: 'equivalent'
};

// Hàm tạo prompt dựa trên loại quiz và phụ đề
const getPromptFromSubtitle = (subtitle, quizType, count = 2) => { 
  const prompts = {
    [QUIZ_TYPES.READING]: `
      Bạn là một giáo viên luyện thi TOEIC chuyên nghiệp.

      Dưới đây là nội dung phụ đề phim:

      [START OF MOVIE SUBTITLES]
      ${subtitle}
      [END OF MOVIE SUBTITLES]

      ===> Nhiệm vụ:
      Tạo ${count} bài đọc hiểu tiếng Anh theo dạng TOEIC Part 7:
      - Mỗi bài là một đoạn văn tóm tắt nội dung phim (khoảng 250-300 từ)
      - Đoạn văn phải có cấu trúc rõ ràng với 3-4 đoạn
      - Mỗi bài có ĐÚNG 5 câu hỏi trắc nghiệm bằng tiếng Anh
      - Trong 5 câu hỏi, BẮT BUỘC phải có ít nhất 1 câu về từ đồng nghĩa (synonym):
        * Format câu hỏi: "The word '[từ]' in line [số], paragraph [số] is closest in meaning to"
        * [từ] phải là từ vựng quan trọng có trong đoạn văn (danh từ, động từ, tính từ)
        * 4 lựa chọn phải là các từ/cụm từ tiếng Anh ở cùng loại từ
        * Các lựa chọn sai phải hợp lý nhưng khác nghĩa rõ ràng
      - Các câu hỏi còn lại (4 câu) phân bố như sau:
        * 1 câu về ý chính (main idea): "What is the main purpose/idea of the passage?"
        * 2 câu về chi tiết (details): "According to the passage, what/when/where/why..."
        * 1 câu về suy luận (inference): "What can be inferred/suggested/implied..."

      ===> Yêu cầu chất lượng:
      - Đoạn văn phải súc tích, mạch lạc, văn phong học thuật
      - Câu hỏi phải đa dạng về độ khó (dễ - trung bình - khó)
      - Tất cả câu hỏi phải có thể trả lời DỰA TRÊN ĐOẠN VĂN
      - **QUAN TRỌNG: Trường "explanation" và "quote" BẮT BUỘC phải viết bằng TIẾNG VIỆT**
      - Giải thích phải rõ ràng, trích dẫn cụ thể từ đoạn văn

      ===> Output format:
      CHỈ TRẢ VỀ MỘT MẢNG JSON THUẦN TUẦN, KHÔNG CÓ BẤT KỲ KÝ TỰ ĐẶC BIỆT NÀO.
      KHÔNG THÊM \`\`\`json, \`\`\` HOẶC BẤT KỲ MARKDOWN NÀO.
      KHÔNG THÊM CHÚ THÍCH.

      [
        {
          "passage": "Đoạn văn bài đọc với cấu trúc rõ ràng (TIẾNG ANH)...",
          "questions": [
            {
              "question": "The word 'determined' in line 3, paragraph 1 is closest in meaning to",
              "options": ["A. decided", "B. confused", "C. worried", "D. excited"],
              "answer": "A",
              "explanation": "Trong ngữ cảnh 'She was determined to succeed', từ 'determined' mang nghĩa 'quyết tâm' (decided), thể hiện sự kiên định. Các từ khác không phù hợp: confused (bối rối), worried (lo lắng), excited (phấn khích).",
              "quote": "She was determined to succeed despite many challenges."
            },
            {
              "question": "What is the main idea of the passage?",
              "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
              "answer": "B",
              "explanation": "Ý chính của đoạn văn là... (GIẢI THÍCH BẰNG TIẾNG VIỆT CHI TIẾT)",
              "quote": "Trích dẫn từ đoạn văn (câu tiếng Anh gốc)"
            },
            {
              "question": "According to the passage, what happened first?",
              "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
              "answer": "C",
              "explanation": "Theo đoạn văn, sự kiện đầu tiên là... (GIẢI THÍCH BẰNG TIẾNG VIỆT)",
              "quote": "Trích dẫn câu tiếng Anh chứng minh"
            }
          ]
        },
        ... (tổng ${count} objects)
      ]

      ===> LƯU Ý CỰC KỲ QUAN TRỌNG:
      - "passage": viết bằng TIẾNG ANH (đoạn văn đọc hiểu)
      - "question": viết bằng TIẾNG ANH (câu hỏi)
      - "options": viết bằng TIẾNG ANH (các lựa chọn)
      - "answer": chữ cái A/B/C/D
      - "explanation": BẮT BUỘC phải viết bằng TIẾNG VIỆT, giải thích chi tiết tại sao đáp án đúng
      - "quote": câu tiếng Anh trích từ passage làm bằng chứng
    `,
    [QUIZ_TYPES.DIALOGUE_REORDERING]: `
      Bạn là một giáo viên luyện thi TOEIC chuyên nghiệp.

      [START OF MOVIE SUBTITLES]
      ${subtitle}
      [END OF MOVIE SUBTITLES]

      ===> Nhiệm vụ:
      Tạo ĐÚNG ${count} bài tập sắp xếp hội thoại (PHẢI TRẢ VỀ ${count} OBJECTS):
      - Mỗi bài là một đoạn hội thoại hoàn chỉnh (5-7 câu) giữa 2-3 người
      - Hội thoại phải:
        + Có tình huống rõ ràng (gặp gỡ, thảo luận công việc, mua sắm...)
        + Sử dụng các mẫu câu giao tiếp tự nhiên (Well, Actually, You know, I mean...)
        + Có các marker từ vựng (First, Then, However, By the way...)
        + Logic chặt chẽ, dễ suy luận thứ tự
      - Đánh số từ 1 đến n, SAU ĐÓ ĐẢO LỘN thứ tự hoàn toàn
      - Mỗi bài có 1 câu hỏi: "Sắp xếp các câu hội thoại theo thứ tự đúng"
      - 4 lựa chọn là 4 chuỗi số khác nhau (trong đó chỉ có 1 đúng)

      ===> Output format:
      CHỈ TRẢ VỀ MẢNG JSON GỒM ĐÚNG ${count} OBJECTS.

      [
        {
          "passage": "3. Sarah: Well, I think we should start with the budget.\n1. Tom: Good morning everyone. Let's begin our meeting.\n5. Sarah: That makes sense. I'll prepare the report.\n2. Mark: Sounds good. What's our first topic?\n4. Tom: Actually, let's discuss the timeline first.",
          "questions": [
            {
              "question": "Sắp xếp các câu hội thoại theo thứ tự đúng:",
              "options": ["A. 1,2,4,3,5", "B. 1,3,2,4,5", "C. 3,1,2,4,5", "D. 1,2,3,4,5"],
              "answer": "A",
              "explanation": "Thứ tự đúng là 1,2,4,3,5: Tom mở đầu cuộc họp (1) → Mark hỏi chủ đề (2) → Tom đề xuất timeline trước (4) → Sarah đề xuất ngân sách (3) → Sarah nhận task (5)",
              "quote": "Từ hội thoại phim"
            }
          ]
        },
        ... (tổng ${count} objects)
      ]
    `,
    [QUIZ_TYPES.TRANSLATION]: `
      Bạn là một giáo viên luyện thi TOEIC chuyên nghiệp.

      [START OF MOVIE SUBTITLES]
      ${subtitle}
      [END OF MOVIE SUBTITLES]

      ===> Nhiệm vụ:
      Tạo ĐÚNG ${count} bài tập dịch câu (PHẢI TRẢ VỀ ${count} OBJECTS):
      - Chọn ${count} câu tiếng Anh KHÁC NHAU từ phụ đề (độ dài 10-20 từ)
      - Ưu tiên câu có cấu trúc ngữ pháp đặc biệt (thì, bị động, câu điều kiện...)
      - MỖI OBJECT chứa 1 câu hỏi duy nhất với 4 bản dịch tiếng Việt (1 đúng, 3 sai)
      - Các bản dịch sai phải sai về:
        + Thì (quá khứ/hiện tại/tương lai)
        + Nghĩa từ vựng
        + Cấu trúc ngữ pháp

      ===> Output format:
      CHỈ TRẢ VỀ MẢNG JSON GỒM ĐÚNG ${count} OBJECTS (MỖI OBJECT = 1 CÂU HỎI).

      [
        {
          "passage": null,
          "questions": [
            {
              "question": "Dịch câu sau sang tiếng Việt: 'I have been waiting for you for hours.'",
              "options": [
                "A. Tôi đã đợi bạn nhiều giờ rồi.",
                "B. Tôi đang đợi bạn nhiều giờ.",
                "C. Tôi sẽ đợi bạn nhiều giờ.",
                "D. Tôi đợi bạn."
              ],
              "answer": "A",
              "explanation": "Thì hiện tại hoàn thành tiếp diễn (have been waiting) diễn tả hành động bắt đầu trong quá khứ và còn tiếp diễn đến hiện tại. 'For hours' nhấn mạnh khoảng thời gian. Đáp án A dịch đúng nghĩa và thì. B sai vì dùng hiện tại tiếp diễn, C sai vì dùng tương lai, D thiếu 'nhiều giờ'.",
              "quote": "I have been waiting for you for hours."
            }
          ]
        },
        {
          "passage": null,
          "questions": [
            {
              "question": "Dịch câu sau sang tiếng Việt: 'She would go if she had time.'",
              "options": [
                "A. Cô ấy sẽ đi nếu có thời gian.",
                "B. Cô ấy đã đi nếu có thời gian.",
                "C. Cô ấy đang đi nếu có thời gian.",
                "D. Cô ấy đi nếu có thời gian."
              ],
              "answer": "A",
              "explanation": "Câu điều kiện loại 2 (would go / had) diễn tả điều không có thật ở hiện tại. Đáp án A dịch đúng. B sai vì dùng quá khứ, C sai vì dùng hiện tại tiếp diễn, D thiếu 'sẽ'.",
              "quote": "She would go if she had time."
            }
          ]
        },
        ... (tổng ${count} objects)
      ]
    `,
    [QUIZ_TYPES.EQUIVALENT]: `
      Bạn là một giáo viên luyện thi TOEIC chuyên nghiệp.

      [START OF MOVIE SUBTITLES]
      ${subtitle}
      [END OF MOVIE SUBTITLES]

      ===> Nhiệm vụ:
      Tạo ĐÚNG ${count} bài tập chọn câu tương đương (PHẢI TRẢ VỀ ${count} OBJECTS):
      - Chọn ${count} câu tiếng Việt KHÁC NHAU từ nghĩa của phụ đề
      - MỖI OBJECT chứa 1 câu hỏi duy nhất với 4 lựa chọn tiếng Anh (1 đúng, 3 sai)
      - Các lựa chọn sai phải hợp lý nhưng sai rõ:
        + Sai thì
        + Sai cấu trúc câu
        + Sai từ vựng then chốt

      ===> Output format:
      CHỈ TRẢ VỀ MẢNG JSON GỒM ĐÚNG ${count} OBJECTS (MỖI OBJECT = 1 CÂU HỎI).

      [
        {
          "passage": null,
          "questions": [
            {
              "question": "Chọn câu tiếng Anh tương đương với: 'Tôi đã đợi bạn nhiều giờ rồi.'",
              "options": [
                "A. I am waiting for you for hours.",
                "B. I have been waiting for you for hours.",
                "C. I will wait for you for hours.",
                "D. I waited for you for hours."
              ],
              "answer": "B",
              "explanation": "Câu tiếng Việt 'đã...rồi' thể hiện hành động bắt đầu trong quá khứ và còn tiếp diễn → dùng Present Perfect Continuous (have been waiting). A sai vì dùng hiện tại tiếp diễn, C sai vì dùng tương lai, D sai vì quá khứ đơn không thể hiện tính liên tục đến hiện tại.",
              "quote": "Tôi đã đợi bạn nhiều giờ rồi."
            }
          ]
        },
        {
          "passage": null,
          "questions": [
            {
              "question": "Chọn câu tiếng Anh tương đương với: 'Cô ấy sẽ đi nếu có thời gian.'",
              "options": [
                "A. She goes if she has time.",
                "B. She would go if she had time.",
                "C. She will go if she has time.",
                "D. She went if she had time."
              ],
              "answer": "B",
              "explanation": "Câu điều kiện loại 2 (would go / had) diễn tả điều không có thật ở hiện tại. Đáp án B đúng. A sai vì dùng hiện tại đơn, C sai vì điều kiện loại 1, D sai vì quá khứ.",
              "quote": "Cô ấy sẽ đi nếu có thời gian."
            }
          ]
        },
        ... (tổng ${count} objects)
      ]
    `,
  };
  return prompts[quizType] || prompts[QUIZ_TYPES.READING];
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
const generateQuiz = async (subtitle, quizType, count, {
  model = MODEL,
  temperature = 0.7,
  top_p = 0.95,
  max_tokens = 8000,
} = {}) => {
  // Validation đầu vào
  if (typeof subtitle !== 'string' || !subtitle.trim()) {
    throw new Error('subtitle phải là chuỗi không rỗng');
  }
  if (!Object.values(QUIZ_TYPES).includes(quizType)) {
    throw new Error(`quizType không hợp lệ. Phải là một trong: ${Object.values(QUIZ_TYPES).join(', ')}`);
  }
  if (!Number.isInteger(count) || count < 1 || count > 10) {
    throw new Error('count phải là số nguyên từ 1 đến 10');
  }

  try {
    const prompt = getPromptFromSubtitle(subtitle, quizType, count);
    
    //console.log(`Đang tạo ${count} bài quiz loại '${quizType}'...`);

    const resp = await openai.chat.completions.create({
      model,
      temperature,
      top_p,
      max_tokens,
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional TOEIC teacher. You ONLY reply with valid JSON arrays. No markdown, no commentary, no code blocks.' 
        },
        { role: 'user', content: prompt },
      ],
    });

    let text = resp?.choices?.[0]?.message?.content ?? '';
    //console.log('OpenAI raw response (first 200 chars):', text.substring(0, 200));

    // Xóa markdown
    text = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

    // Tìm JSON array
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Không tìm thấy JSON array. Full response:', text);
      throw new Error('OpenAI không trả về JSON array hợp lệ');
    }

    const data = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!Array.isArray(data) || data.length !== count) {
      throw new Error(`Kỳ vọng ${count} bài quiz, nhận được ${data?.length ?? 0}`);
    }

    // Validate từng bài quiz
    data.forEach((quiz, idx) => {
      if (!quiz.questions || !Array.isArray(quiz.questions)) {
        throw new Error(`Quiz ${idx + 1}: thiếu trường 'questions' hoặc không phải array`);
      }
      quiz.questions.forEach((q, qIdx) => {
        if (!q.question || !q.options || !q.answer || !q.explanation) {
          throw new Error(`Quiz ${idx + 1}, câu ${qIdx + 1}: thiếu trường bắt buộc`);
        }
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Quiz ${idx + 1}, câu ${qIdx + 1}: options phải có đúng 4 phần tử`);
        }
      });
    });

    //console.log(`Tạo thành công ${count} bài quiz`);
    return data;

  } catch (err) {
    console.error('Lỗi generateQuiz:', err);
    const msg = err?.response?.data?.error?.message || err.message || 'OpenAI error';
    throw new Error(`Lỗi tạo quiz: ${msg}`);
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

export const OpenaiProvider = { generateQuiz, generateInteractiveQuiz, QUIZ_TYPES };
