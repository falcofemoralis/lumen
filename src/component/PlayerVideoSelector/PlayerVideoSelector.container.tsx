import { withTV } from 'Hooks/withTV';
import { useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import { EpisodeInterface, FilmVoiceInterface, SeasonInterface } from 'Type/FilmVoice.interface';

import PlayerVideoSelectorComponent from './PlayerVideoSelector.component';
import FilmVideoSelectorComponentTV from './PlayerVideoSelector.component.atv';
import { PlayerVideoSelectorContainerProps } from './PlayerVideoSelector.type';

export function PlayerVideoSelectorContainer({
  onHide,
  film,
  onSelect,
}: PlayerVideoSelectorContainerProps) {
  const { voices = [] } = film;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<FilmVoiceInterface>(
    voices.find(({ isActive }) => isActive) ?? voices[0],
  );
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(
    selectedVoice.lastSeasonId ?? null,
  );
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(
    selectedVoice.lastEpisodeId ?? null,
  );

  const getSeasons = (): SeasonInterface[] => {
    const { seasons = [] } = selectedVoice;

    return seasons;
  };

  const getEpisodes = (): EpisodeInterface[] => {
    const { seasons = [] } = selectedVoice;

    const { episodes = [] } = seasons.find(({ seasonId }) => seasonId === selectedSeasonId) ?? {};

    return episodes;
  };

  const handleSelectVoice = async (voiceId: string) => {
    const { hasSeasons } = film;
    const voice = voices.find(({ id }) => id === voiceId);

    if (!voice) {
      return;
    }

    if (!hasSeasons) {
      setSelectedVoice(voice);

      return;
    }

    setIsLoading(true);

    try {
      const updatedVoice = await ServiceStore.getCurrentService().getFilmSeasons(film, voice);

      setSelectedVoice(updatedVoice);

      const { seasons = [] } = updatedVoice;

      if (seasons.length > 0) {
        const season = seasons[0];
        const { seasonId, episodes: [{ episodeId }] = [] } = season;
        setSelectedSeasonId(seasonId);
        setSelectedEpisodeId(episodeId);
      }
    } catch (error) {
      NotificationStore.displayError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnPlay = async () => {
    const { hasSeasons } = film;

    setIsLoading(true);

    try {
      const currentService = ServiceStore.getCurrentService();

      const video = !hasSeasons
        ? await currentService.getFilmStreamsByVoice(film, selectedVoice)
        : await currentService.getFilmStreamsByEpisodeId(
          film,
          selectedVoice,
          selectedSeasonId ?? '1',
          selectedEpisodeId ?? '1',
        );

      onSelect(video);
    } catch (error) {
      NotificationStore.displayError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerProps = () => ({
    voices,
    onHide,
    isLoading,
    selectedVoice,
    selectedSeasonId,
    selectedEpisodeId,
    seasons: getSeasons(),
    episodes: getEpisodes(),
  });

  const containerFunctions = {
    handleSelectVoice,
    setSelectedSeasonId,
    setSelectedEpisodeId,
    handleOnPlay,
  };

  return withTV(FilmVideoSelectorComponentTV, PlayerVideoSelectorComponent, {
    ...containerProps(),
    ...containerFunctions,
  });
}

export default PlayerVideoSelectorContainer;
