import RezkaApi from 'Api/RezkaApi';
import { createSupplementedPlaybackAdapter } from './playback/createSupplementedPlaybackAdapter';
import ZonaSourceAdapter from './adapters/ZonaSourceAdapter';
import RezkaSourceAdapter from './adapters/RezkaSourceAdapter';
import ZonaPlaybackAdapter from './playback/ZonaPlaybackAdapter';
import { SourcePlaybackRouter } from './playback/SourcePlaybackRouter';
import { SourceResolver } from './resolver/SourceResolver';
import { SourceRouter } from './resolver/SourceRouter';
import { createUnifiedSearchService } from './search';

export const sourceAdapters = [
  ZonaSourceAdapter,
  RezkaSourceAdapter,
];

export const sourceResolver = new SourceResolver(sourceAdapters);
export const sourceRouter = new SourceRouter(sourceAdapters);

export const unifiedSearchService = createUnifiedSearchService(
  sourceAdapters,
  sourceResolver,
);

export const sourcePlaybackAdapters = [
  createSupplementedPlaybackAdapter(ZonaPlaybackAdapter, RezkaApi),
];

export const sourcePlaybackRouter = new SourcePlaybackRouter(
  sourcePlaybackAdapters,
);

export * from './types/ContentSource';
export * from './types/SourceAdapter';
export * from './types/UnifiedFilm';
export { SourceResolver } from './resolver/SourceResolver';
export { SourceRouter } from './resolver/SourceRouter';
export { SourcePlaybackRouter } from './playback/SourcePlaybackRouter';
export * from './playback/SourcePlaybackAdapter';
export * from './playback/ZonaStreamBridge';
export * from './search';

