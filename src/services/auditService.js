// ============================================================
// Audit Log Service — Supabase-backed
// ============================================================

import { supabase } from './supabaseClient';

// ============================================================
// Add new audit entry
// ============================================================
export const addAuditEntry = async (entry) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      type: entry.type || 'activity',
      actor_id: entry.actorId || user?.id || null,
      actor_name: entry.actorName || user?.user_metadata?.full_name || 'System',
      actor_role: entry.actorRole || user?.user_metadata?.role || 'unknown',
      action: entry.action || 'Performed action',
      details: entry.details || null,
      target_user_id: entry.targetUserId || null,
      target_name: entry.targetName || null,
      incident_id: entry.incidentId || null,
      incident_title: entry.incidentTitle || null,
    };

    const { data, error } = await supabase
      .from('audit_log')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('[SafeRoute] Failed to add audit entry:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[SafeRoute] Audit error:', err);
    return null;
  }
};

// ============================================================
// Get all audit log entries (admin/coordinator)
// ============================================================
export const getAuditLog = async () => {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(500);

  if (error) {
    console.error('[SafeRoute] Failed to get audit log:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    type: row.type,
    timestamp: row.timestamp,
    actorId: row.actor_id,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    action: row.action,
    details: row.details,
    targetUserId: row.target_user_id,
    targetName: row.target_name,
    incidentId: row.incident_id,
    incidentTitle: row.incident_title,
  }));
};

// ============================================================
// Get audit log entries for a specific incident
// ============================================================
export const getAuditLogForIncident = async (incidentId) => {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('incident_id', incidentId)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('[SafeRoute] Failed to get incident audit log:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    type: row.type,
    timestamp: row.timestamp,
    actorId: row.actor_id,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    action: row.action,
    details: row.details,
    targetUserId: row.target_user_id,
    targetName: row.target_name,
    incidentId: row.incident_id,
    incidentTitle: row.incident_title,
  }));
};