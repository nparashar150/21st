import { APITool } from './types';

export const DUMMY_POSTS_TOOL_CONFIG: Omit<APITool, 'tool_type'> = {
  name: 'get_posts',
  config: {
    url: 'https://jsonplaceholder.typicode.com/posts',
    method: 'GET',
    headers: [
      {
        id: 'header-1',
        key: 'Accept',
        value: 'application/json'
      }
    ],
    query: [
      {
        id: 'query-1',
        key: 'userId',
        value: '1'
      }
    ],
    path: [],
    body: []
  }
};

export const DUMMY_TODOS_TOOL_CONFIG: Omit<APITool, 'tool_type'> = {
  name: 'get_todos',
  config: {
    url: 'https://jsonplaceholder.typicode.com/todos',
    method: 'GET',
    headers: [
      {
        id: 'header-1',
        key: 'Accept',
        value: 'application/json'
      }
    ],
    query: [
      {
        id: 'query-1',
        key: 'completed',
        value: 'false'
      }
    ],
    path: [],
    body: []
  }
};

export const CREATE_POST_EXAMPLE: Omit<APITool, 'tool_type'> = {
  name: 'create_post',
  config: {
    url: 'https://jsonplaceholder.typicode.com/posts',
    method: 'POST',
    headers: [
      {
        id: 'header-1',
        key: 'Content-Type',
        value: 'application/json'
      }
    ],
    query: [],
    path: [],
    body: [
      {
        id: 'body-1',
        key: 'title',
        value: 'My New Post'
      },
      {
        id: 'body-2',
        key: 'body',
        value: 'This is the post content'
      },
      {
        id: 'body-3',
        key: 'userId',
        value: '1'
      }
    ]
  }
};
