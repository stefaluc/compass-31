import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Copy text to the clipboard. Uses the async Clipboard API when the browser
 * allows it and falls back to a selection-based copy otherwise (older Safari,
 * embedded webviews, denied clipboard permission). Resolves to whether the
 * text was copied.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Stay inside an open dialog so its focus trap doesn't block the selection.
    const host = document.activeElement?.closest('[role="dialog"]') ?? document.body;
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    host.appendChild(area);
    area.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      area.remove();
    }
  }
}
