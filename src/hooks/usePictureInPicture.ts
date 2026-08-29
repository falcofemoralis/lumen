import { useCallback, useEffect, useRef, useState } from 'react';
import { VideoViewRef } from 'react-native-video';

/**
 * Owns the VideoView ref together with the picture in picture commands that go
 * with it, so components never have to reach into `ref.current` themselves.
 *
 * @param probeKey - changing this re-asks the view whether it supports picture
 *   in picture. react-native-video creates the native view manager some time
 *   after mount, so the first answer can be a false negative; pass something
 *   that changes as the player comes up (its status, for instance).
 */
export const usePictureInPicture = (probeKey?: unknown) => {
  const ref = useRef<VideoViewRef>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (isSupported) {
      return;
    }

    try {
      setIsSupported(ref.current?.canEnterPictureInPicture() ?? false);
    } catch {
      // the native view is not attached yet, a later probe will answer
    }
  }, [isSupported, probeKey]);

  const enter = useCallback(() => {
    ref.current?.enterPictureInPicture();
  }, []);

  return { ref, isSupported, enter };
};

export default usePictureInPicture;
