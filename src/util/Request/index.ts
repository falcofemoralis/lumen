import { t } from 'i18n/translate';
import { customFetch } from 'Util/Fetch';

export type Variables = Record<string, string>;

/**
 * A 404 from the provider. Listings use it for "there is nothing here" (an empty
 * filter, a page past the last one), so callers can tell it from a real failure.
 */
export class NotFoundError extends Error {}

export const formatURI = (query: string, variables: Variables, url: string): string => {
  const stringifyVariables = Object.keys(variables).reduce(
    (acc, variable) => {
      const value = variables[variable];
      const entries = Array.isArray(value)
        ? value.map(v => `${variable}=${v}`)
        : [`${variable}=${JSON.stringify(value)}`];

      return [...acc, ...entries];
    },
    ['']
  );

  if (stringifyVariables.length > 0 && stringifyVariables[0] === '') {
    stringifyVariables.shift();
  }

  const queryVars = stringifyVariables.join('&').replaceAll('"', '');

  // the site's own hrefs (film genres, collections) are absolute -- they carry
  // the host already, but still take the variables
  const uri = query.includes('http') ? query : `${url}${query}`;

  if (queryVars === '') {
    return uri;
  }

  return `${uri}${uri.includes('?') ? '&' : '?'}${queryVars}`;
};

export const getFetch = (
  uri: string,
  headers: HeadersInit,
  signal?: AbortSignal
): Promise<Response> => customFetch(uri, {
  method: 'GET',
  signal,
  headers,
});

export const postFetch = (
  uri: string,
  headers: HeadersInit,
  body: BodyInit,
  signal?: AbortSignal
): Promise<Response> => customFetch(uri, {
  method: 'POST',
  body,
  signal,
  headers,
});

export const parseResponse = async (response: Response): Promise<string> => {
  const promiseResponse = await response;
  const data = await promiseResponse.text();

  return data;
};

export const handleRequestError = (response: Response): void => {
  if (response.status === 503 || response.status === 500) {
    throw new Error(response.statusText);
  }

  if (response.status === 403) {
    throw new Error(t('You are blocked'));
  }

  if (response.status === 404) {
    throw new NotFoundError(t('Not found'));
  }
};

export const executeGet = async (
  query: string,
  endpoint: string,
  headers: HeadersInit,
  params: Variables,
  signal?: AbortSignal
): Promise<string> => {
  const uri = formatURI(query, params, endpoint);

  try {
    const response = await getFetch(uri, {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    }, signal);

    handleRequestError(response);

    const parsedRes = await parseResponse(response);

    return parsedRes;
  } catch (error) {
    // kept as is, callers check for it -- everything else keeps the stringified
    // shape the connection error handler matches on
    if (error instanceof NotFoundError) {
      throw error;
    }

    throw new Error(error as string);
  }
};

export const executePostFormData = async (
  query: string,
  endpoint: string,
  headers: HeadersInit,
  formData: Variables,
  signal?: AbortSignal
): Promise<string> => {
  const uri = formatURI(query, {}, endpoint);

  try {
    const formDataObject = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => formDataObject.append(`${key}[]`, v));
      } else {
        formDataObject.append(key, value);
      }
    });

    const response = await postFetch(uri, {
      'Content-Type': 'multipart/form-data',
      ...headers,
    }, formDataObject, signal);

    handleRequestError(response);

    const parsedRes = await parseResponse(response);

    return parsedRes;
  } catch (error) {
    // kept as is, callers check for it -- everything else keeps the stringified
    // shape the connection error handler matches on
    if (error instanceof NotFoundError) {
      throw error;
    }

    throw new Error(error as string);
  }
};

export const executePostJson = async (
  query: string,
  endpoint: string,
  headers: HeadersInit,
  variables: Variables,
  params?: Variables,
  signal?: AbortSignal
): Promise<string> => {
  const uri = formatURI(query, params || {}, endpoint);

  try {
    const response = await postFetch(uri, {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    }, JSON.stringify(variables), signal);

    handleRequestError(response);

    const parsedRes = await parseResponse(response);

    return parsedRes;
  } catch (error) {
    // kept as is, callers check for it -- everything else keeps the stringified
    // shape the connection error handler matches on
    if (error instanceof NotFoundError) {
      throw error;
    }

    throw new Error(error as string);
  }
};

export const executePostEncoded = async (
  query: string,
  endpoint: string,
  headers: HeadersInit,
  variables: Variables,
  params?: Variables,
  signal?: AbortSignal
): Promise<string> => {
  const uri = formatURI(query, params || {}, endpoint);

  try {
    const response = await postFetch(uri, {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      ...headers,
    }, (() => {
      const searchParams = new URLSearchParams();

      Object.entries(variables).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v));
        } else {
          searchParams.append(key, value);
        }
      });

      return searchParams.toString();
    })(), signal);

    handleRequestError(response);

    const parsedRes = await parseResponse(response);

    return parsedRes;
  } catch (error) {
    // kept as is, callers check for it -- everything else keeps the stringified
    // shape the connection error handler matches on
    if (error instanceof NotFoundError) {
      throw error;
    }

    throw new Error(error as string);
  }
};
