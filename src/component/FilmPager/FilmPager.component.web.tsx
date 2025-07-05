import FilmGrid from 'Component/FilmGrid';
import { useState } from 'react';
import { ScrollView, TouchableOpacity,View } from 'react-native';

import { FilmPagerComponentProps } from './FilmPager.type';

export const FilmPagerComponent = ({
  pagerItems,
  onPreLoad,
  onNextLoad,
}: FilmPagerComponentProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <View style={ { flex: 1 } }>
      { pagerItems.length > 0 && (
        <FilmGrid
          films={ pagerItems[currentIndex].films ?? [] }
          onNextLoad={ (isRefresh) => onNextLoad(isRefresh, pagerItems[currentIndex]) }
        />
      ) }
      { pagerItems.length > 1 && (
        <ScrollView horizontal style={ { maxHeight: 50 } }>
          { pagerItems.map((item, index) => (
            <TouchableOpacity
              key={ item.key }
              onPress={ () => {
                setCurrentIndex(index);
                onPreLoad(item);
              } }
              style={ {
                padding: 10,
                backgroundColor: currentIndex === index ? '#333' : '#222',
              } }
            >
              { item.title }
            </TouchableOpacity>
          )) }
        </ScrollView>
      ) }
    </View>
  );
};

export default FilmPagerComponent;
