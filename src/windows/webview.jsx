import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
export const WebView = forwardRef((props, ref) => {
  const id = useRef(crypto.randomUUID()).current, callbacks = useRef(props); callbacks.current = props;
  useImperativeHandle(ref, () => ({ injectJavaScript: script => window.lumen.injectWebView(id, script), reload: () => window.lumen.injectWebView(id, 'location.reload()'), goBack: () => window.lumen.injectWebView(id, 'history.back()') }), [id]);
  useEffect(() => {
    const remove = window.lumen.onWebView(event => {
      if (event.id !== id) return;
      if (event.type === 'message') callbacks.current.onMessage?.({ nativeEvent: { data: event.message } });
      if (event.type === 'load') { callbacks.current.onLoad?.({ nativeEvent: { url: props.source.uri } }); callbacks.current.onLoadEnd?.({ nativeEvent: { url: props.source.uri } }); }
      if (event.type === 'error') callbacks.current.onError?.({ nativeEvent: { description: event.message } });
    });
    const style = StyleSheet.flatten(props.style) || {};
    callbacks.current.onLoadStart?.({ nativeEvent: { url: props.source.uri } });
    window.lumen.openWebView({ id, url: props.source.uri, hidden: style.height === 0 || style.opacity === 0 || String(props.source.uri).includes('kinoserial.online'), userAgent: props.userAgent || (String(props.source.uri).includes('kinoserial.online') ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36' : undefined), injected: props.injectedJavaScript }).catch(error => callbacks.current.onError?.({ nativeEvent: { description: error.message } }));
    return () => { remove(); window.lumen.closeWebView(id); };
  }, [id, props.source.uri, props.userAgent, props.injectedJavaScript]);
  return React.createElement(View, { style: props.style });
});
export default WebView;

