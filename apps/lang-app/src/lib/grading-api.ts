import type {
  GradeAnswerInput,
  GradeAnswerResult,
  GradingAttemptDetail,
  GradingAttemptList,
  GradingAttemptStatus,
} from '@lang/shared';
import { api } from './api';

// Chấm bài Writing/Speaking trong dashboard tenant (`/t/:slug/grading`).

const base = (slug: string) => `/t/${slug}/grading`;

export const gradingListPath = (slug: string) => `/t/${slug}/dashboard/grading`;
export const gradingAttemptPath = (slug: string, attemptId: string) =>
  `/t/${slug}/dashboard/grading/${attemptId}`;

export interface GradingAttemptQuery {
  page: number;
  pageSize: number;
  status?: GradingAttemptStatus | '';
  examId?: string;
  q?: string;
}

export function listGradingAttempts(slug: string, query: GradingAttemptQuery) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  return api.get<GradingAttemptList>(`${base(slug)}/attempts?${params}`);
}

export const getGradingAttempt = (slug: string, attemptId: string) =>
  api.get<GradingAttemptDetail>(`${base(slug)}/attempts/${attemptId}`);

export const getGradingRecordingUrl = (
  slug: string,
  attemptId: string,
  answerId: string,
) =>
  api.get<{ url: string }>(
    `${base(slug)}/attempts/${attemptId}/recordings/${answerId}/url`,
  );

export const gradeAnswer = (
  slug: string,
  answerId: string,
  input: GradeAnswerInput,
) => api.put<GradeAnswerResult>(`${base(slug)}/answers/${answerId}`, input);
