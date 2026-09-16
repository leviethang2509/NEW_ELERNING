import { randomInt, randomUUID } from 'node:crypto';
import {
  extractStructure,
  stripAnswers,
  validateSection,
  validateSectionShape,
  type ExamValue,
} from '@lang/exam-core';
import { ExamSectionStatus, type ExamContentIssue } from '@lang/shared';
import { BadRequestException } from '@nestjs/common';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import type { ExamPart } from './exam-part.entity';
import type { ExamQuestion } from './exam-question.entity';
import type { ExamSection } from './exam-section.entity';

/** Nội dung một section trước khi lưu (từ request hoặc version cũ). */
export interface SectionDraft {
  moduleId: string | null;
  name: string;
  durationMinutes: number;
  rawData: unknown[];
}

/** Dòng `exam_sections` kèm `exam_parts`/`exam_questions`, id sinh sẵn. */
export interface PreparedSection {
  section: ExamSection;
  parts: ExamPart[];
  questions: ExamQuestion[];
}

/** Nội dung trắng của section mới tạo từ module. */
export const emptySectionContent = (): ExamValue => [
  { type: 'p', children: [{ text: '' }] },
];

/** Lỗi khiến không lưu được (định dạng, id indicator, data: URI) → 400. */
export function assertSectionShapes(sections: readonly SectionDraft[]): void {
  const errors = sections.flatMap((section) =>
    validateSectionShape(section.rawData).map(
      (message) => `Section "${section.name}": ${message}`,
    ),
  );
  if (errors.length > 0) throw new BadRequestException(errors);
}

/** Mọi lỗi/cảnh báo nội dung, dùng khi publish và khi lưu đề không còn nháp. */
export function sectionIssues(
  sections: readonly SectionDraft[],
): ExamContentIssue[] {
  return sections.flatMap((section, sectionIndex) =>
    validateSection(section.rawData).map((issue) => ({
      sectionIndex,
      sectionName: section.name,
      indicatorId: issue.indicatorId,
      message: issue.message,
      severity: issue.severity,
    })),
  );
}

export function hasContentErrors(issues: readonly ExamContentIssue[]): boolean {
  return issues.some((issue) => issue.severity === 'error');
}

/** `insert` của TypeORM không suy được kiểu cột jsonb `unknown[]`. */
export function insertable<T>(rows: T[]): QueryDeepPartialEntity<T>[] {
  return rows as QueryDeepPartialEntity<T>[];
}

/**
 * Tách cấu trúc + đáp án và tạo content_public. Nội dung phải đã qua
 * `assertSectionShapes`. Part cha luôn đứng trước subpart trong danh sách.
 */
export function prepareSection(
  draft: SectionDraft,
  target: {
    examId: string;
    version: number;
    sortOrder: number;
    createdBy: string;
  },
): PreparedSection {
  const value = draft.rawData as ExamValue;
  const structure = extractStructure(value);
  const sectionId = randomUUID();

  const partIds = new Map<string, string>();
  const parts = [...structure.parts]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((part): ExamPart => {
      const id = randomUUID();
      partIds.set(part.nodeId, id);
      return {
        id,
        sectionId,
        parentPartId:
          part.parentNodeId === null
            ? null
            : (partIds.get(part.parentNodeId) ?? null),
        kind: part.kind,
        nodeId: part.nodeId,
        sortOrder: part.sortOrder,
        firstNumber: part.firstNumber,
        lastNumber: part.lastNumber,
      };
    });

  const questions = structure.questions.map((question): ExamQuestion => ({
    id: randomUUID(),
    sectionId,
    partId:
      question.partNodeId === null
        ? null
        : (partIds.get(question.partNodeId) ?? null),
    number: question.number,
    nodeId: question.nodeId,
    subIndex: question.subIndex,
    qtype: question.qtype,
    grading: question.grading,
    answerKey: question.answerKey,
    options: question.options,
    params: question.params,
    maxScore: question.maxScore,
  }));

  const section = {
    id: sectionId,
    examId: target.examId,
    version: target.version,
    status: ExamSectionStatus.ACTIVE,
    moduleId: draft.moduleId,
    name: draft.name,
    sortOrder: target.sortOrder,
    durationMinutes: draft.durationMinutes,
    rawData: value,
    // Thứ tự xáo lưu sẵn chỉ để content_public không lộ đáp án; mỗi lượt làm
    // xáo lại theo `order_seed` riêng (Step 13).
    contentPublic: stripAnswers(value, randomInt(2 ** 31)),
    questionCount: questions.length,
    createdBy: target.createdBy,
  } as ExamSection;

  return { section, parts, questions };
}
