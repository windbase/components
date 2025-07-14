export interface ComponentMetadata {
  id: string;
  name: string;
  tags: string[];
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
  tags: string;
  author: string;
} 