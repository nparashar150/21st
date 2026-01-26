'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import type { Editor } from '@tiptap/react';

import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import type { SlashCommandItem } from '../../lib/types';
import { defaultCommands } from './commands';

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
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

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
          const { selection } = editor.state;
          const { $from } = selection;
          
          // Get the current node (paragraph) start position
          let nodeStart = $from.start();
          let node = $from.node();
          
          // If we're not in a paragraph, find the paragraph node
          if (node.type.name !== 'paragraph') {
            let depth = $from.depth;
            while (depth > 0) {
              const nodeAtDepth = $from.node(depth);
              if (nodeAtDepth.type.name === 'paragraph') {
                nodeStart = $from.start(depth);
                node = nodeAtDepth;
                break;
              }
              depth--;
            }
          } else {
            nodeStart = $from.start();
          }
          
          // Get text from the start of this paragraph to cursor
          const textBeforeCursor = editor.state.doc.textBetween(nodeStart, $from.pos, ' ');
          const match = textBeforeCursor.match(/(?:^|\s)\/(\S*)$/);
          
          if (match) {
            // Calculate the exact position of the slash command
            const slashPos = $from.pos - match[0].length;
            
            // Delete only the slash command text from the current paragraph
            editor.chain().focus().deleteRange({ from: slashPos, to: $from.pos }).run();
          }

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
        const { selection } = editor.state;
        const { $from } = selection;
        const paragraphStart = $from.start(-1);
        const textBeforeCursor = editor.state.doc.textBetween(paragraphStart, $from.pos, ' ');
        const slashMatch = textBeforeCursor.match(/(?:^|\s)\/(\S*)$/);
        if (slashMatch) {
          const slashPos = $from.pos - slashMatch[0].length;
          editor.chain().focus().deleteRange({ from: slashPos, to: $from.pos }).run();
        }
      }
    },
    [show, selectedIndex, filteredItems, editor, onOpenChange]
  );

  useEffect(() => {
    if (show) {
      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [show, handleKeyDown]);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const { selection } = editor.state;
      const { $from } = selection;
      
      try {
        // Get the paragraph node
        const paragraphStart = $from.start(-1);
        
        // Get text from start of paragraph to cursor (use space as separator to handle newlines)
        const textBeforeCursor = editor.state.doc.textBetween(paragraphStart, $from.pos, ' ');
        
        // Check if we have "/" at the start of paragraph or after whitespace
        // This regex matches:
        // - "/" at the very start (^/)
        // - "/" after a space (\s/)
        // Followed by optional non-space characters
        const slashMatch = textBeforeCursor.match(/(?:^|\s)\/(\S*)$/);

        if (slashMatch) {
          const queryText = slashMatch[1] || '';
          setQuery(queryText);
          setShow(true);
          setSelectedIndex(0);
          onOpenChange?.(true);
        } else {
          // Only hide if there's definitely no slash command
          if (!textBeforeCursor.trim().endsWith('/')) {
            setShow(false);
            setQuery('');
            onOpenChange?.(false);
          }
        }
      } catch (error) {
        // Silently fail if there's an error
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
      className='fixed z-50 w-64 rounded-lg border border-border bg-popover p-1 shadow-lg'
      style={{
        top: `${coords.top + 20}px`,
        left: `${coords.left}px`
      }}
      onMouseDown={(e) => e.preventDefault()}>
      <div className='max-h-80 overflow-y-auto'>
        {filteredItems.map((item, index) => (
          <div
            key={item.title}
            ref={index === selectedIndex ? selectedRef : null}
            className={cn('w-full', index === selectedIndex && 'bg-accent rounded')}>
            <Button
              variant='ghost'
              className={cn('w-full justify-start gap-2 px-2 py-1.5 text-sm h-auto')}
              onClick={() => {
                const { selection } = editor.state;
                const { $from } = selection;
                
                // Get the current node (paragraph) start position
                // We need to find the actual paragraph node, not just the parent
                let nodeStart = $from.start();
                let node = $from.node();
                
                // If we're not in a paragraph, find the paragraph node
                if (node.type.name !== 'paragraph') {
                  // Walk up to find paragraph
                  let depth = $from.depth;
                  while (depth > 0) {
                    const nodeAtDepth = $from.node(depth);
                    if (nodeAtDepth.type.name === 'paragraph') {
                      nodeStart = $from.start(depth);
                      node = nodeAtDepth;
                      break;
                    }
                    depth--;
                  }
                } else {
                  nodeStart = $from.start();
                }
                
                // Get text from the start of this paragraph to cursor
                const textBeforeCursor = editor.state.doc.textBetween(nodeStart, $from.pos, ' ');
                const slashMatch = textBeforeCursor.match(/(?:^|\s)\/(\S*)$/);

                if (slashMatch) {
                  // Calculate the exact position of the slash command
                  const slashPos = $from.pos - slashMatch[0].length;
                  
                  // Delete only the slash command text from the current paragraph
                  editor.chain().focus().deleteRange({ from: slashPos, to: $from.pos }).run();
                }

                // Execute the command after deletion
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
