import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { QuizData } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is missing. Check .env file");
}

const genAI = new GoogleGenerativeAI(apiKey || '');

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
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
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

    const result = await model.generateContent(promptParts);
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("Không nhận được phản hồi từ AI.");

    const parsedData = JSON.parse(text) as QuizData;
    return parsedData;

  } catch (error) {
    console.error("Lỗi khi tạo quiz:", error);
    throw error;
  }
};
