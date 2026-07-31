import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { View } from 'react-native';

import { ThemedGroupComponentProps } from './ThemedScrollView.type';

export const ThemedScrollViewComponent = ({
  children,
  style,
  preferredChildFocusKey,
}: ThemedGroupComponentProps) => {
  // Focus resolving into the group lands on the child closest to the top-left
  // corner, unless `preferredChildFocusKey` names the one that should own the
  // group's entry point (norigin still restores the last focused child first).
  const { ref, focusKey } = useFocusable<object, View>({
    autoRestoreFocus: false,
    preferredChildFocusKey,
  });

  return (
    <FocusContext.Provider value={ focusKey }>
      <View ref={ ref } style={ style }>
        { children }
      </View>
    </FocusContext.Provider>
  );
};

export default ThemedScrollViewComponent;
