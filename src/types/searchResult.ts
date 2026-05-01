export interface SearchResult {
  hits: Hit[];
  keyword: string;
  limit: number;
  processingTimeMillis: number;
  total: number;
}

export interface Hit {
  categories?: string[];
  content: string;
  creationTimestamp: string;
  description: string;
  exposed: boolean;
  id: string;
  metadataName: string;
  ownerName: string;
  permalink: string;
  published: boolean;
  recycled: boolean;
  tags: string[];
  title: string;
  type: string;
  updateTimestamp: string;
}
