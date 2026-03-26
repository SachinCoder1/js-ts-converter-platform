import type { BlogCategory } from '@/lib/types';

export const CATEGORY_GRADIENTS: Record<BlogCategory, string> = {
  typescript: 'linear-gradient(135deg, hsl(210 80% 25%), hsl(210 60% 40%))',
  json: 'linear-gradient(135deg, hsl(140 50% 25%), hsl(160 40% 35%))',
  css: 'linear-gradient(135deg, hsl(280 60% 30%), hsl(300 50% 40%))',
  react: 'linear-gradient(135deg, hsl(195 80% 25%), hsl(200 70% 40%))',
  schema: 'linear-gradient(135deg, hsl(30 60% 25%), hsl(40 50% 35%))',
  devops: 'linear-gradient(135deg, hsl(250 50% 25%), hsl(260 40% 38%))',
  security: 'linear-gradient(135deg, hsl(0 50% 28%), hsl(10 45% 38%))',
  testing: 'linear-gradient(135deg, hsl(120 40% 25%), hsl(130 35% 35%))',
  performance: 'linear-gradient(135deg, hsl(45 70% 25%), hsl(50 60% 38%))',
  general: 'linear-gradient(135deg, hsl(220 30% 25%), hsl(220 20% 38%))',
};

export const CATEGORY_GRADIENTS_BRIGHT: Record<BlogCategory, string> = {
  typescript: 'linear-gradient(135deg, hsl(210 80% 35%), hsl(210 70% 50%))',
  json: 'linear-gradient(135deg, hsl(150 60% 30%), hsl(160 50% 42%))',
  css: 'linear-gradient(135deg, hsl(270 70% 35%), hsl(290 60% 48%))',
  react: 'linear-gradient(135deg, hsl(190 80% 30%), hsl(200 75% 45%))',
  schema: 'linear-gradient(135deg, hsl(30 70% 30%), hsl(40 60% 42%))',
  devops: 'linear-gradient(135deg, hsl(30 80% 30%), hsl(30 70% 45%))',
  security: 'linear-gradient(135deg, hsl(350 70% 30%), hsl(350 60% 42%))',
  testing: 'linear-gradient(135deg, hsl(120 50% 28%), hsl(130 45% 40%))',
  performance: 'linear-gradient(135deg, hsl(45 80% 28%), hsl(50 70% 42%))',
  general: 'linear-gradient(135deg, hsl(220 40% 28%), hsl(220 30% 42%))',
};

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  typescript: 'TypeScript',
  json: 'JSON',
  css: 'CSS',
  react: 'React',
  schema: 'Schema',
  devops: 'DevOps',
  security: 'Security',
  testing: 'Testing',
  performance: 'Performance',
  general: 'General',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'var(--success)',
  intermediate: 'var(--warning)',
  advanced: 'hsl(0 62% 55%)',
};

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
