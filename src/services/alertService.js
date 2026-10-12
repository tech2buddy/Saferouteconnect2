// ============================================================
// Alert Service — Supabase-backed
// ============================================================

import { supabase } from './supabaseClient';

// ============================================================
// Create an alert for a new incident (called when incident is created)
// Creates one alert row per user
// ============================================================
export const createAlertsForIncident = async (incidentId, incidentTitle) => {
  try {
    // Get all user IDs
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, role');

    if (usersError) {
      console.error('[SafeRoute] Failed to fetch users for alerts:', usersError);
      return 0;
    }

    if (!users || users.length === 0) {
      console.warn('[SafeRoute] No users to create alerts for');
      return 0;
    }

    // Create one alert per user
    const alertsToInsert = users.map((u) => ({
      user_id: u.id,
      incident_id: incidentId,
      read_status: false,
    }));

    const { data, error } = await supabase
      .from('alerts')
      .insert(alertsToInsert)
      .select();

    if (error) {
      console.error('[SafeRoute] Failed to create alerts:', error);
      return 0;
    }

    console.log(`[SafeRoute] Created ${data?.length || 0} alerts for incident "${incidentTitle}"`);
    return data?.length || 0;
  } catch (err) {
    console.error('[SafeRoute] Alert creation error:', err);
    return 0;
  }
};

// ============================================================
// Get alerts for the current user (with incident details joined)
// ============================================================
export const getUserAlerts = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('alerts')
    .select(`
      id,
      user_id,
      incident_id,
      read_status,
      sent_time,
      incidents:incident_id (
        id,
        type,
        title,
        description,
        location,
        status,
        anonymous,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('sent_time', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[SafeRoute] Failed to get alerts:', error);
    return [];
  }

  // Format for the UI
  return (data || []).map((a) => {
    const incident = a.incidents || {};
    const severityMap = {
      theft: 'high',
      robbery: 'high',
      harassment: 'high',
      suspicious: 'medium',
      poor_lighting: 'medium',
      vandalism: 'low',
      other: 'low',
    };

    return {
      id: a.id,
      incidentId: a.incident_id,
      title: `${incident.title || 'Incident'} reported`,
      time: formatTimeAgo(a.sent_time),
      severity: severityMap[incident.type] || 'low',
      area: incident.location || 'Unknown location',
      read: a.read_status || false,
      sentTime: a.sent_time,
    };
  });
};

// ============================================================
// Mark alert as read
// ============================================================
export const markAlertAsRead = async (alertId) => {
  const { error } = await supabase
    .from('alerts')
    .update({ read_status: true })
    .eq('id', alertId);

  if (error) {
    console.error('[SafeRoute] Failed to mark alert as read:', error);
    return false;
  }
  return true;
};

// ============================================================
// Mark all alerts as read
// ============================================================
export const markAllAlertsAsRead = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('alerts')
    .update({ read_status: true })
    .eq('user_id', user.id)
    .eq('read_status', false);

  if (error) {
    console.error('[SafeRoute] Failed to mark all alerts:', error);
    return false;
  }
  return true;
};

// ============================================================
// Helper: format time ago
// ============================================================
const formatTimeAgo = (isoString) => {
  if (!isoString) return 'Just now';
  const created = new Date(isoString).getTime();
  const diffMin = Math.floor((Date.now() - created) / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)} hours ago`;
  if (diffMin < 10080) return `${Math.floor(diffMin / 1440)} days ago`;
  return new Date(isoString).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
  });
};