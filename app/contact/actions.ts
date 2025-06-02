'use server';

import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

interface SubmissionResult {
  success: boolean;
  error?: string;
}

export async function submitContactForm(formData: FormData): Promise<SubmissionResult> {
  try {
    // Extract form data
    const name = formData.get('name')?.toString()?.trim();
    const email = formData.get('email')?.toString()?.trim();
    const subject = formData.get('subject')?.toString()?.trim();
    const message = formData.get('message')?.toString()?.trim();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return {
        success: false,
        error: 'All fields are required.',
      };
    }

    // Basic validation
    if (name.length < 2 || name.length > 255) {
      return {
        success: false,
        error: 'Name must be between 2 and 255 characters.',
      };
    }

    if (subject.length < 5 || subject.length > 500) {
      return {
        success: false,
        error: 'Subject must be between 5 and 500 characters.',
      };
    }

    if (message.length < 10 || message.length > 5000) {
      return {
        success: false,
        error: 'Message must be between 10 and 5000 characters.',
      };
    }

    // Email validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Please enter a valid email address.',
      };
    }

    // Get request metadata
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const referer = headersList.get('referer');
    
    // Try to get the client IP
    let ipAddress = null;
    if (forwardedFor) {
      ipAddress = forwardedFor.split(',')[0].trim();
    } else if (realIp) {
      ipAddress = realIp;
    }

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
        ip_address: ipAddress,
        referrer_url: referer,
        status: 'new',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        error: 'Failed to submit your message. Please try again.',
      };
    }

    console.log(`Contact form submission saved with ID: ${data.id}`);

    return {
      success: true,
    };

  } catch (error) {
    console.error('Contact form submission error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
} 