export interface SearchResult {
  hits: Hit[];
  keyword: string;
  total: number;
  limit: number;
  processingTimeMillis: number;
}

export interface Hit {
  id: string;
  metadataName: string;
  title: string;
  description?: string;
  content: string;
  categories: string[];
  tags: string[];
  published: boolean;
  recycled: boolean;
  exposed: boolean;
  ownerName: string;
  creationTimestamp: string;
  updateTimestamp: string;
  permalink: string;
  type: string;
}
