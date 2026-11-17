import {
  registerZonaStreamHandler,
  ZonaRuntimeStream,
  ZonaStreamRequest,
} from '../../source/playback/ZonaStreamBridge';

export type ZonaProviderRequest = Omit<ZonaStreamRequest, 'requestId'>;

interface PendingRequest {
  waitingTimeout?: ReturnType<typeof setTimeout>;
  request: ZonaProviderRequest;
  resolve: (streams: ZonaRuntimeStream[]) => void;
  reject: (error: Error) => void;
}

let nextRequestId = 1;
let webViewReady = false;
let sendRequest: ((request: ZonaStreamRequest) => void) | null = null;
let activeRequest: PendingRequest | null = null;
let activeRequestId: string | null = null;
let activeRequestTimeout: ReturnType<typeof setTimeout> | null = null;

const ZONA_STREAM_REQUEST_TIMEOUT_MS = 30_000;

const requestQueue: PendingRequest[] = [];

const createRequestId = (): string => {
  const id = String(nextRequestId);
  nextRequestId += 1;
  return id;
};

const clearActiveRequestTimeout = (): void => {
  if (activeRequestTimeout !== null) {
    clearTimeout(activeRequestTimeout);
    activeRequestTimeout = null;
  }
};

const failActiveRequest = (error: Error): void => {
  if (!activeRequest) {
    return;
  }

  clearActiveRequestTimeout();

  const pending = activeRequest;
  activeRequest = null;
  activeRequestId = null;

  pending.reject(error);
  processNext();
};

const processNext = (): void => {
  if (!webViewReady || !sendRequest || activeRequest || requestQueue.length === 0) {
    return;
  }

  activeRequest = requestQueue.shift()!;
  if (activeRequest.waitingTimeout) clearTimeout(activeRequest.waitingTimeout);

  const request: ZonaStreamRequest = {
    requestId: createRequestId(),
    ...activeRequest.request,
  };

  activeRequestId = request.requestId;

  try {
    sendRequest(request);

    activeRequestTimeout = setTimeout(() => {
      const requestId = activeRequestId;

      if (!requestId) {
        return;
      }

      failActiveRequest(
        new Error(
          `Zona stream request timed out after ${ZONA_STREAM_REQUEST_TIMEOUT_MS} ms (requestId=${requestId})`,
        ),
      );
    }, ZONA_STREAM_REQUEST_TIMEOUT_MS);
  } catch (error) {
    failActiveRequest(
      error instanceof Error
        ? error
        : new Error(String(error)),
    );
  }
};

export const setZonaStreamWebViewReady = (ready: boolean): void => {
  webViewReady = ready;

  if (ready) {
    processNext();
  }
};

export const setZonaStreamWebViewSender = (
  sender: ((request: ZonaStreamRequest) => void) | null,
): void => {
  sendRequest = sender;

  if (sender) {
    processNext();
  }
};

export const resolveZonaStreamRequest = (
  requestId: string,
  streams: ZonaRuntimeStream[],
): void => {
  if (!activeRequest || activeRequestId !== requestId) {
    return;
  }

  const pending = activeRequest;

  clearActiveRequestTimeout();

  activeRequest = null;
  activeRequestId = null;

  pending.resolve(streams);
  processNext();
};

export const rejectZonaStreamRequest = (
  requestId: string,
  error: string,
): void => {
  if (!activeRequest || activeRequestId !== requestId) {
    return;
  }

  const pending = activeRequest;

  clearActiveRequestTimeout();

  activeRequest = null;
  activeRequestId = null;

  pending.reject(new Error(error || 'Zona stream request failed'));
  processNext();
};

export const rejectActiveZonaStreamRequest = (
  error: string,
): void => {
  failActiveRequest(
    new Error(error || 'Zona stream request failed'),
  );
};

export const requestZonaStreamsFromProvider = (
  request: ZonaProviderRequest,
): Promise<ZonaRuntimeStream[]> =>
  new Promise((resolve, reject) => {
    const pending: PendingRequest = { request, resolve, reject };
    pending.waitingTimeout = setTimeout(() => {
      const index = requestQueue.indexOf(pending);
      if (index < 0) return;
      requestQueue.splice(index, 1);
      reject(new Error('Zona stream provider did not become available within 30 seconds. Try again.'));
    }, ZONA_STREAM_REQUEST_TIMEOUT_MS);
    requestQueue.push(pending);

    processNext();
  });

export const registerZonaProviderBridge = (): (() => void) => {
  const unregister = registerZonaStreamHandler(
    requestZonaStreamsFromProvider,
  );

  return () => {
    unregister();

    for (const pending of requestQueue.splice(0)) {
      if (pending.waitingTimeout) clearTimeout(pending.waitingTimeout);
      pending.reject(new Error('Zona stream provider was unmounted'));
    }

    if (activeRequest) {
      failActiveRequest(
        new Error('Zona stream provider was unmounted'),
      );
    }

    sendRequest = null;
    webViewReady = false;
  };
};
