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

  return `${url}${query}${stringifyVariables.length > 0 ? '?' + stringifyVariables.join('&') : ''}`;
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
  query: string,
  headers: HeadersInit,
  variables: Record<string, string>
): Promise<Response> =>
  fetch(uri, {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
  });

// export const checkForErrors = <T>(res: ResponseBody<T>): Promise<T> =>
//   new Promise((resolve, reject) => {
//     const { errors, data } = res;

//     if (errors) {
//       reject(errors);

//       return;
//     }

//     resolve(data);
//   });

// TODO: Add to logs pool
export const handleConnectionError = (err: unknown, msg: string): void => {
  console.error(msg, err);
};

export const parseResponse = async (response: Response): Promise<string> => {
  try {
    const promiseResponse = await response;
    const data = await promiseResponse.text(); // .json();

    return data;

    // TODO handle errors, such as site not available
    //return await checkForErrors(data);
  } catch (err) {
    handleConnectionError(err, 'Can not parse JSON!');

    throw err;
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

  // Fetch only throws on network error, http errors have to be handled manually.
  try {
    if (!ignoreCache) {
      const cachedResult = await queryCache.get(uriHash);

      if (cachedResult) {
        console.log('cachedResult ' + uriHash);

        return cachedResult;
      }
    }

    const result = await getFetch(uri, headers, signal);

    // if (result.status === HTTP_410_GONE) {
    //   const putResponse = await putPersistedQuery(getGraphqlEndpoint(), query, cacheTTL);

    //   if (putResponse.status === HTTP_201_CREATED) {
    //     return await parseResponse(await getFetch(uri, name, signal));
    //   }
    // }

    if (result.status === 503) {
      handleConnectionError(result.status, result.statusText);
      throw new Error(result.statusText);
    }

    // Successful and all other http responses go here:
    const parsedRes = await parseResponse(result);

    if (!ignoreCache) {
      queryCache.set(uriHash, parsedRes);
      console.log('saveToHash ' + uriHash);
    }

    return parsedRes;
  } catch (error) {
    // Network error
    handleConnectionError(error, 'executeGet failed');
    throw new Error(error as string);
  }
};

export const executePost = async (
  query: string,
  endpoint: string,
  headers: HeadersInit,
  variables: Record<string, string>
): Promise<string> => {
  try {
    const response = await postFetch(endpoint, query, headers, variables);

    return await parseResponse(response);
  } catch (err) {
    handleConnectionError(err, 'executePost failed');

    throw err;
  }
};
