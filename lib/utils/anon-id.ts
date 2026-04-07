/**
 * Anonymous ID utilities for identifying the current user
 * without authentication (stored in localStorage)
 */

const ANON_ID_KEY = "anonId";

/**
 * Get or create an anonymous ID for the current user
 * @returns The anonymous ID string
 */
export function getAnonId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  let anonId = localStorage.getItem(ANON_ID_KEY);
  if (!anonId) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      anonId = crypto.randomUUID();
    } else {
      // Fallback for non-secure contexts (HTTP / External IP)
      anonId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    localStorage.setItem(ANON_ID_KEY, anonId);
  }
  return anonId;
}
