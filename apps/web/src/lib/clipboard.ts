/**
 * Cross-browser clipboard helper.
 *
 * Prefers the async Clipboard API (available in secure contexts such as
 * https and localhost). When it is unavailable or rejects (e.g. non-secure
 * contexts, older mobile browsers), it falls back to a hidden textarea +
 * `document.execCommand('copy')` so copying still works on mobile.
 *
 * Returns `true` when the text was placed on the clipboard, `false` otherwise.
 * It never throws, so callers can safely use the boolean to decide the toast.
 */

export async function copyText(text: string): Promise<boolean> {
  // 1) Modern async clipboard API (secure contexts).
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to the legacy path
    }
  }

  // 2) Legacy fallback for non-secure / older browsers.
  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }

  return false;
}
