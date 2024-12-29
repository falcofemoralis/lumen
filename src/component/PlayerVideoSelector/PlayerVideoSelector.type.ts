import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { EpisodeInterface, FilmVoiceInterface, SeasonInterface } from 'Type/FilmVoice.interface';

export type PlayerVideoSelectorContainerProps = {
  film: FilmInterface;
  visible: boolean;
  onHide: () => void;
  onSelect: (video: FilmVideoInterface) => void;
};

export type PlayerVideoSelectorComponentProps = {
  voices: FilmVoiceInterface[];
  visible: boolean;
  onHide: () => void;
  isLoading: boolean;
  selectedVoice: FilmVoiceInterface;
  selectedSeasonId: string | null;
  selectedEpisodeId: string | null;
  handleSelectVoice: (voiceId: string) => void;
  setSelectedSeasonId: (id: string) => void;
  setSelectedEpisodeId: (id: string) => void;
  seasons: SeasonInterface[];
  episodes: EpisodeInterface[];
  handleOnPlay: () => void;
};
