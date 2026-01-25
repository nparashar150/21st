'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  Link as LinkIcon,
  Image,
  Sparkles,
  Type,
  Bold,
  Italic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (editor: Editor) => void;
  keywords?: string[];
}

const defaultCommands: SlashCommandItem[] = [
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
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
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

interface SlashCommandProps {
  editor: Editor;
  items?: SlashCommandItem[];
  onAIAction?: (action: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
}

export function SlashCommand({ editor, items = defaultCommands, onAIAction, onOpenChange }: SlashCommandProps) {
  const [show, setShow] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [query, setQuery] = useState('');

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  const selectedRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  const allItems = onAIAction
    ? [
        ...items,
        {
          title: 'AI Continue',
          description: 'Continue writing with AI',
          icon: <Sparkles className='h-4 w-4' />,
          command: () => onAIAction('complete'),
          keywords: ['ai', 'continue', 'complete']
        },
        {
          title: 'AI Rewrite',
          description: 'Rewrite selected text with AI',
          icon: <Sparkles className='h-4 w-4' />,
          command: () => onAIAction('rewrite'),
          keywords: ['ai', 'rewrite', 'improve']
        }
      ]
    : items;

  const filteredItems = allItems.filter((item) => {
    if (!query) return true;
    const searchQuery = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery) ||
      item.keywords?.some((keyword) => keyword.toLowerCase().includes(searchQuery))
    );
  });

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!show) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        event.stopPropagation();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        event.stopPropagation();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        if (filteredItems[selectedIndex]) {
          // Remove the "/" and query text
          const { selection } = editor.state;
          const { $from } = selection;
          const lineStart = $from.start();
          const textBeforeCursor = editor.state.doc.textBetween(lineStart, $from.pos, '\0');
          const slashMatch = textBeforeCursor.match(/\/([^\0]*)$/);
          
          if (slashMatch) {
            const slashPos = $from.pos - slashMatch[0].length;
            editor.chain().focus().deleteRange({ from: slashPos, to: $from.pos }).run();
          }
          
          // Execute the command
          setTimeout(() => {
            filteredItems[selectedIndex].command(editor);
          }, 0);
          
          setShow(false);
          setQuery('');
          onOpenChange?.(false);
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setShow(false);
        setQuery('');
        onOpenChange?.(false);
        // Remove the "/" from editor
        const { selection } = editor.state;
        const { $from } = selection;
        const lineStart = $from.start();
        const textBeforeCursor = editor.state.doc.textBetween(lineStart, $from.pos, '\0');
        const slashMatch = textBeforeCursor.match(/\/([^\0]*)$/);
        if (slashMatch) {
          const slashPos = $from.pos - slashMatch[0].length;
          editor.chain().focus().deleteRange({ from: slashPos, to: $from.pos }).run();
        }
      }
    },
    [show, selectedIndex, filteredItems, editor]
  );

  useEffect(() => {
    if (show) {
      // Use capture phase to intercept before editor handles it
      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [show, handleKeyDown]);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const { selection } = editor.state;
      const { $from } = selection;
      
      // Get text from the start of the current line to cursor
      const lineStart = $from.start();
      const textBeforeCursor = editor.state.doc.textBetween(lineStart, $from.pos, '\0');
      
      // Check if we have "/" at the start or after whitespace
      const slashMatch = textBeforeCursor.match(/\/([^\0]*)$/);
      
      if (slashMatch) {
        const queryText = slashMatch[1] || '';
        setQuery(queryText);
        setShow(true);
        setSelectedIndex(0);
        onOpenChange?.(true);
      } else {
        setShow(false);
        setQuery('');
        onOpenChange?.(false);
      }
    };

    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [editor, onOpenChange]);

  if (!show || !editor || filteredItems.length === 0) {
    return null;
  }

  const { selection } = editor.state;
  const { $from } = selection;
  const coords = editor.view.coordsAtPos($from.pos);

  return (
    <div
      className='fixed z-50 w-64 rounded-lg border bg-popover p-1 shadow-lg'
      style={{
        top: `${coords.top + 20}px`,
        left: `${coords.left}px`
      }}
      onMouseDown={(e) => e.preventDefault()}>
      <div className='max-h-80 overflow-y-auto'>
        {          filteredItems.map((item, index) => (
            <div
              key={item.title}
              ref={index === selectedIndex ? selectedRef : null}
              className={cn('w-full', index === selectedIndex && 'bg-accent rounded')}>
              <Button
                variant='ghost'
                className={cn('w-full justify-start gap-2 px-2 py-1.5 text-sm h-auto')}
                onClick={() => {
                // Remove the "/" and query text from the editor
                const { selection } = editor.state;
                const { $from } = selection;
                const lineStart = $from.start();
                const textBeforeCursor = editor.state.doc.textBetween(lineStart, $from.pos, '\0');
                const slashMatch = textBeforeCursor.match(/\/([^\0]*)$/);
                
                if (slashMatch) {
                  const slashPos = $from.pos - slashMatch[0].length;
                  editor.chain().focus().deleteRange({ from: slashPos, to: $from.pos }).run();
                }
                
                // Execute the command
                setTimeout(() => {
                  item.command(editor);
                }, 0);
                
                setShow(false);
                setQuery('');
                onOpenChange?.(false);
                }}>
                <span className='text-muted-foreground'>{item.icon}</span>
                <div className='flex flex-col items-start'>
                  <span className='font-medium'>{item.title}</span>
                  <span className='text-xs text-muted-foreground'>{item.description}</span>
                </div>
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
