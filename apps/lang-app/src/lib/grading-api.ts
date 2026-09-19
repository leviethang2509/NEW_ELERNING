import type {
  GradeAnswerInput,
  GradeAnswerResult,
  GradingAttemptDetail,
  GradingAttemptList,
  GradingAttemptStatus,
  LessonGradeAnswerResult,
  LessonGradingAttemptDetail,
  LessonGradingAttemptList,
} from '@lang/shared';
import { api } from './api';

// Chấm bài Writing/Speaking trong dashboard tenant (`/t/:slug/grading`): đề thi
// và bài học.

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

// --- Bài học (req-3 Step 5) ----------------------------------------------------

export const gradingLessonListPath = (slug: string) =>
  `${gradingListPath(slug)}?kind=lesson`;
export const gradingLessonAttemptPath = (slug: string, attemptId: string) =>
  `/t/${slug}/dashboard/grading/lessons/${attemptId}`;

export interface LessonGradingAttemptQuery {
  page: number;
  pageSize: number;
  status?: GradingAttemptStatus | '';
  lessonId?: string;
  q?: string;
}

export function listLessonGradingAttempts(
  slug: string,
  query: LessonGradingAttemptQuery,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  return api.get<LessonGradingAttemptList>(
    `${base(slug)}/lesson-attempts?${params}`,
  );
}

export const getLessonGradingAttempt = (slug: string, attemptId: string) =>
  api.get<LessonGradingAttemptDetail>(
    `${base(slug)}/lesson-attempts/${attemptId}`,
  );

export const getLessonGradingRecordingUrl = (
  slug: string,
  attemptId: string,
  answerId: string,
) =>
  api.get<{ url: string }>(
    `${base(slug)}/lesson-attempts/${attemptId}/recordings/${answerId}/url`,
  );

export const gradeLessonAnswer = (
  slug: string,
  answerId: string,
  input: GradeAnswerInput,
) =>
  api.put<LessonGradeAnswerResult>(
    `${base(slug)}/lesson-answers/${answerId}`,
    input,
  );
