/**
 * Hồ sơ người học và thân gói khung đi vào prompt dàn ý qua ĐÚNG MỘT bộ định
 * dạng, và mô hình có đường trả lại một câu neo. Ba bản chép tay trước đây của
 * đường soạn phải biến mất — bài kiểm soi thẳng mã nguồn cho điều đó, vì một
 * bản chép còn sót không làm prompt sai ngay, nó chỉ lệch khi ai đó sửa một chỗ.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, test } from 'vitest';

import { buildOutlinePrompt, formatLearnerContext, type LearnerContext } from '../src';
import { generateSceneOutlinesFromRequirements } from '../src/outline-generator';

const BE: LearnerContext = {
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
const PACK = '## Mạch và unit\n\n- Unit 3 — Tỉ lệ và tỉ số';

describe('bối cảnh người học vào prompt dàn ý', () => {
  test('khối hồ sơ và thân gói cùng có mặt, và đến từ bộ định dạng chung', () => {
    const { user } = buildOutlinePrompt(
      { requirement: 'tỉ lệ và tỉ số', learner: BE },
      { curriculumContext: PACK },
    );
    expect(user).toContain(formatLearnerContext(BE).trim());
    expect(user).toContain('Unit 3 — Tỉ lệ và tỉ số');
  });

  test('CHIỀU ĐỎ: bỏ hồ sơ khỏi yêu cầu thì khối biến mất hoàn toàn', () => {
    const { user } = buildOutlinePrompt({ requirement: 'tỉ lệ và tỉ số' }, {});
    expect(user, 'learner dropped between request and outline prompt').not.toContain('Bi');
    expect(user).not.toContain('Unit 3');
  });

  test('câu neo mô hình trả về được mang ra ngoài', async () => {
    const res = await generateSceneOutlinesFromRequirements(
      { requirement: 'tỉ lệ và tỉ số', learner: BE },
      undefined,
      undefined,
      async () =>
        JSON.stringify({
          languageDirective: 'Teach in Vietnamese.',
          courseTitle: 'Tỉ lệ và tỉ số',
          curriculumAnchor: 'Bài này theo Unit 3 — Tỉ lệ và tỉ số',
          outlines: [{ type: 'slide', title: 'Mở đầu', description: 'x', keyPoints: ['a'] }],
        }),
      { curriculumContext: PACK },
    );
    expect(res.success).toBe(true);
    expect(res.data?.curriculumAnchor, 'curriculumAnchor was dropped by the generator').toBe(
      'Bài này theo Unit 3 — Tỉ lệ và tỉ số',
    );
  });

  test('mô hình KHÔNG trả câu neo thì không có gì, và không lỗi', async () => {
    const res = await generateSceneOutlinesFromRequirements(
      { requirement: 'x' },
      undefined,
      undefined,
      async () => JSON.stringify({ languageDirective: 'vi', outlines: [] }),
    );
    expect(res.success).toBe(true);
    expect(res.data?.curriculumAnchor).toBeUndefined();
  });

  test('đường soạn chỉ còn MỘT chỗ dựng khối hồ sơ — prompt-formatters', () => {
    const root = join(__dirname, '..', '..', '..', '..');
    const soanThao = [
      'packages/@openmaic/generation/src/outline-generator.ts',
      'app/api/generate/scene-outlines-stream/route.ts',
      'app/generation-preview/page.tsx',
    ];
    const conChepTay = soanThao.filter((f) =>
      /## Student Profile|`Student: \$\{/.test(readFileSync(join(root, f), 'utf8')),
    );
    expect(
      conChepTay,
      `learner context diverged from the shared formatter: ${conChepTay.join(', ')}`,
    ).toEqual([]);
  });
});
