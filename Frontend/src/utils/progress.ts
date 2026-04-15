/**
 * Calculate progress percentage from an array of checkpoints.
 * Status "DONE" is considered complete.
 */
export function calculateProgress(checkpoints: Array<{ status: string }>): number {
  if (!checkpoints || checkpoints.length === 0) return 0;
  const done = checkpoints.filter(cp => cp.status === 'DONE').length;
  return Math.round((done / checkpoints.length) * 100);
}
