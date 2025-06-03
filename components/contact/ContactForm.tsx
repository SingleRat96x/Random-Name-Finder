'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { submitContactForm } from '@/app/contact/actions';

// Form validation schema
const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters')
    .trim(),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .trim(),
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(500, 'Subject must be less than 500 characters')
    .trim(),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be less than 5000 characters')
    .trim(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('subject', data.subject);
      formData.append('message', data.message);

      const result = await submitContactForm(formData);

      if (result.success) {
        setSubmitStatus('success');
        reset(); // Clear the form
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Failed to submit form. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
      console.error('Contact form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-xl font-semibold text-foreground">Thank You!</h3>
              <p className="text-muted-foreground mt-2">
                Your message has been sent successfully. We&apos;ll get back to you as soon as possible.
              </p>
            </div>
            <Button 
              onClick={() => setSubmitStatus('idle')} 
              variant="outline"
              className="mt-4"
            >
              Send Another Message
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Get in Touch</CardTitle>
        <CardDescription className="text-center">
          Have a question or feedback? We&apos;d love to hear from you. Fill out the form below and we&apos;ll respond as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {submitStatus === 'error' && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                disabled={isSubmitting}
                className={errors.name ? 'border-destructive' : ''}
                aria-describedby={errors.name ? 'name-error' : undefined}
                aria-invalid={errors.name ? 'true' : 'false'}
                {...register('name')}
              />
              {errors.name && (
                <p 
                  id="name-error" 
                  className="text-sm text-destructive"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                disabled={isSubmitting}
                className={errors.email ? 'border-destructive' : ''}
                aria-describedby={errors.email ? 'email-error' : undefined}
                aria-invalid={errors.email ? 'true' : 'false'}
                {...register('email')}
              />
              {errors.email && (
                <p 
                  id="email-error" 
                  className="text-sm text-destructive"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              type="text"
              placeholder="What is this message about?"
              disabled={isSubmitting}
              className={errors.subject ? 'border-destructive' : ''}
              aria-describedby={errors.subject ? 'subject-error' : undefined}
              aria-invalid={errors.subject ? 'true' : 'false'}
              {...register('subject')}
            />
            {errors.subject && (
              <p 
                id="subject-error" 
                className="text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {errors.subject.message}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Please share your thoughts, questions, or feedback..."
              rows={6}
              disabled={isSubmitting}
              className={`min-h-[150px] resize-y ${errors.message ? 'border-destructive' : ''}`}
              aria-describedby={errors.message ? 'message-error' : 'message-help'}
              aria-invalid={errors.message ? 'true' : 'false'}
              {...register('message')}
            />
            {errors.message && (
              <p 
                id="message-error" 
                className="text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {errors.message.message}
              </p>
            )}
            {!errors.message && (
              <p id="message-help" className="text-xs text-muted-foreground">
                Please provide as much detail as possible so we can help you effectively.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Message...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            * Required fields. We respect your privacy and will never share your information with third parties.
          </p>
        </form>
      </CardContent>
    </Card>
  );
} 