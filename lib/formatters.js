export function getCategoryLabel(category) {
  if (!category) return '';
  if (typeof category === 'object' && category !== null) {
    return category.name || category.label || category._id || '';
  }
  return String(category);
}
