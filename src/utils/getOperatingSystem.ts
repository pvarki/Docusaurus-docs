export type OS = 'android' | 'ios' | 'windows';

export function detectOS(): OS {
  if (/Android/i.test(navigator.userAgent)) return 'android';
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) return 'ios';
  if (/Win/i.test(navigator.platform)) return 'windows';
  // fall‑back: assume Android
  return 'android';
}
