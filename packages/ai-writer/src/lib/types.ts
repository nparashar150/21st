import type { Editor } from '@tiptap/react';
import * as React from 'react';

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (editor: Editor) => void;
  keywords?: string[];
}

export interface AIWriterProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  onAIAction?: (action: string, prompt: string) => Promise<string>;
  className?: string;
  minHeight?: string;
}
