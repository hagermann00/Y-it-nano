/**
 * EVALUATOR GENERATION ENDPOINT WITH RATE LIMITING
 *
 * This endpoint generates AI roasts for user submissions
 * Rate limiting applied to prevent abuse and control OpenAI costs
 */

import { NextResponse } from 'next/server';
import { emailRateLimiter, ipRateLimiter } from '@/middleware/rateLimiterConfig';
import { generateRoastWithOpenAI } from '@/lib/openai';
import db from '@/lib/database';

/**
 * POST /api/evaluator/generate
 *
 * Rate limits applied:
 * - 1 request per email per 24 hours (emailRateLimiter)
 * - 10 requests per IP per hour (ipRateLimiter)
 */
export async function POST(req) {
  try {
    // Parse request body
    const body = await req.json();
    const {
      topic_slug,
      customer_name,
      customer_email,
      form_data,
      utm_source,
      utm_medium,
      utm_campaign,
    } = body;

    // Validate required fields
    if (!topic_slug || !customer_email) {
      return NextResponse.json(
        { error: 'Missing required fields: topic_slug, customer_email' },
        { status: 400 }
      );
    }

    // Get topic information
    const topicResult = await db.query(
      'SELECT topic_id, title, evaluator_active FROM topics WHERE slug = $1',
      [topic_slug]
    );

    if (topicResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    const topic = topicResult.rows[0];

    if (!topic.evaluator_active) {
      return NextResponse.json(
        { error: 'Evaluator not active for this topic' },
        { status: 403 }
      );
    }

    // Apply rate limiting manually (for Next.js App Router)
    // Note: In Express, middleware is applied automatically
    // In Next.js App Router, we need to wrap the limiters
    const emailLimit = await applyRateLimit(req, emailRateLimiter);
    if (emailLimit.error) {
      return NextResponse.json(emailLimit.error, { status: 429 });
    }

    const ipLimit = await applyRateLimit(req, ipRateLimiter);
    if (ipLimit.error) {
      return NextResponse.json(ipLimit.error, { status: 429 });
    }

    // Generate roast with OpenAI
    const startTime = Date.now();
    const roastResult = await generateRoastWithOpenAI(topic.topic_id, form_data);
    const generationTime = Date.now() - startTime;

    // Save to database
    const responseResult = await db.query(
      `INSERT INTO evaluator_responses (
        topic_id,
        customer_name,
        customer_email,
        submitted_form_data,
        roast_generated_text,
        roast_pdf_url,
        openai_tokens_used,
        openai_cost_cents,
        utm_source,
        utm_medium,
        utm_campaign,
        ip_address,
        user_agent,
        submission_timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING response_id`,
      [
        topic.topic_id,
        customer_name,
        customer_email,
        JSON.stringify(form_data),
        roastResult.roast_text,
        roastResult.pdf_url,
        roastResult.tokens_used,
        roastResult.cost_cents,
        utm_source,
        utm_medium,
        utm_campaign,
        req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        req.headers.get('user-agent'),
      ]
    );

    const responseId = responseResult.rows[0].response_id;

    // Trigger email sequence (async, don't wait)
    triggerEmailSequence(customer_email, topic.topic_id, responseId).catch(err => {
      console.error('Failed to trigger email sequence:', err);
    });

    // Return success
    return NextResponse.json({
      success: true,
      response_id: responseId,
      roast_text: roastResult.roast_text,
      roast_pdf_url: roastResult.pdf_url,
      generation_time_ms: generationTime,
      cta_url: `/topics/${topic_slug}/purchase?from=evaluator&response_id=${responseId}`,
    });

  } catch (error) {
    console.error('Error generating roast:', error);
    return NextResponse.json(
      { error: 'Failed to generate roast. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Apply rate limit middleware in Next.js App Router
 * (Helper function to adapt Express middleware)
 */
async function applyRateLimit(req, limiter) {
  return new Promise((resolve) => {
    // Create mock Express-style req/res objects
    const mockReq = {
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      headers: Object.fromEntries(req.headers.entries()),
      body: req.json ? await req.json() : {},
    };

    const mockRes = {
      status: (code) => mockRes,
      json: (data) => {
        resolve({ error: data });
      },
      getHeader: (name) => mockRes.headers[name],
      setHeader: (name, value) => {
        mockRes.headers = mockRes.headers || {};
        mockRes.headers[name] = value;
      },
      headers: {},
    };

    const next = () => {
      resolve({ success: true });
    };

    limiter(mockReq, mockRes, next);
  });
}

/**
 * Trigger email sequence via ConvertKit
 */
async function triggerEmailSequence(email, topicId, responseId) {
  // Implementation would go here
  // See ConvertKit integration in Y-IT_WEB_PLATFORM_ARCHITECTURE.md
  console.log(`Triggering email sequence for ${email}, topic ${topicId}, response ${responseId}`);
}
