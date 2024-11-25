import Film from 'Type/Film.interface';
import { FilmVideo } from 'Type/FilmVideo.interface';
import { Episode, FilmVoice, Season } from 'Type/FilmVoice.interface';

export type FilmVideoSelectorContainerProps = {
  film: Film;
  voices: FilmVoice[];
  visible: boolean;
  onHide: () => void;
  onSelect: (video: FilmVideo) => void;
};

export type FilmVideoSelectorComponentProps = {
  voices: FilmVoice[];
  visible: boolean;
  onHide: () => void;
  isLoading: boolean;
  selectedVoice: FilmVoice;
  selectedSeasonId: string | null;
  selectedEpisodeId: string | null;
  handleSelectVoice: (voice: FilmVoice) => void;
  setSelectedSeasonId: (id: string) => void;
  setSelectedEpisodeId: (id: string) => void;
  seasons: Season[];
  episodes: Episode[];
};
