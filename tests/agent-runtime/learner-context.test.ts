/**
 * Bối cảnh người học ở cửa xưởng Pro.
 *
 * Ba điều bài này canh:
 *  1. Hồ sơ sai hình bị từ chối KÈM TÊN TRƯỜNG — một lời từ chối chung chung
 *     buộc người gọi đoán, và đoán sai thì im lặng gửi hồ sơ rỗng.
 *  2. Khối lời nhắc TRỎ TÊN SKILL gói khung. Thiếu dòng ấy thì agent phải tự
 *     đoán gói nào liên quan, và nó sẽ đoán sai — mọi phép đo khác vẫn xanh.
 *  3. Bản chụp vắng → KHÔNG khối nào. Người chưa khai hồ sơ phải nhận đúng lời
 *     nhắc như trước vòng này.
 */
import { describe, expect, it, vi } from 'vitest';

const findPackMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/server/curriculum-packs', () => ({ findPack: findPackMock }));

import {
  LearnerShapeError,
  learnerPromptBlock,
  parseLearner,
} from '@/lib/server/agent-runtime/learner-context';

const ok = {
  nickname: 'Bi',
  gradeLabel: 'lớp 7',
  school: 'Emasi',
  subjects: [
    {
      subject: 'Toán',
      curriculum: 'cambridge-lower-secondary',
      language: 'en-US',
      textbook: "Learner's Book 8",
      packId: 'cambridge-lower-secondary-maths-8',
    },
  ],
};

describe('đọc hồ sơ từ thân yêu cầu', () => {
  it('hồ sơ đúng hình đi qua nguyên vẹn', () => {
    const got = parseLearner(ok);
    expect(got.nickname).toBe('Bi');
    expect(got.subjects[0].packId).toBe('cambridge-lower-secondary-maths-8');
  });

  it.each([
    ['root', 'không phải đối tượng', []],
    ['nickname', 'thiếu tên gọi', { ...ok, nickname: '' }],
    ['nickname', 'tên gọi quá dài', { ...ok, nickname: 'x'.repeat(41) }],
    ['gradeLabel', 'thiếu lớp', { ...ok, gradeLabel: undefined }],
    ['subjects', 'subjects không phải mảng', { ...ok, subjects: 'Toán' }],
    ['subjects', 'subjects rỗng', { ...ok, subjects: [] }],
    [
      'subjects[0].curriculum',
      'giáo trình không phải chuỗi',
      {
        ...ok,
        subjects: [{ subject: 'Toán', curriculum: 7, language: 'en-US' }],
      },
    ],
  ])('từ chối và NÊU TÊN TRƯỜNG %s (%s)', (field, _why, bad) => {
    let err: unknown;
    try {
      parseLearner(bad);
    } catch (e) {
      err = e;
    }
    expect(err, 'malformed learner accepted').toBeInstanceOf(LearnerShapeError);
    expect((err as LearnerShapeError).field).toBe(field);
  });
});

describe('khối người học trong lời nhắc hệ thống', () => {
  it('nêu bé, các môn, và TÊN SKILL gói phải đọc trước khi soạn', () => {
    findPackMock.mockReturnValue(null);
    const block = learnerPromptBlock(parseLearner(ok));
    expect(block).toContain('Bi');
    expect(block).toContain('lớp 7');
    expect(block, 'learner block does not name the curriculum pack skill').toContain(
      'cambridge-lower-secondary-maths-8',
    );
    expect(block).toContain('Toán');
  });

  it('môn chưa có gói: không dòng trỏ skill, nhưng khai đang đoán', () => {
    findPackMock.mockReturnValue(null);
    const moet = parseLearner({
      ...ok,
      subjects: [{ subject: 'Toán', curriculum: 'moet', language: 'vi-VN' }],
    });
    const block = learnerPromptBlock(moet);
    expect(block).not.toContain('đọc skill');
    expect(block, 'guess mode not declared for subject without pack').toContain(
      'chưa có gói khung',
    );
  });

  it('CHIỀU ĐỎ: không bản chụp → KHÔNG khối nào', () => {
    expect(learnerPromptBlock(null)).toBe('');
  });
});
