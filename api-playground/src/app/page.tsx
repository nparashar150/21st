'use client'

import { useState } from 'react'
import APIPlayground from '@/components/api-playground'
import { APIConfig, APITestResponse, JSONObject } from '@/lib/types'

export default function Home() {
  const [config, setConfig] = useState<APIConfig>({
    url: '',
    method: 'GET',
    headers: [],
    query: [],
    path: [],
    body: []
  })


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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">API Playground</h1>
            <p className="text-gray-600">
              Test and configure APIs with a clean, powerful interface
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4 h-[600px]">
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