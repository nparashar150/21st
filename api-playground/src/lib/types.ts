export type APIMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface Parameter {
  id: string;
  key: string;
  value: string;
}

export interface APITool {
  tool_type: 'api_tool' | 'pre_call_api_tool';
  name: string;
  config: APIConfig;
}

// JSON value can be string, number, boolean, null, object, or array
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;

export interface JSONObject {
  [key: string]: JSONValue;
}

export type JSONArray = Array<JSONValue>;

export interface APIResponse {
  status?: number;
  data?: JSONValue;
  error?: string;
  headers?: Record<string, string>;
}

export interface APITestResponse {
  status_code: number;
  response: JSONValue;
  headers?: Record<string, string>;
}

export interface APIConfig {
  url: string;
  method: APIMethod;
  headers: Parameter[];
  query: Parameter[];
  path: Parameter[];
  body: Parameter[];
  rawResponse?: APIResponse;
}

export interface APIPlaygroundProps {
  tools: APITool[];
  onToolsChange: (tools: APITool[]) => void;
  variables?: Set<string>;
  onSave?: (tools: APITool[]) => Promise<void>;
  onTest?: (config: APIConfig) => Promise<APITestResponse>;
}

export interface ParsedCurlData {
  url: string;
  method: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  pathParams: Record<string, string>;
  data?: JSONObject;
}

export interface CleanParameter {
  key: string;
  value: string;
}

export interface CleanAPIConfig {
  url: string;
  method: APIMethod;
  headers?: CleanParameter[];
  query?: CleanParameter[];
  path?: CleanParameter[];
  body?: CleanParameter[];
  responseKeys?: string[];
}
