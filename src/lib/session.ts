// Anonymous per-browser session id so the dashboard can scope data per player
// without requiring authentication.
const KEY = "iot-quest-session-id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id =
      (crypto as any)?.randomUUID?.() ??
      `s_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}
