import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuizData } from '../types';

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const quizSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    mcqs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "Câu hỏi trắc nghiệm" },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "4 lựa chọn cho câu hỏi",
          },
          correctAnswerIndex: { type: Type.INTEGER, description: "Chỉ số của đáp án đúng (0-3)" },
          explanation: { type: Type.STRING, description: "Giải thích ngắn gọn tại sao đáp án này đúng" },
        },
        required: ["question", "options", "correctAnswerIndex", "explanation"],
      },
      description: "Danh sách 15 câu hỏi trắc nghiệm",
    },
    tfqs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "Câu hỏi Đúng/Sai" },
          isTrue: { type: Type.BOOLEAN, description: "True nếu đúng, False nếu sai" },
          explanation: { type: Type.STRING, description: "Giải thích ngắn gọn" },
        },
        required: ["question", "isTrue", "explanation"],
      },
      description: "Danh sách 5 câu hỏi Đúng/Sai",
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
    const modelId = 'gemini-2.5-flash';
    
    let contents: any = [];
    let tools: any = undefined;

    const systemInstruction = `
      Bạn là một trợ lý giáo dục AI thông minh có tên là AI-hue-Quiz.
      Nhiệm vụ của bạn là tạo ra một bài kiểm tra kiến thức dựa trên nội dung được cung cấp.
      
      Yêu cầu bắt buộc:
      1. Tạo chính xác 15 câu hỏi trắc nghiệm (MCQ) với 4 lựa chọn.
      2. Tạo chính xác 5 câu hỏi Đúng/Sai (True/False).
      3. Ngôn ngữ câu hỏi và giải thích: Tiếng Việt.
      4. Giải thích phải ngắn gọn, súc tích và mang tính giáo dục.
      5. Đảm bảo nội dung câu hỏi bám sát dữ liệu đầu vào.
    `;

    if (mode === 'url') {
      // Use Search grounding for URLs to get context
      tools = [{ googleSearch: {} }];
      contents = [
        {
          text: `Hãy phân tích nội dung từ đường dẫn sau và tạo bài kiểm tra: ${input}`,
        },
      ];
    } else if (mode === 'text' && !fileData) {
      contents = [
        {
          text: `Hãy phân tích văn bản sau và tạo bài kiểm tra:\n\n${input}`,
        },
      ];
    } else if (fileData) {
      // File mode (Video or Text file)
      contents = [
        {
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.data,
          },
        },
        {
          text: input || "Hãy phân tích tệp đính kèm này và tạo bài kiểm tra.",
        },
      ];
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        tools: tools,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from Gemini.");
    }

    const parsedData = JSON.parse(text) as QuizData;
    
    // Basic validation to ensure we have enough questions
    if (!parsedData.mcqs || parsedData.mcqs.length === 0) {
      throw new Error("Dữ liệu câu hỏi không hợp lệ.");
    }

    return parsedData;

  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};
