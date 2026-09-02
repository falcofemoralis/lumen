import { FilmInterface } from 'Type/Film.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';

// A schedule block is a season ("1 сезон", parsed out of "<title> - даты выхода серий
// 1 сезона"), and each of its rows an episode ("2 серия"). Neither carries an id that
// ties it back to a season/episode of a voice, so the numbers in those labels are what
// is matched against.
const SEASON_MARKER = /(\d+)\s*сезон/i;
const EPISODE_MARKER = /(\d+)\s*сери/i;

const parseMarkedNumber = (value: string | undefined, marker: RegExp): number | null => {
  const match = value?.match(marker);

  return match ? Number(match[1]) : null;
};

// a row that names no episode marker - a differently labelled provider, or a bare
// "2" - still has its leading number to go by. Block names get no such fallback:
// the only number to find in one of those is the number of a title.
const parseEpisodeNumber = (value: string | undefined): number | null => {
  const match = value?.match(EPISODE_MARKER) ?? value?.match(/\d+/);

  return match ? Number(match[match.length - 1]) : null;
};

/**
 * The name the schedule gives the episode that is currently playing, for the player to
 * show under the title. Returns undefined whenever there is nothing to be sure about:
 * a film rather than a series, a film with no schedule, or a schedule that does not
 * list this episode yet. With `withDate` the air date the schedule lists for that
 * episode is appended as "name (date)" - dropped when the row carries no date.
 */
export const getScheduleEpisodeName = (
  film: FilmInterface,
  voice: FilmVoiceInterface,
  withDate = false
): string | undefined => {
  const { hasSeasons, schedule = [] } = film;
  const { lastSeasonId, lastEpisodeId } = voice;

  if (!hasSeasons || !lastSeasonId || !lastEpisodeId || !schedule.length) {
    return undefined;
  }

  const seasonNumber = Number(lastSeasonId);
  const episodeNumber = Number(lastEpisodeId);

  // the lone block of a series that never numbered its seasons is the one being watched -
  // but a lone block that does carry a number still has to match it, or a show whose
  // schedule only covers its latest season would name the wrong episode
  const season = schedule.find(({ name }) => parseMarkedNumber(name, SEASON_MARKER) === seasonNumber)
    ?? (schedule.length === 1 && parseMarkedNumber(schedule[0].name, SEASON_MARKER) === null
      ? schedule[0]
      : undefined);

  const item = season?.items.find(({ name }) => parseEpisodeNumber(name) === episodeNumber);

  if (!item) {
    return undefined;
  }

  const { episodeName, episodeNameOriginal, date } = item;
  const name = episodeName || episodeNameOriginal || undefined;
  const airDate = date?.trim();

  if (!name || !withDate || !airDate) {
    return name;
  }

  return `${name} (${airDate})`;
};
