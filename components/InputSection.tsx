import React, { useState, useRef } from 'react';
import { Type, Link, Upload, FileVideo, FileText, Loader2 } from 'lucide-react';
import { generateQuiz } from '../services/geminiService';
import { QuizData, InputMode } from '../types';

interface InputSectionProps {
  onQuizGenerated: (data: QuizData) => void;
  onError: (msg: string) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({ onQuizGenerated, onError }) => {
  const [mode, setMode] = useState<InputMode>('url');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileData, setFileData] = useState<{ mimeType: string; data: string } | undefined>(undefined);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (limit to ~20MB for client-side ease, though Gemini supports more via upload API, inline has limits)
    if (file.size > 20 * 1024 * 1024) {
      onError("File quá lớn. Vui lòng chọn file dưới 20MB.");
      return;
    }

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix (e.g., "data:video/mp4;base64,")
      const base64Data = base64String.split(',')[1];
      setFileData({
        mimeType: file.type,
        data: base64Data
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError('');
    
    if (mode === 'text' && !inputText.trim()) {
      onError("Vui lòng nhập nội dung văn bản.");
      return;
    }
    if (mode === 'url' && !inputText.trim()) {
      onError("Vui lòng nhập URL.");
      return;
    }
    if (mode === 'file' && !fileData) {
      onError("Vui lòng chọn một file.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await generateQuiz(inputText, mode === 'file' ? 'text' : mode, fileData);
      onQuizGenerated(data);
    } catch (err) {
      onError("Đã xảy ra lỗi khi tạo câu hỏi. Vui lòng thử lại hoặc kiểm tra nội dung đầu vào.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-indigo-600 p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Tạo Bài Kiểm Tra Mới</h2>
        <p className="text-indigo-100">Nhập nội dung để AI-hue-Quiz tạo câu hỏi tự động</p>
      </div>
      
      <div className="p-6">
        {/* Tabs */}
        <div className="flex justify-center space-x-2 mb-8 bg-slate-100 p-1 rounded-xl w-fit mx-auto">
          <button
            onClick={() => { setMode('url'); setInputText(''); setFileData(undefined); setFileName(null); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'url' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'
            }`}
          >
            <Link size={18} />
            <span>URL Video/Bài viết</span>
          </button>
          <button
            onClick={() => { setMode('text'); setInputText(''); setFileData(undefined); setFileName(null); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'text' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'
            }`}
          >
            <Type size={18} />
            <span>Văn bản</span>
          </button>
          <button
            onClick={() => { setMode('file'); setInputText(''); setFileData(undefined); setFileName(null); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'file' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'
            }`}
          >
            <Upload size={18} />
            <span>Tải lên File</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'url' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Dán đường dẫn (YouTube, Website, Docs)</label>
              <input
                type="url"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              />
              <p className="text-xs text-slate-500">
                Lưu ý: Với video YouTube, AI sẽ tìm kiếm thông tin liên quan. Để chính xác nhất, hãy tải video hoặc transcript lên ở mục "Tải lên File".
              </p>
            </div>
          )}

          {mode === 'text' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Nội dung văn bản</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Dán nội dung bài học, tài liệu hoặc ghi chú vào đây..."
                rows={8}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
              />
            </div>
          )}

          {mode === 'file' && (
            <div className="space-y-4">
               <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-xl p-10 text-center cursor-pointer transition-all hover:bg-indigo-50 group"
               >
                 <input 
                   ref={fileInputRef}
                   type="file" 
                   accept="video/mp4,video/quicktime,text/plain,application/pdf"
                   onChange={handleFileChange}
                   className="hidden"
                 />
                 <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {fileName ? (fileName.endsWith('.mp4') ? <FileVideo size={32}/> : <FileText size={32}/>) : <Upload size={32} />}
                 </div>
                 {fileName ? (
                   <p className="text-indigo-700 font-medium text-lg">{fileName}</p>
                 ) : (
                   <div>
                     <p className="text-slate-700 font-medium">Nhấn để chọn file video (MP4) hoặc văn bản</p>
                     <p className="text-slate-400 text-sm mt-1">Hỗ trợ tối đa 20MB</p>
                   </div>
                 )}
               </div>
               
               {fileName && (
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Ghi chú thêm (Tùy chọn)</label>
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Ví dụ: Tập trung vào phần lịch sử..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                 </div>
               )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] ${
              isLoading 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                <span>Đang phân tích dữ liệu...</span>
              </>
            ) : (
              <>
                <span>Tạo Bài Kiểm Tra</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
