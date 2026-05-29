import Reactotron, { ReactotronReactNative } from 'reactotron-react-native';
import mmkvPlugin from 'reactotron-react-native-mmkv';
import { storage } from 'Util/Storage';

const reactotron = Reactotron.configure({
  name: require('../../package.json').name,
  onConnect: () => {
    Reactotron.clear();
  },
});

reactotron.use(mmkvPlugin<ReactotronReactNative>({ storage: storage.getMiscStorage().getMMKVInstance() }));

reactotron.useReactNative({
  networking: {
    ignoreUrls: /symbolicate/,
  },
});

/**
 * We're going to add `console.tron` to the Reactotron object.
 * Now, anywhere in our app in development, we can use Reactotron like so:
 *
 * ```
 * if (__DEV__) {
 *  console.tron.display({
 *    name: 'JOKE',
 *    preview: 'What's the best thing about Switzerland?',
 *    value: 'I don't know, but the flag is a big plus!',
 *    important: true
 *  })
 * }
 * ```
 *
 * Use this power responsibly! :)
 */
console.tron = reactotron;

/**
 * We tell typescript about our dark magic
 *
 * You can also import Reactotron yourself from ./reactotronClient
 * and use it directly, like Reactotron.log('hello world')
 */
declare global {
  interface Console {
    /**
     * Reactotron client for logging, displaying, measuring performance, and more.
     * @see https://github.com/infinitered/reactotron
     * @example
     * if (__DEV__) {
     *  console.tron.display({
     *    name: 'JOKE',
     *    preview: 'What's the best thing about Switzerland?',
     *    value: 'I don't know, but the flag is a big plus!',
     *    important: true
     *  })
     * }
     */
    tron: typeof reactotron
  }
}

/**
 * Now that we've setup all our Reactotron configuration, let's connect!
 */
reactotron.connect();
