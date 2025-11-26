import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { QuizData } from '../types';

// Lấy API Key từ biến môi trường
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is missing. Check .env file");
}

const genAI = new GoogleGenerativeAI(apiKey || '');

// Định nghĩa cấu trúc dữ liệu trả về (Schema)
const quizSchema = {
  type: SchemaType.OBJECT,
  properties: {
    mcqs: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: { type: SchemaType.STRING, description: "Câu hỏi trắc nghiệm" },
          options: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "4 lựa chọn"
          },
          correctAnswerIndex: { type: SchemaType.INTEGER, description: "Chỉ số đáp án đúng (0-3)" },
          explanation: { type: SchemaType.STRING, description: "Giải thích" },
        },
        required: ["question", "options", "correctAnswerIndex", "explanation"],
      },
    },
    tfqs: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: { type: SchemaType.STRING, description: "Câu hỏi Đúng/Sai" },
          isTrue: { type: SchemaType.BOOLEAN, description: "True/False" },
          explanation: { type: SchemaType.STRING, description: "Giải thích" },
        },
        required: ["question", "isTrue", "explanation"],
      },
    },
  },
  required: ["mcqs", "tfqs"],
};

export const generateQuiz = async (
  input: string,
  mode: 'text' | 'url',
  fileData?: { mimeType: string; data: string }
): Promise<QuizData> => {
  try {
    // Khởi tạo model với tên phiên bản cụ thể để tránh lỗi 404
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-001", 
      systemInstruction: `
        Bạn là trợ lý giáo dục AI-hue-Quiz.
        Nhiệm vụ: Tạo bài kiểm tra từ nội dung được cung cấp.
        Yêu cầu:
        1. 15 câu trắc nghiệm (MCQ).
        2. 5 câu Đúng/Sai.
        3. Ngôn ngữ: Tiếng Việt.
        4. Trả về đúng định dạng JSON.
      `,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      }
    });

    let promptParts: any[] = [];

    // Xử lý đầu vào tùy theo chế độ (URL, Văn bản, hoặc File)
    if (mode === 'url') {
      promptParts = [{ text: `Hãy phân tích nội dung quan trọng từ chủ đề/đường dẫn này và tạo bài kiểm tra: ${input}` }];
    } else if (mode === 'text' && !fileData) {
      promptParts = [{ text: `Phân tích văn bản sau:\n\n${input}` }];
    } else if (fileData) {
      promptParts = [
        {
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.data
          }
        },
        { text: input || "Tạo bài kiểm tra từ file này." }
      ];
    }

    // Gửi yêu cầu đến Gemini
    const result = await model.generateContent(promptParts);
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("Không nhận được phản hồi từ AI.");

    // Chuyển đổi kết quả từ văn bản sang JSON
    const parsedData = JSON.parse(text) as QuizData;
    return parsedData;

  } catch (error) {
    console.error("Lỗi khi tạo quiz:", error);
    throw error;
  }
};
