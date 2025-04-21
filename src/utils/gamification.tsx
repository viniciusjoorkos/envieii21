import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

// Define point thresholds for levels
export const LEVEL_THRESHOLDS = {
  INICIANTE: 0,
  PRO: 500,
  MASTER: 1000
};

export type UserLevel = 'Iniciante' | 'Pró' | 'Master';

export const getUserLevel = (points: number): UserLevel => {
  if (points >= LEVEL_THRESHOLDS.MASTER) return 'Master';
  if (points >= LEVEL_THRESHOLDS.PRO) return 'Pró';
  return 'Iniciante';
};

// Check if user has leveled up
export const checkLevelUp = (prevPoints: number, newPoints: number): UserLevel | null => {
  const prevLevel = getUserLevel(prevPoints);
  const newLevel = getUserLevel(newPoints);
  
  return prevLevel !== newLevel ? newLevel : null;
};

// Award points to the user
export const awardPoints = (points: number, reason: string): void => {
  // Get current points
  const currentPoints = parseInt(localStorage.getItem('userPoints') || '0', 10);
  const newTotalPoints = currentPoints + points;
  
  // Check for level up
  const newLevel = checkLevelUp(currentPoints, newTotalPoints);
  
  // Save new points total
  localStorage.setItem('userPoints', newTotalPoints.toString());
  
  // Dispatch event for components to update
  window.dispatchEvent(new CustomEvent('pointsUpdated', { 
    detail: { 
      points: newTotalPoints,
      awarded: points,
      reason,
      newLevel
    } 
  }));
  
  // Show toast with points awarded
  toast({
    title: `+${points} pontos!`,
    description: `Você ganhou pontos por: ${reason}`,
    className: "bg-indigo-900/80 border-indigo-400 text-indigo-50 relative overflow-hidden",
    action: <ToastAction altText="Fechar">Fechar</ToastAction>
  });
  
  // If user leveled up, play sound and show toast
  if (newLevel) {
    // Dispatch level up event
    window.dispatchEvent(new CustomEvent('levelUp', { 
      detail: { 
        level: newLevel
      } 
    }));
  }
};

// Mock function to get current user's points - in a real app this would come from backend
export const getUserPoints = (): number => {
  return parseInt(localStorage.getItem('userPoints') || '0', 10);
}; 