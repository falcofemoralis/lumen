import type { FilmVoiceInterface } from '../../type/FilmVoice.interface';

export interface EpisodePosition {
  seasonId?: string;
  episodeId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
}
const numberFor = (name?: string, id?: string): number | undefined => {
  const named = name?.match(/^(?:сезон|серия|эпизод|season|episode)\s*(\d+)\b/i)
    ?? name?.match(/^(\d+)\s*(?:сезон|серия|эпизод|season|episode)(?:\s|$)/i);
  if (named) return Number(named[1]);

  return id && /^\d{1,3}$/.test(id) ? Number(id) : undefined;
};

export function episodePosition(voice: FilmVoiceInterface, seasonId?: string, episodeId?: string): EpisodePosition {
  const season = voice.seasons?.find(item => item.seasonId === seasonId);
  const episode = season?.episodes.find(item => item.episodeId === episodeId);

  return {
    seasonId, episodeId,
    seasonNumber: numberFor(season?.name, seasonId),
    episodeNumber: numberFor(episode?.name, episodeId),
  };
}

/** Provider IDs are only comparable within the same voice; cross-source resumes use episode numbers. */
export function resolveEpisodeSelection(
  voice: FilmVoiceInterface, position: EpisodePosition, sameVoice = false
): { seasonId: string; episodeId: string } | undefined {
  const seasons = voice.seasons ?? [];
  const seasonNumber = position.seasonNumber ?? numberFor(undefined, position.seasonId);
  const episodeNumber = position.episodeNumber ?? numberFor(undefined, position.episodeId);
  const season = (sameVoice ? seasons.find(item => item.seasonId === position.seasonId) : undefined)
    ?? (seasonNumber !== undefined
      ? seasons.find(item => numberFor(item.name, item.seasonId) === seasonNumber) : undefined);
  if (!season) return undefined;
  const episode = (sameVoice ? season.episodes.find(item => item.episodeId === position.episodeId) : undefined)
    ?? (episodeNumber !== undefined
      ? season.episodes.find(item => numberFor(item.name, item.episodeId) === episodeNumber) : undefined);

  return episode ? { seasonId: season.seasonId, episodeId: episode.episodeId } : undefined;
}
