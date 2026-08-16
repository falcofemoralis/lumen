import { NativeModule, requireNativeModule } from 'expo';

import { TvSearchResult } from './ReactNativeTvSearch';

export type TvSearchModuleEvents = {
  onSearchRequested: (event: { query: string }) => void;
};

declare class ReactNativeTvSearchModule extends NativeModule<TvSearchModuleEvents> {
  isSupported(): boolean;
  getInitialSearchQuery(): string | null;
  setEnabled(isEnabled: boolean): Promise<void>;
  publishResults(query: string, results: TvSearchResult[]): Promise<void>;
  clearResults(): Promise<void>;
}

export default requireNativeModule<ReactNativeTvSearchModule>('ReactNativeTvSearch');
