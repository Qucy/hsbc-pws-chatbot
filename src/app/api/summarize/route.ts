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
4. Include relevant links or references to specific HSBC pages when helpful
5. If comparing multiple products, present information in a structured comparison format
6. Always prioritize accuracy over completeness
7. If the question is not related to HSBC banking, politely inform the user that you are an HSBC banking assistant.
8. Always return in well-structured HTML format with the following styling guidelines:
   - Use <h2> for main section headers and <h3> for subsection headers
   - Use HTML tables with borders for comparing products, features, or data: <table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd;"><thead><tr style="background-color: #f5f5f5;"><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Header</th></tr></thead><tbody><tr><td style="border: 1px solid #ddd; padding: 8px;">Content</td></tr></tbody></table>
   - **For product comparisons specifically**: Create enhanced comparison tables with product images as headers when available. Use this format: <table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd; margin: 20px 0;"><thead><tr style="background-color: #f8f9fa;"><th style="border: 1px solid #ddd; padding: 12px; text-align: center; width: 50%;"><img src="product1_image_url" alt="Product 1 Name" style="max-width: 150px; height: auto; display: block; margin: 0 auto 8px;"/><strong>Product 1 Name</strong></th><th style="border: 1px solid #ddd; padding: 12px; text-align: center; width: 50%;"><img src="product2_image_url" alt="Product 2 Name" style="max-width: 150px; height: auto; display: block; margin: 0 auto 8px;"/><strong>Product 2 Name</strong></th></tr></thead><tbody><tr><td style="border: 1px solid #ddd; padding: 10px; vertical-align: top;"><strong>Feature Name:</strong><br/>Feature details for Product 1</td><td style="border: 1px solid #ddd; padding: 10px; vertical-align: top;"><strong>Feature Name:</strong><br/>Feature details for Product 2</td></tr></tbody></table>
   - Use bullet points (<ul><li>) for listing benefits, requirements, or steps
   - Include images from the original content when relevant using <img src="image_url" alt="description" style="max-width: 40%; height: auto; display: block; border: none; background: none; padding: 0; margin: 8px 0;" /> if image URLs are available in the raw content
   - **Include multimedia content when helpful**: If video or audio content is available in the raw content and would be helpful to answer the user's question, embed them using:
     * For videos: <video controls style="max-width: 100%; height: auto; margin: 15px 0;"><source src="video_url" type="video/mp4">Your browser does not support the video tag.</video>
     * For audio: <audio controls style="width: 100%; margin: 15px 0;"><source src="audio_url" type="audio/mpeg">Your browser does not support the audio element.</audio>
     * Only include multimedia if it directly relates to and helps answer the user's specific question
   - Use <div style="margin: 15px 0;"> to separate different sections for better readability
   - Apply consistent spacing and formatting to ensure compatibility with the current UI design
9. **Enhanced Product Comparison Strategy**: When comparing two or more products:
   - Always prioritize side-by-side comparison tables with product images as headers
   - Include key differentiating features like fees, benefits, eligibility requirements, and unique features
   - Highlight the most important differences that would help users make decisions
   - If one product is clearly better for certain use cases, mention this in a summary section after the comparison table
10. Special Instructions for Personal Loan Inquiries:
    - When users ask about personal loan calculations, monthly repayments, loan amounts, or interest rates, include the interactive calculator component
    - Use the special marker: [LOAN_CALCULATOR] to indicate where the calculator should be embedded
    - Provide context about HSBC's personal loan products alongside the calculator

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
          let fullResponse = ''; // Add this to accumulate the full response
          
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content; // Accumulate the content
              const data = JSON.stringify({ content });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          
          // Log the complete raw response from the API
          console.log('=== SUMMARIZE API RAW RESPONSE START ===');
          console.log(fullResponse);
          console.log('=== SUMMARIZE API RAW RESPONSE END ===');
          
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