'use client';

import { useState } from 'react';
import { APIPlayground, type APIConfig, type APITestResponse } from '@21st/api-playground';

export default function APIPlaygroundDemo() {
  const [config, setConfig] = useState<APIConfig>({
    url: '',
    method: 'GET',
    headers: [],
    query: [],
    path: [],
    body: []
  });

  const handleTest = async (config: APIConfig): Promise<APITestResponse> => {
    console.log('Testing API with config:', config);

    let url = config.url;
    const queryParams = new URLSearchParams();

    config.query?.forEach((param) => {
      if (param.key && param.value) {
        queryParams.append(param.key, param.value);
      }
    });

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    try {
      const response = await fetch(url, {
        method: config.method,
        headers: config.headers?.reduce((acc, header) => {
          if (header.key && header.value) {
            acc[header.key] = header.value;
          }
          return acc;
        }, {} as Record<string, string>) || {},
        body: config.method !== 'GET' && config.body ? JSON.stringify(config.body) : undefined
      });

      const data = await response.json();
      return {
        status: response.status,
        statusText: response.statusText,
        data,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      return {
        status: 0,
        statusText: 'Error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        headers: {}
      };
    }
  };

  return (
    <div className='space-y-4'>
      <div className='rounded-lg border border-border bg-card p-6'>
        <h2 className='text-xl font-semibold mb-4 text-foreground'>API Playground</h2>
        <p className='text-sm text-muted-foreground mb-4'>
          Test and explore APIs with a visual interface. Configure headers, query parameters, path variables, and request bodies.
        </p>
        <div className='rounded-lg border border-border bg-background'>
          <APIPlayground config={config} onConfigChange={setConfig} onTest={handleTest} />
        </div>
      </div>
    </div>
  );
}
