/**
 * Calculates project progress based on checkpoint status
 * @param {Array} checkpoints 
 * @returns {number} percentage
 */
const calculateProgress = (checkpoints) => {
  if (!checkpoints || checkpoints.length === 0) return 0;
  const completed = checkpoints.filter(c => c.status === 'DONE').length;
  return Math.round((completed / checkpoints.length) * 100);
};

/**
 * Determines project health status
 */
const getProjectHealth = (project) => {
  const now = new Date();
  const hasOverdue = project.checkpoints && project.checkpoints.some(c => c.status === 'PENDING' && new Date(c.targetDate) < now);
  
  if (project.overallTargetDate && new Date(project.overallTargetDate) < now) return 'DELAYED';
  if (hasOverdue) return 'AT RISK';
  return 'ON TRACK';
};

module.exports = { calculateProgress, getProjectHealth };
