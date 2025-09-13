import { SavedTime } from 'Component/Player/Player.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { EpisodeInterface, FilmVoiceInterface, SeasonInterface } from 'Type/FilmVoice.interface';

export type PlayerVideoSelectorContainerProps = {
  overlayRef: React.RefObject<ThemedOverlayRef | null>;
  film: FilmInterface;
  voice?: FilmVoiceInterface;
  onSelect: (video: FilmVideoInterface, voice: FilmVoiceInterface) => void;
  onClose?: () => void;
};

export type PlayerVideoSelectorComponentProps = {
  overlayRef: React.RefObject<ThemedOverlayRef | null>;
  film: FilmInterface;
  voices: FilmVoiceInterface[];
  isLoading: boolean;
  selectedVoice: FilmVoiceInterface;
  selectedSeasonId: string | undefined;
  selectedEpisodeId: string | undefined;
  seasons: SeasonInterface[];
  episodes: EpisodeInterface[];
  savedTime: SavedTime | null;
  voiceOverlayRef: React.RefObject<ThemedOverlayRef | null>;
  handleSelectVoice: (voiceId: string) => void;
  setSelectedSeasonId: (id: string) => void;
  handleSelectEpisode: (episodeId: string) => void;
  calculateProgressThreshold: (progress: number) => number;
  onOverlayOpen: () => void;
  onClose?: () => void;
};
