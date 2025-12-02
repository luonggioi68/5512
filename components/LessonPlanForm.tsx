
import React from 'react';
import { LessonPlanFormData, ContentInput, InputType } from '../types';
import { SparklesIcon, FileUploadIcon, LinkIcon, TextIcon } from './icons';

interface ContentInputControlProps {
  label: string;
  id: keyof LessonPlanFormData;
  value: ContentInput;
  onChange: (field: keyof LessonPlanFormData, value: ContentInput) => void;
  placeholder?: string;
}

const ContentInputControl: React.FC<ContentInputControlProps> = ({ label, id, value, onChange, placeholder }) => {
  const activeType = value.type;

  const handleTypeChange = (newType: InputType) => {
    onChange(id, { type: newType, value: newType === 'file' ? null : '' });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (activeType === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      onChange(id, { ...value, value: file });
    } else {
      onChange(id, { ...value, value: e.target.value });
    }
  };
  
  const typeOptions: { type: InputType; label: string; icon: React.ReactNode }[] = [
    { type: 'text', label: 'Văn bản', icon: <TextIcon className="h-4 w-4 mr-1.5" /> },
    { type: 'file', label: 'File PDF', icon: <FileUploadIcon className="h-4 w-4 mr-1.5" /> },
    { type: 'url', label: 'Link', icon: <LinkIcon className="h-4 w-4 mr-1.5" /> },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-md p-0.5 bg-gray-50 mb-2">
        {typeOptions.map(option => (
          <button
            key={option.type}
            onClick={() => handleTypeChange(option.type)}
            className={`flex-1 flex items-center justify-center text-sm px-3 py-1 rounded-md transition-all duration-200 ${
              activeType === option.type
                ? 'bg-white text-blue-600 shadow-sm'
                : 'bg-transparent text-gray-500 hover:bg-gray-200'
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
      <div>
        {activeType === 'text' && (
          <textarea
            id={id}
            name={id}
            value={(value.value as string) || ''}
            onChange={handleValueChange}
            rows={6}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition"
          />
        )}
        {activeType === 'url' && (
          <input
            type="url"
            id={id}
            name={id}
            value={(value.value as string) || ''}
            onChange={handleValueChange}
            placeholder="https://example.com/sach-giao-khoa.pdf"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition"
          />
        )}
        {activeType === 'file' && (
          <div className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-md text-center">
            <input type="file" id={id} name={id} accept=".pdf" onChange={handleValueChange} className="sr-only" />
            <label htmlFor={id} className="cursor-pointer text-blue-600 hover:text-blue-800">
              {value.value instanceof File ? `Đã chọn: ${value.value.name}` : 'Nhấn để chọn file PDF'}
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

interface LessonPlanFormProps {
  formData: LessonPlanFormData;
  setFormData: React.Dispatch<React.SetStateAction<LessonPlanFormData>>;
  onGenerate: () => void;
  isLoading: boolean;
}

const LessonPlanForm: React.FC<LessonPlanFormProps> = ({ formData, setFormData, onGenerate, isLoading }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
        setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContentChange = (field: keyof LessonPlanFormData, value: ContentInput) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">Thông tin bài dạy</h2>
      <div className="space-y-4 overflow-y-auto" style={{maxHeight: 'calc(100vh - 250px)'}}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-600 mb-1">Khối lớp</label>
            <select id="grade" name="grade" value={formData.grade} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition">
              {Array.from({ length: 7 }, (_, i) => 6 + i).map(g => (
                <option key={g} value={g}>{`Lớp ${g}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-600 mb-1">Môn học</label>
            <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition" />
          </div>
        </div>
        
        <div>
          <label htmlFor="lessonTitle" className="block text-sm font-medium text-gray-600 mb-1">Tên bài học</label>
          <input type="text" id="lessonTitle" name="lessonTitle" value={formData.lessonTitle} onChange={handleChange} placeholder="VD: Bài 1: Mạng máy tính và Internet" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="col-span-1">
                <label htmlFor="duration" className="block text-sm font-medium text-gray-600 mb-1">Thời lượng</label>
                <input type="text" id="duration" name="duration" value={formData.duration} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>
             <div className="col-span-1">
                <label htmlFor="studentCount" className="block text-sm font-medium text-gray-600 mb-1">Số lượng HS</label>
                <input type="number" id="studentCount" name="studentCount" value={formData.studentCount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>
            <div className="col-span-1">
                <div className="flex items-center h-6 mb-1">
                    <input 
                        type="checkbox" 
                        id="hasComputers" 
                        name="hasComputers" 
                        checked={formData.hasComputers} 
                        onChange={handleChange} 
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                    />
                    <label htmlFor="hasComputers" className="ml-2 block text-sm font-medium text-gray-600 select-none">
                        Có sử dụng máy tính
                    </label>
                </div>
                {formData.hasComputers && (
                     <input 
                        type="number" 
                        id="computerCount" 
                        name="computerCount" 
                        value={formData.computerCount} 
                        onChange={handleChange} 
                        placeholder="Số lượng máy"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition" 
                    />
                )}
            </div>
        </div>

        <div className="flex items-center space-x-8">
            <div className="flex items-center">
                <input type="checkbox" id="groupActivity" name="groupActivity" checked={formData.groupActivity} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="groupActivity" className="ml-2 block text-sm text-gray-900">Có hoạt động nhóm</label>
            </div>
            <div className="flex items-center">
                <input type="checkbox" id="worksheet" name="worksheet" checked={formData.worksheet} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="worksheet" className="ml-2 block text-sm text-gray-900">Có phiếu học tập</label>
            </div>
             <div className="flex items-center">
                <input type="checkbox" id="generateImages" name="generateImages" checked={formData.generateImages} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="generateImages" className="ml-2 block text-sm text-gray-900">Gợi ý ảnh minh họa</label>
            </div>
        </div>

        <div>
          <label htmlFor="teachingTechnique" className="block text-sm font-medium text-gray-600 mb-1">Kỹ thuật dạy học</label>
          <input type="text" id="teachingTechnique" name="teachingTechnique" value={formData.teachingTechnique} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition" />
        </div>

        <ContentInputControl 
          label="Nội dung chính từ Sách giáo khoa"
          id="textbookContent"
          value={formData.textbookContent}
          onChange={handleContentChange}
          placeholder="Dán nội dung cốt lõi của bài học từ sách giáo khoa vào đây..."
        />

        <div>
          <div className="flex items-center mb-2">
            <input 
              type="checkbox"
              id="includeDigitalCompetency"
              name="includeDigitalCompetency"
              checked={formData.includeDigitalCompetency}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="includeDigitalCompetency" className="ml-2 text-sm font-medium text-gray-600 cursor-pointer">
              Bao gồm Năng lực số (Phụ lục 3)
            </label>
          </div>
          
          {formData.includeDigitalCompetency && (
            <ContentInputControl 
              label="Nội dung Năng lực số"
              id="digitalCompetency"
              value={formData.digitalCompetency}
              onChange={handleContentChange}
            />
          )}
        </div>
      </div>
       <div className="mt-6">
          <button
            onClick={onGenerate}
            disabled={isLoading || !formData.lessonTitle || !formData.textbookContent.value}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang soạn giáo án...
              </>
            ) : (
             <>
                <SparklesIcon className="h-5 w-5 mr-2"/>
                Tạo giáo án
             </>
            )}
          </button>
        </div>
    </div>
  );
};

export default LessonPlanForm;
