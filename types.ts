
export type InputType = 'text' | 'file' | 'url';

export interface ContentInput {
  type: InputType;
  value: string | File | null;
}

export interface LessonPlanFormData {
  grade: string;
  subject: string;
  lessonTitle: string;
  duration: string;
  groupActivity: boolean;
  studentCount: number;
  hasComputers: boolean;
  computerCount: number;
  worksheet: boolean;
  teachingTechnique: string;
  textbookContent: ContentInput;
  includeDigitalCompetency: boolean;
  digitalCompetency: ContentInput;
  generateImages: boolean;
}
