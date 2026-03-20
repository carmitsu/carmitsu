export function getPanelToken(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem('panel_token') || '';
}

export function setPanelToken(token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('panel_token', token);
}

export function clearPanelToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('panel_token');
}

export function getAuthHeaders(): Record<string, string> {
  const token = getPanelToken();
  if (!token) return {};
  return {
    'Authorization': `Bearer ${token}`,
  };
}
