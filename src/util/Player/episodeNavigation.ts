import { FilmVoiceInterface } from 'Type/FilmVoice.interface';

export const findAdjacentEpisode = (voice: FilmVoiceInterface, direction: -1 | 1) => {
  const episodes = (voice.seasons ?? []).flatMap((season) =>
    season.episodes.map((episode) => ({ seasonId: season.seasonId, episode })));
  const index = episodes.findIndex((item) =>
    item.seasonId === voice.lastSeasonId && item.episode.episodeId === voice.lastEpisodeId);
  if (index < 0) return null;
  return episodes[index + direction] ?? null;
};

export const resolveAdjacentEpisode = async (
  voice: FilmVoiceInterface,
  direction: -1 | 1,
  refresh?: (voice: FilmVoiceInterface) => Promise<FilmVoiceInterface>,
) => {
  const fresh = refresh ? await refresh(voice) : voice;
  const updated = { ...voice, ...fresh, lastSeasonId: voice.lastSeasonId, lastEpisodeId: voice.lastEpisodeId };
  const target = findAdjacentEpisode(updated, direction);
  return target ? {
    voice: { ...updated, lastSeasonId: target.seasonId, lastEpisodeId: target.episode.episodeId },
    seasonId: target.seasonId,
    episodeId: target.episode.episodeId,
    video: target.episode.video,
  } : null;
};