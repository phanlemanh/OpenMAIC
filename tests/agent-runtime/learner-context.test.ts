/**
 * Bối cảnh người học ở cửa xưởng Pro.
 *
 * Bốn điều bài này canh:
 *  1. Máy chủ đọc hồ sơ từ CHÍNH kho mà trình duyệt ghi — ngăn tài khoản, khoá
 *     `learner-profile-storage` — và bóc đúng phong bì của zustand `persist`.
 *     Không có bản chụp thứ hai: một khoá mồ côi là thứ «Xoá bộ nhớ đệm»
 *     không với tới (lỗi vòng nghiệm thu thứ ba).
 *  2. Hồ sơ sai hình bị từ chối KÈM TÊN TRƯỜNG — một lời từ chối chung chung
 *     buộc người gọi đoán, và đoán sai thì im lặng gửi hồ sơ rỗng.
 *  3. Khối lời nhắc TRỎ TÊN SKILL gói khung. Thiếu dòng ấy thì agent phải tự
 *     đoán gói nào liên quan, và nó sẽ đoán sai — mọi phép đo khác vẫn xanh.
 *  4. Hồ sơ vắng → KHÔNG khối nào. Người chưa khai hồ sơ phải nhận đúng lời
 *     nhắc như trước vòng này.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const findPackMock = vi.hoisted(() => vi.fn());
const kvGetMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/server/curriculum-packs', () => ({ findPack: findPackMock }));
vi.mock('@/lib/persistence/server-provider', () => ({
  getServerPersistenceProvider: async () => ({ kvStore: { get: kvGetMock } }),
}));

import {
  LearnerShapeError,
  learnerPromptBlock,
  parseLearner,
  readLearnerProfileForOwner,
  unwrapStoredLearner,
} from '@/lib/server/agent-runtime/learner-context';
import { LEARNER_PROFILE_STORE_NAME } from '@/lib/store/learner-profile-key';

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

describe('đọc hồ sơ từ một giá trị chưa tin được', () => {
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

describe('máy chủ đọc hồ sơ từ ngăn tài khoản của chủ sở hữu', () => {
  beforeEach(() => {
    kvGetMock.mockReset();
  });

  it('bóc đúng phong bì zustand persist: { state: { learner }, version }', () => {
    expect(unwrapStoredLearner({ state: { learner: ok }, version: 0 })).toEqual(parseLearner(ok));
  });

  it.each([
    ['khoá vắng', null],
    ['phong bì lạ', 'Bi'],
    ['không có state', {}],
    ['hồ sơ đã xoá', { state: { learner: null }, version: 0 }],
    ['hồ sơ sai hình trong kho', { state: { learner: { ...ok, nickname: '' } }, version: 0 }],
  ])('%s → không hồ sơ, không lỗi', (_why, stored) => {
    expect(unwrapStoredLearner(stored), 'stored profile envelope misread').toBeNull();
  });

  it('đọc ĐÚNG khoá kho hồ sơ, ở ngăn account, của đúng chủ sở hữu', async () => {
    kvGetMock.mockResolvedValue({ state: { learner: ok }, version: 0 });
    const got = await readLearnerProfileForOwner('postgres://x', 'anon:abc');
    expect(kvGetMock, 'server reads a key other than the profile store').toHaveBeenCalledWith(
      'anon:abc',
      LEARNER_PROFILE_STORE_NAME,
      'account',
    );
    expect(got?.nickname).toBe('Bi');
  });

  it('kho trống → null', async () => {
    kvGetMock.mockResolvedValue(null);
    expect(await readLearnerProfileForOwner('postgres://x', 'anon:abc')).toBeNull();
  });

  it('máy chủ và trình duyệt cùng MỘT tên kho', async () => {
    const { useLearnerProfileStore } = await import('@/lib/store/learner-profile');
    expect(
      useLearnerProfileStore.persist.getOptions().name,
      'server and browser disagree on the profile store name',
    ).toBe(LEARNER_PROFILE_STORE_NAME);
  });

  it('CHIỀU ĐỎ: không mã nào còn nhắc tới khoá bản chụp mồ côi', () => {
    const root = process.cwd();
    const files = [
      'lib/server/agent-runtime/learner-context.ts',
      'lib/server/agent-runtime/runner.ts',
      'app/api/agent/sessions/route.ts',
      'lib/workbench/session-store.ts',
    ];
    const conNhac = files.filter((f) =>
      readFileSync(join(root, f), 'utf8').includes('learner-profile.snapshot'),
    );
    expect(conNhac, `orphan learner snapshot key still referenced: ${conNhac.join(', ')}`).toEqual(
      [],
    );
    // Và client không còn gửi hồ sơ kèm yêu cầu mở phiên — nguồn duy nhất là kho.
    expect(
      readFileSync(join(root, 'lib/workbench/session-store.ts'), 'utf8'),
      'client still ships the profile on session open',
    ).not.toContain('useLearnerProfileStore');
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

  it('CHIỀU ĐỎ: không hồ sơ → KHÔNG khối nào', () => {
    expect(learnerPromptBlock(null)).toBe('');
  });
});
