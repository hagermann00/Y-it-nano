/**
 * FIX #5: OPTIMIZED EVALUATOR FORM (2-FIELD VERSION)
 *
 * Reduces form friction from 6 fields to 2 fields
 * Expected impact:
 * - Form completion rate: 30% → 60%+ (2x improvement)
 * - Email capture rate: 45% → 85%+ (1.9x improvement)
 * - Time to submit: 3-5 minutes → 30-60 seconds (5x faster)
 *
 * A/B Test Setup:
 * 1. Deploy this component alongside existing 6-field form
 * 2. Use feature flag to split traffic 50/50
 * 3. Measure completion rate, conversion rate, time-to-submit
 * 4. Winner replaces old form after 1,000 submissions
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schema (minimal, only 2 required fields)
const evaluatorSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
});

/**
 * Optimized 2-field evaluator form component
 *
 * Features:
 * - Multi-step flow (form → loading → result)
 * - Trust badges to reduce anxiety
 * - Optional details collection (post-roast)
 * - Real-time validation
 * - Error handling with retry
 */
export default function EvaluatorFormOptimized({ topicSlug, topicName }) {
  const router = useRouter();

  // Form step state
  const [step, setStep] = useState(1); // 1=form, 2=loading, 3=result

  // Roast data
  const [roastData, setRoastData] = useState(null);
  const [error, setError] = useState(null);

  // Form submission
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(evaluatorSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  /**
   * Handle form submission
   */
  const onSubmit = async (data) => {
    try {
      setError(null);
      setStep(2); // Show loading state

      // Submit to API
      const response = await fetch('/api/evaluator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic_slug: topicSlug,
          customer_name: data.name,
          customer_email: data.email,
          // Optional fields left empty (will be filled later if user engages)
          form_data: {
            product_idea: '',
            investment_amount: '',
            marketing_plan: '',
            research_done: '',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle rate limiting
        if (response.status === 429) {
          throw new Error(
            errorData.message ||
            'You\'ve already submitted a roast today. Please try again tomorrow.'
          );
        }

        throw new Error(errorData.error || 'Failed to generate roast');
      }

      const result = await response.json();

      // Store roast data
      setRoastData(result);

      // Show result
      setStep(3);

    } catch (err) {
      console.error('Error generating roast:', err);
      setError(err.message);
      setStep(1); // Return to form
    }
  };

  /**
   * Retry after error
   */
  const handleRetry = () => {
    setError(null);
    reset();
    setStep(1);
  };

  /**
   * Download roast PDF
   */
  const handleDownloadPDF = () => {
    if (roastData?.roast_pdf_url) {
      window.open(roastData.roast_pdf_url, '_blank');
    }
  };

  /**
   * Navigate to purchase page
   */
  const handleGetFullBook = () => {
    router.push(roastData?.cta_url || `/${topicSlug}/purchase`);
  };

  // ===================================================================
  // RENDER: STEP 1 - FORM
  // ===================================================================

  if (step === 1) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Roast My {topicName} Idea
          </h2>
          <p className="text-gray-600">
            Get a free, brutally honest analysis in 60 seconds
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              First name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Your name"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('email')}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Generating...' : 'Get My Free Roast'}
          </button>
        </form>

        {/* Trust badges */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No spam
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Instant analysis
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100% free
            </div>
          </div>
        </div>

        {/* Privacy notice */}
        <p className="mt-4 text-xs text-center text-gray-500">
          By submitting, you agree to receive occasional emails about {topicName}.
          You can unsubscribe anytime.
        </p>
      </div>
    );
  }

  // ===================================================================
  // RENDER: STEP 2 - LOADING
  // ===================================================================

  if (step === 2) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-xl">
        <div className="text-center">
          {/* Loading spinner */}
          <div className="inline-block mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>

          {/* Loading message */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Generating Your Roast...
          </h3>
          <p className="text-gray-600 mb-4">
            Our AI is analyzing {topicName} statistics and case studies
          </p>

          {/* Progress indicators */}
          <div className="space-y-2 text-left max-w-xs mx-auto">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Checking failure statistics
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Reviewing case studies
            </div>
            <div className="flex items-center text-sm text-blue-600 animate-pulse">
              <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating your roast
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================================
  // RENDER: STEP 3 - RESULT
  // ===================================================================

  if (step === 3) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Success header */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-center mb-4">
            <svg className="w-8 h-8 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h2 className="text-3xl font-bold text-gray-900">
              Your {topicName} Reality Check
            </h2>
          </div>

          {/* Roast preview */}
          <div className="prose max-w-none mb-6">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap">
                {roastData?.roast_text}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 py-3 px-6 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              📄 Download as PDF
            </button>
            <button
              onClick={handleGetFullBook}
              className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              📚 Get the Full Book
            </button>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-3">
            Want the complete {topicName} analysis?
          </h3>
          <p className="text-blue-100 mb-6">
            Get the full guide with detailed case studies, statistics, and realistic alternatives.
          </p>
          <button
            onClick={handleGetFullBook}
            className="py-3 px-8 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get the Full Book →
          </button>
        </div>

        {/* Optional details collection */}
        <details className="bg-white rounded-lg shadow-md">
          <summary className="p-4 cursor-pointer hover:bg-gray-50 rounded-lg font-medium text-gray-700">
            💡 Make your roast more personalized (optional)
          </summary>

          <div className="p-6 pt-0 space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Tell us more about your specific situation to get an even more tailored analysis.
            </p>

            <OptionalDetailsForm
              responseId={roastData?.response_id}
              topicSlug={topicSlug}
            />
          </div>
        </details>
      </div>
    );
  }

  return null;
}

/**
 * Optional details form (shown after roast is generated)
 */
function OptionalDetailsForm({ responseId, topicSlug }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const data = {
      response_id: responseId,
      product_idea: formData.get('product_idea'),
      investment_amount: formData.get('investment_amount'),
      marketing_plan: formData.get('marketing_plan'),
    };

    try {
      await fetch('/api/evaluator/update-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Error updating details:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <p className="text-green-600 font-medium">Thanks! We'll use this to improve your analysis.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          What's your specific business idea?
        </label>
        <textarea
          name="product_idea"
          rows={3}
          placeholder="E.g., Selling vintage phone cases from AliExpress..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          How much are you planning to invest?
        </label>
        <input
          name="investment_amount"
          type="text"
          placeholder="E.g., $500"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          What's your marketing plan?
        </label>
        <textarea
          name="marketing_plan"
          rows={3}
          placeholder="E.g., TikTok ads targeting Gen Z..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Updating...' : 'Update My Roast'}
      </button>
    </form>
  );
}
