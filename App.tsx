import React, { useState, useCallback } from 'react';
import { LessonPlanFormData } from './types';
import LessonPlanForm from './components/LessonPlanForm';
import LessonPlanDisplay from './components/LessonPlanDisplay';
import { generateLessonPlan } from './services/geminiService';
import { BrainCircuitIcon } from './components/icons';

const App: React.FC = () => {
  const [formData, setFormData] = useState<LessonPlanFormData>({
    grade: '10',
    subject: 'Tin học',
    lessonTitle: '',
    duration: '2 tiết',
    groupActivity: true,
    studentCount: 40,
    hasComputers: true,
    computerCount: 20,
    worksheet: true,
    teachingTechnique: 'Dạy học dự án, Thảo luận nhóm',
    textbookContent: { type: 'text', value: '' },
    includeDigitalCompetency: true,
    digitalCompetency: { 
      type: 'text', 
      value: '' 
    },
    generateImages: false
  });
  const [resultData, setResultData] = useState<{ lessonPlan: string; worksheet: string; images: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResultData(null);
    try {
      const result = await generateLessonPlan(formData);
      setResultData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi không mong muốn xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-md py-3">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BrainCircuitIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Trợ lý Soạn Kế Hoạch Bài Dạy -5512
            </h1>
          </div>
          <p className="text-sm text-gray-500 hidden md:block">2025 - By Lương Văn Giỏi</p>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LessonPlanForm
            formData={formData}
            setFormData={setFormData}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
          <LessonPlanDisplay
            lessonPlan={resultData?.lessonPlan || ''}
            worksheet={resultData?.worksheet || ''}
            images={resultData?.images || []}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>

      <footer className="text-center py-4 text-sm text-gray-500">
        <p>&copy; 2025 - By Lương Văn Giỏi.</p>
      </footer>
    </div>
  );
};

export default App;