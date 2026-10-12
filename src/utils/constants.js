export const APP_NAME = 'SafeRoute Connect';
export const APP_DESCRIPTION = 'Community Safety Reporting System';

export const ROLES = {
  RESIDENT: 'resident',
  COORDINATOR: 'coordinator',
  ADMIN: 'admin',
};

export const INCIDENT_TYPES = [
  { id: 'theft', label: 'Theft', emoji: '🛡️' },
  { id: 'robbery', label: 'Robbery', emoji: '⚠️' },
  { id: 'harassment', label: 'Harassment', emoji: '⚠️' },
  { id: 'suspicious', label: 'Suspicious Activity', emoji: '🔍' },
  { id: 'poor_lighting', label: 'Poor Lighting', emoji: '💡' },
  { id: 'vandalism', label: 'Vandalism', emoji: '🔨' },
  { id: 'other', label: 'Other', emoji: '•••' },
];

export const INCIDENT_STATUS = {
  REPORTED: 'reported',
  UNDER_REVIEW: 'under_review',
  ACTION_TAKEN: 'action_taken',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

export const ALERT_SEVERITY = { HIGH: 'high', MEDIUM: 'medium', LOW: 'low' };
export const ITEMS_PER_PAGE = 10;