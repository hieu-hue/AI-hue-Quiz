import React, { useState } from 'react';
import { InputSection } from './components/InputSection';
import { QuizGame } from './components/QuizGame';
import { QuizData } from './types';
import { BrainCircuit, Sparkles } from 'lucide-react';

export default function App() {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [error, setError] = useState<string>('');

  const handleQuizGenerated = (data: QuizData) => {
    setQuizData(data);
    setError('');
  };

  const handleReset = () => {
    setQuizData(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/50 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-600 cursor-pointer" onClick={handleReset}>
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <BrainCircuit size={24} />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
              AI-hue-Quiz
            </h1>
          </div>
          {quizData && (
             <button onClick={handleReset} className="text-sm font-medium text-slate-500 hover:text-indigo-600">
               Thoát
             </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 mt-8 md:mt-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center space-x-2 animate-fade-in">
             <span className="font-bold">Lỗi:</span> <span>{error}</span>
          </div>
        )}

        {!quizData ? (
          <div className="space-y-12 animate-fade-in-up">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-2">
                <Sparkles size={16} />
                <span>Powered by Gemini AI</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Biến nội dung bất kỳ thành <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Bài kiểm tra tương tác
                </span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Tải lên video bài giảng, dán đường dẫn YouTube hoặc tài liệu văn bản. AI sẽ tự động tạo ra bộ câu hỏi trắc nghiệm giúp bạn ôn tập hiệu quả.
              </p>
            </div>

            <InputSection onQuizGenerated={handleQuizGenerated} onError={setError} />
            
            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 pt-8 text-slate-600">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 font-bold">1</div>
                <h3 className="font-bold text-slate-900 mb-2">Đa dạng đầu vào</h3>
                <p className="text-sm">Hỗ trợ Video (MP4), YouTube URL và văn bản thông thường.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 font-bold">2</div>
                <h3 className="font-bold text-slate-900 mb-2">20 Câu hỏi sâu sắc</h3>
                <p className="text-sm">15 câu trắc nghiệm và 5 câu đúng/sai bao quát toàn bộ nội dung.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4 font-bold">3</div>
                <h3 className="font-bold text-slate-900 mb-2">Giải thích chi tiết</h3>
                <p className="text-sm">Nhận phản hồi và giải thích ngay lập tức sau mỗi câu trả lời.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
             <QuizGame data={quizData} onReset={handleReset} />
          </div>
        )}
      </main>
      
      {/* Simple styles for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
