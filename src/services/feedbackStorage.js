// ============================================================
// Feedback Storage — Supabase-backed
// ============================================================

import { supabase } from './supabaseClient';

// ============================================================
// Submit new feedback
// ============================================================
export const submitFeedback = async (feedbackData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('You must be logged in to submit feedback');
  }

  const payload = {
    user_id: user.id,
    type: feedbackData.type,
    rating: feedbackData.rating,
    comments: feedbackData.comments,
    want_response: feedbackData.wantResponse || false,
    contact_email: feedbackData.wantResponse ? feedbackData.email : null,
    status: 'pending',
  };

  const { data, error } = await supabase
    .from('feedback')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('[SafeRoute] Failed to submit feedback:', error);
    throw new Error(error.message);
  }

  return data;
};

// ============================================================
// Get all feedback (admin/coordinator only)
// ============================================================
export const getAllFeedback = async () => {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[SafeRoute] Failed to get feedback:', error);
    return [];
  }

  return (data || []).map((f) => ({
    id: f.id,
    userId: f.user_id,
    type: f.type,
    rating: f.rating,
    comments: f.comments,
    wantResponse: f.want_response,
    contactEmail: f.contact_email,
    status: f.status,
    createdAt: f.created_at,
  }));
};

// ============================================================
// Get user's own feedback
// ============================================================
export const getMyFeedback = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[SafeRoute] Failed to get my feedback:', error);
    return [];
  }

  return data || [];
};

// ============================================================
// Update feedback status (admin/coordinator)
// ============================================================
export const updateFeedbackStatus = async (feedbackId, newStatus) => {
  const { data, error } = await supabase
    .from('feedback')
    .update({ status: newStatus })
    .eq('id', feedbackId)
    .select()
    .single();

  if (error) {
    console.error('[SafeRoute] Failed to update feedback:', error);
    return false;
  }

  return true;
};