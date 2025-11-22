export interface Database {
  public: {
    Tables: {
      items: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          category: string
          images: string[]
          seller_id: string
          seller_name?: string
          seller_contact?: string
          status: 'active' | 'sold' | 'removed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          category: string
          images: string[]
          seller_id: string
          seller_name?: string
          seller_contact?: string
          status?: 'active' | 'sold' | 'removed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          category?: string
          images?: string[]
          seller_id?: string
          seller_name?: string
          seller_contact?: string
          status?: 'active' | 'sold' | 'removed'
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon: string
          created_at?: string
        }
        Update: {
          name?: string
          icon?: string
        }
      }
    }
  }
}

export type Item = Database['public']['Tables']['items']['Row']
export type Category = Database['public']['Tables']['categories']['Row']

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export interface LegacyItem {
  id: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  categoryId: string;
  publisher: string;
  contact: string;
  createdAt: Date;
}