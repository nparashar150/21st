'use client';

import { useState, useEffect } from 'react';
import { AIWriter } from '@/components/ai-writer/ai-writer';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Github, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [content, setContent] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleAIAction = async (action: string, prompt: string): Promise<string> => {
    try {
      const response = await fetch('/api/ai-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, prompt })
      });

      if (!response.ok) {
        throw new Error('AI action failed');
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('AI action error:', error);
      throw error;
    }
  };

  return (
    <div className={cn('min-h-screen bg-background transition-colors')}>
      <div className='container mx-auto px-4 py-8'>
        <div className='mx-auto max-w-5xl'>
          {/* Header */}
          <div className='mb-8 flex items-start justify-between'>
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <Sparkles className='h-6 w-6 text-primary' />
                <h1 className='text-3xl font-bold text-foreground'>AI Writer</h1>
              </div>
              <p className='text-muted-foreground'>A powerful rich text editor with AI capabilities built with Tiptap</p>
            </div>
            <div className='flex items-center gap-2'>
              <Button size='icon' variant='secondary' onClick={toggleTheme} aria-label='Toggle theme'>
                {theme === 'light' ? <Moon className='h-5 w-5' /> : <Sun className='h-5 w-5' />}
              </Button>
              <Button
                variant='outline'
                onClick={() => window.open('https://github.com/nparashar150/21st', '_blank')}>
                <Github className='h-4 w-4 mr-2' />
                GitHub
              </Button>
              <Button
                variant='outline'
                onClick={() => window.open('https://21st.dev/nparashar150/ai-writer/default', '_blank')}>
                View on 21st
              </Button>
            </div>
          </div>

          {/* Editor */}
          <div className='rounded-lg border border-border/50 bg-card'>
            <AIWriter
              content={content}
              onChange={setContent}
              placeholder="Start writing... Try typing '/' for commands or selecting text for formatting options!"
              onAIAction={handleAIAction}
              minHeight='500px'
            />
          </div>

          {/* Features */}
          <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='p-6 border border-border/50 rounded-lg bg-card'>
              <h3 className='font-semibold mb-2 flex items-center gap-2'>
                <Sparkles className='h-4 w-4 text-primary' />
                AI-Powered
              </h3>
              <p className='text-sm text-muted-foreground'>
                Use AI to complete, rewrite, expand, shorten, improve, or change the tone of your writing.
              </p>
            </div>
            <div className='p-6 border border-border/50 rounded-lg bg-card'>
              <h3 className='font-semibold mb-2'>Rich Formatting</h3>
              <p className='text-sm text-muted-foreground'>
                Full formatting support with headings, lists, links, bold, italic, underline, and more. Includes bubble menu and slash commands.
              </p>
            </div>
            <div className='p-6 border border-border/50 rounded-lg bg-card'>
              <h3 className='font-semibold mb-2'>Built with Tiptap</h3>
              <p className='text-sm text-muted-foreground'>
                Powered by Tiptap, a modern, extensible rich text editor framework for React.
              </p>
            </div>
          </div>

          {/* Usage Example */}
          <div className='mt-8 p-6 border border-border/50 rounded-lg bg-muted/50'>
            <h2 className='text-xl font-semibold mb-4'>Usage Example</h2>
            <pre className='text-sm overflow-x-auto bg-background p-4 rounded border border-border/50'>
              {`import { AIWriter } from '@/components/ai-writer';

function MyComponent() {
  const [content, setContent] = useState('');

  const handleAIAction = async (action, prompt) => {
    // Call your AI service (OpenAI, Anthropic, etc.)
    const response = await fetch('/api/ai', {
      method: 'POST',
      body: JSON.stringify({ action, prompt })
    });
    return response.json().result;
  };

  return (
    <AIWriter
      content={content}
      onChange={setContent}
      onAIAction={handleAIAction}
      placeholder="Start writing..."
    />
  );
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
