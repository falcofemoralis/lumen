import { parseHtml } from 'Util/Parser';
import { executeGet } from './Request';

export const fetchPage = async (
  query: string,
  endpoint: string,
  headers: HeadersInit,
  variables: Record<string, string> = {},
  ignoreCache: boolean = false
) => {
  const response = await executeGet(query, endpoint, headers, variables, ignoreCache);

  return parseHtml(response);
};