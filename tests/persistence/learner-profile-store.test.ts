/**
 * Hồ sơ người học đi theo TÀI KHOẢN, và danh sách xoá rút từ SỔ ĐĂNG KÝ.
 *
 * Hai lớp lỗi đã xảy ra thật ở vòng trước, nên mỗi lớp có một vế phá vật:
 * trạng thái gói bị đóng băng vào hồ sơ lúc lưu (rồi lệch mãi mãi), và một kho
 * account mới bị bỏ quên khỏi danh sách xoá chép tay.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isCompleteLearner } from '@/lib/store/learner-profile';

const FULL = {
  nickname: 'Bi',
  gradeLabel: 'lớp 7',
  school: 'Emasi',
  subjects: [{ subject: 'Toán', curriculum: 'cambridge-lower-secondary', language: 'en-US' }],
};

describe('hồ sơ người học', () => {
  it('đủ ba phần bắt buộc mới là hợp lệ', () => {
    expect(isCompleteLearner(FULL)).toBe(true);
    expect(isCompleteLearner({ ...FULL, nickname: '' })).toBe(false);
    expect(isCompleteLearner({ ...FULL, gradeLabel: '' })).toBe(false);
    expect(isCompleteLearner({ ...FULL, subjects: [] })).toBe(false);
    expect(
      isCompleteLearner({
        ...FULL,
        subjects: [{ subject: 'Toán', curriculum: '', language: 'en-US' }],
      }),
    ).toBe(false);
  });

  it('CHIỀU ĐỎ: trạng thái gói KHÔNG được ghi cứng vào hồ sơ lúc lưu', () => {
    const src = readFileSync(join(process.cwd(), 'lib/store/learner-profile.ts'), 'utf8');
    expect(src, 'pack match frozen into the stored profile').not.toMatch(
      /findPack|curriculum-packs/,
    );
  });

  it('danh sách xoá bộ nhớ đệm rút từ sổ đăng ký, không chép tay', () => {
    const src = readFileSync(
      join(process.cwd(), 'components/settings/general-settings.tsx'),
      'utf8',
    );
    expect(src, 'clear-cache skipped an account store: hand-written list').toContain(
      'ACCOUNT_SCOPE_STORES',
    );
    expect(src).not.toMatch(/clearPersistedStore\(\s*useSettingsStore\.persist/);
  });
});
