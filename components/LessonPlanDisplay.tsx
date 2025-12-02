
import React from 'react';
import { saveAsDoc } from '../utils/fileUtils';
import { markdownToHtml } from '../utils/fileUtils';
import { DocumentTextIcon, DownloadIcon, ClipboardIcon, GoogleDocsIcon } from './icons';

interface LessonPlanDisplayProps {
  lessonPlan: string;
  isLoading: boolean;
  error: string | null;
}

const LessonPlanDisplay: React.FC<LessonPlanDisplayProps> = ({ lessonPlan, isLoading, error }) => {
    const [notification, setNotification] = React.useState<string | null>(null);
    const [showGDocsHelper, setShowGDocsHelper] = React.useState(false);

    const handleCopyText = () => {
        navigator.clipboard.writeText(lessonPlan);
        setNotification('Đã sao chép văn bản!');
        setTimeout(() => setNotification(null), 2000);
    };
    
    const handleExportWord = () => {
        saveAsDoc(lessonPlan, 'Giao-an-5512.doc');
    };

    const handleExportGoogleDocs = async () => {
        const html = markdownToHtml(lessonPlan);
        try {
            // Check for modern Clipboard API support
            if (typeof ClipboardItem === "undefined") {
                 throw new Error("ClipboardItem API is not supported in this browser.");
            }
            const blob = new Blob([html], { type: 'text/html' });
            const item = new ClipboardItem({ 'text/html': blob });
            await navigator.clipboard.write([item]);
            setShowGDocsHelper(true); // Show helper modal on success
        } catch (err) {
            console.error('Không thể sao chép HTML:', err);
            alert('Lỗi: Trình duyệt của bạn có thể không hỗ trợ sao chép với định dạng. Vui lòng sử dụng nút "Copy" và dán thủ công.');
        }
    };

    const renderLessonPlan = (plan: string) => {
        const lines = plan.split('\n');
        return lines.map((line, index) => {
            if (line.trim() === '') return <br key={index} />;

            // Main Headers and Sub-headers (Must be fully wrapped in **)
            // e.g., **I. MỤC TIÊU** or **1. Tên mục bài học**
            if (line.startsWith('**') && line.endsWith('**')) {
                const content = line.slice(2, -2); // Remove ** at start and end
                
                // Check if it looks like a sub-header (starts with a number followed by a dot, e.g., "1. Tên mục")
                if (/^\d+\./.test(content)) {
                     return <p key={index} className="font-bold mt-2">{content}</p>;
                }

                // Main headers (I., II., HOẠT ĐỘNG, etc.)
                return <p key={index} className="font-bold text-lg mt-4">{content}</p>;
            }

            // Unordered list items
            if (line.startsWith('* ')) {
                // If the list item contains bold parts, render them carefully
                if (line.includes('**')) {
                    const content = line.substring(2);
                    const parts = content.split(/(\*\*.*?\*\*)/g).filter(Boolean);
                    return (
                        <li key={index} className="ml-6 list-disc">
                            {parts.map((part, i) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
                                }
                                return <span key={i}>{part}</span>;
                            })}
                        </li>
                    );
                }
                return <li key={index} className="ml-6 list-disc">{line.substring(2)}</li>;
            }

            // Handle inline bolding for standard paragraphs (e.g., "**3. Phẩm chất:** Yêu nước...")
            // The logic splits by **...** groups.
            const parts = line.split(/(\*\*.*?\*\*)/g).filter(Boolean);
            return (
                <p key={index}>
                    {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
                        }
                        return <span key={i}>{part}</span>;
                    })}
                </p>
            );
        });
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="font-semibold text-lg">AI đang suy nghĩ...</p>
                    <p className="text-sm mt-1">Vui lòng chờ trong giây lát.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-red-600 bg-red-50 p-4 rounded-md">
                    <p className="font-bold">Đã xảy ra lỗi!</p>
                    <p className="text-sm mt-2">{error}</p>
                </div>
            );
        }

        if (lessonPlan) {
            return <div className="prose max-w-none">{renderLessonPlan(lessonPlan)}</div>;
        }

        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <DocumentTextIcon className="h-16 w-16 mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold">Giáo án của bạn sẽ xuất hiện ở đây</h3>
                <p className="mt-1 text-sm">Điền thông tin vào biểu mẫu bên trái và nhấn "Tạo giáo án" để bắt đầu.</p>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
                <h2 className="text-2xl font-bold text-gray-700">Kết quả: Kế hoạch bài dạy</h2>
                {lessonPlan && !isLoading && (
                    <div className="flex items-center space-x-2">
                        <button onClick={handleCopyText} title="Copy to Clipboard" className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-full transition">
                            <ClipboardIcon className="h-5 w-5" />
                        </button>
                         <button onClick={handleExportGoogleDocs} className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition">
                            <GoogleDocsIcon className="h-5 w-5 mr-1.5" />
                            Google Docs
                        </button>
                        <button onClick={handleExportWord} className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm transition">
                            <DownloadIcon className="h-5 w-5 mr-1.5" />
                            File Word
                        </button>
                    </div>
                )}
            </div>
            <div className="flex-grow overflow-y-auto pr-2" style={{maxHeight: 'calc(100vh - 250px)'}}>
                {renderContent()}
            </div>
             
            {notification && (
                <div className="absolute bottom-5 right-5 bg-gray-900 text-white text-sm py-2 px-4 rounded-md shadow-lg transition-opacity duration-300">
                    {notification}
                </div>
            )}

            {showGDocsHelper && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md w-full text-center transform transition-all animate-fade-in-scale">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                            <GoogleDocsIcon className="h-7 w-7 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mt-4">Sẵn sàng dán vào Google Docs</h3>
                        <p className="text-base text-gray-600 my-4">
                            Giáo án đã được sao chép với đầy đủ định dạng.
                            Nhấn nút bên dưới để mở tài liệu mới, sau đó chỉ cần dán (<kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Ctrl</kbd> + <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">V</kbd>) nội dung vào.
                        </p>
                        <div className="mt-6 flex justify-center space-x-4">
                            <button 
                                onClick={() => setShowGDocsHelper(false)}
                                className="px-6 py-2.5 rounded-md text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={() => {
                                    window.open('https://docs.new', '_blank', 'noopener,noreferrer');
                                    setShowGDocsHelper(false);
                                }}
                                className="px-6 py-2.5 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Mở Google Docs
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonPlanDisplay;
