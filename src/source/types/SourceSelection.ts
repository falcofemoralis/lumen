import { ContentSource } from './ContentSource';

let selection: () => readonly string[] = () => Object.values(ContentSource);
export const setSourceSelection = (read: () => readonly string[]) => { selection = read; };
const enabledSources = (): readonly string[] => {
  const value = selection();
  return Array.isArray(value) ? value : Object.values(ContentSource);
};
export const isSourceEnabled = (source: ContentSource): boolean => enabledSources().includes(source);
export const enabledSourceKey = (): string => enabledSources().slice().sort().join(',');
export const sourceForLink = (link: string): ContentSource => {
  try {
    const host = new URL(link).hostname;
    if (host === 'anixart-app.com') return ContentSource.ANIXART;
    if (host.endsWith('.zona.im')) return ContentSource.ZONA;
  } catch { /* Legacy Rezka links may be relative. */ }
  return ContentSource.REZKA;
};