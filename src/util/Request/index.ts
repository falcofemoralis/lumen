import t from 'i18n/t';
import { customFetch } from 'Util/Fetch';

export type Variables = Record<string, string>;

export const formatURI = (query: string, variables: Variables, url: string): string => {
  if (query.includes('http')) {
    return query;
  }

  const stringifyVariables = Object.keys(variables).reduce(
    (acc, variable) => [...acc, `${variable}=${JSON.stringify(variables[variable])}`],
    ['']
  );

  if (stringifyVariables.length > 0 && stringifyVariables[0] === '') {
    stringifyVariables.shift();
  }

  const queryVars = stringifyVariables.join('&').replaceAll('"', '');

  return `${url}${query}${queryVars !== '' ? `?${queryVars}` : ''}`;
};

export const getFetch = (
  uri: string,
  headers: HeadersInit,
  signal?: AbortSignal
): Promise<Response> => customFetch(uri, {
  method: 'GET',
  signal,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  },
});

export const postFetch = (
  uri: string,
  headers: HeadersInit,
  variables: FormData,
  signal?: AbortSignal
): Promise<Response> => customFetch(uri, {
  method: 'POST',
  body: variables,
  signal,
  headers: {
    'Content-Type': 'multipart/form-data',
    ...headers,
  },
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
    throw new Error('You are blocked');
  }

  if (response.status === 404) {
    throw new Error('Not found');
  }
};

export const executeGet = async (
  query: string,
  endpoint: string,
  headers: HeadersInit,
  variables: Variables,
  signal?: AbortSignal
): Promise<string> => {
  const uri = formatURI(query, variables, endpoint);

  try {
    const response = await getFetch(uri, headers, signal);

    handleRequestError(response);

    const parsedRes = await parseResponse(response);

    return parsedRes;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const executePost = async (
  query: string,
  endpoint: string,
  headers: HeadersInit,
  variables: Variables,
  signal?: AbortSignal
): Promise<string> => {
  const uri = formatURI(query, {}, endpoint);

  try {
    const formData = new FormData();

    Object.entries(variables).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await postFetch(uri, headers, formData, signal);

    handleRequestError(response);

    const parsedRes = await parseResponse(response);

    return parsedRes;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const requestValidator = async (
  host: string,
  headers: HeadersInit
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    await executeGet(
      '/',
      host,
      headers,
      {},
      controller.signal
    );
  } catch (error) {
    throw new Error(t('Invalid URL'));
  } finally {
    clearTimeout(timeoutId);
  }
};
