export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-ZA', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const humanize = (str) => {
  if (!str) return '';
  return str.split('_').map(w => capitalize(w)).join(' ');
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n.charAt(0)).slice(0, 2).join('').toUpperCase();
};

export const truncate = (text, length = 50) => {
  if (!text) return '';
  return text.length > length ? `${text.slice(0, length)}...` : text;
};

export const getStatusVariant = (status) => {
  const variants = {
    resolved: 'success',
    under_review: 'warning',
    reported: 'info',
    action_taken: 'primary',
    rejected: 'danger',
  };
  return variants[status] || 'default';
};

export const debounce = (func, wait = 300) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};