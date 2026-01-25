'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useState, useRef } from 'react';
import { BubbleMenu } from './bubble-menu';
import { SlashCommand } from './slash-command';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Sparkles,
  Loader2,
  Wand2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowRight,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface AIWriterProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  onAIAction?: (action: string, prompt: string) => Promise<string>;
  className?: string;
  minHeight?: string;
}

type AIAction = 'complete' | 'rewrite' | 'expand' | 'shorten' | 'improve' | 'tone';

export function AIWriter({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  onAIAction,
  className,
  minHeight = '400px'
}: AIWriterProps) {
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSuggestion, setAISuggestion] = useState<string | null>(null);
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const slashCommandOpenRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to);
      setSelectedText(text);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[200px] px-4 py-3 prose-ul:list-disc prose-ol:list-decimal'
      },
      handleKeyDown: (view, event) => {
        // If Enter is pressed and slash command is open, prevent default
        if (event.key === 'Enter' && slashCommandOpenRef.current) {
          event.preventDefault();
          return true; // Prevent default behavior
        }
        return false;
      }
    }
  });

  const handleAIAction = useCallback(
    async (action: AIAction) => {
      if (!editor || !onAIAction) return;

      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);

      if (!selectedText && action !== 'complete') {
        // If no selection and not complete, use entire document
        const fullText = editor.getText();
        if (!fullText.trim()) return;
      }

      setIsAILoading(true);
      setSelectedText(selectedText || editor.getText());

      try {
        const prompt = getAIPrompt(action, selectedText || editor.getText());
        const result = await onAIAction(action, prompt);

        if (action === 'complete') {
          // Insert at cursor
          editor.chain().focus().insertContent(result).run();
        } else if (selectedText) {
          // Replace selection
          editor.chain().focus().deleteSelection().insertContent(result).run();
        } else {
          // Replace entire content
          editor.commands.setContent(result);
        }
      } catch (error) {
        console.error('AI action failed:', error);
      } finally {
        setIsAILoading(false);
        setAISuggestion(null);
        setShowAISuggestion(false);
      }
    },
    [editor, onAIAction]
  );

  const getAIPrompt = (action: AIAction, text: string): string => {
    const prompts: Record<AIAction, string> = {
      complete: `Continue writing from: "${text.slice(-100)}"`,
      rewrite: `Rewrite this text to be clearer and more engaging: "${text}"`,
      expand: `Expand this text with more details and examples: "${text}"`,
      shorten: `Make this text more concise while keeping the key points: "${text}"`,
      improve: `Improve this text for better clarity, flow, and impact: "${text}"`,
      tone: `Rewrite this text in a more professional tone: "${text}"`
    };
    return prompts[action];
  };

  const handleFormat = useCallback(
    (format: string) => {
      if (!editor) return;

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
        case 'h1':
          editor.chain().focus().toggleHeading({ level: 1 }).run();
          break;
        case 'h2':
          editor.chain().focus().toggleHeading({ level: 2 }).run();
          break;
        case 'h3':
          editor.chain().focus().toggleHeading({ level: 3 }).run();
          break;
        case 'bulletList':
          editor.chain().focus().toggleBulletList().run();
          break;
        case 'orderedList':
          editor.chain().focus().toggleOrderedList().run();
          break;
        case 'link':
          const url = window.prompt('Enter URL:');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
          break;
      }
    },
    [editor]
  );

  if (!editor) {
    return null;
  }

  const isActive = (name: string, options?: any) => {
    if (name === 'bold') return editor.isActive('bold');
    if (name === 'italic') return editor.isActive('italic');
    if (name === 'underline') return editor.isActive('underline');
    if (name === 'strike') return editor.isActive('strike');
    if (name === 'code') return editor.isActive('code');
    if (name === 'heading') return editor.isActive('heading', options);
    if (name === 'bulletList') return editor.isActive('bulletList');
    if (name === 'orderedList') return editor.isActive('orderedList');
    return false;
  };

  return (
    <div className={cn('flex flex-col border border-border/50 rounded-lg bg-background overflow-hidden', className)}>
      {/* Toolbar */}
      <div className='flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap'>
        {/* Formatting Tools */}
        <div className='flex items-center gap-1'>
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
            <TooltipContent>Bold (Ctrl+B)</TooltipContent>
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
            <TooltipContent>Italic (Ctrl+I)</TooltipContent>
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
            <TooltipContent>Underline (Ctrl+U)</TooltipContent>
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
        </div>

        <Separator orientation='vertical' className='h-6' />

        {/* Headings */}
        <div className='flex items-center gap-1'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleFormat('h1')}
                className={cn('h-8 w-8 p-0', isActive('heading', { level: 1 }) && 'bg-accent')}>
                <Heading1 className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 1</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleFormat('h2')}
                className={cn('h-8 w-8 p-0', isActive('heading', { level: 2 }) && 'bg-accent')}>
                <Heading2 className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 2</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleFormat('h3')}
                className={cn('h-8 w-8 p-0', isActive('heading', { level: 3 }) && 'bg-accent')}>
                <Heading3 className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 3</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation='vertical' className='h-6' />

        {/* Lists */}
        <div className='flex items-center gap-1'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleFormat('bulletList')}
                className={cn('h-8 w-8 p-0', isActive('bulletList') && 'bg-accent')}>
                <List className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleFormat('orderedList')}
                className={cn('h-8 w-8 p-0', isActive('orderedList') && 'bg-accent')}>
                <ListOrdered className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Numbered List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='sm' onClick={() => handleFormat('link')} className='h-8 w-8 p-0'>
                <LinkIcon className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Link</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation='vertical' className='h-6' />

        {/* AI Actions */}
        {onAIAction && (
          <>
            <Popover open={showAISuggestion} onOpenChange={setShowAISuggestion}>
              <PopoverTrigger asChild>
                <Button variant='ghost' size='sm' className='h-8 gap-1.5 text-primary hover:text-primary'>
                  <Sparkles className='h-4 w-4' />
                  <span className='text-xs font-medium'>AI</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-64 p-2' align='start'>
                <div className='space-y-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start gap-2'
                    onClick={() => handleAIAction('complete')}
                    disabled={isAILoading}>
                    <Wand2 className='h-4 w-4' />
                    Continue Writing
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start gap-2'
                    onClick={() => handleAIAction('rewrite')}
                    disabled={isAILoading || !selectedText}>
                    <ArrowRight className='h-4 w-4' />
                    Rewrite
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start gap-2'
                    onClick={() => handleAIAction('expand')}
                    disabled={isAILoading || !selectedText}>
                    <ArrowRight className='h-4 w-4' />
                    Expand
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start gap-2'
                    onClick={() => handleAIAction('shorten')}
                    disabled={isAILoading || !selectedText}>
                    <ArrowRight className='h-4 w-4' />
                    Shorten
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start gap-2'
                    onClick={() => handleAIAction('improve')}
                    disabled={isAILoading || !selectedText}>
                    <Sparkles className='h-4 w-4' />
                    Improve
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start gap-2'
                    onClick={() => handleAIAction('tone')}
                    disabled={isAILoading || !selectedText}>
                    <Sparkles className='h-4 w-4' />
                    Change Tone
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {isAILoading && (
              <div className='flex items-center gap-2 text-xs text-muted-foreground ml-2'>
                <Loader2 className='h-3 w-3 animate-spin' />
                <span>AI is thinking...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Editor Content */}
      <div className='flex-1 overflow-auto relative' style={{ minHeight }}>
        {editor && <BubbleMenu editor={editor} onAIAction={onAIAction ? (action) => handleAIAction(action as AIAction) : undefined} />}
        {editor && (
          <SlashCommand
            editor={editor}
            onAIAction={onAIAction ? (action) => handleAIAction(action as AIAction) : undefined}
            onOpenChange={(isOpen) => {
              slashCommandOpenRef.current = isOpen;
            }}
          />
        )}
        <EditorContent editor={editor} />
      </div>

      {/* AI Suggestion Bubble */}
      {aiSuggestion && (
        <div className='border-t bg-muted/50 p-3'>
          <div className='flex items-start justify-between gap-2'>
            <div className='flex-1'>
              <p className='text-xs font-medium mb-1 text-muted-foreground'>AI Suggestion:</p>
              <p className='text-sm'>{aiSuggestion}</p>
            </div>
            <div className='flex items-center gap-1'>
              <Button
                variant='ghost'
                size='sm'
                className='h-7 w-7 p-0'
                onClick={() => {
                  if (editor && aiSuggestion) {
                    editor.chain().focus().insertContent(aiSuggestion).run();
                    setAISuggestion(null);
                  }
                }}>
                <Check className='h-4 w-4' />
              </Button>
              <Button variant='ghost' size='sm' className='h-7 w-7 p-0' onClick={() => setAISuggestion(null)}>
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
