export interface Episode {
  name: string;
  episodeId: string;
}

export interface Season {
  name: string;
  seasonId: string;
  episodes: Episode[];
}

export interface FilmVoice {
  id: string;
  title: string;
  img?: string;
  //
  seasons?: Season[];
  //
  isCamrip: string;
  isDirector: string;
  isAds: string;
  isPremium: boolean;
  //
  lastSeasonId?: string;
  lastEpisodeId?: string;
  //
  isActive: boolean;
}
