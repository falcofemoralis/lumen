import { InfoBlock } from 'Component/InfoBlock';
import { Loader } from 'Component/Loader';
import { Page } from 'Component/Page';
import { ThemedPressable } from 'Component/ThemedPressable';
import { t } from 'i18n/translate';
import { TVFocusGuideView } from 'react-native';
import { PlayerState, useYouTubeEvent, useYouTubePlayer, YoutubeView } from 'react-native-youtube-bridge';
import { DefaultFocus } from 'react-tv-space-navigation';

import { FilmTrailerScreenComponentProps } from './FilmTrailerScreen.type';

const TrailerPlayer = ({ trailerUrl }: { trailerUrl: string }) => {
  const player = useYouTubePlayer({ url: trailerUrl }, {
    autoplay: true,
    controls: false,
  });

  const state = useYouTubeEvent(player, 'stateChange');

  const handleTogglePlay = () => {
    if (state === PlayerState.PLAYING) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <TVFocusGuideView focusable={ false } style={ { flex: 1 } }>
      <ThemedPressable
        onPress={ handleTogglePlay }
        style={ { width: '100%', height: '100%' } }
      >
        <YoutubeView player={ player } style={ { width: '100%', height: '100%' } } />
      </ThemedPressable>
    </TVFocusGuideView>
  );
};

export const FilmTrailerComponent = ({
  trailerUrl,
  isLoading,
}: FilmTrailerScreenComponentProps) => {
  const renderContent = () => {
    if (isLoading) {
      return <Loader isLoading fullScreen />;
    }

    if (!trailerUrl) {
      return (
        <InfoBlock
          title={ t('Tailer not found') }
          subtitle={ t('Try again later') }
          style={ { flex: 1, justifyContent: 'center', alignItems: 'center' } }
        />
      );
    }

    return (
      <DefaultFocus>
        <TrailerPlayer trailerUrl={ trailerUrl } />
      </DefaultFocus>
    );
  };

  return (
    <Page fullscreen>
      { renderContent() }
    </Page>
  );
};

export default FilmTrailerComponent;