'use client';

import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Link as LinkIcon, Sparkles } from 'lucide-react';
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react';
import type { Editor } from '@tiptap/react';

import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';

interface BubbleMenuProps {
  editor: Editor;
  onAIAction?: (action: string) => void;
}

export function BubbleMenu({ editor, onAIAction }: BubbleMenuProps) {
  if (!editor) return null;

  const isActive = (name: string) => {
    if (name === 'bold') return editor.isActive('bold');
    if (name === 'italic') return editor.isActive('italic');
    if (name === 'underline') return editor.isActive('underline');
    if (name === 'strike') return editor.isActive('strike');
    if (name === 'code') return editor.isActive('code');
    return false;
  };

  const handleFormat = (format: string) => {
    switch (format) {
      case 'bold':
        editor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'underline':
        editor.chain().focus().toggleUnderline().run();
        break;
      case 'strike':
        editor.chain().focus().toggleStrike().run();
        break;
      case 'code':
        editor.chain().focus().toggleCode().run();
        break;
      case 'link':
        const url = window.prompt('Enter URL:');
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
        break;
    }
  };

  return (
    <TiptapBubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      className='flex items-center gap-1 rounded-lg border border-border bg-popover p-1 shadow-lg'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleFormat('bold')}
            className={cn('h-8 w-8 p-0', isActive('bold') && 'bg-accent')}>
            <Bold className='h-4 w-4' />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Bold</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleFormat('italic')}
            className={cn('h-8 w-8 p-0', isActive('italic') && 'bg-accent')}>
            <Italic className='h-4 w-4' />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Italic</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleFormat('underline')}
            className={cn('h-8 w-8 p-0', isActive('underline') && 'bg-accent')}>
            <UnderlineIcon className='h-4 w-4' />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Underline</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleFormat('strike')}
            className={cn('h-8 w-8 p-0', isActive('strike') && 'bg-accent')}>
            <Strikethrough className='h-4 w-4' />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Strikethrough</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleFormat('code')}
            className={cn('h-8 w-8 p-0', isActive('code') && 'bg-accent')}>
            <Code className='h-4 w-4' />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Code</TooltipContent>
      </Tooltip>

      <Separator orientation='vertical' className='h-6' />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='ghost' size='sm' onClick={() => handleFormat('link')} className='h-8 w-8 p-0'>
            <LinkIcon className='h-4 w-4' />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add Link</TooltipContent>
      </Tooltip>

      {onAIAction && (
        <>
          <Separator orientation='vertical' className='h-6' />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onAIAction('rewrite')}
                className='h-8 w-8 p-0 text-primary hover:text-primary/80'>
                <Sparkles className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>AI Rewrite</TooltipContent>
          </Tooltip>
        </>
      )}
    </TiptapBubbleMenu>
  );
}
