import { queryCache } from 'Util/Cache';
import { customFetch } from 'Util/Fetch';
import { hash } from 'Util/Hash';
import { removeParamFromUrl } from 'Util/Url';

export type Variables = Record<string, string>;

export const formatURI = (query: string, variables: Variables, url: string): string => {
  if (query.includes('http')) {
    return query;
  }

  const stringifyVariables = Object.keys(variables).reduce(
    (acc, variable) => [...acc, `${variable}=${JSON.stringify(variables[variable])}`],
    [''],
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
  signal?: AbortSignal,
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
  signal?: AbortSignal,
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

export const executeGet = async (
  query: string,
  endpoint: string,
  headers: HeadersInit,
  variables: Variables,
  ignoreCache = false,
  signal?: AbortSignal,
): Promise<string> => {
  const uri = formatURI(query, variables, endpoint);
  console.log(uri);

  const uriHash = hash(uri).toString();

  try {
    if (!ignoreCache) {
      const cachedResult = await queryCache.get(uriHash);

      if (cachedResult) {
        return cachedResult;
      }
    }

    const response = await getFetch(uri, headers, signal);

    if (response.status === 503) {
      throw new Error(response.statusText);
    }

    if (response.status === 403) {
      throw new Error('You are blocked');
    }

    const parsedRes = await parseResponse(response);

    queryCache.set(uriHash, parsedRes);

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
  ignoreCache?: boolean,
  signal?: AbortSignal,
): Promise<string> => {
  const uri = formatURI(query, {}, endpoint);
  const uriHash = hash(removeParamFromUrl(uri, 't')).toString();

  try {
    if (!ignoreCache) {
      const cachedResult = await queryCache.get(uriHash);

      if (cachedResult) {
        return cachedResult;
      }
    }

    const formData = new FormData();

    Object.entries(variables).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await postFetch(uri, headers, formData, signal);

    const parsedRes = await parseResponse(response);

    queryCache.set(uriHash, parsedRes);

    return parsedRes;
  } catch (error) {
    throw new Error(error as string);
  }
};
