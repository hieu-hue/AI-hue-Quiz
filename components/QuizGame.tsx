import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight, RotateCw, AlertCircle, HelpCircle } from 'lucide-react';
import { QuizData, QuestionType } from '../types';

interface QuizGameProps {
  data: QuizData;
  onReset: () => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({ data, onReset }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [history, setHistory] = useState<{question: string, correct: boolean}[]>([]);

  // Flatten questions into a single array with types
  const questions = [
    ...data.mcqs.map(q => ({ ...q, type: QuestionType.MCQ })),
    ...data.tfqs.map(q => ({ ...q, type: QuestionType.TF }))
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Scroll to top when question changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuestionIndex]);

  const handleAnswer = (answer: number | boolean) => {
    if (isAnswered) return;

    setSelectedOption(answer);
    setIsAnswered(true);

    let isCorrect = false;
    if (currentQuestion.type === QuestionType.MCQ) {
      isCorrect = answer === (currentQuestion as any).correctAnswerIndex;
    } else {
      isCorrect = answer === (currentQuestion as any).isTrue;
    }

    if (isCorrect) {
      setScore(s => s + 1);
    }
    
    setHistory(prev => [...prev, {
      question: currentQuestion.question,
      correct: isCorrect
    }]);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    let feedback = "";
    if (percentage >= 90) feedback = "Xuất sắc! Bạn là một chuyên gia.";
    else if (percentage >= 70) feedback = "Rất tốt! Bạn nắm bài khá chắc.";
    else if (percentage >= 50) feedback = "Tạm ổn. Hãy ôn lại một chút nhé.";
    else feedback = "Cần cố gắng hơn. Đừng nản chí!";

    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in border border-slate-100">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-2">Kết Quả</h2>
          <div className="text-6xl font-extrabold mb-4">{score} / {questions.length}</div>
          <p className="text-xl opacity-90">{feedback}</p>
        </div>
        <div className="p-8">
           <div className="space-y-4 mb-8">
              <h3 className="font-bold text-slate-700 text-lg border-b pb-2">Chi tiết câu trả lời</h3>
              <div className="max-h-96 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {history.map((h, idx) => (
                  <div key={idx} className={`p-3 rounded-lg flex items-start space-x-3 ${h.correct ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="mt-1 flex-shrink-0">
                      {h.correct ? <CheckCircle size={18} className="text-green-600"/> : <XCircle size={18} className="text-red-600"/>}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Câu {idx + 1}</span>
                      <p className={`text-sm font-medium ${h.correct ? 'text-green-800' : 'text-red-800'}`}>{h.question}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           <button
            onClick={onReset}
            className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors flex items-center justify-center space-x-2"
           >
             <RotateCw size={20} />
             <span>Làm bài mới</span>
           </button>
        </div>
      </div>
    );
  }

  // --- Rendering Question ---

  // Determine correct answer for display
  const correctAnswer = currentQuestion.type === QuestionType.MCQ 
    ? (currentQuestion as any).correctAnswerIndex 
    : (currentQuestion as any).isTrue;

  const getOptionStyle = (optionIndex: number | boolean) => {
    if (!isAnswered) {
      return selectedOption === optionIndex 
        ? "bg-indigo-100 border-indigo-500 text-indigo-900" 
        : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50";
    }

    if (optionIndex === correctAnswer) {
      return "bg-green-100 border-green-500 text-green-900 ring-1 ring-green-500"; // Correct
    }
    
    if (selectedOption === optionIndex && selectedOption !== correctAnswer) {
      return "bg-red-100 border-red-500 text-red-900"; // Wrong selection
    }

    return "bg-slate-50 border-slate-200 opacity-50"; // Others
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-full h-3 w-full shadow-sm overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 min-h-[400px] flex flex-col">
        {/* Question Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 tracking-wide uppercase">
              {currentQuestion.type === QuestionType.MCQ ? 'Trắc nghiệm' : 'Đúng / Sai'}
            </span>
            <span className="text-sm font-semibold text-slate-400">
              Câu {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Options Area */}
        <div className="p-6 md:p-8 flex-grow">
          <div className="space-y-3">
            {currentQuestion.type === QuestionType.MCQ ? (
              (currentQuestion as any).options.map((opt: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${getOptionStyle(idx)}`}
                >
                  <span className="font-medium text-lg flex-grow">{opt}</span>
                  {isAnswered && idx === (correctAnswer as number) && <CheckCircle size={24} className="text-green-600 flex-shrink-0 ml-3" />}
                  {isAnswered && selectedOption === idx && idx !== (correctAnswer as number) && <XCircle size={24} className="text-red-600 flex-shrink-0 ml-3" />}
                </button>
              ))
            ) : (
              // True/False Options
              <div className="grid grid-cols-2 gap-4">
                {[true, false].map((val) => (
                   <button
                   key={val.toString()}
                   onClick={() => handleAnswer(val)}
                   disabled={isAnswered}
                   className={`p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center space-y-2 ${getOptionStyle(val)}`}
                 >
                   <span className="text-2xl font-bold">{val ? "Đúng" : "Sai"}</span>
                   {isAnswered && val === (correctAnswer as boolean) && <CheckCircle size={24} className="text-green-600" />}
                   {isAnswered && selectedOption === val && val !== (correctAnswer as boolean) && <XCircle size={24} className="text-red-600" />}
                 </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer / Explanation */}
        <div className="bg-slate-50 p-6 border-t border-slate-100">
          {isAnswered ? (
            <div className="animate-fade-in-up">
              <div className={`p-4 rounded-xl mb-4 flex items-start space-x-3 ${
                selectedOption === correctAnswer ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <div className="mt-1">
                   {selectedOption === correctAnswer ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                </div>
                <div>
                  <p className="font-bold text-sm uppercase mb-1">{selectedOption === correctAnswer ? 'Chính xác!' : 'Chưa chính xác'}</p>
                  <p className="text-sm leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              </div>
              <button
                onClick={handleNext}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
              >
                <span>{isLastQuestion ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
                <ArrowRight size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center text-slate-400 space-x-2 py-4">
               <HelpCircle size={18} />
               <span className="text-sm font-medium">Chọn một đáp án để tiếp tục</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
