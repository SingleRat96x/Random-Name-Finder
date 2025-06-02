'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  Mail, 
  Calendar, 
  Globe, 
  Monitor, 
  ChevronLeft, 
  ChevronRight,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { 
  updateSubmissionStatus, 
  markAsRead, 
  deleteContactSubmission 
} from '@/app/(admin)/admin/contact-submissions/actions';

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

interface ContactSubmissionsListProps {
  submissions: ContactSubmission[];
  selectedSubmissions: string[];
  onSelectionChange: (selected: string[]) => void;
  onDataChange: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ContactSubmissionsList({
  submissions,
  selectedSubmissions,
  onSelectionChange,
  onDataChange,
  currentPage,
  totalPages,
  onPageChange,
}: ContactSubmissionsListProps) {
  const [viewingSubmission, setViewingSubmission] = useState<ContactSubmission | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'read': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'replied': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSelectionChange = (submissionId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedSubmissions, submissionId]);
    } else {
      onSelectionChange(selectedSubmissions.filter(id => id !== submissionId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(submissions.map(s => s.id));
    } else {
      onSelectionChange([]);
    }
  };

  const openSubmissionDetails = async (submission: ContactSubmission) => {
    setViewingSubmission(submission);
    
    // Mark as read if it's new
    if (submission.status === 'new') {
      try {
        await markAsRead(submission.id);
        onDataChange();
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  };

  const startEditingStatus = (submission: ContactSubmission) => {
    setEditingStatus(submission.id);
    setNewStatus(submission.status);
    setAdminNotes(submission.admin_notes || '');
    setError(null);
  };

  const saveStatusChange = async (submissionId: string) => {
    try {
      setError(null);
      await updateSubmissionStatus(submissionId, newStatus as 'new' | 'read' | 'replied' | 'archived', adminNotes);
      setEditingStatus(null);
      onDataChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const cancelStatusEdit = () => {
    setEditingStatus(null);
    setNewStatus('');
    setAdminNotes('');
    setError(null);
  };

  const handleDelete = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteContactSubmission(submissionId);
      onDataChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete submission');
    }
  };

  const truncateMessage = (message: string, maxLength: number = 150) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No contact submissions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Select All */}
      <div className="flex items-center space-x-2 pb-4 border-b">
        <Checkbox
          id="select-all"
          checked={selectedSubmissions.length === submissions.length}
          onCheckedChange={handleSelectAll}
        />
        <label htmlFor="select-all" className="text-sm font-medium">
          Select all ({submissions.length} items)
        </label>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {submissions.map((submission) => (
          <Card key={submission.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={selectedSubmissions.includes(submission.id)}
                  onCheckedChange={(checked) => handleSelectionChange(submission.id, !!checked)}
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-foreground truncate">
                          {submission.name}
                        </h3>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                        {submission.status === 'new' && (
                          <Badge variant="secondary" className="text-xs">NEW</Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {submission.email}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="font-medium text-sm text-foreground mb-1">
                          {submission.subject}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {truncateMessage(submission.message)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {editingStatus === submission.id ? (
                        <div className="flex items-center space-x-2">
                          <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="read">Read</SelectItem>
                              <SelectItem value="replied">Replied</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            size="sm" 
                            onClick={() => saveStatusChange(submission.id)}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={cancelStatusEdit}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditingStatus(submission)}
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Edit Status
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openSubmissionDetails(submission)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {editingStatus === submission.id && (
                    <div className="mt-3 pt-3 border-t">
                      <label className="text-sm font-medium mb-1 block">Admin Notes</label>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add internal notes..."
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Submission Details Modal */}
      {viewingSubmission && (
        <Dialog open={!!viewingSubmission} onOpenChange={() => setViewingSubmission(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <span>Contact Submission Details</span>
                <Badge className={getStatusColor(viewingSubmission.status)}>
                  {viewingSubmission.status}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Submitted {formatDate(viewingSubmission.submitted_at)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-sm">{viewingSubmission.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm">{viewingSubmission.email}</p>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-sm font-medium">Subject</label>
                <p className="text-sm">{viewingSubmission.subject}</p>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium">Message</label>
                <div className="mt-1 p-3 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{viewingSubmission.message}</p>
                </div>
              </div>

              {/* Technical Information */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Technical Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {viewingSubmission.ip_address && (
                    <div>
                      <label className="font-medium flex items-center">
                        <Globe className="h-3 w-3 mr-1" />
                        IP Address
                      </label>
                      <p className="text-muted-foreground">{viewingSubmission.ip_address}</p>
                    </div>
                  )}
                  {viewingSubmission.user_agent && (
                    <div>
                      <label className="font-medium flex items-center">
                        <Monitor className="h-3 w-3 mr-1" />
                        User Agent
                      </label>
                      <p className="text-muted-foreground text-xs break-all">
                        {viewingSubmission.user_agent}
                      </p>
                    </div>
                  )}
                  {viewingSubmission.referrer_url && (
                    <div className="md:col-span-2">
                      <label className="font-medium">Referrer URL</label>
                      <p className="text-muted-foreground text-xs break-all">
                        {viewingSubmission.referrer_url}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              {viewingSubmission.admin_notes && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium">Admin Notes</label>
                  <div className="mt-1 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm">{viewingSubmission.admin_notes}</p>
                  </div>
                </div>
              )}

              {/* Status History */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Status History</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Submitted</span>
                    <span className="text-muted-foreground">
                      {formatDate(viewingSubmission.submitted_at)}
                    </span>
                  </div>
                  {viewingSubmission.read_at && (
                    <div className="flex justify-between">
                      <span>First Read</span>
                      <span className="text-muted-foreground">
                        {formatDate(viewingSubmission.read_at)}
                      </span>
                    </div>
                  )}
                  {viewingSubmission.replied_at && (
                    <div className="flex justify-between">
                      <span>Replied</span>
                      <span className="text-muted-foreground">
                        {formatDate(viewingSubmission.replied_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setViewingSubmission(null);
                    handleDelete(viewingSubmission.id);
                  }}
                >
                  Delete Submission
                </Button>
                <Button onClick={() => setViewingSubmission(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 