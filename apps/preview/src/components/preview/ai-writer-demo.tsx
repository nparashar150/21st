'use client';

import { useState } from 'react';
import { AIWriter } from '@21st/ai-writer';

export default function AIWriterDemo() {
  const [content, setContent] = useState('');

  const handleAIAction = async (action: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const responses: Record<string, string> = {
      complete: `This is a continuation of your text. The AI has generated additional content that flows naturally from what you've written.`,
      rewrite: `This text has been rewritten to be clearer and more engaging while maintaining the original meaning.`,
      expand: `This is an expanded version with more details and examples. The original content has been enhanced with additional context.`,
      shorten: `A concise version that keeps all key points.`,
      improve: `This improved version has better clarity, flow, and impact.`,
      tone: `This text has been rewritten in a more professional tone.`
    };

    return responses[action] || 'AI response generated successfully.';
  };

  return (
    <div className='space-y-4'>
      <div className='rounded-lg border border-border bg-card p-6'>
        <h2 className='text-xl font-semibold mb-4 text-foreground'>AI Writer</h2>
        <p className='text-sm text-muted-foreground mb-4'>
          A powerful rich text editor with AI capabilities built with Tiptap. Try typing &apos;/&apos; for commands or selecting text for formatting options!
        </p>
        <div className='rounded-lg border border-border bg-background'>
          <AIWriter
            content={content}
            onChange={setContent}
            placeholder="Start writing... Try typing '/' for commands or selecting text for formatting options!"
            onAIAction={handleAIAction}
            minHeight='500px'
          />
        </div>
      </div>
    </div>
  );
}
