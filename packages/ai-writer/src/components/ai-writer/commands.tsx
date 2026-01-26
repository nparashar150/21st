'use client';

import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  Link as LinkIcon
} from 'lucide-react';
import type { Editor } from '@tiptap/react';
import type { SlashCommandItem } from '../../lib/types';

export const defaultCommands: SlashCommandItem[] = [
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: <Heading1 className='h-4 w-4' />,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    keywords: ['h1', 'heading1', 'title']
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: <Heading2 className='h-4 w-4' />,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    keywords: ['h2', 'heading2', 'subtitle']
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: <Heading3 className='h-4 w-4' />,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    keywords: ['h3', 'heading3']
  },
  {
    title: 'Bullet List',
    description: 'Create a bulleted list',
    icon: <List className='h-4 w-4' />,
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
    keywords: ['ul', 'bullet', 'unordered']
  },
  {
    title: 'Numbered List',
    description: 'Create a numbered list',
    icon: <ListOrdered className='h-4 w-4' />,
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
    keywords: ['ol', 'numbered', 'ordered']
  },
  {
    title: 'Code Block',
    description: 'Insert a code block',
    icon: <Code className='h-4 w-4' />,
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    keywords: ['code', 'pre', 'preformatted']
  },
  {
    title: 'Quote',
    description: 'Insert a quote',
    icon: <Quote className='h-4 w-4' />,
    command: (editor) => {
      // Check if we're already in a blockquote
      if (editor.isActive('blockquote')) {
        // If already in blockquote, unwrap it
        editor.chain().focus().lift('blockquote').run();
      } else {
        const { selection } = editor.state;
        const { $from } = selection;
        
        // Find the paragraph node we're currently in
        let paragraphStart = $from.start();
        let paragraphEnd = $from.end();
        let depth = $from.depth;
        
        // Walk up the node tree to find the paragraph
        while (depth >= 0) {
          const nodeAtDepth = $from.node(depth);
          if (nodeAtDepth.type.name === 'paragraph') {
            paragraphStart = $from.start(depth);
            paragraphEnd = $from.end(depth);
            break;
          }
          depth--;
        }
        
        // If we're not in a paragraph (e.g., in a heading), convert to paragraph first
        if (depth < 0) {
          editor.chain().focus().setParagraph().wrapIn('blockquote').run();
        } else {
          // Select only the paragraph node and wrap it
          editor
            .chain()
            .focus()
            .setTextSelection({ from: paragraphStart, to: paragraphEnd })
            .wrapIn('blockquote')
            .run();
        }
      }
    },
    keywords: ['quote', 'blockquote', 'citation']
  },
  {
    title: 'Link',
    description: 'Insert a link',
    icon: <LinkIcon className='h-4 w-4' />,
    command: (editor) => {
      const url = window.prompt('Enter URL:');
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    },
    keywords: ['link', 'url', 'href']
  },
  {
    title: 'Bold',
    description: 'Make text bold',
    icon: <Bold className='h-4 w-4' />,
    command: (editor) => editor.chain().focus().toggleBold().run(),
    keywords: ['bold', 'strong']
  },
  {
    title: 'Italic',
    description: 'Make text italic',
    icon: <Italic className='h-4 w-4' />,
    command: (editor) => editor.chain().focus().toggleItalic().run(),
    keywords: ['italic', 'emphasis']
  }
];
