// ============================================================
// Incident Storage Service — Powered by Supabase
// ============================================================

import { supabase } from './supabaseClient';
import { createAlertsForIncident } from './alertService';

// ============================================================
// Upload photo to Supabase Storage
// ============================================================
const uploadPhoto = async (base64DataUrl, userId) => {
  if (!base64DataUrl || !base64DataUrl.startsWith('data:image')) {
    return null;
  }

  try {
    const response = await fetch(base64DataUrl);
    const blob = await response.blob();

    const mimeType = blob.type || 'image/jpeg';
    const extension = mimeType.split('/')[1] || 'jpg';
    const fileName = `${userId || 'anon'}-${Date.now()}.${extension}`;

    console.log('[SafeRoute] Uploading photo:', fileName);

    const { data, error } = await supabase.storage
      .from('incident-photos')
      .upload(fileName, blob, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error('[SafeRoute] Photo upload failed:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('incident-photos')
      .getPublicUrl(data.path);

    console.log('[SafeRoute] Photo uploaded:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (err) {
    console.error('[SafeRoute] Photo upload error:', err);
    return null;
  }
};

// ============================================================
// Helper: map Supabase row → frontend shape
// ============================================================
const mapIncident = (row) => {
  const emojiMap = {
    theft: '🚲',
    robbery: '⚠️',
    harassment: '⚠️',
    suspicious: '🔍',
    poor_lighting: '💡',
    vandalism: '🔨',
    other: '📋',
  };

  return {
    id: row.id,
    title: row.title,
    location: row.location,
    time: formatTimeAgo(row.created_at),
    status: row.status,
    emoji: emojiMap[row.type] || '📋',
    reportedBy: row.anonymous ? 'Anonymous' : 'Resident',
    type: row.type,
    description: row.description,
    photoUrl: row.photo_url,
    anonymous: row.anonymous,
    lat: row.latitude,
    lng: row.longitude,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    adminNotes: row.admin_notes,
    userResponse: row.user_response,
    userId: row.user_id,
  };
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

// ============================================================
// Helper: is incident locked?
// ============================================================
export const isIncidentLocked = (status) => {
  return status === 'resolved' || status === 'rejected';
};

// ============================================================
// Helper: can the current viewer see the admin's response?
// Rules:
//   - Admin: always yes
//   - Reporter (owner, non-anonymous): yes
//   - Everyone else (incl. coordinator, anonymous reporters): no
// ============================================================
export const canViewResponse = (incident, user) => {
  if (!incident || !incident.userResponse) return false;
  if (!user) return false;

  const role = user?.user_metadata?.role;
  const isAdmin = role === 'admin';

  if (isAdmin) return true;

  const isOwner =
    incident.userId &&
    user.id &&
    String(incident.userId) === String(user.id);

  return isOwner;
};

// ============================================================
// Helper: is the current viewer the reporter?
// (used for "Reply received" badge on the list)
// ============================================================
export const isReporter = (incident, user) => {
  if (!incident || !user) return false;
  return (
    incident.userId &&
    user.id &&
    String(incident.userId) === String(user.id)
  );
};

// ============================================================
// GET ALL INCIDENTS
// ============================================================
export const getIncidents = async () => {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[SafeRoute] getIncidents error:', error);
    return [];
  }

  return (data || []).map(mapIncident);
};

// ============================================================
// GET ONE INCIDENT
// ============================================================
export const getIncidentById = async (id) => {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[SafeRoute] getIncidentById error:', error);
    return null;
  }

  return data ? mapIncident(data) : null;
};

// ============================================================
// ADD INCIDENT
// ============================================================
export const addIncident = async (incident) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const typeLabels = {
    theft: 'Theft',
    robbery: 'Robbery',
    harassment: 'Harassment',
    suspicious: 'Suspicious Activity',
    poor_lighting: 'Poor Lighting',
    vandalism: 'Vandalism',
    other: 'Other Incident',
  };

  const description = incident.description || '';
  const shortDesc = description.length > 40
    ? description.slice(0, 40).trim() + '...'
    : description;

  const KIMBERLEY_LAT = -28.7412;
  const KIMBERLEY_LNG = 24.7665;

  let photoUrl = null;
  if (incident.photoUrl) {
    photoUrl = await uploadPhoto(incident.photoUrl, user?.id);
  }

  const payload = {
    user_id: incident.anonymous ? null : (user?.id || null),
    type: incident.type,
    title:
      incident.title ||
      `${typeLabels[incident.type] || 'Incident'}${shortDesc ? ' - ' + shortDesc : ''}`,
    description: incident.description,
    location: incident.location || incident.address || 'Unknown location',
    latitude:
      typeof incident.lat === 'number'
        ? incident.lat
        : KIMBERLEY_LAT + (Math.random() - 0.5) * 0.02,
    longitude:
      typeof incident.lng === 'number'
        ? incident.lng
        : KIMBERLEY_LNG + (Math.random() - 0.5) * 0.02,
    photo_url: photoUrl,
    anonymous: incident.anonymous || false,
    status: 'reported',
  };

  const { data, error } = await supabase
    .from('incidents')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('[SafeRoute] addIncident error:', error);
    throw new Error(error.message);
  }

  try {
    await createAlertsForIncident(data.id, data.title);
  } catch (alertErr) {
    console.warn('[SafeRoute] Alerts creation failed:', alertErr);
  }

  return mapIncident(data);
};

// ============================================================
// UPDATE STATUS
// ============================================================
export const updateIncidentStatus = async (
  id,
  status,
  adminNotes = null,
  userResponse = null
) => {
  const updatePayload = { status };
  if (adminNotes !== null) updatePayload.admin_notes = adminNotes;
  if (userResponse !== null) updatePayload.user_response = userResponse;

  const { data, error } = await supabase
    .from('incidents')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[SafeRoute] updateIncidentStatus error:', error);
    return null;
  }

  return mapIncident(data);
};

// ============================================================
// REOPEN INCIDENT
// ============================================================
export const reopenIncident = async (id, staffResponse = null) => {
  const updatePayload = { status: 'reported' };
  if (staffResponse) {
    updatePayload.user_response = staffResponse;
  }

  const { data, error } = await supabase
    .from('incidents')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[SafeRoute] reopenIncident error:', error);
    return null;
  }

  return mapIncident(data);
};

// ============================================================
// DELETE INCIDENT
// ============================================================
export const deleteIncident = async (id) => {
  const { error } = await supabase
    .from('incidents')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[SafeRoute] deleteIncident error:', error);
    return false;
  }

  return true;
};

// ============================================================
// GET STATS
// ============================================================
export const getIncidentStats = async () => {
  const { data, error } = await supabase
    .from('incidents')
    .select('status, created_at');

  if (error) {
    console.error('[SafeRoute] getIncidentStats error:', error);
    return {
      total: 0,
      newThisWeek: 0,
      underReview: 0,
      resolved: 0,
      reported: 0,
      actionTaken: 0,
      rejected: 0,
    };
  }

  const incidents = data || [];
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const thisWeek = incidents.filter(
    (i) => new Date(i.created_at).getTime() >= oneWeekAgo
  );

  return {
    total: incidents.length,
    newThisWeek: thisWeek.length,
    underReview: incidents.filter((i) => i.status === 'under_review').length,
    resolved: incidents.filter((i) => i.status === 'resolved').length,
    reported: incidents.filter((i) => i.status === 'reported').length,
    actionTaken: incidents.filter((i) => i.status === 'action_taken').length,
    rejected: incidents.filter((i) => i.status === 'rejected').length,
  };
};

// ============================================================
// GET INCIDENTS BY TYPE (with guaranteed 100% total)
// Uses the "Largest Remainder Method" so percentages
// always sum to exactly 100%.
// ============================================================
export const getIncidentsByType = async () => {
  const { data, error } = await supabase
    .from('incidents')
    .select('type');

  if (error) {
    console.error('[SafeRoute] getIncidentsByType error:', error);
    return [];
  }

  const incidents = data || [];
  const counts = {};

  incidents.forEach((i) => {
    const type = i.type || 'other';
    counts[type] = (counts[type] || 0) + 1;
  });

  const labels = {
    theft: 'Theft',
    robbery: 'Robbery',
    harassment: 'Harassment',
    suspicious: 'Suspicious Activity',
    poor_lighting: 'Poor Lighting',
    vandalism: 'Vandalism',
    other: 'Other',
  };

  const total = incidents.length;

  // 1. Build raw rows with exact (fractional) percentages
  const rows = Object.entries(counts).map(([type, count]) => ({
    type,
    label: labels[type] || type,
    count,
    exact: total > 0 ? (count / total) * 100 : 0,
  }));

  // 2. Floor every percentage, remember the fractional remainder
  const floored = rows.map((r) => ({
    ...r,
    percentage: Math.floor(r.exact),
    remainder: r.exact - Math.floor(r.exact),
  }));

  // 3. How many points are left to reach exactly 100?
  const sumFloored = floored.reduce((s, r) => s + r.percentage, 0);
  let remaining = total > 0 ? 100 - sumFloored : 0;

  // 4. Give +1 to the entries with the largest remainders
  const sortedByRemainder = [...floored].sort(
    (a, b) => b.remainder - a.remainder
  );

  for (let i = 0; i < sortedByRemainder.length && remaining > 0; i++) {
    sortedByRemainder[i].percentage += 1;
    remaining -= 1;
  }

  // 5. Return clean objects, sorted by count descending
  return floored
    .map(({ type, label, count, percentage }) => ({
      type,
      label,
      count,
      percentage,
    }))
    .sort((a, b) => b.count - a.count);
};

// ============================================================
// GET INCIDENTS BY STATUS
// ============================================================
export const getIncidentsByStatus = async () => {
  const { data, error } = await supabase
    .from('incidents')
    .select('status');

  if (error) {
    console.error('[SafeRoute] getIncidentsByStatus error:', error);
    return {
      reported: 0,
      under_review: 0,
      action_taken: 0,
      resolved: 0,
      rejected: 0,
    };
  }

  const counts = {
    reported: 0,
    under_review: 0,
    action_taken: 0,
    resolved: 0,
    rejected: 0,
  };

  (data || []).forEach((i) => {
    if (counts[i.status] !== undefined) counts[i.status]++;
  });

  return counts;
};

// ============================================================
// GET INCIDENTS BY SEVERITY
// ============================================================
export const getIncidentsBySeverity = async () => {
  const { data, error } = await supabase
    .from('incidents')
    .select('type');

  if (error) {
    console.error('[SafeRoute] getIncidentsBySeverity error:', error);
    return { critical: 0, high: 0, medium: 0, low: 0 };
  }

  const severityMap = {
    theft: 'critical',
    robbery: 'critical',
    harassment: 'high',
    suspicious: 'high',
    poor_lighting: 'medium',
    vandalism: 'medium',
    other: 'low',
  };

  const counts = { critical: 0, high: 0, medium: 0, low: 0 };

  (data || []).forEach((i) => {
    const sev = severityMap[i.type] || 'low';
    counts[sev]++;
  });

  return counts;
};

// ============================================================
// GET INCIDENT TREND
// ============================================================
export const getIncidentTrend = async (days = 14) => {
  const { data, error } = await supabase
    .from('incidents')
    .select('created_at');

  if (error) {
    console.error('[SafeRoute] getIncidentTrend error:', error);
    return [];
  }

  const incidents = data || [];
  const trend = [];

  for (let d = days - 1; d >= 0; d--) {
    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() - d);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const count = incidents.filter((i) => {
      const t = new Date(i.created_at).getTime();
      return t >= dayStart.getTime() && t <= dayEnd.getTime();
    }).length;

    trend.push({
      date: dayStart.toISOString(),
      label: dayStart.toLocaleDateString('en-ZA', {
        day: '2-digit',
        month: 'short',
      }),
      count,
    });
  }

  return trend;
};

// ============================================================
// Deprecated (kept for compatibility)
// ============================================================
export const getAlertsFromIncidents = async () => {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) return [];

  return (data || []).map((incident) => {
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
      id: incident.id,
      title: `${incident.title} reported`,
      time: formatTimeAgo(incident.created_at),
      severity: severityMap[incident.type] || 'low',
      area: incident.location,
      read: false,
    };
  });
};

export const resetIncidentStorage = () => {
  console.warn('[SafeRoute] resetIncidentStorage deprecated');
};

export const subscribeToIncidents = (callback) => {
  console.warn('[SafeRoute] Real-time subscriptions coming soon');
  return () => {};
};