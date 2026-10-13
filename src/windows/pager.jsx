import React, { forwardRef, useState, useImperativeHandle, useRef, useMemo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
const Pager = forwardRef(({ children, initialPage = 0, onPageSelected, onPageScroll, onPageScrollStateChanged, style }, ref) => {
  const [page, setPage] = useState(initialPage), element = useRef(null), enabled = useRef(true);
  const select = index => {
    const next = Math.max(0, Math.min(React.Children.count(children)-1, index)); setPage(next);
    onPageSelected?.({ nativeEvent: { position: next } });
    onPageScrollStateChanged?.({ nativeEvent: { pageScrollState: 'idle' } });
  };
  useImperativeHandle(ref, () => ({ setPage: select, setPageWithoutAnimation: select, setScrollEnabled: value => { enabled.current = value; } }));
  useEffect(() => {
    const swipe = event => { if (enabled.current) select(page + event.detail); };
    const node = element.current;
    node?.addEventListener('lumen-swipe', swipe);
    return () => node?.removeEventListener('lumen-swipe', swipe);
  }, [page, children, onPageSelected, onPageScrollStateChanged]);
  return React.createElement('div', { ref: element, 'data-lumen-pager': true, 'data-lumen-page': page,
    style: { ...StyleSheet.flatten(style), overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 },
  }, React.Children.toArray(children).map((child, index) => React.createElement(View, { key: child.key || index, style: { flex: 1, display: index === page ? 'flex' : 'none' } }, child)));
});
export const usePagerView = () => { const ref = useRef(null); return useMemo(() => ({ AnimatedPagerView: Pager, PagerView: Pager, ref }), []); };
export default Pager;
