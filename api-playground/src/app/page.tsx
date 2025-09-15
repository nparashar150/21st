'use client';

import { useState, useEffect } from 'react';
import APIPlayground from '@/components/api-playground';
import { APIConfig, APITestResponse, JSONObject } from '@/lib/types';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [config, setConfig] = useState<APIConfig>({
    url: '',
    method: 'GET',
    headers: [],
    query: [],
    path: [],
    body: []
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleTest = async (config: APIConfig): Promise<APITestResponse> => {
    console.log('Testing API with config:', config);

    // Build the full URL with query parameters
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

    // Build headers
    const headers: Record<string, string> = {};
    config.headers?.forEach((param) => {
      if (param.key && param.value) {
        headers[param.key] = param.value;
      }
    });

    // Build body for POST/PUT/PATCH requests
    let body: string | undefined = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(config.method)) {
      const bodyData: JSONObject = {};
      config.body?.forEach((param) => {
        if (param.key) {
          bodyData[param.key] = param.value;
        }
      });
      body = JSON.stringify(bodyData);
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    try {
      // Use our backend proxy to avoid CORS issues
      const response = await fetch('/api/test-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          method: config.method,
          headers,
          body
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to test API');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API test failed:', error);
      throw error;
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 transition-colors dark:bg-neutral-950'>
      <div className='container mx-auto px-4 py-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-8 flex items-start justify-between'>
            <div>
              <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100'>API Playground</h1>
              <p className='text-gray-600 dark:text-gray-400'>Test and configure APIs with a clean, powerful interface</p>
            </div>
            <div className='flex flex-row items-center gap-2'>
              <Button size='icon' variant='secondary' onClick={toggleTheme} aria-label='Toggle theme'>
                {theme === 'light' ? <Moon className='h-5 w-5 text-gray-700 dark:text-gray-300' /> : <Sun className='h-5 w-5 text-gray-700 dark:text-gray-300' />}
              </Button>
              <Button onClick={() => window.open('https://21st.dev/nparashar150/api-playground/default', '_blank')}>View on 21st</Button>
            </div>
          </div>

          <div className='h-[600px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-neutral-900'>
            <APIPlayground config={config} onConfigChange={setConfig} onTest={handleTest} />
          </div>
        </div>
      </div>
    </div>
  );
}
