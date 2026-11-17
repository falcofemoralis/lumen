import React from 'react';
import { StyleSheet } from 'react-native';
export const useYouTubePlayer = (source, options) => ({ ...source, options });
export const YoutubeView = ({ player, style }) => {
  const url = new URL(player.url);
  const id = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).at(-1);
  return React.createElement('iframe', { src: 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0',
    style: { ...StyleSheet.flatten(style), border: 0 }, title: 'Трейлер', allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen', allowFullScreen: true });
};
