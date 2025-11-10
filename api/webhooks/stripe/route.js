/**
 * FIX #1: STRIPE WEBHOOK SIGNATURE VERIFICATION
 *
 * Secure webhook endpoint with signature verification
 * Prevents fraudulent webhook attacks
 *
 * Setup Instructions:
 * 1. Get webhook secret from Stripe Dashboard:
 *    - Go to Developers → Webhooks
 *    - Create endpoint: https://your-domain.com/api/webhooks/stripe
 *    - Copy webhook signing secret (starts with whsec_)
 *
 * 2. Add to environment variables:
 *    STRIPE_SECRET_KEY=sk_live_xxxxx
 *    STRIPE_WEBHOOK_SECRET=whsec_xxxxx
 *
 * 3. Test locally with Stripe CLI:
 *    stripe listen --forward-to localhost:3000/api/webhooks/stripe
 *
 * 4. Events to subscribe to:
 *    - payment_intent.succeeded
 *    - payment_intent.payment_failed
 *    - customer.subscription.created
 *    - customer.subscription.deleted
 */

import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Database imports (adjust based on your setup)
import db from '@/lib/database';
import { logWebhookEvent } from '@/lib/logging';
import { sendPurchaseConfirmationEmail } from '@/lib/email';

/**
 * POST handler for Stripe webhooks
 * Must be exported as POST for Next.js 14+ app router
 */
export async function POST(req) {
  const body = await req.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');

  // Logging for debugging
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Stripe webhook received`);

  // CRITICAL: Verify webhook signature BEFORE processing
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`[${timestamp}] ❌ Webhook signature verification failed:`, err.message);

    // Log failed verification attempt (potential security issue)
    await logWebhookEvent({
      status: 'failed',
      error: err.message,
      ip_address: headersList.get('x-forwarded-for') || 'unknown',
      timestamp: new Date(),
    });

    return new Response(
      JSON.stringify({ error: `Webhook Error: ${err.message}` }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  console.log(`[${timestamp}] ✅ Webhook signature verified. Event type: ${event.type}`);

  // NOW safe to process webhook
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      default:
        console.log(`[${timestamp}] ⚠️  Unhandled event type: ${event.type}`);
    }

    // Log successful processing
    await logWebhookEvent({
      event_id: event.id,
      event_type: event.type,
      status: 'processed',
      timestamp: new Date(),
    });

    return new Response(
      JSON.stringify({ received: true, event_id: event.id }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error(`[${timestamp}] ❌ Error processing webhook:`, error);

    // Log processing error
    await logWebhookEvent({
      event_id: event.id,
      event_type: event.type,
      status: 'error',
      error: error.message,
      timestamp: new Date(),
    });

    // Return 500 so Stripe retries
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent) {
  const {
    id: stripe_payment_id,
    amount,
    currency,
    metadata,
    customer,
  } = paymentIntent;

  const {
    customer_id,
    topic_id,
    purchase_type,
    evaluator_response_id,
  } = metadata;

  console.log(`Processing payment success for customer ${customer_id}, topic ${topic_id}`);

  // Create purchase record
  const purchase = await db.query(
    `INSERT INTO purchases (
      customer_id,
      topic_id,
      purchase_type,
      amount_cents,
      currency,
      stripe_charge_id,
      status,
      purchased_at,
      evaluator_response_id,
      converted_to_purchase
    ) VALUES ($1, $2, $3, $4, $5, $6, 'completed', NOW(), $7, true)
    RETURNING purchase_id`,
    [
      customer_id,
      topic_id,
      purchase_type,
      amount,
      currency.toUpperCase(),
      stripe_payment_id,
      evaluator_response_id || null,
    ]
  );

  const purchaseId = purchase.rows[0].purchase_id;

  // Update evaluator response if this came from evaluator
  if (evaluator_response_id) {
    await db.query(
      `UPDATE evaluator_responses
       SET converted_to_purchase = true,
           purchase_id = $1,
           days_to_purchase = EXTRACT(DAY FROM NOW() - submission_timestamp)
       WHERE response_id = $2`,
      [purchaseId, evaluator_response_id]
    );
  }

  // Update customer LTV
  await db.query(
    `UPDATE customers
     SET total_spent = total_spent + $1,
         total_purchases = total_purchases + 1,
         last_purchase_date = NOW()
     WHERE customer_id = $2`,
    [amount / 100, customer_id]
  );

  // Update topic metrics
  await db.query(
    `UPDATE topics
     SET total_purchases = total_purchases + 1
     WHERE topic_id = $1`,
    [topic_id]
  );

  // Send confirmation email
  await sendPurchaseConfirmationEmail(customer_id, purchaseId, purchase_type);

  console.log(`✅ Purchase ${purchaseId} created successfully`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent) {
  const { id, last_payment_error, metadata } = paymentIntent;

  console.log(`Payment failed: ${id}, reason: ${last_payment_error?.message}`);

  // Log failed payment attempt
  await db.query(
    `INSERT INTO payment_failures (
      stripe_payment_id,
      customer_id,
      topic_id,
      failure_reason,
      failed_at
    ) VALUES ($1, $2, $3, $4, NOW())`,
    [
      id,
      metadata.customer_id,
      metadata.topic_id,
      last_payment_error?.message || 'Unknown error',
    ]
  );

  // TODO: Send email to customer about failed payment
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(subscription) {
  const { id, customer, status, current_period_end, items } = subscription;

  console.log(`Subscription created: ${id}`);

  await db.query(
    `INSERT INTO subscriptions (
      stripe_subscription_id,
      customer_id,
      status,
      next_billing_date,
      created_at
    ) VALUES ($1, $2, $3, $4, NOW())`,
    [id, customer, status, new Date(current_period_end * 1000)]
  );

  // Update customer subscription status
  await db.query(
    `UPDATE customers
     SET active_subscription = true
     WHERE stripe_customer_id = $1`,
    [customer]
  );
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(subscription) {
  const { id, customer, canceled_at } = subscription;

  console.log(`Subscription cancelled: ${id}`);

  await db.query(
    `UPDATE subscriptions
     SET status = 'cancelled',
         cancelled_at = $1
     WHERE stripe_subscription_id = $2`,
    [new Date(canceled_at * 1000), id]
  );

  // Update customer subscription status
  await db.query(
    `UPDATE customers
     SET active_subscription = false
     WHERE stripe_customer_id = $1`,
    [customer]
  );
}

/**
 * Handle subscription updates (plan changes, etc.)
 */
async function handleSubscriptionUpdated(subscription) {
  const { id, status, current_period_end } = subscription;

  console.log(`Subscription updated: ${id}, new status: ${status}`);

  await db.query(
    `UPDATE subscriptions
     SET status = $1,
         next_billing_date = $2,
         updated_at = NOW()
     WHERE stripe_subscription_id = $3`,
    [status, new Date(current_period_end * 1000), id]
  );
}

// Disable Next.js body parsing (required for Stripe signature verification)
export const config = {
  api: {
    bodyParser: false,
  },
};
