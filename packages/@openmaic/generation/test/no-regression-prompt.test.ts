/**
 * Không hồi quy: người dùng KHÔNG khai hồ sơ người học thì prompt phải giống
 * hệt trước vòng này — từng byte. Ảnh nền sinh bằng `scripts/pin-prompt-baseline.mjs`
 * trên commit nền của vòng; chính bộ ghim từ chối chạy nếu mặt prompt đã đổi
 * giữa commit nền và lúc ghim, nên một ảnh nền sinh muộn không tồn tại được.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, test } from 'vitest';

import { buildPrompt } from '../src/prompts/loader.js';
import { buildOutlinePrompt } from '../src/index.js';

const BASE_COMMIT = '40f1cf954f5d2a5b6593e5d1dfe0ef85a05b26f9';
const BASELINE = join(__dirname, '__baseline__', `prompts-${BASE_COMMIT.slice(0, 7)}.json`);

interface Baseline {
  base_commit: string;
  pinned_at_sha: string;
  prompt_surface_unchanged: boolean;
  outline: { system: string; user: string };
  outlineLegacyProfile: { system: string; user: string };
}

const baseline = JSON.parse(readFileSync(BASELINE, 'utf8')) as Baseline;

describe('prompt không hồi quy khi hồ sơ người học trống', () => {
  test('ảnh nền ghim ĐÚNG commit nền đã khai ở ô cơ hội', () => {
    expect(baseline.base_commit, 'baseline snapshot postdates the round').toBe(BASE_COMMIT);
    expect(
      baseline.prompt_surface_unchanged,
      'baseline snapshot postdates the round — mặt prompt đã đổi trước khi ghim',
    ).toBe(true);
  });

  test('yêu cầu trần: prompt bằng TỪNG BYTE với nền', () => {
    expect(
      buildOutlinePrompt(
        { requirement: 'Teach recursion to beginners' },
        { researchContext: '', teacherContext: '' },
      ),
    ).toEqual(baseline.outline);
  });

  test('đường biệt-danh-và-giới-thiệu cũ: không vỡ người dùng hôm nay', () => {
    expect(
      buildOutlinePrompt(
        { requirement: 'Dạy tỉ lệ và tỉ số', userNickname: 'Bi', userBio: 'học sinh lớp 7' },
        { researchContext: '', teacherContext: '' },
      ),
    ).toEqual(baseline.outlineLegacyProfile);
  });

  test('CHIỀU ĐỎ: ô template mới không có mặc định thì lộ ra ngay', () => {
    const { system, user } = buildOutlinePrompt({ requirement: 'x' }, {});
    for (const [name, text] of Object.entries({ system, user })) {
      const left = text.match(/\{\{[^}]+\}\}/g);
      expect(left, `unresolved template variable: ${left?.join(', ')} (trong ${name})`).toBeNull();
    }
  });

  test('ĐỐI CHỨNG DƯƠNG: ô có nội dung thì nội dung vào prompt thật', () => {
    const filled = buildPrompt('requirements-to-outlines', {
      requirement: 'tỉ lệ và tỉ số',
      curriculumContext: '## Khung giáo trình\n\n- Unit 3 — Tỉ lệ và tỉ số',
    });
    expect(filled?.user).toContain('Unit 3 — Tỉ lệ và tỉ số');
    // Cùng một dữ liệu dựng sẵn, bỏ ô đi thì dấu vết biến mất hoàn toàn —
    // đây là vế còn lại của cặp: rỗng không để lại gì, có thì mang đủ.
    const empty = buildPrompt('requirements-to-outlines', { requirement: 'tỉ lệ và tỉ số' });
    expect(empty?.user).not.toContain('Khung giáo trình');
  });
});
