import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface SummarizeRequest {
  messages: ChatMessage[];
  userQuery: string;
  rawContent: Array<{
    source_url: string;
    raw_content: string;
  }>;
}

// Summarization prompt for generating final answers
const summarization_prompt = `You are an expert HSBC Banking Assistant for HSBC Hong Kong.

Your task is to provide accurate, helpful, and comprehensive answers to user questions about HSBC HK based on the provided raw content from the HSBC Hong Kong website.

Guidelines:
1. Use ONLY the information provided in the raw content to answer questions
2. If the raw content doesn't contain sufficient information to answer the question, clearly state this limitation
3. Provide specific details, numbers, and features when available
4. Structure your response in a clear, easy-to-read format
5. Include relevant links or references to specific HSBC pages when helpful
6. Be conversational but professional in tone
7. If comparing multiple products, present information in a structured comparison format
8. Always prioritize accuracy over completeness

Context from conversation history and raw content will be provided below.`;

const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_API_ENDPOINT,
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, userQuery, rawContent }: SummarizeRequest = await request.json();

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Prepare the raw content as context
    const contentContext = rawContent
      .map(item => `Source: ${item.source_url}\n\nContent:\n${item.raw_content}`)
      .join('\n\n---\n\n');

    // Create system message with summarization prompt only
    const systemMessage: ChatMessage = {
      role: 'system',
      content: summarization_prompt
    };

    // Create a final user message with content context
    const contextMessage: ChatMessage = {
      role: 'user',
      content: `Please answer my question: ${userQuery} based on the following raw content from the HSBC Hong Kong website:\n\n${contentContext}\n\nPlease provide a comprehensive answer based on this information.`
    };

    // Prepare messages for API call (include conversation history + context)
    const apiMessages: ChatMessage[] = [systemMessage, ...messages, contextMessage];

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: apiMessages,
      max_tokens: 2000,
      temperature: 0.1,
      stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              const data = JSON.stringify({ content });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          // Send completion signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Summarize API error:', error);
    return NextResponse.json(
      { error: 'Failed to process summarization request' },
      { status: 500 }
    );
  }
}