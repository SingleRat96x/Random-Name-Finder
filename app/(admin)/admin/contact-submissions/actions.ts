'use server';

import { revalidatePath } from 'next/cache';
import { createServerActionClient } from '@/lib/supabase/server';

// Types for contact form submissions
interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  user_agent: string | null;
  ip_address: string | null;
  referrer_url: string | null;
  status: 'new' | 'read' | 'replied' | 'archived';
  admin_notes: string | null;
  submitted_at: string;
  read_at: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
}

interface SubmissionStats {
  total_submissions: number;
  new_submissions: number;
  read_submissions: number;
  replied_submissions: number;
  archived_submissions: number;
  this_week_submissions: number;
  this_month_submissions: number;
}

interface FilterOptions {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Helper function to verify admin access
async function verifyAdminAccess() {
  const supabase = await createServerActionClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Authentication required');
  }

  const { data: isAdmin, error: adminError } = await supabase
    .rpc('is_admin');
    
  if (adminError || !isAdmin) {
    throw new Error('Admin access required');
  }
  
  return { supabase, user };
}

// Fetch contact form submissions with filtering and pagination
export async function fetchContactSubmissions(
  filters: FilterOptions = {}
): Promise<{ submissions: ContactSubmission[]; totalCount: number }> {
  const { supabase } = await verifyAdminAccess();
  
  const {
    status,
    search,
    dateFrom,
    dateTo,
    sortBy = 'submitted_at',
    sortOrder = 'desc',
    page = 1,
    limit = 20
  } = filters;

  let query = supabase
    .from('contact_form_submissions')
    .select('*', { count: 'exact' });

  // Apply status filter
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  // Apply search filter (name, email, subject, or message)
  if (search && search.trim()) {
    const searchTerm = search.trim();
    query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%,message.ilike.%${searchTerm}%`);
  }

  // Apply date filters
  if (dateFrom) {
    query = query.gte('submitted_at', dateFrom);
  }
  if (dateTo) {
    // Add one day to include the entire day
    const endDate = new Date(dateTo);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt('submitted_at', endDate.toISOString().split('T')[0]);
  }

  // Apply sorting
  const ascending = sortOrder === 'asc';
  query = query.order(sortBy, { ascending });

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch contact submissions: ${error.message}`);
  }

  return {
    submissions: data || [],
    totalCount: count || 0,
  };
}

// Get contact submission statistics
export async function getContactSubmissionStats(): Promise<SubmissionStats> {
  const { supabase } = await verifyAdminAccess();
  
  const { data, error } = await supabase
    .rpc('get_contact_submission_stats');
    
  if (error) {
    throw new Error(`Failed to fetch submission stats: ${error.message}`);
  }
  
  return data[0] || {
    total_submissions: 0,
    new_submissions: 0,
    read_submissions: 0,
    replied_submissions: 0,
    archived_submissions: 0,
    this_week_submissions: 0,
    this_month_submissions: 0,
  };
}

// Update submission status
export async function updateSubmissionStatus(
  submissionId: string,
  status: 'new' | 'read' | 'replied' | 'archived',
  adminNotes?: string
): Promise<ContactSubmission> {
  const { supabase } = await verifyAdminAccess();
  
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  // Set appropriate timestamp based on status
  if (status === 'read' && !await hasBeenRead(submissionId)) {
    updateData.read_at = new Date().toISOString();
  } else if (status === 'replied') {
    updateData.replied_at = new Date().toISOString();
    if (!await hasBeenRead(submissionId)) {
      updateData.read_at = new Date().toISOString();
    }
  }

  if (adminNotes !== undefined) {
    updateData.admin_notes = adminNotes;
  }

  const { data, error } = await supabase
    .from('contact_form_submissions')
    .update(updateData)
    .eq('id', submissionId)
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to update submission status: ${error.message}`);
  }
  
  revalidatePath('/admin/contact-submissions');
  return data;
}

// Helper function to check if submission has been read
async function hasBeenRead(submissionId: string): Promise<boolean> {
  const { supabase } = await verifyAdminAccess();
  
  const { data, error } = await supabase
    .from('contact_form_submissions')
    .select('read_at')
    .eq('id', submissionId)
    .single();
    
  return !error && data?.read_at !== null;
}

// Mark submission as read
export async function markAsRead(submissionId: string): Promise<void> {
  const { supabase } = await verifyAdminAccess();
  
  // Only update if not already read
  const isRead = await hasBeenRead(submissionId);
  if (isRead) return;

  const { error } = await supabase
    .from('contact_form_submissions')
    .update({
      status: 'read',
      read_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId);
    
  if (error) {
    throw new Error(`Failed to mark submission as read: ${error.message}`);
  }
  
  revalidatePath('/admin/contact-submissions');
}

// Delete a contact submission
export async function deleteContactSubmission(submissionId: string): Promise<void> {
  const { supabase } = await verifyAdminAccess();
  
  const { error } = await supabase
    .from('contact_form_submissions')
    .delete()
    .eq('id', submissionId);
    
  if (error) {
    throw new Error(`Failed to delete contact submission: ${error.message}`);
  }
  
  revalidatePath('/admin/contact-submissions');
}

// Bulk update submissions status
export async function bulkUpdateSubmissions(
  submissionIds: string[],
  status: 'new' | 'read' | 'replied' | 'archived'
): Promise<void> {
  const { supabase } = await verifyAdminAccess();
  
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  // Set appropriate timestamp based on status
  if (status === 'read') {
    updateData.read_at = new Date().toISOString();
  } else if (status === 'replied') {
    updateData.replied_at = new Date().toISOString();
    updateData.read_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('contact_form_submissions')
    .update(updateData)
    .in('id', submissionIds);
    
  if (error) {
    throw new Error(`Failed to bulk update submissions: ${error.message}`);
  }
  
  revalidatePath('/admin/contact-submissions');
} 