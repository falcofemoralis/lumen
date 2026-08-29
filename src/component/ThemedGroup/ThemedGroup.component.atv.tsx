import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { View } from 'react-native';

import { ThemedGroupComponentProps } from './ThemedGroup.type';

export const ThemedScrollViewComponent = ({
  children,
  style,
  preferredChildFocusKey,
  focusKey: propFocusKey,
}: ThemedGroupComponentProps) => {
  // Focus resolving into the group lands on the child closest to the top-left
  // corner, unless `preferredChildFocusKey` names the one that should own the
  // group's entry point (norigin still restores the last focused child first).
  const { ref, focusKey } = useFocusable<object, View>({
    autoRestoreFocus: false,
    preferredChildFocusKey,
    focusKey: propFocusKey,
  });

  return (
    <FocusContext.Provider value={ focusKey }>
      { /* A group that only carries layout props is a candidate for Android view
           flattening, and a flattened view can't be measured -- norigin would get
           an empty layout and the group would become unreachable by direction. */ }
      <View
        ref={ ref }
        style={ style }
        collapsable={ false }
      >
        { children }
      </View>
    </FocusContext.Provider>
  );
};

export default ThemedScrollViewComponent;
