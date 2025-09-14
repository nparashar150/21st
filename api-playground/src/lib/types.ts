export type APIMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface Parameter {
  id: string
  key: string
  value: string
}

export interface APITool {
  tool_type: 'api_tool' | 'pre_call_api_tool'
  name: string
  config: APIConfig
}

export interface APIConfig {
  url: string
  method: APIMethod
  headers: Parameter[]
  query: Parameter[]
  path: Parameter[]
  body: Parameter[]
  rawResponse?: {
    status?: number
    data?: any
    error?: string
  }
}

export interface APIPlaygroundProps {
  tools: APITool[]
  onToolsChange: (tools: APITool[]) => void
  variables?: Set<string>
  onSave?: (tools: APITool[]) => Promise<void>
  onTest?: (config: APIConfig) => Promise<{
    status_code: number
    response: any
  }>
}