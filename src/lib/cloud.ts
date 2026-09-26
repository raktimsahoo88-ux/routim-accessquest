export type CloudSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  expires_at?: number;
  user: { id: string; email?: string; user_metadata?: { name?: string } };
};

export type CloudProfile = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'owner' | 'moderator';
  created_at: string;
  last_seen: string;
};

export type ActivityEvent = {
  id: string;
  user_id: string | null;
  event_type: string;
  title: string;
  body: string;
  created_at: string;
  metadata?: Record<string, unknown>;
};

export type CloudNotification = {
  id: string;
  recipient_user_id: string | null;
  title: string;
  body: string;
  type: string;
  created_at: string;
};

export const cloudEnabled = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function headers(token?: string) {
  return {
    apikey: anon || '',
    Authorization: `Bearer ${token || anon || ''}`,
    'Content-Type': 'application/json',
  };
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  if (!cloudEnabled || !base) throw new Error('Cloud mode is not configured.');
  const response = await fetch(`${base}${path}`, { ...init, headers: { ...headers(token), ...(init.headers || {}) }, cache: 'no-store' });
  const text = await response.text();
  let data: unknown = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const message = typeof data === 'object' && data && 'msg' in data ? String((data as {msg:string}).msg) : typeof data === 'object' && data && 'message' in data ? String((data as {message:string}).message) : `Cloud request failed (${response.status})`;
    throw new Error(message);
  }
  return data as T;
}

export async function cloudSignUp(email: string, password: string, name: string): Promise<CloudSession> {
  const data = await request<CloudSession>('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ email, password, data: { name } }) });
  if (!data?.access_token) throw new Error('Account created. If email confirmation is enabled in Supabase, verify the email and then log in.');
  return data;
}

export async function cloudSignIn(email: string, password: string): Promise<CloudSession> {
  return request<CloudSession>('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function cloudRefresh(refreshToken: string): Promise<CloudSession> {
  return request<CloudSession>('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) });
}

export async function cloudProfile(token: string, userId: string): Promise<CloudProfile | null> {
  const rows = await request<CloudProfile[]>(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,name,email,role,created_at,last_seen&limit=1`, {}, token);
  return rows[0] || null;
}

export async function cloudTouchProfile(token: string, userId: string) {
  await request(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ last_seen: new Date().toISOString() }) }, token);
}

export async function cloudActivity(token: string, limit = 80): Promise<ActivityEvent[]> {
  return request<ActivityEvent[]>(`/rest/v1/activity_events?select=id,user_id,event_type,title,body,created_at,metadata&order=created_at.desc&limit=${limit}`, {}, token);
}

export async function cloudProfiles(token: string): Promise<CloudProfile[]> {
  return request<CloudProfile[]>('/rest/v1/profiles?select=id,name,email,role,created_at,last_seen&order=last_seen.desc', {}, token);
}

export async function cloudNotifications(token: string, userId: string): Promise<CloudNotification[]> {
  return request<CloudNotification[]>(`/rest/v1/notifications?select=id,recipient_user_id,title,body,type,created_at&or=(recipient_user_id.is.null,recipient_user_id.eq.${encodeURIComponent(userId)})&order=created_at.desc&limit=60`, {}, token);
}

export async function cloudInsertActivity(token: string, userId: string, eventType: string, title: string, body: string, metadata: Record<string, unknown> = {}) {
  await request('/rest/v1/activity_events', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ user_id: userId, event_type: eventType, title, body, metadata }) }, token);
}
