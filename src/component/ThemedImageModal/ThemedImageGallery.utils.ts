import { ScaledSize } from 'react-native';

/**
 * Size the image gets on screen once fitted to the viewport.
 *
 * Shared by the viewer and the off-screen preloaders on purpose: the native
 * image cache keys a request by its target size, so a preload only warms the
 * bitmap the viewer later asks for when both request the very same dimensions.
 */
export const getFittedSize = (
  width: number,
  height: number,
  dimensions: ScaledSize
) => {
  // Callers that have no metadata pass zeroes. Fall back to the viewport rather
  // than to the equal-sides branch below, which would read them as a square and
  // crop the image to one.
  if (!width || !height) {
    return {
      width: dimensions.width,
      height: dimensions.height,
    };
  }

  const ruleOfThree = (
    firstValue: number,
    firstResult: number,
    secondValue: number
  ) => (firstResult * secondValue) / firstValue;

  const resizedBasedOnWidth = {
    width: dimensions.width,
    height: ruleOfThree(width, dimensions.width, height),
  };

  const resizedBasedOnHeight = {
    width: ruleOfThree(height, dimensions.height, width),
    height: dimensions.height,
  };

  if (width === height) {
    const smallestScreenDimension = Math.min(
      dimensions.width,
      dimensions.height
    );

    return {
      width: smallestScreenDimension,
      height: smallestScreenDimension,
    };
  }

  if (width > height) {
    return resizedBasedOnWidth;
  }

  if (resizedBasedOnHeight.width > dimensions.width) {
    return resizedBasedOnWidth;
  }

  return resizedBasedOnHeight;
};
