export interface LeconResponse {
  id: number;
  titre: string;
  description: string;
  ordre: number;
  coursId: number;
  videoUrl?: string;
  pdfUrl?: string;
}

export interface LeconRequest {
  titre: string;
  description: string;
  ordre: number;
  coursId: number;
  videoUrl?: string;
  pdfUrl?: string;
}