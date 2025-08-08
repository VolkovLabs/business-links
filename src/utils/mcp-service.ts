import { CachedMcpState, McpToolResult } from '@/types';

/**
 * Clears MCP cache and closes all clients
 * @param cacheRef - Reference to cached MCP state
 */
export function clearMcpCache(cacheRef: React.RefObject<CachedMcpState | null>) {
  if (cacheRef.current) {
    cacheRef.current.clients.forEach(({ client }) => {
      try {
        client.close();
      } catch {}
    });
  }
  cacheRef.current = null;
}

/**
 * Return Timeout Error
 * @param serverName - Server name
 * @param serverTimeout - Server error timeout
 */
export const timeoutError = (serverName: string, serverTimeout: number) =>
  new Promise<never>((unused, reject) => {
    setTimeout(() => {
      reject(new Error(`Server ${serverName} timed out after ${serverTimeout}ms`));
    }, serverTimeout);
  });

/**
 * Return Timeout Error
 * @param result - Response result
 * @param functionName - Function name execute to call
 * @param errorMessage - Error message
 */
export const prepareToolContent = (result: McpToolResult, functionName: string, errorMessage?: string) => {
  return result.isError
    ? `Error executing ${functionName}: ${errorMessage ?? ''}`
    : Array.isArray(result.content)
      ? result.content.map((contentItem) => contentItem.text || JSON.stringify(contentItem)).join('\n')
      : JSON.stringify(result.content);
};
