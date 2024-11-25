import { queryCache } from 'Util/Cache';
import { hash } from 'Util/Hash';

export const formatURI = (
  query: string,
  variables: Record<string, string>,
  url: string
): string => {
  if (query.includes('http')) {
    return query;
  }

  const stringifyVariables = Object.keys(variables).reduce(
    (acc, variable) => [...acc, `${variable}=${JSON.stringify(variables[variable])}`],
    ['']
  );

  const queryVars = stringifyVariables.join('&');

  return `${url}${query}${queryVars !== '' ? '?' + queryVars : ''}`;
};

export const getFetch = (
  uri: string,
  headers: HeadersInit,
  signal?: AbortSignal
): Promise<Response> =>
  fetch(uri, {
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
): Promise<Response> =>
  fetch(uri, {
    method: 'POST',
    body: variables,
    signal,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...headers,
    },
  });

export const parseResponse = async (response: Response): Promise<string> => {
  try {
    const promiseResponse = await response;
    const data = await promiseResponse.text();

    return data;
  } catch (err) {
    throw err;
  }
};

export const parseJSONResponse = async (response: Response): Promise<string> => {
  try {
    const promiseResponse = await response;
    const data = await promiseResponse.json();

    return data;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const executeGet = async (
  query: string,
  endpoint: string,
  headers: HeadersInit,
  variables: Record<string, string>,
  ignoreCache: boolean = false,
  signal?: AbortSignal
): Promise<string> => {
  const uri = formatURI(query, variables, endpoint);
  const uriHash = hash(uri).toString();

  try {
    if (!ignoreCache) {
      const cachedResult = await queryCache.get(uriHash);

      if (cachedResult) {
        console.log('GET cache hit');
        return cachedResult;
      }
    }

    const result = await getFetch(uri, headers, signal);

    if (result.status === 503) {
      throw new Error(result.statusText);
    }

    const parsedRes = await parseResponse(result);

    if (!ignoreCache) {
      queryCache.set(uriHash, parsedRes);
    }

    console.log('GET cache miss');

    return parsedRes;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const executePost = async (
  query: string,
  endpoint: string,
  headers: HeadersInit,
  variables: Record<string, string>,
  signal?: AbortSignal
): Promise<any> => {
  const uri = formatURI(query, {}, endpoint);

  try {
    const formData = new FormData();

    Object.entries(variables).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await postFetch(uri, headers, formData, signal);

    return await parseJSONResponse(response);
  } catch (error) {
    throw new Error(error as string);
  }
};
