import { CloudflareSolveOutcome } from 'Util/Cloudflare';

/** One challenge waiting to be worked, and the `solveCloudflare` call blocked on it. */
export interface CloudflareSolveRequest {
  id: number;
  /** Scheme+authority to load. Clearance is issued per origin, not per page. */
  origin: string;
  /** The user agent the app sends; clearance is bound to it, so the WebView matches. */
  userAgent?: string;
  resolve: (outcome: CloudflareSolveOutcome) => void;
}

/** What the injected probe reports back about the page currently loaded. */
export interface CloudflareProbeMessage {
  challenge: boolean;
}

export interface CloudflareSolverComponentProps {
  request: CloudflareSolveRequest;
  onSettled: (request: CloudflareSolveRequest, outcome: CloudflareSolveOutcome) => void;
}
