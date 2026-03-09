import { SavedTime } from 'Component/Player/Player.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { DownloadLinkInterface } from 'Type/DownloadLink.interface';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { EpisodeInterface, FilmVoiceInterface, SeasonInterface } from 'Type/FilmVoice.interface';

export type PlayerVideoSelectorContainerProps = {
  film: FilmInterface;
  voice?: FilmVoiceInterface;
  isDownloader?: boolean;
  isOffline?: boolean;
  onSelect: (video: FilmVideoInterface, voice: FilmVoiceInterface, quality?: string) => void;
  onClose?: () => void;
  onDownloadSelect?: (links: DownloadLinkInterface[]) => void;
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
  isDownloader?: boolean;
  isOffline?: boolean;
  qualityOverlayRef: React.RefObject<ThemedOverlayRef | null>;
  episodesToDownload: Record<string, boolean>;
  streamQualities: string[] | null;
  playerAskQuality: boolean;
  handleSelectVoice: (voiceId: string) => void;
  setSelectedSeasonId: (id: string) => void;
  handleSelectEpisode: (episodeId: string) => void;
  calculateProgressThreshold: (progress: number) => number;
  onOverlayOpen: () => void;
  onClose?: () => void;
  handleEpisodesDownload: () => void;
  handleDownload: (quality: string) => void;
  handleQualitySelect: (quality: string) => void;
};
