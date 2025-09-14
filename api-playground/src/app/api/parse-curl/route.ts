import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { curlCommand } = await request.json()

    if (!curlCommand || typeof curlCommand !== 'string') {
      return NextResponse.json(
        { error: 'cURL command is required' },
        { status: 400 }
      )
    }

    // Parse cURL command using our improved parser
    const result = parseCurlCommand(curlCommand)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error parsing cURL:', error)
    return NextResponse.json(
      { error: 'Failed to parse cURL command' },
      { status: 500 }
    )
  }
}

function parseCurlCommand(curlCommand: string) {
  const result = {
    url: '',
    method: 'GET',
    headers: {} as Record<string, string>,
    data: undefined as Record<string, any> | undefined,
    queryParams: {} as Record<string, string>,
    pathParams: {} as Record<string, string>
  }

  try {
    // Clean up the command
    const cleanCommand = curlCommand.trim()

    // Extract URL - much simpler approach
    let url = ''

    // Remove curl command and flags to find URL
    const urlRegex = /(https?:\/\/[^\s'"]+)/i
    const match = cleanCommand.match(urlRegex)
    if (match) {
      url = match[1]
    }

    // Parse URL to separate base URL and query parameters
    if (url.includes('?')) {
      const [baseUrl, queryString] = url.split('?', 2)
      result.url = baseUrl
      const params = new URLSearchParams(queryString)
      params.forEach((value, key) => {
        result.queryParams[key] = value
      })
    } else {
      result.url = url
    }

    // Extract method
    const methodMatches = [
      /-X\s+([A-Z]+)/i,
      /--request\s+([A-Z]+)/i
    ]

    for (const regex of methodMatches) {
      const match = cleanCommand.match(regex)
      if (match) {
        result.method = match[1].toUpperCase()
        break
      }
    }

    // Extract headers - handles various formats
    const headerRegexes = [
      /-H\s+['"]([^:]+?):\s*([^'"]*?)['"](?:\s|$)/gi,  // -H "key: value"
      /--header\s+['"]([^:]+?):\s*([^'"]*?)['"](?:\s|$)/gi, // --header "key: value"
    ]

    for (const regex of headerRegexes) {
      let match
      while ((match = regex.exec(cleanCommand)) !== null) {
        const key = match[1].trim()
        const value = match[2].trim()
        result.headers[key] = value
      }
    }

    // Extract data/body - handles various formats
    const dataRegexes = [
      /-d\s+['"](.+?)['"](?:\s|$)/s,        // -d "data"
      /--data\s+['"](.+?)['"](?:\s|$)/s,    // --data "data"
      /--data-raw\s+['"](.+?)['"](?:\s|$)/s, // --data-raw "data"
      /--data-binary\s+['"](.+?)['"](?:\s|$)/s, // --data-binary "data"
    ]

    for (const regex of dataRegexes) {
      const match = cleanCommand.match(regex)
      if (match) {
        const dataStr = match[1]
        try {
          // Try to parse as JSON
          result.data = JSON.parse(dataStr)
        } catch {
          // If not valid JSON, try to parse as form data or treat as string
          if (dataStr.includes('=') && !dataStr.includes('{')) {
            // Looks like form data
            const formData: Record<string, string> = {}
            const pairs = dataStr.split('&')
            pairs.forEach(pair => {
              const [key, value] = pair.split('=', 2)
              if (key && value !== undefined) {
                formData[decodeURIComponent(key)] = decodeURIComponent(value)
              }
            })
            result.data = formData
          } else {
            // Treat as raw string
            result.data = { body: dataStr }
          }
        }
        break
      }
    }

    // Extract path parameters from URL patterns like /users/:id
    const pathParamMatches = result.url.matchAll(/:([^/]+)/g)
    for (const match of pathParamMatches) {
      const paramName = match[1]
      result.pathParams[paramName] = paramName
    }

  } catch (error) {
    console.error('Error parsing cURL command:', error)
  }

  return result
}