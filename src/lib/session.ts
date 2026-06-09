// Per-page-load session id. Refreshing the page starts a brand new session,
// so all progress and dashboard data resets like a first-time visit.
let cachedId: string | null = null;

export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  if (!cachedId) {
    cachedId =
      (crypto as any)?.randomUUID?.() ??
      `s_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  }
  return cachedId;
}
