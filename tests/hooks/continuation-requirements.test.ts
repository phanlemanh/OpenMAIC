/**
 * Hồ sơ người học đi tới TỪNG trang sinh tiếp trong lớp học — không chỉ trang
 * đầu. Lỗi HIGH của vòng nghiệm thu thứ ba: hai chỗ gọi sinh-tiếp tự dựng
 * `requirements` bằng tay và chỉ mang cờ task-engine, nên trang 2 trở đi soạn
 * cho một học sinh chung chung trong khi trang 1 soạn cho Bi.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { continuationRequirements } from '@/lib/hooks/continuation-requirements';

const BI = {
  nickname: 'Bi',
  gradeLabel: 'lớp 7',
  subjects: [{ subject: 'Toán', curriculum: 'cambridge-lower-secondary', language: 'en-US' }],
};

describe('requirements của trang sinh tiếp', () => {
  it('mang hồ sơ khi khoá học có hồ sơ', () => {
    expect(continuationRequirements({ learner: BI })).toEqual({ requirements: { learner: BI } });
  });

  it('mang cả cờ task-engine lẫn hồ sơ khi có cả hai', () => {
    expect(continuationRequirements({ taskEngineMode: true, learner: BI })).toEqual({
      requirements: { taskEngineMode: true, learner: BI },
    });
  });

  it('CHIỀU ĐỎ: không hồ sơ, không cờ → không trường requirements nào (y như trước vòng)', () => {
    expect(continuationRequirements({})).toEqual({});
    expect(continuationRequirements({ taskEngineMode: false })).toEqual({});
  });

  it('CẢ HAI chỗ gọi sinh-tiếp trong hook đi qua hàm này, không tự dựng', () => {
    const src = readFileSync(join(process.cwd(), 'lib/hooks/use-scene-generator.ts'), 'utf8');
    // Đếm ĐÚNG lời gọi trong hai khối fetchSceneContent — chỗ duy nhất một
    // trang sinh tiếp được gửi đi. Một bản chép tay còn sót là một chỗ hồ sơ
    // rơi mất mà mọi phép đo hàm thuần ở trên vẫn xanh.
    const calls = src.split('fetchSceneContent(').slice(1);
    const continuation = calls.filter((c) => c.includes('...continuationRequirements(params)'));
    expect(
      continuation.length,
      'continuation call site builds its own requirements',
    ).toBeGreaterThanOrEqual(2);
    expect(src, 'continuation call site builds its own requirements').not.toContain(
      'requirements: { taskEngineMode: true }',
    );
  });
});
