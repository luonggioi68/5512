
import { GoogleGenAI, Type } from "@google/genai";
import { LessonPlanFormData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Helper to convert a File object to a GoogleGenerativeAI.Part object.
const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

const createPromptParts = async (formData: LessonPlanFormData): Promise<any[]> => {
    const parts: any[] = [];
    
    const hasDigitalCompetency = formData.includeDigitalCompetency;
    const wantsWorksheet = formData.worksheet;
    const wantsImages = formData.generateImages;
    const hasComputers = formData.hasComputers && formData.computerCount > 0;

    // This part of the prompt contains all the text-based information.
    let textPrompt = `
Bạn là một chuyên gia giáo dục và giáo viên giỏi tại Việt Nam. Nhiệm vụ của bạn là soạn thảo Kế hoạch bài dạy (Giáo án) theo đúng khung Phụ lục IV của Công văn 5512/BGDĐT-GDTrH.

**Dữ liệu đầu vào:**
- Khối lớp: ${formData.grade}
- Môn học: ${formData.subject}
- Tên bài: ${formData.lessonTitle}
- Thời lượng: ${formData.duration}
- Số lượng học sinh: ${formData.studentCount}
- Sử dụng máy tính: ${hasComputers ? `Có (${formData.computerCount} máy)` : 'Không'}
- Hoạt động nhóm: ${formData.groupActivity ? 'Có' : 'Không'}
- Phiếu học tập: ${wantsWorksheet ? 'Có' : 'Không'}
- Kỹ thuật dạy học: ${formData.teachingTechnique}
`;

    // Append text/URL content directly to the text prompt
    if (formData.textbookContent.type === 'text' || formData.textbookContent.type === 'url') {
        textPrompt += `
- Nội dung chính từ sách giáo khoa: 
---
${formData.textbookContent.value || 'Chưa cung cấp'}
---
`;
    }
    if (hasDigitalCompetency && (formData.digitalCompetency.type === 'text' || formData.digitalCompetency.type === 'url')) {
        textPrompt += `
- Nội dung Năng lực số (Phụ lục 3): 
---
${formData.digitalCompetency.value || ''}
---
`;
    }

    const digitalCompetencyObjective = hasDigitalCompetency
      ? `   - **Năng lực số:** (Dựa vào nội dung Năng lực số đã cung cấp, trích dẫn chính xác các kí hiệu và nội dung tương ứng được tích hợp trong bài học.)`
      : '';

    const digitalCompetencyInstruction = hasDigitalCompetency
      ? `- **Tích hợp Năng lực số chi tiết (BẮT BUỘC):** Trong phần **Nội dung** hoặc **Tổ chức thực hiện** của mỗi hoạt động, phải **chỉ rõ và mô tả** hoạt động đó giúp phát triển năng lực số nào. Luôn sử dụng kí hiệu đã được cung cấp trong phần Năng lực số. *Ví dụ: "GV yêu cầu HS sử dụng phần mềm trình chiếu để tạo báo cáo kết quả (NLS 5.a, 5.b)" hoặc "HS hợp tác trên tài liệu trực tuyến để hoàn thành phiếu học tập (NLS 4.a, 3.b)".*`
      : '';

    const groupingInstruction = formData.studentCount > 0
      ? `- **Chia nhóm và thiết bị:** Dựa trên số lượng ${formData.studentCount} HS${hasComputers ? ` và ${formData.computerCount} máy tính` : ' (lớp học không sử dụng máy tính)'}, hãy đề xuất phương án chia nhóm${hasComputers ? ' và sử dụng thiết bị' : ''} hợp lý trong phần **II. Thiết bị dạy học** và **III. Tổ chức thực hiện** (ví dụ: chia thành bao nhiêu nhóm, mỗi nhóm bao nhiêu HS${hasComputers ? ', bao nhiêu em chung 1 máy' : ''}).`
      : '';

    const worksheetInstruction = wantsWorksheet
      ? `Nếu người dùng yêu cầu, hãy tạo nội dung cho phiếu học tập trong trường "worksheet".`
      : `Không tạo phiếu học tập.`;

     const imageInstruction = wantsImages
      ? `Nếu người dùng yêu cầu, hãy tạo danh sách các gợi ý hình ảnh minh họa trong trường "images".`
      : `Không tạo gợi ý hình ảnh.`;


    // Append the final instructions to the text prompt
    textPrompt += `
**Yêu cầu:**
Dựa vào dữ liệu trên, hãy soạn thảo nội dung và trả về kết quả dưới dạng JSON (không dùng Markdown code block, chỉ trả về raw JSON) theo schema sau:
{
  "lessonPlan": "Chuỗi văn bản chứa nội dung giáo án định dạng Markdown",
  "worksheet": "Chuỗi văn bản chứa nội dung phiếu học tập định dạng Markdown (nếu có)",
  "images": [
      {
          "description": "Mô tả chi tiết hình ảnh cần tìm hoặc tạo",
          "prompt": "Câu lệnh (Prompt) tiếng Anh để tạo ảnh bằng AI (Midjourney/DALL-E)"
      }
  ]
}

**Quy tắc nội dung trường "lessonPlan":**
TUÂN THỦ NGHIÊM NGẶT cấu trúc dưới đây.
**Quan trọng: Bắt đầu phần lessonPlan trực tiếp với Tên bài học được VIẾT HOA và IN ĐẬM, theo sau là Thời lượng. Không thêm bất kỳ lời dẫn, câu giới thiệu, hay dòng phân cách (\`---\`) nào trước đó.**

**${formData.lessonTitle.toUpperCase()}**
**Thời lượng:** ${formData.duration}

**I. MỤC TIÊU**
**1. Kiến thức:** [Nội dung kiến thức cốt lõi, viết thường]
**2. Năng lực:**
   - **Năng lực chung:** [Nội dung năng lực chung, viết thường]
   - **Năng lực đặc thù môn học:** [Nội dung năng lực đặc thù, viết thường]${digitalCompetencyObjective ? `\n${digitalCompetencyObjective}` : ''}
**3. Phẩm chất:** [Liệt kê các phẩm chất chính, viết thường]

**II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU**
**1. Thiết bị dạy học:** (Liệt kê các thiết bị cần thiết. Dựa trên số liệu ${formData.studentCount} HS${hasComputers ? ` và ${formData.computerCount} máy` : ''}, nêu rõ cách bố trí và tổ chức.)
**2. Học liệu:** (Liệt kê các học liệu: Sách giáo khoa, phiếu học tập (nếu có), video, phần mềm mô phỏng,...)

**III. TIẾN TRÌNH DẠY HỌC**

**HOẠT ĐỘNG 1: MỞ ĐẦU (XÁC ĐỊNH VẤN ĐỀ)**
**a) Mục tiêu:** [Mục tiêu hoạt động, viết thường]
**b) Nội dung:** [Mô tả nhiệm vụ, viết thường]
**c) Sản phẩm:** [Mô tả sản phẩm, viết thường]
**d) Tổ chức thực hiện:** (Mô tả 4 bước rõ ràng: Giao nhiệm vụ -> Thực hiện -> Báo cáo -> Kết luận).

**HOẠT ĐỘNG 2: HÌNH THÀNH KIẾN THỨC MỚI**
(Chia thành các mục nhỏ tương ứng với các phần trong sách giáo khoa đã cung cấp. Sử dụng định dạng số \`**1.**\`, \`**2.**\`, \`**3.**\` cho tiêu đề mỗi mục.)
**1. [Tên mục 1 trong SGK]**
**a) Mục tiêu:** [Nội dung viết tiếp ở đây, không in đậm]
**b) Nội dung:** [Nội dung viết tiếp ở đây, không in đậm]
**c) Sản phẩm:** [Nội dung viết tiếp ở đây, không in đậm]
**d) Tổ chức thực hiện:**
[Mô tả các bước tổ chức thực hiện ở đây]

**2. [Tên mục 2 trong SGK]**
... (Tương tự cho các mục khác)

**HOẠT ĐỘNG 3: LUYỆN TẬP**
**a) Mục tiêu:**
**b) Nội dung:**
**c) Sản phẩm:**
**d) Tổ chức thực hiện:**

**HOẠT ĐỘNG 4: VẬN DỤNG**
**a) Mục tiêu:**
**b) Nội dung:**
**c) Sản phẩm:**
**d) Tổ chức thực hiện:**

**LƯU Ý QUAN TRỌNG:**
- Sử dụng ngôn ngữ sư phạm, rõ ràng, ngắn gọn.
- Chỉ in đậm phần tiêu đề của các mục (ví dụ: **a) Mục tiêu:**, **1. Kiến thức:**, **3. Phẩm chất:**), phần nội dung chi tiết phía sau để ở dạng chữ thường, tuyệt đối KHÔNG in đậm.
- Tuyệt đối không thêm ước tính thời gian (ví dụ: 'Khoảng 5 phút').
- Tuyệt đối không chia nội dung thành các TIẾT (ví dụ: 'TIẾT 1', 'TIẾT 2').
${digitalCompetencyInstruction ? digitalCompetencyInstruction : ''}
${groupingInstruction}
${worksheetInstruction}
${imageInstruction}
`;
    parts.push({ text: textPrompt });
    
    // Add file parts if they exist, with context
    if (formData.textbookContent.type === 'file' && formData.textbookContent.value instanceof File) {
        parts.push({ text: "\n--- Bắt đầu Nội dung sách giáo khoa từ file đính kèm ---" });
        parts.push(await fileToGenerativePart(formData.textbookContent.value));
        parts.push({ text: "--- Kết thúc Nội dung sách giáo khoa từ file đính kèm ---" });
    }
    if (hasDigitalCompetency && formData.digitalCompetency.type === 'file' && formData.digitalCompetency.value instanceof File) {
        parts.push({ text: "\n--- Bắt đầu Nội dung Năng lực số từ file đính kèm ---" });
        parts.push(await fileToGenerativePart(formData.digitalCompetency.value));
        parts.push({ text: "--- Kết thúc Nội dung Năng lực số từ file đính kèm ---" });
    }

    return parts;
};

export const generateLessonPlan = async (formData: LessonPlanFormData): Promise<{ lessonPlan: string; worksheet: string; images: any[] }> => {
  try {
    const promptParts = await createPromptParts(formData);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: promptParts },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    lessonPlan: { type: Type.STRING },
                    worksheet: { type: Type.STRING },
                    images: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                description: { type: Type.STRING },
                                prompt: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        }
    });
    
    if (response && response.text) {
        return JSON.parse(response.text);
    } else {
        throw new Error("Không nhận được phản hồi hợp lệ từ Gemini API.");
    }
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("API Key không hợp lệ. Vui lòng kiểm tra lại cấu hình.");
    }
    throw new Error("Không thể tạo giáo án. Đã có lỗi xảy ra trong quá trình xử lý.");
  }
};
