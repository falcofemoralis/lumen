import { NUMBER_OF_COLUMNS_TV } from 'Component/FilmGrid/FilmGrid.config';
import { ROW_GAP } from 'Component/FilmGrid/FilmGrid.style.atv';
import { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';
import { getWindowWidth } from 'Util/Window';

const windowWidth = getWindowWidth() - ROW_GAP;
const cardWidth = windowWidth / NUMBER_OF_COLUMNS_TV - ROW_GAP;

export const POSTER_HEIGHT = cardWidth * (250 / 166);
export const INFO_PADDING = 8;
export const INFO_PADDING_TOP = 4;
export const INFO_HEIGHT = 60 + INFO_PADDING + INFO_PADDING_TOP;
export const CARD_HEIGHT_TV = POSTER_HEIGHT + INFO_HEIGHT;
export const DEFAULT_SCALE = 1;
export const FOCUSED_SCALE = 1.1;
export const BORDER_RADIUS = 15;

export const styles = CreateStyles({
  card: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    height: CARD_HEIGHT_TV,
  },
  posterWrapper: {
    height: CARD_HEIGHT_TV - INFO_HEIGHT,
    width: '100%',
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
  },
  poster: {
    height: '100%',
    width: '100%',
  },
  info: {
    width: '100%',
    height: INFO_HEIGHT,
    backgroundColor: Colors.transparent,
    borderEndEndRadius: BORDER_RADIUS,
    borderStartEndRadius: BORDER_RADIUS,
    padding: INFO_PADDING,
    paddingTop: INFO_PADDING_TOP,
  },
  infoFocused: {
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  titleFocused: {
    color: Colors.darkText,
  },
  subtitle: {
    fontSize: 10,
    color: Colors.secondaryText,
  },
  subtitleFocused: {
    color: Colors.darkText,
  },
  cardThumbnail: {
    backgroundColor: Colors.lightBackground,
    borderRadius: BORDER_RADIUS,
  },
});

export const FocusedAnimation = ({
  isFocused = false,
  children,
}: {
  isFocused?: boolean;
  children: (style: any) => React.ReactElement;
}) => {
  const duration = 250;

  const animatedScaleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(isFocused ? FOCUSED_SCALE : DEFAULT_SCALE, {
            duration,
          }),
        },
      ],
    };
  });

  const animatedInfoStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(
        isFocused ? styles.infoFocused.backgroundColor : styles.info.backgroundColor,
        {
          duration,
        }
      ),
    };
  });

  const animatedTitleStyle = useAnimatedStyle(() => {
    return {
      color: withTiming(isFocused ? styles.titleFocused.color : styles.title.color, {
        duration,
      }),
    };
  });

  const animatedSubtitleStyle = useAnimatedStyle(() => {
    return {
      color: withTiming(isFocused ? styles.subtitleFocused.color : styles.subtitle.color, {
        duration,
      }),
    };
  });

  const animatedPosterStyle = useAnimatedStyle(() => {
    const borderRadius = withTiming(isFocused ? 0 : BORDER_RADIUS, {
      duration,
    });

    return {
      borderEndEndRadius: borderRadius,
      borderStartEndRadius: borderRadius,
    };
  });

  return children({
    animatedScaleStyle,
    animatedInfoStyle,
    animatedTitleStyle,
    animatedSubtitleStyle,
    animatedPosterStyle,
  });
};
