export class SourceBlockedError extends Error {
  retryAt?: number;
  constructor(message: string) {
    super(message);
    this.name = 'SourceBlockedError';
  }
}
export const shouldRetrySourceQuery = (failureCount: number, error: unknown): boolean => failureCount < 1 && !(error instanceof SourceBlockedError);