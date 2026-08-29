import { InfoBlock } from 'Component/InfoBlock';
import { Loader } from 'Component/Loader';
import { Page } from 'Component/Page';
import { ThemedSafeArea } from 'Component/ThemedSafeArea';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { View } from 'react-native';
import { useYouTubePlayer, YoutubeView } from 'react-native-youtube-bridge';

import { componentStyles } from './FilmTrailerScreen.style';
import { FilmTrailerScreenComponentProps } from './FilmTrailerScreen.type';

const TrailerPlayer = ({ trailerUrl }: { trailerUrl: string }) => {
  const player = useYouTubePlayer({ url: trailerUrl }, {
    autoplay: true,
    controls: true,
    playsinline: true,
    rel: false,
  });

  return (
    <YoutubeView player={ player } style={ { width: '100%', height: '100%' } } />
  );
};

export const FilmTrailerComponent = ({
  trailerUrl,
  isLoading,
  backHandler,
}: FilmTrailerScreenComponentProps) => {
  const styles = useThemedStyles(componentStyles);

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
      <View style={ styles.wrapper }>
        { /* { renderCloseButton() } */ }
        <TrailerPlayer trailerUrl={ trailerUrl } />
      </View>
    );
  };

  return (
    <Page fullscreen>
      <ThemedSafeArea edges={ ['top', 'bottom', 'left', 'right'] }>
        { renderContent() }
      </ThemedSafeArea>
    </Page>
  );
};

export default FilmTrailerComponent;