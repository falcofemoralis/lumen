import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  rejectActiveZonaStreamRequest,
  rejectZonaStreamRequest,
  registerZonaProviderBridge,
  resolveZonaStreamRequest,
  setZonaStreamWebViewReady,
  setZonaStreamWebViewSender,
} from './ZonaStreamProvider.container';
import {
  ZonaRuntimeStream,
  ZonaStreamProviderProps,
  ZonaStreamRequest,
} from './ZonaStreamProvider.type';

const PLAYER_URL =
  'https://kinoserial.online/?projectId=1&projectName=zona';

const injectedJavaScript = `
(function() {
  var provider = null;
  var ready = false;

  function send(data) {
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
    } catch (e) {}
  }

  function safeString(value) {
    try {
      return String(value);
    } catch (e) {
      return '[String ERROR]';
    }
  }

  function normalizeStream(stream) {
    var source = stream && stream.source
      ? stream.source
      : {};

    return {
      source: {
        url: source.url || '',
        headers: source.headers || {}
      },
      translation: stream && stream.translation || '',
      language: stream && stream.language || '',
      resolution: stream && stream.resolution || '',
      quality: stream && stream.quality || '',
      isTrailer: !!(stream && stream.isTrailer),
      subtitles:
        stream && Array.isArray(stream.subtitles)
          ? stream.subtitles
          : [],
      parameters:
        stream && stream.parameters
          ? stream.parameters
          : {}
    };
  }

  function findProvider() {
    try {
      var site = window['ru.zona.stream.site'];

      if (!site ||
          typeof site.createStreamsProvider !== 'function') {
        return null;
      }

      return site.createStreamsProvider();
    } catch (e) {
      send({
        type: 'provider-error',
        error: safeString(e)
      });

      return null;
    }
  }

  function waitForProvider() {
    if (provider) {
      return;
    }

    provider = findProvider();

    if (!provider) {
      setTimeout(waitForProvider, 250);
      return;
    }

    ready = true;

    send({
      type: 'ready'
    });
  }

  function handleRequest(message) {
    if (!ready || !provider) {
      send({
        type: 'error',
        requestId: message.requestId,
        error: 'Zona runtime provider is not ready'
      });
      return;
    }

    var runtimeGetStreams = provider.getStreams;

    
    send({
      type: 'debug',
      message:
        'getStreams type=' +
        safeString(typeof runtimeGetStreams)
    });
if (typeof runtimeGetStreams !== 'function') {
      send({
        type: 'error',
        requestId: message.requestId,
        error: 'Zona getStreams is not available'
      });
      return;
    }

    var streams = [];

    var callbacks = {
      onStreamsReceived: function(chunk) {
                send({
          type: 'debug',
          message: 'onStreamsReceived called'
        });
try {
          var parsed =
            typeof chunk === 'string'
              ? JSON.parse(chunk)
              : chunk;

          var chunkStreams =
            parsed &&
            Array.isArray(parsed.videoStreams)
              ? parsed.videoStreams
              : [];

          for (var i = 0; i < chunkStreams.length; i++) {
            streams.push(
              normalizeStream(chunkStreams[i])
            );
          }
        } catch (e) {
          send({
            type: 'error',
            requestId: message.requestId,
            error:
              'Zona stream parse error: ' +
              safeString(e)
          });
        }
      },

      onCompletion: function() {
                send({
          type: 'debug',
          message: 'onCompletion called'
        });
send({
          type: 'result',
          requestId: message.requestId,
          streams: streams
        });
      }
    };    try {
      send({
        type: 'debug',
        message:
          'before getStreams kp=' +
          safeString(message.kinopoiskId) +
          ', episode=' +
          safeString(message.episodeKey)
      });

      runtimeGetStreams.call(
        provider,
        Number(message.kinopoiskId),
        false,
        message.episodeKey || null,
        callbacks
      );
    
      send({
        type: 'debug',
        message: 'after getStreams call'
      });} catch (e) {
      send({
        type: 'error',
        requestId: message.requestId,
        error:
          'Zona getStreams call failed: ' +
          safeString(e)
      });
    }
  }

  window.__zonaStreamProviderRequest = function(rawMessage) {
    try {
      var message =
        typeof rawMessage === 'string'
          ? JSON.parse(rawMessage)
          : rawMessage;

      if (message && message.type === 'request') {
        handleRequest(message);
      }
    } catch (e) {
      send({
        type: 'error',
        requestId: '',
        error: 'Zona request bridge error: ' + safeString(e)
      });
    }
  };

  document.addEventListener(
    'message',
    function(event) {
      try {
        var message = JSON.parse(event.data);

        if (message && message.type === 'request') {
          handleRequest(message);
        }
      } catch (e) {}
    }
  );

  window.addEventListener(
    'message',
    function(event) {
      try {
        var message = JSON.parse(event.data);

        if (message && message.type === 'request') {
          handleRequest(message);
        }
      } catch (e) {}
    }
  );

  waitForProvider();
})();
true;
`;

const ZonaStreamProvider = ({
  onReadyChange,
}: ZonaStreamProviderProps) => {
  const webViewRef = useRef<WebView>(null);

  const sendRequest = useCallback(
    (request: ZonaStreamRequest) => {
      const payload = JSON.stringify({
        type: 'request',
        requestId: request.requestId,
        kinopoiskId: request.kinopoiskId,
        episodeKey: request.episodeKey,
      });

      const script =
        'window.__zonaStreamProviderRequest(' +
        JSON.stringify(payload) +
        '); true;';

      const webView = webViewRef.current;

      if (!webView) {
        throw new Error('Zona WebView is not available');
      }

      webView.injectJavaScript(script);
    },
    [],
  );

  useEffect(() => {
    const unregister = registerZonaProviderBridge();

    setZonaStreamWebViewSender(sendRequest);

    return () => {
      setZonaStreamWebViewSender(null);
      unregister();
    };
  }, [sendRequest]);
  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);

        if (message?.type === 'ready') {
          setZonaStreamWebViewReady(true);
          onReadyChange?.(true);
          return;
        }

        if (message?.type === 'result') {
          resolveZonaStreamRequest(
            String(message.requestId),
            Array.isArray(message.streams)
              ? message.streams as ZonaRuntimeStream[]
              : [],
          );
          return;
        }

        if (message?.type === 'error') {
          rejectZonaStreamRequest(
            String(message.requestId),
            String(message.error ?? 'Zona stream request failed'),
          );
        }
      } catch {
        // Ignore unrelated WebView messages.
      }
    },
    [onReadyChange],
  );

  const source = useMemo(
    () => ({ uri: PLAYER_URL }),
    [],
  );

  return (
    <View pointerEvents="none" style={styles.container}>
      <WebView
        ref={webViewRef}
        source={source}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
        incognito={false}
        originWhitelist={['*']}
        setSupportMultipleWindows={false}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        onError={(event) => {
          setZonaStreamWebViewReady(false);
          onReadyChange?.(false);

          rejectActiveZonaStreamRequest(
            `Zona WebView error: ${event.nativeEvent.description || 'unknown error'}`,
          );
        }}
        onHttpError={(event) => {
          setZonaStreamWebViewReady(false);
          onReadyChange?.(false);

          rejectActiveZonaStreamRequest(
            `Zona WebView HTTP error: ${event.nativeEvent.statusCode} ${event.nativeEvent.description || ''}`.trim(),
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0.01,
    left: -10,
    top: -10,
  },
});

export default ZonaStreamProvider;
export { ZonaStreamProvider };
