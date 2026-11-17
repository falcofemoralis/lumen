import { FilmVoiceInterface } from 'Type/FilmVoice.interface';

const PREMIUM_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">',
  '<path fill="#f4c542" d="m2 5 5 4 5-7 5 7 5-4-3 14H5z"/>',
  '<path fill="#f4c542" d="M5 20h14v2H5z"/></svg>',
].join('');
const PREMIUM_ICON = `data:image/svg+xml,${encodeURIComponent(PREMIUM_SVG)}`;

export const visibleVoices = (voices: FilmVoiceInterface[], hidePremium: boolean) => (
  hidePremium ? voices.filter(voice => !voice.isPremium) : voices
);
export const voicePremiumIcon = (voice: FilmVoiceInterface, platform: string) => (
  platform === 'web' && voice.isPremium ? PREMIUM_ICON : voice.premiumIcon
);