import { GoogleGenerativeAI } from "@google/generative-ai";
import { QuizData } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is missing. Check .env file");
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export const generateQuiz = async (
  input: string,
  mode: 'text' | 'url',
  fileData?: { mimeType: string; data: string }
): Promise<QuizData> => {
  try {
    // CHUYỂN VỀ MODEL GEMINI-PRO (Ổn định nhất)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Hướng dẫn chi tiết cho Gemini Pro để trả về đúng JSON
    const systemPrompt = `
      Bạn là trợ lý giáo dục AI-hue-Quiz.
      Nhiệm vụ: Tạo bài kiểm tra trắc nghiệm từ nội dung người dùng cung cấp.
      
      YÊU CẦU BẮT BUỘC VỀ ĐỊNH DẠNG (JSON):
      Chỉ trả về duy nhất một chuỗi JSON hợp lệ, không có Markdown, không có dấu backtick (\`\`\`).
      Cấu trúc JSON phải chính xác như sau:
      {
        "mcqs": [
          {
            "question": "Câu hỏi trắc nghiệm 1",
            "options": ["A", "B", "C", "D"],
            "correctAnswerIndex": 0,
            "explanation": "Giải thích"
          }
          // ... thêm 14 câu nữa (tổng 15 câu)
        ],
        "tfqs": [
          {
            "question": "Câu hỏi đúng sai 1",
            "isTrue": true,
            "explanation": "Giải thích"
          }
          // ... thêm 4 câu nữa (tổng 5 câu)
        ]
      }
      
      Nội dung cần xử lý:
    `;

    let promptParts: any[] = [systemPrompt];

    if (mode === 'url') {
      promptParts.push(`Hãy phân tích nội dung từ đường dẫn này: ${input}`);
    } else if (mode === 'text' && !fileData) {
      promptParts.push(`Phân tích văn bản sau:\n\n${input}`);
    } else if (fileData) {
      promptParts.push({
        inlineData: {
          mimeType: fileData.mimeType,
          data: fileData.data
        }
      });
      promptParts.push(input || "Tạo bài kiểm tra từ file đính kèm.");
    }

    const result = await model.generateContent(promptParts);
    const response = await result.response;
    let text = response.text();

    if (!text) throw new Error("Không nhận được phản hồi từ AI.");

    // LÀM SẠCH KẾT QUẢ (Vì Gemini Pro hay thêm dấu ```json vào đầu)
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Parse JSON
    const parsedData = JSON.parse(text) as QuizData;
    
    // Kiểm tra dữ liệu
    if (!parsedData.mcqs || parsedData.mcqs.length === 0) {
        throw new Error("AI không tạo được câu hỏi nào.");
    }

    return parsedData;

  } catch (error) {
    console.error("Lỗi khi tạo quiz:", error);
    throw error;
  }
};
