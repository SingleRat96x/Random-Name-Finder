'use server';

import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { 
  checkServerRateLimit, 
  recordServerFailedAttempt, 
  recordServerSuccessfulAttempt,
  detectSpamPatterns 
} from '@/lib/utils/serverRateLimiting';

interface SubmissionResult {
  success: boolean;
  error?: string;
}

/**
 * Get client IP address from headers
 */
function getClientIP(headersList: Headers): string {
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const remoteAddr = headersList.get('x-remote-addr');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  if (remoteAddr) {
    return remoteAddr;
  }
  
  // Fallback - use a generic identifier
  return 'unknown';
}

export async function submitContactForm(formData: FormData): Promise<SubmissionResult> {
  try {
    // Get request metadata early for rate limiting
    const headersList = await headers();
    const clientIP = getClientIP(headersList);
    
    // Check rate limiting first
    const rateLimitResult = await checkServerRateLimit(clientIP, 'contact');
    if (!rateLimitResult.isAllowed) {
      return {
        success: false,
        error: rateLimitResult.message || 'Too many attempts. Please try again later.',
      };
    }

    // Extract form data
    const name = formData.get('name')?.toString()?.trim();
    const email = formData.get('email')?.toString()?.trim();
    const subject = formData.get('subject')?.toString()?.trim();
    const message = formData.get('message')?.toString()?.trim();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      await recordServerFailedAttempt(clientIP, 'contact');
      return {
        success: false,
        error: 'All fields are required.',
      };
    }

    // Basic validation
    if (name.length < 2 || name.length > 255) {
      await recordServerFailedAttempt(clientIP, 'contact');
      return {
        success: false,
        error: 'Name must be between 2 and 255 characters.',
      };
    }

    if (subject.length < 5 || subject.length > 500) {
      await recordServerFailedAttempt(clientIP, 'contact');
      return {
        success: false,
        error: 'Subject must be between 5 and 500 characters.',
      };
    }

    if (message.length < 10 || message.length > 5000) {
      await recordServerFailedAttempt(clientIP, 'contact');
      return {
        success: false,
        error: 'Message must be between 10 and 5000 characters.',
      };
    }

    // Email validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      await recordServerFailedAttempt(clientIP, 'contact');
      return {
        success: false,
        error: 'Please enter a valid email address.',
      };
    }

    // Spam detection
    const spamCheck = detectSpamPatterns({ name, email, subject, message });
    if (spamCheck.isSpam) {
      await recordServerFailedAttempt(clientIP, 'contact');
      console.log(`Spam detected from IP ${clientIP}: ${spamCheck.reason}`);
      return {
        success: false,
        error: 'Your message appears to be spam. Please try again with a different message.',
      };
    }

    // Get additional request metadata
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const referer = headersList.get('referer');

    // Create Supabase client with service role for anonymous insertions
    // This bypasses RLS for contact form submissions
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Insert the contact form submission
    const { data, error } = await supabase
      .from('contact_form_submissions')
      .insert({
        name,
        email,
        subject,
        message,
        user_agent: userAgent,
        ip_address: clientIP,
        referrer_url: referer,
        status: 'new',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      await recordServerFailedAttempt(clientIP, 'contact');
      return {
        success: false,
        error: 'Failed to submit your message. Please try again.',
      };
    }

    // Record successful submission and clear rate limiting
    await recordServerSuccessfulAttempt(clientIP, 'contact');
    
    console.log(`Contact form submission saved with ID: ${data.id} from IP: ${clientIP}`);

    return {
      success: true,
    };

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    // Try to record failed attempt even if there was an error
    try {
      const headersList = await headers();
      const clientIP = getClientIP(headersList);
      await recordServerFailedAttempt(clientIP, 'contact');
    } catch (rateLimitError) {
      console.error('Error recording failed attempt:', rateLimitError);
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
} 