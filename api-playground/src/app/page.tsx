'use client'

import { useState, useEffect } from 'react'
import APIPlayground from '@/components/api-playground'
import { APIConfig, APITestResponse, JSONObject } from '@/lib/types'
import { Moon, Sun } from 'lucide-react'

export default function Home() {
  const [config, setConfig] = useState<APIConfig>({
    url: '',
    method: 'GET',
    headers: [],
    query: [],
    path: [],
    body: []
  })
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }


  const handleTest = async (config: APIConfig): Promise<APITestResponse> => {
    console.log('Testing API with config:', config)

    // Build the full URL with query parameters
    let url = config.url
    const queryParams = new URLSearchParams()

    config.query?.forEach(param => {
      if (param.key && param.value) {
        queryParams.append(param.key, param.value)
      }
    })

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`
    }

    // Build headers
    const headers: Record<string, string> = {}
    config.headers?.forEach(param => {
      if (param.key && param.value) {
        headers[param.key] = param.value
      }
    })

    // Build body for POST/PUT/PATCH requests
    let body: string | undefined = undefined
    if (['POST', 'PUT', 'PATCH'].includes(config.method)) {
      const bodyData: JSONObject = {}
      config.body?.forEach(param => {
        if (param.key) {
          bodyData[param.key] = param.value
        }
      })
      body = JSON.stringify(bodyData)
      headers['Content-Type'] = headers['Content-Type'] || 'application/json'
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
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to test API')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API test failed:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">API Playground</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Test and configure APIs with a clean, powerful interface
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-[600px]">
            <APIPlayground
              config={config}
              onConfigChange={setConfig}
              onTest={handleTest}
            />
          </div>
        </div>
      </div>
    </div>
  )
}