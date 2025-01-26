import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { EpisodeInterface, FilmVoiceInterface, SeasonInterface } from 'Type/FilmVoice.interface';

export type PlayerVideoSelectorContainerProps = {
  overlayId: string;
  film: FilmInterface;
  onHide: () => void;
  onSelect: (video: FilmVideoInterface, voice: FilmVoiceInterface) => void;
};

export type PlayerVideoSelectorComponentProps = {
  overlayId: string;
  voices: FilmVoiceInterface[];
  onHide: () => void;
  isLoading: boolean;
  selectedVoice: FilmVoiceInterface;
  selectedSeasonId: string | undefined;
  selectedEpisodeId: string | undefined;
  handleSelectVoice: (voiceId: string) => void;
  setSelectedSeasonId: (id: string) => void;
  seasons: SeasonInterface[];
  episodes: EpisodeInterface[];
  handleSelectEpisode: (episodeId: string) => void;
};
