export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  section: 'landing' | 'wellness' | 'about' | 'services' | 'gallery' | 'success-stories' | 'news' | 'blank';
  alt?: string;
  caption?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MediaUploadRequest {
  file: File;
  section: MediaAsset['section'];
  alt?: string;
  caption?: string;
}

export interface MediaUploadResponse {
  success: boolean;
  asset?: MediaAsset;
  error?: string;
}

export interface MediaListResponse {
  assets: MediaAsset[];
  total: number;
}
