import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, method, headers, body } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Prepare the request options
    const requestOptions: RequestInit = {
      method: method || 'GET',
      headers: {
        ...headers
        // Remove browser-specific headers that might cause issues
      }
    };

    // Add body for non-GET requests
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      requestOptions.body = body;
    }

    // Make the API request
    const response = await fetch(url, requestOptions);

    let data;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return NextResponse.json({
      status_code: response.status,
      response: data,
      headers: Object.fromEntries(response.headers.entries())
    });
  } catch (error) {
    console.error('API test failed:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to test API',
        status_code: 0
      },
      { status: 500 }
    );
  }
}
