import { ContentSource } from '../types/ContentSource';
import { isSourceEnabled, sourceForLink } from '../types/SourceSelection';
import { SourcePlaybackAdapter } from './SourcePlaybackAdapter';

export class SourcePlaybackRouter {
  private readonly adapters: Map<ContentSource, SourcePlaybackAdapter>;

  constructor(adapters: SourcePlaybackAdapter[]) {
    this.adapters = new Map(
      adapters.map((adapter) => [adapter.source, adapter]),
    );
  }

  getAdapter(source: ContentSource): SourcePlaybackAdapter | null {
    return isSourceEnabled(source) ? this.adapters.get(source) ?? null : null;
  }

  getAdapterForFilmLink(
    link: string,
  ): SourcePlaybackAdapter | null {
    if (!isSourceEnabled(sourceForLink(link))) throw new Error('Content source is disabled in settings');
    try {
      const url = new URL(link);
      if (url.hostname === 'anixart-app.com') return this.getAdapter(ContentSource.ANIXART);

      if (
        url.hostname === 'w1.zona.im' ||
        url.hostname.endsWith('.zona.im')
      ) {
        return this.getAdapter(ContentSource.ZONA);
      }
    } catch {
      return null;
    }

    return null;
  }
}
