import { withTV } from 'Hooks/withTV';
import { useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
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
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>(
    selectedVoice.lastSeasonId,
  );
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | undefined>(
    selectedVoice.lastEpisodeId,
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

  const handleSelectVideo = (video: FilmVideoInterface, voice: FilmVoiceInterface) => {
    if (ServiceStore.isSignedIn) {
      ServiceStore.getCurrentService().saveWatch(film, voice)
        .catch((error) => {
          NotificationStore.displayError(error as Error);
        });
    }

    onSelect(video, voice);
  };

  const handleSelectVoice = async (voiceId: string) => {
    const { hasSeasons } = film;
    const voice = voices.find(({ id }) => id === voiceId);

    if (!voice) {
      return;
    }

    if (!hasSeasons) {
      setSelectedVoice(voice);

      setIsLoading(true);

      try {
        const video = await ServiceStore.getCurrentService()
          .getFilmStreamsByVoice(film, selectedVoice);

        handleSelectVideo(video, voice);
      } catch (error) {
        NotificationStore.displayError(error as Error);
      } finally {
        setIsLoading(false);
      }

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

  const handleSelectEpisode = async (episodeId: string) => {
    const { hasSeasons } = film;

    setSelectedEpisodeId(episodeId);
    setIsLoading(true);

    try {
      const video = await ServiceStore.getCurrentService()
        .getFilmStreamsByEpisodeId(
          film,
          selectedVoice,
          selectedSeasonId ?? '1',
          episodeId,
        );

      const voice = {
        ...selectedVoice,
      };

      if (hasSeasons) {
        voice.lastSeasonId = selectedSeasonId;
        voice.lastEpisodeId = episodeId;
      }

      handleSelectVideo(video, voice);
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
    handleSelectEpisode,
  };

  return withTV(FilmVideoSelectorComponentTV, PlayerVideoSelectorComponent, {
    ...containerProps(),
    ...containerFunctions,
  });
}

export default PlayerVideoSelectorContainer;
