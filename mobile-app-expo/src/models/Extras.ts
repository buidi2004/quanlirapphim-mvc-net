export interface ConcessionItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface News {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  thumbnailUrl: string;
  publishedAt: string;
}

export interface Promotion {
  id: number;
  title: string;
  slug: string;
  discountCode: string;
  description: string;
  imageUrl: string;
  validUntil: string;
}
