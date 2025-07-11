import { SavedTime } from 'Component/Player/Player.type';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { EpisodeInterface, FilmVoiceInterface, SeasonInterface } from 'Type/FilmVoice.interface';

export type PlayerVideoSelectorContainerProps = {
  overlayId: string;
  film: FilmInterface;
  voice?: FilmVoiceInterface;
  onHide: () => void;
  onSelect: (video: FilmVideoInterface, voice: FilmVoiceInterface) => void;
};

export type PlayerVideoSelectorComponentProps = {
  overlayId: string;
  film: FilmInterface;
  voices: FilmVoiceInterface[];
  isLoading: boolean;
  selectedVoice: FilmVoiceInterface;
  selectedSeasonId: string | undefined;
  selectedEpisodeId: string | undefined;
  seasons: SeasonInterface[];
  episodes: EpisodeInterface[];
  savedTime: SavedTime | null;
  handleSelectVoice: (voiceId: string) => void;
  setSelectedSeasonId: (id: string) => void;
  onHide: () => void;
  handleSelectEpisode: (episodeId: string) => void;
  calculateProgressThreshold: (progress: number) => number;
};
