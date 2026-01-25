import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { action, prompt } = await request.json();

    // This is a mock AI implementation
    // In production, you would integrate with OpenAI, Anthropic, or another AI service
    const mockAIResponse = async (action: string, prompt: string): Promise<string> => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock responses based on action
      const responses: Record<string, string> = {
        complete: `This is a continuation of your text. The AI has generated additional content that flows naturally from what you've written. It maintains the same tone and style while expanding on your ideas.`,
        rewrite: `This text has been rewritten to be clearer and more engaging. The key points remain the same, but the presentation is improved for better readability and impact.`,
        expand: `This is an expanded version with more details and examples. The original content has been enhanced with additional context, explanations, and supporting information to provide a more comprehensive view.`,
        shorten: `A concise version that keeps all key points.`,
        improve: `This improved version has better clarity, flow, and impact while maintaining the original meaning.`,
        tone: `This text has been rewritten in a more professional tone while preserving the original message and intent.`
      };

      return responses[action] || 'AI response generated successfully.';
    };

    const result = await mockAIResponse(action, prompt);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('AI action error:', error);
    return NextResponse.json({ error: 'Failed to process AI action' }, { status: 500 });
  }
}
