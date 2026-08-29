// NOTE: File ini adalah helper untuk fetch data dari API publik.
// Jangan gunakan di Server Components — gunakan langsung fungsi dari @/server/public/data.ts

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface PublicPeriod {
  id: string;
  name: string;
  visi: string;
  misi: string;
  photo_url: string | null;
  year_start: number;
  year_end: number;
}

export interface PublicContent {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  category: string;
  tags: string[];
  reading_time: number | null;
  published_at: string | null;
  author: { name: string };
  department: { name: string } | null;
}

export interface PublicContentDetail extends PublicContent {
  seo_slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  body: string;
  view_count: number;
}

export interface PublicBoardMember {
  id: string;
  name: string;
  position: string;
  photo_url: string | null;
  display_order: number;
  department: { name: string } | null;
}

export interface PublicDepartment {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
}

export interface PublicDepartmentDetail extends PublicDepartment {
  department_members_department: Array<{
    id: string;
    name: string;
    position: string;
    photo_url: string | null;
    display_order: number;
  }>;
}

export async function fetchActivePeriod(): Promise<PublicPeriod | null> {
  try {
    const res = await fetch(`${API_BASE}/api/public/period`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error('fetchActivePeriod error:', error);
    return null;
  }
}

export async function fetchPublicContents(params?: {
  category?: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<{ items: PublicContent[]; total: number }> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.search) searchParams.set('q', params.search);

    const res = await fetch(`${API_BASE}/api/public/contents?${searchParams}`, {
      next: { revalidate: 30 }
    });
    
    if (!res.ok) return { items: [], total: 0 };
    const json = await res.json();
    return json.data || { items: [], total: 0 };
  } catch (error) {
    console.error('fetchPublicContents error:', error);
    return { items: [], total: 0 };
  }
}

export async function fetchPublicContentBySlug(slug: string): Promise<PublicContentDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/api/public/contents/${slug}`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error('fetchPublicContentBySlug error:', error);
    return null;
  }
}

export async function fetchActiveBoardMembers(): Promise<PublicBoardMember[]> {
  try {
    const res = await fetch(`${API_BASE}/api/public/board`, {
      next: { revalidate: 120 }
    });
    
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('fetchActiveBoardMembers error:', error);
    return [];
  }
}

export async function fetchPublicDepartments(): Promise<PublicDepartment[]> {
  try {
    const res = await fetch(`${API_BASE}/api/public/departments`, {
      next: { revalidate: 120 }
    });
    
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('fetchPublicDepartments error:', error);
    return [];
  }
}

export async function fetchPublicDepartmentBySlug(slug: string): Promise<PublicDepartmentDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/api/public/departments/${slug}`, {
      next: { revalidate: 120 }
    });
    
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error('fetchPublicDepartmentBySlug error:', error);
    return null;
  }
}

export async function fetchPublicStats(): Promise<{
  departments: number;
  programs: number;
  contents: number;
  events: number;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/public/stats`, {
      next: { revalidate: 300 }
    });
    
    if (!res.ok) return { departments: 0, programs: 0, contents: 0, events: 0 };
    const json = await res.json();
    return json.data || { departments: 0, programs: 0, contents: 0, events: 0 };
  } catch (error) {
    console.error('fetchPublicStats error:', error);
    return { departments: 0, programs: 0, contents: 0, events: 0 };
  }
}
