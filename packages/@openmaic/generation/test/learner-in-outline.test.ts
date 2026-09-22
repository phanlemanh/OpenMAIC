/**
 * Hồ sơ người học và thân gói khung đi vào prompt dàn ý qua ĐÚNG MỘT bộ định
 * dạng. Ba bản chép tay trước đây của đường soạn phải biến mất — bài kiểm soi
 * thẳng mã nguồn cho điều đó, vì một bản chép còn sót không làm prompt sai
 * ngay, nó chỉ lệch khi ai đó sửa một chỗ.
 *
 * Câu neo KHÔNG còn đi qua mô hình: máy chủ suy nó từ gói + dàn ý. Bộ sinh này
 * vì thế không được đọc một khoá `curriculumAnchor` mô hình tự trả — đọc là mở
 * lại đường mà ba vòng nghiệm thu không đóng được.
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

  test('mô hình tự trả curriculumAnchor → bộ sinh BỎ QUA, kết quả không mang khoá ấy', async () => {
    const res = await generateSceneOutlinesFromRequirements(
      { requirement: 'tỉ lệ và tỉ số', learner: BE },
      undefined,
      undefined,
      async () =>
        JSON.stringify({
          languageDirective: 'Teach in Vietnamese.',
          courseTitle: 'Tỉ lệ và tỉ số',
          curriculumAnchor: 'Stage 8 objective 8Nf.01',
          outlines: [{ type: 'slide', title: 'Mở đầu', description: 'x', keyPoints: ['a'] }],
        }),
      { curriculumContext: PACK },
    );
    expect(res.success).toBe(true);
    expect(res.data, 'generator still parses a model anchor').not.toHaveProperty(
      'curriculumAnchor',
    );
    expect(res.data?.courseTitle).toBe('Tỉ lệ và tỉ số');
  });

  test('prompt dàn ý không còn xin mô hình câu neo, kể cả khi có thân gói', () => {
    const { system, user } = buildOutlinePrompt(
      { requirement: 'tỉ lệ và tỉ số', learner: BE },
      { curriculumContext: PACK },
    );
    expect(
      `${system}\n${user}`,
      'template still asks the model for curriculumAnchor',
    ).not.toContain('curriculumAnchor');
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
