import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Thinking prompt to determine knowledge sources
const thinking_prompt = `You are an HSBC Banking Knowledge Analyst specializing in credit card products and services for HSBC Hong Kong.
Primary Task: Analyze user inquiries about HSBC credit cards and precisely identify which sections of the HSBC Hong Kong website (based on the provided sitemap) contain relevant information to answer the questions accurately and comprehensively.

Below is the HSBC Hong Kong credit card sitemap you'll use for reference:
🏠 www.hsbc.com.hk
└── 📁 credit-cards
    ├── 📁 apply
    │   └── 📄 over-the-limit
    ├── 📁 articles
    │   ├── 📄 4-tips-to-get-cash-from-credit-cards
    │   └── 📄 how-to-get-extra-rebate-and-enjoy-interest-free-on-spending
    ├── 📁 compare
    ├── 📁 documents-required
    │   └── 📄 upload
    ├── 📁 features
    │   ├── 📄 cash-advance
    │   ├── 📄 merchant-instalment
    │   └── 📄 virtual-credit-card
    ├── 📁 fees
    ├── 📁 products
    │   ├── 📄 cash-instalment-plan
    │   │   └── 📄 documents-required
    │   │       └── 📄 upload
    │   ├── 📄 everymile
    │   ├── 📄 payment-services
    │   │   ├── 📄 apple-pay
    │   │   ├── 📄 google-pay
    │   │   ├── 📄 octopus-add-value
    │   │   └── 📄 samsung-pay
    │   ├── 📄 premier-mastercard
    │   ├── 📄 red
    │   ├── 📄 spending-instalment
    │   ├── 📄 student-visa-gold
    │   ├── 📄 unionpay-dual-currency-classic
    │   ├── 📄 unionpay-dual-currency-diamond
    │   ├── 📄 visa-gold
    │   ├── 📄 visa-platinum
    │   └── 📄 visa-signature
    ├── 📁 rewards
    │   ├── 📄 app
    │   ├── 📄 certificate
    │   ├── 📄 mileage-programme
    │   ├── 📄 rewardcash-redemption
    │   ├── 📄 terms
    │   └── 📄 your-choice
    ├── 📁 tools
    │   └── 📄 repayment-calculator
    ├── 📁 use-your-card
    │   ├── 📄 cash-instalment-plan
    │   ├── 📄 credit-limit-transfer
    │   ├── 📄 merchant-instalment
    │   │   ├── 📄 apple-instalment
    │   │   └── 📄 visa
    │   └── 📄 spending-instalment
    │       ├── 📄 all-you-can-split
    │       ├── 📄 mobile-app-apply
    │       └── 📄 reward-plus-apply
    └── 📁 use-your-credit-card

Instructions for Analysis:
Always provide the full URL path (e.g., www.hsbc.com.hk/credit-cards/features/cash-advance) for any relevant sections.
For comparison questions (e.g., "best card for travel"), retrieve all product pages under /products for comprehensive analysis.
If multiple sections are relevant (e.g., fees + features), list all paths.

Output Format, always return a JSON format start with rationale and followed by the relevant_paths, put all the paths in a list:
Example 1 - User question: "How do I use Apple Pay with my HSBC card?"
rationale: "Apple Pay is a payment service that allows users to make payments using their Apple devices, such as iPhones and iPads. HSBC credit cards may support Apple Pay for online and in-store payments."
relevant_paths: ['https://www.hsbc.com.hk/credit-cards/products/payment-services/apple-pay']

Example 2 (Broad Queries Example: Return all applicable paths with a brief rationale.) - User question: "What is the best credit card for online shopping?"
rationale: "The user question is about the best credit card for online shopping. I need to retrieve all the credit card products under /credit-cards/products and compare their features."
relevant_paths: [
  'https://www.hsbc.com.hk/credit-cards/products/premier-mastercard',
  'https://www.hsbc.com.hk/credit-cards/products/red',
  'https://www.hsbc.com.hk/credit-cards/products/spending-instalment',
  'https://www.hsbc.com.hk/credit-cards/products/tudent-visa-gold',
  'https://www.hsbc.com.hk/credit-cards/products/nionpay-dual-currency-classic',
  'https://www.hsbc.com.hk/credit-cards/products/nionpay-dual-currency-diamond',
  'https://www.hsbc.com.hk/credit-cards/products/visa-gold',
  'https://www.hsbc.com.hk/credit-cards/products/visa-platinum',
  'https://www.hsbc.com.hk/credit-cards/products/visa-signature'
]

User Inquiry:
{user_context}
`;

const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_API_ENDPOINT,
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, userContext } = await request.json();

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Create system message with user context
    const systemMessage: ChatMessage = {
      role: 'system',
      content: thinking_prompt.replace('{user_context}', userContext)
    };

    // Prepare messages for API call
    const apiMessages: ChatMessage[] = [systemMessage, ...messages];

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: apiMessages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: true,
      response_format : {
        type: 'json_object'
      }
    });

    // Create a readable stream for the response
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
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}