import { withTV } from 'Hooks/withTV';
import { useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import { Episode, FilmVoice, Season } from 'Type/FilmVoice.interface';
import FilmVideoSelectorComponent from './FilmVideoSelector.component';
import FilmVideoSelectorComponentTV from './FilmVideoSelector.component.atv';
import { FilmVideoSelectorContainerProps } from './FilmVideoSelector.type';
import configApi from 'Api/RezkaApi/configApi';
import RezkaApi from 'Api/RezkaApi';

export function FilmVideoSelectorContainer(props: FilmVideoSelectorContainerProps) {
  const { visible, onHide, film, voices } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<FilmVoice>(
    voices.find(({ isActive }) => isActive) ?? voices[0]
  );
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(
    selectedVoice.lastSeasonId ?? null
  );
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(
    selectedVoice.lastEpisodeId ?? null
  );

  const getSeasons = (): Season[] => {
    const { seasons = [] } = selectedVoice;

    return seasons;
  };

  const getEpisodes = (): Episode[] => {
    const { seasons = [] } = selectedVoice;

    const { episodes = [] } = seasons.find(({ seasonId }) => seasonId === selectedSeasonId) ?? {};

    return episodes;
  };

  const handleSelectVoice = async (voice: FilmVoice) => {
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
      NotificationStore.displayError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnPlay = async () => {
    throw new Error('Not implemented');
    setIsLoading(true);

    try {
      const video = await ServiceStore.getCurrentService().getFilmStreams(film, selectedVoice);
    } catch (error) {
      NotificationStore.displayError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerProps = () => {
    return {
      visible,
      voices,
      onHide,
      isLoading,
      selectedVoice,
      selectedSeasonId,
      selectedEpisodeId,
      seasons: getSeasons(),
      episodes: getEpisodes(),
    };
  };

  const containerFunctions = {
    handleSelectVoice,
    setSelectedSeasonId,
    setSelectedEpisodeId,
    handleOnPlay,
  };

  return withTV(FilmVideoSelectorComponentTV, FilmVideoSelectorComponent, {
    ...containerProps(),
    ...containerFunctions,
  });
}

export default FilmVideoSelectorContainer;
