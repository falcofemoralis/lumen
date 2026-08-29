import NotificationStore from 'Store/Notification.store';

export type ConnectionErrorHandler = (error: Error) => boolean;

let connectionErrorHandler: ConnectionErrorHandler | null = null;

/**
 * The query client lives outside React, so NetworkProvider registers its handler here.
 * That lets a failed query flip the app into the offline state exactly like a manual
 * try/catch used to.
 */
export const setConnectionErrorHandler = (handler: ConnectionErrorHandler | null) => {
  connectionErrorHandler = handler;
};

export const toError = (error: unknown): Error => (
  error instanceof Error ? error : new Error(String(error))
);

/**
 * The single place where a failed request becomes visible to the user. Queries and
 * mutations report through the query client caches, so containers no longer need
 * their own error effects. Opt out per query with `meta: { silent: true }`.
 */
export const reportQueryError = (error: unknown) => {
  const preparedError = toError(error);

  if (connectionErrorHandler?.(preparedError)) {
    return;
  }

  NotificationStore.displayError(preparedError);
};
