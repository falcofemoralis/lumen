import { Loader } from 'Component/Loader';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedText } from 'Component/ThemedText';
import { ImageProgressEventData } from 'expo-image';
import { useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useAppTheme } from 'Theme/context';

import { getFittedSize } from './ThemedImageGallery.utils';

export type ImageViewerProps = {
  imageUrl: string;
  width: number;
  height: number;
  maxZoom?: number;
  maxZoomDouble?: number;
  /** Share of the image downloaded so far, or null while the size is unknown. */
  progress?: number | null;
  /** Set once the image is cached, so a preloaded one shows no loader at all. */
  isLoaded?: boolean;
  onProgress?: (event: ImageProgressEventData) => void;
  onRequestClose: () => unknown;
  onSingleTap?: () => unknown;
  onZoomChange?: (isZoomed: boolean) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
};

const AnimatedImage = Animated.createAnimatedComponent(ThemedImage);

export default function ImageViewer({
  imageUrl,
  width,
  height,
  maxZoom = 4,
  maxZoomDouble = 2,
  progress = null,
  isLoaded = false,
  onProgress,
  onSingleTap,
  onRequestClose,
  onZoomChange,
  onSwipeLeft,
  onSwipeRight,
}: ImageViewerProps) {
  const { theme } = useAppTheme();
  const dimensions = useWindowDimensions();

  const [isLoading, setIsLoading] = useState(!isLoaded);
  // A cached image still fires onLoadStart, so lean on `isLoaded` as well:
  // otherwise a preloaded image would blink a full loader before onLoadEnd.
  const showLoader = isLoading && !isLoaded;

  // Callers do not always know the image dimensions up front, so fall back to
  // what the decoded image reports. Until it arrives there is no aspect ratio to
  // fit to, and `getFittedSize` hands back a viewport-sized box.
  const [naturalSize, setNaturalSize] = useState<{
    width: number
    height: number
  } | null>(null);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);

  const MAX_ZOOM_SCALE = maxZoom;
  const MAX_ZOOM_SCALE_DOUBLE = maxZoomDouble;

  const { width: finalWidth, height: finalHeight } = useMemo(
    () => getFittedSize(
      width || naturalSize?.width || 0,
      height || naturalSize?.height || 0,
      dimensions
    ),
    [width, height, naturalSize, dimensions]
  );

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      onZoomChange && runOnJS(onZoomChange)(scale.value > 1);
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (scale.value < 1) {
        return;
      }

      if (scale.value === 1) {
        translateX.value = savedTranslateX.value + event.translationX;
      } else {
        const realImageWidth = finalWidth * scale.value;

        const maxTranslateX = realImageWidth <= dimensions.width
          ? 0
          : (realImageWidth - dimensions.width) / 2;
        const minTranslateX = realImageWidth <= dimensions.width
          ? 0
          : -(realImageWidth - dimensions.width) / 2;

        const possibleNewTranslateX = savedTranslateX.value + event.translationX;

        if (possibleNewTranslateX > maxTranslateX) {
          translateX.value = maxTranslateX;
        } else if (possibleNewTranslateX < minTranslateX) {
          translateX.value = minTranslateX;
        } else {
          translateX.value = possibleNewTranslateX;
        }
      }

      if (scale.value > 1) {
        const realImageHeight = finalHeight * scale.value;

        const maxTranslateY = realImageHeight <= dimensions.height
          ? 0
          : (realImageHeight - dimensions.height) / 2;
        const minTranslateY = realImageHeight <= dimensions.height
          ? 0
          : -(realImageHeight - dimensions.height) / 2;

        const possibleNewTranslateY = savedTranslateY.value + event.translationY;

        if (possibleNewTranslateY > maxTranslateY) {
          translateY.value = maxTranslateY;
        } else if (possibleNewTranslateY < minTranslateY) {
          translateY.value = minTranslateY;
        } else {
          translateY.value = possibleNewTranslateY;
        }
      }
    })
    .onEnd((event) => {
      if (scale.value === 1) {
        const absX = Math.abs(event.translationX);
        const absY = Math.abs(event.translationY);

        if (absX > absY && absX > 50) {
          translateX.value = withTiming(0);
          translateY.value = withTiming(0);

          if (event.translationX < 0) {
            onSwipeLeft && runOnJS(onSwipeLeft)();
          } else {
            onSwipeRight && runOnJS(onSwipeRight)();
          }

          return;
        }

        translateY.value = withTiming(0);
        translateX.value = withTiming(0);
        onZoomChange && runOnJS(onZoomChange)(false);
      } else if (scale.value < 1) {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        onZoomChange && runOnJS(onZoomChange)(false);
      } else if (scale.value > MAX_ZOOM_SCALE) {
        scale.value = withTiming(MAX_ZOOM_SCALE);
        onZoomChange && runOnJS(onZoomChange)(true);
      } else {
        const realImageWidth = finalWidth * scale.value;

        const maxTranslateX = realImageWidth <= dimensions.width
          ? 0
          : (realImageWidth - dimensions.width) / 2;
        const minTranslateX = realImageWidth <= dimensions.width
          ? 0
          : -(realImageWidth - dimensions.width) / 2;

        translateX.value = withDecay({
          velocity: event.velocityX,
          clamp: [minTranslateX, maxTranslateX],
          deceleration: 0.97,
        });

        const realImageHeight = finalHeight * scale.value;

        const maxTranslateY = realImageHeight <= dimensions.height
          ? 0
          : (realImageHeight - dimensions.height) / 2;
        const minTranslateY = realImageHeight <= dimensions.height
          ? 0
          : -(realImageHeight - dimensions.height) / 2;

        translateY.value = withDecay({
          velocity: event.velocityY,
          clamp: [minTranslateY, maxTranslateY],
          deceleration: 0.97,
        });
        onZoomChange && runOnJS(onZoomChange)(true);
      }
    });

  const singleTap = Gesture.Tap().onEnd(() => {
    onSingleTap && scheduleOnRN(onSingleTap);
  });

  const doubleTap = Gesture.Tap()
    .onStart((event) => {
      if (scale.value > 1) {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        onZoomChange && runOnJS(onZoomChange)(false);
      } else {
        scale.value = withTiming(MAX_ZOOM_SCALE_DOUBLE);

        const realImageWidth = finalWidth * MAX_ZOOM_SCALE_DOUBLE;

        const maxTranslateX = (realImageWidth - dimensions.width) / 2;
        const minTranslateX = -(realImageWidth - dimensions.width) / 2;

        const possibleNewTranslateX = (dimensions.width / 2 - event.x) * MAX_ZOOM_SCALE_DOUBLE;

        let newTranslateX = 0;

        if (possibleNewTranslateX > maxTranslateX) {
          newTranslateX = maxTranslateX;
        } else if (possibleNewTranslateX < minTranslateX) {
          newTranslateX = minTranslateX;
        } else {
          newTranslateX = possibleNewTranslateX;
        }

        translateX.value = withTiming(newTranslateX);

        const realImageHeight = finalHeight * MAX_ZOOM_SCALE_DOUBLE;

        const maxTranslateY = realImageHeight <= dimensions.height
          ? 0
          : (realImageHeight - dimensions.height) / 2;
        const minTranslateY = realImageHeight <= dimensions.height
          ? 0
          : -(realImageHeight - dimensions.height) / 2;

        const possibleNewTranslateY = (dimensions.height / 2 - event.y) * MAX_ZOOM_SCALE_DOUBLE;

        let newTranslateY = 0;

        if (possibleNewTranslateY > maxTranslateY) {
          newTranslateY = maxTranslateY;
        } else if (possibleNewTranslateY < minTranslateY) {
          newTranslateY = minTranslateY;
        } else {
          newTranslateY = possibleNewTranslateY;
        }

        translateY.value = withTiming(newTranslateY);
        onZoomChange && runOnJS(onZoomChange)(true);
      }
    })
    .numberOfTaps(2);

  const imageContainerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const imageAnimatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: scale.value,
        },
      ],
    }),
    []
  );

  const composedGestures = Gesture.Simultaneous(pinchGesture, panGesture);
  const allGestures = Gesture.Exclusive(composedGestures, doubleTap, singleTap);

  return (
    <GestureDetector gesture={ allGestures }>
      <Animated.View
        style={ {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.transparent,
        } }
      >
        <Animated.View style={ imageContainerAnimatedStyle }>
          <AnimatedImage
            style={ [
              imageAnimatedStyle,
              {
                width: finalWidth,
                height: finalHeight,
                backgroundColor: theme.colors.background,
              },
            ] }
            src={ imageUrl }
            resizeMode='contain'
            onLoadStart={ () => setIsLoading(true) }
            onProgress={ onProgress }
            onLoad={ ({ source }) => setNaturalSize({
              width: source.width,
              height: source.height,
            }) }
            onLoadEnd={ () => setIsLoading(false) }
          />
        </Animated.View>
        { showLoader && (
          <View
            style={ StyleSheet.absoluteFill }
            pointerEvents='none'
          >
            <View style={ styles.progress }>
              <Loader isLoading />
              { progress !== null && (
                <ThemedText>
                  { `${ Math.round(progress * 100) }%` }
                </ThemedText>
              ) }
            </View>
          </View>
        ) }
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  progress: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
