'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { cn, titleCase } from '@/lib/utils';
import { APIConfig, APIMethod, Parameter, APITestResponse, CleanAPIConfig } from '@/lib/types';
import { DUMMY_POSTS_TOOL_CONFIG, DUMMY_TODOS_TOOL_CONFIG, CREATE_POST_EXAMPLE } from '@/lib/example-configs';

type TabType = 'headers' | 'path' | 'query' | 'body';

interface APIPlaygroundProps {
  config?: APIConfig;
  onConfigChange?: (config: APIConfig) => void;
  onTest?: (config: APIConfig) => Promise<APITestResponse>;
}

export default function APIPlayground({ config: initialConfig, onConfigChange, onTest }: APIPlaygroundProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('headers');
  const [config, setConfig] = useState<APIConfig>(
    initialConfig || {
      url: '',
      method: 'GET',
      headers: [],
      query: [],
      path: [],
      body: [],
      rawResponse: {}
    }
  );

  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(config);
    }
  }, [config, onConfigChange]);

  const parseUrlToParams = (url: string) => {
    if (!url || url.startsWith('curl')) return { queryParams: [], pathParams: [] };

    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://example.com${url.startsWith('/') ? url : `/${url}`}`);

      // Extract query parameters
      const queryParams: Parameter[] = [];
      urlObj.searchParams.forEach((value, key) => {
        queryParams.push({
          id: crypto.randomUUID(),
          key,
          value
        });
      });

      // Extract path parameters (segments that start with :)
      const pathSegments = urlObj.pathname.split('/').filter((segment) => segment.startsWith(':'));
      const pathParams: Parameter[] = pathSegments.map((segment) => ({
        id: crypto.randomUUID(),
        key: segment.substring(1), // remove the ':'
        value: ''
      }));

      return { queryParams, pathParams };
    } catch {
      // If URL parsing fails, try to extract query params manually
      const queryParams: Parameter[] = [];
      const pathParams: Parameter[] = [];

      // Extract query string
      const queryIndex = url.indexOf('?');
      if (queryIndex !== -1) {
        const queryString = url.substring(queryIndex + 1);
        const urlParams = new URLSearchParams(queryString);
        urlParams.forEach((value, key) => {
          queryParams.push({
            id: crypto.randomUUID(),
            key,
            value
          });
        });
      }

      // Extract path parameters
      const pathMatches = url.match(/:[a-zA-Z_][a-zA-Z0-9_]*/g);
      if (pathMatches) {
        pathMatches.forEach((match) => {
          const key = match.substring(1);
          if (!pathParams.find((p) => p.key === key)) {
            pathParams.push({
              id: crypto.randomUUID(),
              key,
              value: ''
            });
          }
        });
      }

      return { queryParams, pathParams };
    }
  };

  const updateConfig = <K extends keyof APIConfig>(key: K, value: APIConfig[K]) => {
    setConfig((prev) => {
      const newConfig = { ...prev, [key]: value };

      // If URL is being updated, sync query and path parameters
      if (key === 'url' && value !== prev.url && typeof value === 'string' && !value.startsWith('curl')) {
        const { queryParams, pathParams } = parseUrlToParams(value);

        // Only update if the parsed params are different from current ones
        const currentQueryKeys = new Set(prev.query?.map((q) => q.key) || []);
        const newQueryKeys = new Set(queryParams.map((q) => q.key));
        const queryChanged = currentQueryKeys.size !== newQueryKeys.size || [...currentQueryKeys].some((key) => !newQueryKeys.has(key));

        const currentPathKeys = new Set(prev.path?.map((p) => p.key) || []);
        const newPathKeys = new Set(pathParams.map((p) => p.key));
        const pathChanged = currentPathKeys.size !== newPathKeys.size || [...currentPathKeys].some((key) => !newPathKeys.has(key));

        if (queryChanged || pathChanged) {
          return {
            ...newConfig,
            query: queryParams,
            path: pathParams
          };
        }
      }

      return newConfig;
    });
  };

  const activeTabMap = activeTab === 'headers' ? config.headers : activeTab === 'query' ? config.query : activeTab === 'path' ? config.path : activeTab === 'body' ? config.body : [];

  const buildUrlFromParams = (baseUrl: string, queryParams: Parameter[]) => {
    let url = baseUrl;

    // Remove existing query string from base URL
    const queryIndex = url.indexOf('?');
    if (queryIndex !== -1) {
      url = url.substring(0, queryIndex);
    }

    // Add query parameters
    if (queryParams.length > 0) {
      const queryString = queryParams
        .filter((param) => param.key && param.value)
        .map((param) => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`)
        .join('&');

      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  };

  const setBody = (body: Parameter[]) => updateConfig('body', body);
  const setQuery = (query: Parameter[]) => {
    setConfig((prev) => {
      const newConfig = { ...prev, query };
      // Update URL when query parameters change
      const currentUrl = newConfig.url || '';
      if (!currentUrl.startsWith('curl')) {
        const newUrl = buildUrlFromParams(currentUrl, query);
        return { ...newConfig, url: newUrl };
      }
      return newConfig;
    });
  };
  const setPaths = (paths: Parameter[]) => updateConfig('path', paths);
  const setHeaders = (headers: Parameter[]) => updateConfig('headers', headers);

  const map = { headers: setHeaders, query: setQuery, body: setBody, path: setPaths };

  const updateActiveTabMapItem = (type: keyof typeof map, id: string, field: 'key' | 'value', value: string): void => {
    const oldItem = config[type]?.find((item: Parameter) => item.id === id);
    const updatedSettingsConfig = config[type]?.map((item: Parameter) => (item.id === id ? { ...item, [field]: value } : item));

    if (type === 'query') {
      // For query parameters, use setQuery to update URL automatically
      setQuery(updatedSettingsConfig);
    } else if (type === 'path' && field === 'key' && oldItem) {
      // Update path parameters and URL
      map[type](updatedSettingsConfig);

      const currentUrl = config.url || '';
      let updatedUrl = currentUrl;

      if (oldItem.key) {
        const escapedOldKey = oldItem.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        updatedUrl = updatedUrl.replace(new RegExp(`:${escapedOldKey}(?=/|$)`, 'g'), `:${value}`);
      }

      updateConfig('url', updatedUrl);
    } else {
      // For headers, body, and path value changes, just update normally
      map[type](updatedSettingsConfig);
    }
  };

  const addActiveTabMapItem = (type: keyof typeof map) => {
    let paramName = '';
    const existingKeys = config[type]?.map((item: Parameter) => item.key) || [];

    if (type === 'path') {
      let counter = 1;
      paramName = `param${counter}`;

      while (existingKeys.includes(paramName)) {
        counter++;
        paramName = `param${counter}`;
      }
    }

    const newItem: Parameter = {
      id: crypto.randomUUID(),
      value: '',
      key: type === 'path' ? paramName : ''
    };

    const updatedItems = [...(config[type] || []), newItem];

    if (type === 'query') {
      // For query parameters, use setQuery to update URL automatically
      setQuery(updatedItems);
    } else if (type === 'path' && paramName) {
      // Update path parameters and URL
      map[type](updatedItems);
      updateConfig('url', `${config.url}/:${paramName}`);
    } else {
      // For headers and body, just update normally
      map[type](updatedItems);
    }
  };

  const removeActiveTabMapItem = (type: keyof typeof map, itemId: string) => {
    const itemToRemove = config[type]?.find((item: Parameter) => item.id === itemId);
    const filteredItems = config[type]?.filter((item: Parameter) => item.id !== itemId) || [];

    if (type === 'query') {
      // For query parameters, use setQuery to update URL automatically
      setQuery(filteredItems);
    } else if (type === 'path' && itemToRemove?.key) {
      // Update path parameters
      map[type](filteredItems);

      // Update URL to remove the path parameter
      const currentUrl = config.url || '';
      const escapedKey = itemToRemove.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const placeholderRegex = new RegExp(`/?:${escapedKey}(?=/|$)/?`, 'g');

      const updatedUrl = currentUrl
        .replace(placeholderRegex, (match) => {
          if (match.startsWith('/') && match.endsWith('/')) return '/';
          return '';
        })
        .replace(/([^:]\/)\/+/g, '$1')
        .replace(/\/$/, '');

      updateConfig('url', updatedUrl);
    } else {
      // For headers and body, just update normally
      map[type](filteredItems);
    }
  };

  const testApi = async () => {
    if (!onTest) {
      console.error('onTest function not provided');
      return;
    }

    setLoading(true);

    try {
      const response = await onTest(config);
      updateConfig('rawResponse', {
        status: response.status_code,
        data: response.response
      });
      // Don't auto-switch to response tab - let user see response in right panel
    } catch (error) {
      updateConfig('rawResponse', {
        error: error instanceof Error ? error.message : 'An error occurred'
      });
      // Don't auto-switch to response tab - let user see error in right panel
    } finally {
      setLoading(false);
    }
  };

  const parseCurlCommand = useCallback(
    async (curlCommand: string) => {
      try {
        const response = await fetch('/api/parse-curl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ curlCommand })
        });

        if (!response.ok) {
          console.error('Failed to parse cURL command');
          return;
        }

        const parsed = await response.json();

        const newQueryItems = Object.entries(parsed.queryParams || {}).map(([key, value]) => ({
          id: crypto.randomUUID(),
          key,
          value: String(value)
        }));

        const newHeadersItems = Object.entries(parsed.headers || {}).map(([key, value]) => ({
          id: crypto.randomUUID(),
          key,
          value: String(value)
        }));

        const newBodyItems = parsed.data
          ? Object.entries(parsed.data).map(([key, value]) => ({
              id: crypto.randomUUID(),
              key,
              value: String(value)
            }))
          : [];

        const pathItems = Object.entries(parsed.pathParams || {}).map(([key, value]) => ({
          id: crypto.randomUUID(),
          key,
          value: String(value)
        }));

        setConfig({
          ...config,
          url: parsed.url,
          method: parsed.method as APIMethod,
          query: newQueryItems, // Replace instead of append
          headers: newHeadersItems, // Replace instead of append
          body: newBodyItems, // Replace instead of append
          path: pathItems // Replace instead of append
        });
      } catch (error) {
        console.error('Error parsing cURL command:', error);
      }
    },
    [config]
  );

  const applyExampleConfig = (example: 'posts' | 'todos' | 'create') => {
    const preset = example === 'posts' ? DUMMY_POSTS_TOOL_CONFIG : example === 'todos' ? DUMMY_TODOS_TOOL_CONFIG : CREATE_POST_EXAMPLE;

    setConfig(preset.config);
  };

  useEffect(() => {
    const url = config.url;

    if (url?.startsWith('curl')) {
      parseCurlCommand(url);
    }
  }, [config.url, parseCurlCommand]);

  const getCleanConfig = (): CleanAPIConfig => {
    const clean: CleanAPIConfig = {
      url: config.url,
      method: config.method
    };

    if (config.headers?.length > 0) {
      clean.headers = config.headers.map((h) => ({
        key: h.key,
        value: h.value
      }));
    }

    if (config.query?.length > 0) {
      clean.query = config.query.map((q) => ({
        key: q.key,
        value: q.value
      }));
    }

    if (config.path?.length > 0) {
      clean.path = config.path.map((p) => ({
        key: p.key,
        value: p.value
      }));
    }

    if (config.body?.length > 0) {
      clean.body = config.body.map((b) => ({
        key: b.key,
        value: b.value
      }));
    }

    return clean;
  };

  return (
    <ResizablePanelGroup direction='horizontal' className='h-full gap-4'>
      {/* Left side - Configuration */}
      <ResizablePanel defaultSize={66} minSize={50}>
        <div className='flex h-full flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700/40 dark:bg-neutral-900'>
          <div className='flex flex-col gap-3 sm:flex-row'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='w-full justify-between sm:w-[90px]'>
                  {config.method}
                  <ChevronDown className='ml-2 h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((method) => (
                  <DropdownMenuItem key={method} onClick={() => updateConfig('method', method as APIMethod)}>
                    <div className='flex items-center'>
                      {method}
                      {config.method === method && <Check className='ml-2 h-4 w-4' />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Input
              placeholder='Enter API URL or paste cURL command'
              value={config.url}
              onChange={(e) => updateConfig('url', e.target.value)}
              className='h-10 flex-1 rounded-md border border-gray-200 bg-white/95 px-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-400/25 focus:outline-none dark:border-gray-700 dark:bg-neutral-800 dark:text-gray-100 dark:placeholder-gray-400'
            />
          </div>

          <div className='flex gap-1 border-b border-gray-200 dark:border-gray-700'>
            {[
              { value: 'headers', label: 'Headers', supportedTab: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
              { value: 'path', label: 'Path', supportedTab: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
              { value: 'query', label: 'Query', supportedTab: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
              { value: 'body', label: 'Body', supportedTab: ['POST', 'PUT', 'PATCH'] }
            ]
              .filter((t) => t.supportedTab.includes(config.method))
              .map((t) => (
                <button
                  key={t.value}
                  onClick={() => setActiveTab(t.value as TabType)}
                  className={cn(
                    '-mb-[2px] rounded-t-md border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                    activeTab === t.value ? 'border-blue-500 bg-white/60 text-blue-600 dark:bg-neutral-800/60 dark:text-blue-300' : 'border-transparent text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  )}>
                  {t.label}
                </button>
              ))}
          </div>

          <div className='flex-1 overflow-y-auto py-4'>
            {['headers', 'query', 'path'].includes(activeTab) && (
              <div className='space-y-3'>
                {activeTabMap?.map((activeTabMapItem: Parameter) => (
                  <div key={activeTabMapItem.id} className='flex items-center gap-3'>
                    <Input
                      placeholder='Key'
                      className='h-10 flex-1 rounded-md border border-gray-200 bg-white/95 px-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-400/25 focus:outline-none dark:border-gray-700 dark:bg-neutral-800 dark:text-gray-100 dark:placeholder-gray-400'
                      value={activeTabMapItem.key}
                      disabled={activeTab === 'path'}
                      onChange={(e) => updateActiveTabMapItem(activeTab as keyof typeof map, activeTabMapItem.id, 'key', e.target.value)}
                    />
                    <Input
                      placeholder='Value'
                      className='h-10 flex-1 rounded-md border border-gray-200 bg-white/95 px-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-400/25 focus:outline-none dark:border-gray-700 dark:bg-neutral-800 dark:text-gray-100 dark:placeholder-gray-400'
                      value={activeTabMapItem.value}
                      onChange={(e) => updateActiveTabMapItem(activeTab as keyof typeof map, activeTabMapItem.id, 'value', e.target.value)}
                    />
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-10 w-10 flex-shrink-0 rounded-md border border-red-200/60 text-red-600 transition-colors hover:bg-red-50/30 dark:border-red-900/30 dark:text-red-300 dark:hover:bg-red-900/25'
                      onClick={() => removeActiveTabMapItem(activeTab as keyof typeof map, activeTabMapItem.id)}>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
                <Button variant='outline' size='sm' className='mt-4 h-10' onClick={() => addActiveTabMapItem(activeTab as keyof typeof map)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add {titleCase(activeTab)}
                </Button>
              </div>
            )}

            {activeTab === 'body' && ['POST', 'PUT', 'PATCH'].includes(config.method) && (
              <div className='space-y-3'>
                {config.body?.map((bodyItem: Parameter) => (
                  <div key={bodyItem.id} className='flex items-center gap-3'>
                    <Input
                      placeholder='Key'
                      value={bodyItem.key}
                      onChange={(e) => updateActiveTabMapItem('body', bodyItem.id, 'key', e.target.value)}
                      className='h-10 flex-1 rounded-md border border-gray-200 bg-white/95 px-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-400/25 focus:outline-none dark:border-gray-700 dark:bg-neutral-800 dark:text-gray-100 dark:placeholder-gray-400'
                    />
                    <Input
                      placeholder='Value'
                      className='h-10 flex-1 rounded-md border border-gray-200 bg-white/95 px-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-400/25 focus:outline-none dark:border-gray-700 dark:bg-neutral-800 dark:text-gray-100 dark:placeholder-gray-400'
                      onChange={(e) => updateActiveTabMapItem('body', bodyItem.id, 'value', e.target.value)}
                      value={bodyItem.value}
                    />
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-10 w-10 flex-shrink-0 rounded-md border border-red-200/60 text-red-600 transition-colors hover:bg-red-50/30 dark:border-red-900/30 dark:text-red-300 dark:hover:bg-red-900/25'
                      onClick={() => removeActiveTabMapItem('body', bodyItem.id)}>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
                <Button variant='outline' size='sm' className='mt-4 h-10' onClick={() => addActiveTabMapItem('body')}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Field
                </Button>
              </div>
            )}
          </div>

          <div className='flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-700'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={loading} variant='outline' size='sm' className='h-10'>
                  Examples
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => applyExampleConfig('posts')}>GET Posts</DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyExampleConfig('todos')}>GET Todos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyExampleConfig('create')}>POST Create</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={testApi} disabled={!config.url?.trim() || loading} variant='default' size='sm' className='h-10 px-6'>
              {loading ? 'Testing...' : 'Test API'}
            </Button>
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right side - JSON preview */}
      <ResizablePanel defaultSize={34} minSize={25}>
        <div className='h-full'>
          <ResizablePanelGroup direction='vertical' className='gap-4'>
            {/* Configuration JSON - Top Half */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className='h-full rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700/40 dark:bg-neutral-900'>
                <div className='flex h-full flex-col p-4'>
                  <h3 className='mb-3 border-b border-gray-100 pb-2 text-sm font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-200'>Configuration JSON</h3>
                  <pre className='flex-1 overflow-auto rounded-lg bg-gray-50 p-4 font-mono text-xs text-gray-800 dark:bg-neutral-950/50 dark:text-gray-100'>{JSON.stringify(getCleanConfig(), null, 2)}</pre>
                </div>
              </div>
            </ResizablePanel>

            {/* Response JSON - Bottom Half */}
            {config.rawResponse && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className='h-full rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700/40 dark:bg-neutral-900 dark:bg-gradient-to-br'>
                    <div className='flex h-full flex-col p-4'>
                      <h3 className='mb-3 border-b border-gray-100 pb-2 text-sm font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-200'>Response JSON</h3>
                      <pre className='flex-1 overflow-auto rounded-lg bg-gray-50 p-4 font-mono text-xs dark:bg-neutral-950/50'>
                        {config.rawResponse.error ? (
                          <span className='font-medium text-red-700 dark:text-red-300'>{config.rawResponse.error}</span>
                        ) : (
                          <span className='text-gray-800 dark:text-gray-100'>{JSON.stringify(config.rawResponse.data, null, 2)}</span>
                        )}
                      </pre>
                    </div>
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
