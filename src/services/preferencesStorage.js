// ============================================================
// User Preferences Storage — Supabase-backed
// ============================================================

import { supabase } from './supabaseClient';

// ============================================================
// Default preferences
// ============================================================
const DEFAULT_PREFERENCES = {
  email_alerts: true,
  sms_alerts: false,
  push_alerts: true,
  alert_radius: 5,
  language: 'en',
};

// ============================================================
// Get user preferences
// ============================================================
export const getUserPreferences = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return DEFAULT_PREFERENCES;
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[SafeRoute] Failed to load preferences:', error);
    return DEFAULT_PREFERENCES;
  }

  // If no preferences exist yet, create default ones
  if (!data) {
    const { data: created, error: createError } = await supabase
      .from('user_preferences')
      .insert([{ user_id: user.id, ...DEFAULT_PREFERENCES }])
      .select()
      .maybeSingle();

    if (createError) {
      console.error('[SafeRoute] Failed to create preferences:', createError);
      return DEFAULT_PREFERENCES;
    }

    return created || DEFAULT_PREFERENCES;
  }

  return data;
};

// ============================================================
// Save user preferences
// ============================================================
export const saveUserPreferences = async (preferences) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not logged in');
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      email_alerts: preferences.emailAlerts,
      sms_alerts: preferences.smsAlerts,
      push_alerts: preferences.pushAlerts,
      alert_radius: parseInt(preferences.alertRadius, 10),
      language: preferences.language,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    })
    .select()
    .single();

  if (error) {
    console.error('[SafeRoute] Failed to save preferences:', error);
    throw new Error(error.message);
  }

  return data;
};