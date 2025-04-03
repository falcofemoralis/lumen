import PlayerStore from 'Component/Player/Player.store';
import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import OverlayStore from 'Store/Overlay.store';
import ServiceStore from 'Store/Service.store';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { EpisodeInterface, FilmVoiceInterface, SeasonInterface } from 'Type/FilmVoice.interface';

import PlayerVideoSelectorComponent from './PlayerVideoSelector.component';
import FilmVideoSelectorComponentTV from './PlayerVideoSelector.component.atv';
import { PlayerVideoSelectorContainerProps } from './PlayerVideoSelector.type';

export function PlayerVideoSelectorContainer({
  overlayId,
  film,
  voice: voiceInput,
  onHide,
  onSelect,
}: PlayerVideoSelectorContainerProps) {
  const { voices = [] } = film;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<FilmVoiceInterface>(
    voiceInput ?? voices.find(({ isActive }) => isActive) ?? voices[0],
  );

  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>(
    selectedVoice.lastSeasonId,
  );
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | undefined>(
    selectedVoice.lastEpisodeId,
  );

  const getStoreVoice = () => {
    const { id } = film;

    const { filmId, voice } = PlayerStore.selectedVoice || {};

    if (filmId === id && voice) {
      return voice;
    }

    return null;
  };

  /**
   * In case if user selected another voice\season\episode directly in the player
   */
  useEffect(() => {
    const voice = getStoreVoice();

    if (voice) {
      setSelectedVoice(voice);
      setSelectedSeasonId(voice.lastSeasonId);
      setSelectedEpisodeId(voice.lastEpisodeId);
    }
  }, [PlayerStore.selectedVoice]);

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

    if (getStoreVoice()) {
      // if store voice was updated, re update it
      PlayerStore.setSelectedVoice(film.id, voice);
    }
  };

  const handleSelectVoice = async (voiceId: string) => {
    const { hasSeasons } = film;
    const voice = voices.find(({ identifier }) => identifier === voiceId);

    if (!voice) {
      return;
    }

    if (!hasSeasons) {
      setSelectedVoice(voice);

      setIsLoading(true);

      try {
        const video = await ServiceStore.getCurrentService()
          .getFilmStreamsByVoice(film, voice);

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

    OverlayStore.goToPreviousOverlay();
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
    overlayId,
    voices,
    onHide,
    isLoading,
    selectedVoice,
    selectedSeasonId,
    selectedEpisodeId,
    seasons: getSeasons(),
    episodes: getEpisodes(),
    film,
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

export default observer(PlayerVideoSelectorContainer);
