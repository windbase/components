export interface ComponentMetadata {
  id: string;
  name: string;
  categories: string[];
  author: string;
}

export interface Component {
  metadata: ComponentMetadata;
  html: string;
  type: 'blocks' | 'templates';
  folder: string;
}

export interface ComponentFormData {
  name: string;
  type: 'blocks' | 'templates';
  html: string;
  categories: string;
  author: string;
} 