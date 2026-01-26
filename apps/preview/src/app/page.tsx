'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, FileText, Search, Clock, Code, Github, Coffee, Heart, ExternalLink, Star, Globe } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import components to avoid SSR issues
const AIWriterDemo = dynamic(() => import('@/components/preview/ai-writer-demo'), { ssr: false });
const QueryBuilderDemo = dynamic(() => import('@/components/preview/query-builder-demo'), { ssr: false });
const TimelineDemo = dynamic(() => import('@/components/preview/timeline-demo'), { ssr: false });
const APIPlaygroundDemo = dynamic(() => import('@/components/preview/api-playground-demo'), { ssr: false });

type Tab = 'ai-writer' | 'query-builder' | 'timeline' | 'api-playground';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'ai-writer', label: 'AI Writer', icon: <FileText className='h-4 w-4' /> },
  { id: 'query-builder', label: 'Query Builder', icon: <Search className='h-4 w-4' /> },
  { id: 'timeline', label: 'Timeline', icon: <Clock className='h-4 w-4' /> },
  { id: 'api-playground', label: 'API Playground', icon: <Code className='h-4 w-4' /> }
];

function cn(...inputs: (string | undefined | null | boolean)[]) {
  return inputs.filter(Boolean).join(' ');
}

function Button({ className, children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 outline-none cursor-pointer border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2',
        className
      )}
      onClick={onClick}
      {...props}>
      {children}
    </button>
  );
}

function IconButton({ className, children, onClick, href, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: string }) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 outline-none cursor-pointer hover:bg-accent hover:text-accent-foreground h-9 w-9 p-0';
  
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(baseClasses, className)}
        {...(props as any)}>
        {children}
      </a>
    );
  }
  
  return (
    <button
      className={cn(baseClasses, className)}
      onClick={onClick}
      {...props}>
      {children}
    </button>
  );
}

export default function PreviewPage() {
  const [activeTab, setActiveTab] = useState<Tab>('ai-writer');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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

  return (
    <div className='min-h-screen bg-background transition-colors'>
      {/* Header */}
      <header className='border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-foreground'>21st Components Preview</h1>
              <p className='text-sm text-muted-foreground mt-1'>Unified preview of all components</p>
            </div>
            <div className='flex items-center gap-2'>
              {/* Support Links */}
              <div className='flex items-center gap-1 border-r border-border pr-2 mr-2'>
                <IconButton
                  href="https://21st.dev/community/nparashar150"
                  aria-label="View on 21st"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="View on 21st.dev">
                  <Globe className='h-4 w-4' />
                </IconButton>
                <IconButton
                  href="https://github.com/nparashar150/21st"
                  aria-label="View on GitHub"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="View on GitHub">
                  <Github className='h-4 w-4' />
                </IconButton>
                <IconButton
                  href="https://github.com/nparashar150/21st"
                  aria-label="Star on GitHub"
                  className="text-muted-foreground hover:text-yellow-500 transition-colors"
                  title="Star us on GitHub">
                  <Star className='h-4 w-4' />
                </IconButton>
                <IconButton
                  href="https://buymeacoffee.com/nparashar150"
                  aria-label="Buy me a coffee"
                  className="text-muted-foreground hover:text-orange-500 transition-colors"
                  title="Support us">
                  <Coffee className='h-4 w-4' />
                </IconButton>
              </div>
              {/* Theme Toggle */}
              <IconButton
                onClick={toggleTheme}
                aria-label='Toggle theme'
                className="text-muted-foreground hover:text-foreground transition-colors"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                {theme === 'light' ? <Moon className='h-4 w-4' /> : <Sun className='h-4 w-4' />}
              </IconButton>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className='border-b border-border bg-background'>
        <div className='container mx-auto px-4'>
          <div className='flex gap-1 overflow-x-auto'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                )}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className='container mx-auto px-4 py-8'>
        <div className='min-h-[600px]'>
          {activeTab === 'ai-writer' && <AIWriterDemo />}
          {activeTab === 'query-builder' && <QueryBuilderDemo />}
          {activeTab === 'timeline' && <TimelineDemo />}
          {activeTab === 'api-playground' && <APIPlaygroundDemo />}
        </div>
      </main>

      {/* Footer */}
      <footer className='border-t border-border bg-background mt-16'>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <span>Made with</span>
              <Heart className='h-4 w-4 text-red-500 fill-red-500' />
              <span>by</span>
              <a
                href="https://21st.dev/community/nparashar150"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium transition-colors">
                nparashar150
              </a>
            </div>
            <div className='flex items-center gap-4 flex-wrap justify-center'>
              <a
                href="https://21st.dev/community/nparashar150"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Globe className='h-4 w-4' />
                <span>View on 21st</span>
                <ExternalLink className='h-3 w-3 opacity-50' />
              </a>
              <a
                href="https://github.com/nparashar150/21st"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Github className='h-4 w-4' />
                <span>GitHub</span>
                <ExternalLink className='h-3 w-3 opacity-50' />
              </a>
              <a
                href="https://github.com/nparashar150/21st"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Star className='h-4 w-4' />
                <span>Star us</span>
                <ExternalLink className='h-3 w-3 opacity-50' />
              </a>
              <a
                href="https://buymeacoffee.com/nparashar150"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Coffee className='h-4 w-4' />
                <span>Support us</span>
                <ExternalLink className='h-3 w-3 opacity-50' />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
