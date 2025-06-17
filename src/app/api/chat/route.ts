import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { baseSitemap, getRelevantSitemaps } from '@/config/hsbcSitemap';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Step 1: Prompt to determine which sub-sitemaps are relevant
const sitemap_selection_prompt = `You are an HSBC Banking Knowledge Analyst. Your task is to determine which sections of the HSBC Hong Kong website are most relevant to answer the user's inquiry.

Available website sections:
${baseSitemap}

Analyze the user inquiry and determine which sections (maximum 3) are most relevant. Return ONLY a JSON object with the following format:

{
  "relevant_sections": ["section1", "section2"]
}

Available sections to choose from:

- "accounts" (for employee-banking, estatement, manage-your-bank-account-smartly, account offers, current account, HSBC one account, personal-integrated account, saving accounts and time-deposits account)
- "banking" (for greater-bay-area)
- "broking" (for broker service and help)
- "campaigns" (for budget, customer-voice, digitalfx, fps, fx-time-deposit, investments-prom154, prom138, prom189, prom191, prom203, tcb-rate, tcr-rate)
- "community-banking" (for accessibility, age-friendly, hongkong-bank-foundation-40th-anniversary, how-to-build-up-your-credit-history, how-to-make-the-most-of-your-money, how-to-save-money, mental-health, minority-groups, our-impact, special-education-needs, teenagers-financial-education, what-is-budgeting, young-adults-financial-education)
- "credit-cards" (for compare credit cards, eStatements, HSBC EveryMile Credit Card, HSBC Premier Mastercard®, HSBC Red Credit Card, HSBC Visa Gold Card for Students, HSBC Pulse UnionPay Dual Currency Diamond Credit Card, HSBC UnionPay Dual Currency Credit Card, HSBC Visa Gold Card, HSBC easy Credit Card / Visa Platinum Credit Card, HSBC Visa Signature Card, HSBC Reward+ Mobile App, Credit Cards Application, Cash Credit Plan, Cash Instalment Plan, Mobile payment and Octopus add value services, Red Hot Rewards, RewardCash Certificate Scheme, Rewards of Your Choice, Miles and travel privileges, Instant RewardCash redemption at merchants, Using your credit card, Credit card limit transfer, Fees and charges)
- "debit-cards" (for mastercard-debit-card, twelve-currency-debit-card)
- "digital" (for cross-border-banking, logon-update, online-and-mobile-banking-terms, online-banking-faq, online-banking-services-changes)
- "fees" (for banking fees and charges)
- "financial-education" (for career-starters, managing-money)
- "financial-wellbeing" (for habits-for-financial-wellbeing, learning-to-set-financial-goals-budget-and-repay-debt, savings-vs-investing)
- "finfit" (for finfit)
- "healthpass" (for healthpass)
- "help" (for banking-made-easy, bereavement, card-support, contact, cybersecurity-and-fraud, faq, forms, guidelines, health-support, money-worries, online-and-banking-security, opening-up-a-world-of-opportunity, security-centre, separation, travel)
- "insurance" (for benefit-plus, claims, existing-customers, fund-performance, healthylife, hsbc-life, lifestage, manage-your-policy, online-insurance, About HSBC Life, HSBC Life Benefits+, Life Insurance, AccidentSurance, Motor insurance, TravelSurance, Home and domestic helper insurance, Medical and critical illness insurance, Savings insurance and retirement plans)
- "international" (for international-account-opening, banking-in-hong-kong, international-mortgages, investing-in-hong-kong, living-in-hong-kong, moving-to-hong-kong, services, studying-in-hong-kong, travel-services)
- "investments" (for investment-account-opening, articles, currency-exchange-rate-calculator, esg, fees, forms, how-does-currency-linked-work, how-does-deposit-plus-work, how-does-equity-linked-investment-work, how-to-apply-thorugh-eipo, how-to-set-up-order-watch, investment-platform-guide, learn-about-bonds, market-information, products, renminbi)
- "legal" (for accessibility, hyperlink-policy, important-notices, maintenance-schedule, privacy-security, regulatory-disclosures, terms-of-use)
- "loans" (for loan-campaigns, cash-advance-vs-cash-instalment, comparison-tax-loan-with-instalment-loan, consider-factors-before-apply, credit-card-debt, documents-required, help-starting-a-business, home-renovation, Personal Instalment Loan, Personal Tax Loan, Balance Consolidation Program, Personal Instalment Loan Redraw, Revolving Credit Facility, Electric Vehicle Personal Instalment Loan, Fees and charges)
- "misc" (for credit-card-fraud-alert, data-privacy-notice, hyperlink-policy, insurance, investments, pdo-before-jun2014, privacy-security, terms-of-use, ways-to-bank)
- "mobile" (for mobile-faq, privacy-statement, privacy-statement-easy-invest-app, terms-and-conditions-mobile-cheque-deposit, wealth-shopping-cart)
- "mortgages" (for borrowing-calculator, mortgages-application-document, mortgages-loan-process, Home Ownership Scheme, Tenants Purchase Scheme, Deposit-linked Mortgage, Green Mortgage, HighAdvance Mortgage, Investor Mortgage, HIBOR based Mortgage)
- "mpf" (for academy, annual-benefits-statement, awards, default-investment-strategy, documents, empf, empf-member-benefit-statement, enquiry, eservices, existing-employee-customers, existing-employer-customers, fees, financial-wellness-and-retirement-planning, forms, funds, glossary, guidelines-for-employers, how-bond-return-bond-price-and-bond-yield-work, MPF Academy, HSBC MPF Awards, Forms and documents, Glossary, MPF management fees, MPF news, MPF for members, MPF for employers, MPF constituent fund information, MPF Personal Accounts, MPF for the self-employed, Tax Deductible Voluntary Contributions account, HSBC Retirement Monitor, Designated branches with MPF services, Cumulative Performance, Retirement planner, Understanding MPF, Useful links, Fees and charges)
- "premier" (for premier account, existing-customers, expertise-and-privileges, global-banking, offers)
- "premier-elite" (for premier-elite account, all-round-support, international-support, lifestyle, medical-concierge, offers, wealth, welcome-offers)
- "sustainability" (for how-to-save-money-on-energy, how-to-save-money-on-food-and-waste-less, mobile, net-zero-investment-strategies, recycled-plastic-payment-cards, sustainable-investing)
- "transfer-payments" (for Faster Payment System (FPS), Local transfers, Global payments, Pay abroad with FPS, Bill Payments, autoPay, Daily payment and transfer limits)
- "ways-to-bank" (for branch, chat-with-relationship-manager, digital-academy, forms, internet, live-chat, mobile-apps, open-banking, phone, service-pledge-programme)
- "wealth-financing" (for wealth, products)
- "wealth-management" (for education, family, future-planner, grow-your-money, hybrid-wealth, legacy, professional-investor, retirement, risk-tolerance, wealth-portfolio-intelligence)
- "well-plus" (for bonus-badge)

User Inquiry: {user_context}`;

// Step 2: Main analysis prompt with selected sitemaps
const thinking_prompt = `You are an HSBC Banking Knowledge Analyst specializing in banking products and services for HSBC Hong Kong.
Primary Task: Analyze user inquiries about HSBC services and precisely identify which sections of the HSBC Hong Kong website (based on the provided sitemap) contain relevant information to answer the questions accurately and comprehensively.

Instructions for Analysis:
Always provide the full URL path (e.g., www.hsbc.com.hk/credit-cards/features/cash-advance) for any relevant sections.
For comparison questions (e.g., "best card for travel"), retrieve all product pages under /products for comprehensive analysis.
If multiple sections are relevant (e.g., fees + features), list all paths.

Below is the relevant HSBC Hong Kong sitemap you'll use for reference:
{selected_sitemap}

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

    // Step 1: Determine relevant sub-sitemaps
    console.log('🔍 Starting sitemap selection process');
    console.log('📝 User context:', userContext);
    
    const sitemapSelectionMessage: ChatMessage = {
      role: 'system',
      content: sitemap_selection_prompt.replace('{user_context}', userContext)
    };

    console.log('🤖 Calling DeepSeek API for sitemap selection...');
    const sitemapSelection = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [sitemapSelectionMessage],
      max_tokens: 200,
      temperature: 0.3,
      response_format: {
        type: 'json_object'
      }
    });

    // Parse the sitemap selection response
    const rawResponse = sitemapSelection.choices[0]?.message?.content || '{}';
    console.log('📋 Raw sitemap selection response:', rawResponse);
    
    let relevantSections: string[] = [];
    try {
      const selectionResult = JSON.parse(rawResponse);
      relevantSections = selectionResult.relevant_sections || ['credit-cards']; // Default fallback
      console.log('✅ Successfully parsed sitemap selection:', relevantSections);
    } catch (error) {
      console.error('❌ Error parsing sitemap selection:', error);
      console.log('🔄 Using default fallback: ["credit-cards"]');
      relevantSections = ['credit-cards']; // Default fallback
    }

    // Step 2: Get the relevant sitemaps and create the main prompt
    console.log('🗺️ Selected sections for sitemap:', relevantSections);
    const selectedSitemap = getRelevantSitemaps(relevantSections);
    console.log('📊 Generated sitemap length:', selectedSitemap.length, 'characters');
    console.log('🎯 Proceeding with main analysis using selected sections');
    const systemMessage: ChatMessage = {
      role: 'system',
      content: thinking_prompt
        .replace('{selected_sitemap}', selectedSitemap)
        .replace('{user_context}', userContext)
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