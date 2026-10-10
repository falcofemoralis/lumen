import { ContentSource } from '../types/ContentSource';
import { SourcePlaybackAdapter } from './SourcePlaybackAdapter';

export class SourcePlaybackRouter {
  private readonly adapters: Map<ContentSource, SourcePlaybackAdapter>;

  constructor(adapters: SourcePlaybackAdapter[]) {
    this.adapters = new Map(
      adapters.map((adapter) => [adapter.source, adapter]),
    );
  }

  getAdapter(source: ContentSource): SourcePlaybackAdapter | null {
    return this.adapters.get(source) ?? null;
  }

  getAdapterForFilmLink(
    link: string,
  ): SourcePlaybackAdapter | null {
    try {
      const url = new URL(link);

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
