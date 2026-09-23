/**
 * Nội dung slide và quiz nhận bối cảnh người học từ CÙNG bộ định dạng với
 * prompt dàn ý — so bằng chuỗi con, không bằng ba bản vàng riêng, vì ba bản
 * vàng riêng chính là cách ba đường lặng lẽ nói ba kiểu về cùng một đứa trẻ.
 */
import { describe, expect, test, vi } from 'vitest';

import { formatLearnerContext, type LearnerContext } from '../src/index.js';
import { generateSceneContent } from '../src/scene-generator.js';
import type { SceneOutline } from '../src/outline-types.js';

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

const slideOutline: SceneOutline = {
  id: 's1',
  type: 'slide',
  title: 'Tỉ lệ và tỉ số',
  description: 'Mở đầu',
  keyPoints: ['a', 'b'],
  order: 1,
};
const quizOutline: SceneOutline = { ...slideOutline, id: 'q1', type: 'quiz' };

function spyCall() {
  const seen: string[] = [];
  const aiCall = vi.fn(async (system: string, user: string) => {
    seen.push(`${system}\n${user}`);
    return JSON.stringify({ elements: [], questions: [] });
  });
  return { aiCall, seen };
}

describe('bối cảnh người học tới nội dung slide và quiz', () => {
  test('slide: khối hồ sơ trong prompt, đúng chuỗi bộ định dạng chung sinh', async () => {
    const { aiCall, seen } = spyCall();
    await generateSceneContent(slideOutline, aiCall, {
      userRequirements: { requirement: 'x', learner: BE },
    });
    expect(
      seen[0],
      'learner context diverged from the shared formatter: generateSlideContent',
    ).toContain(formatLearnerContext(BE).trim());
  });

  test('quiz: khối hồ sơ trong prompt, cùng chuỗi ấy', async () => {
    const { aiCall, seen } = spyCall();
    await generateSceneContent(quizOutline, aiCall, {
      userRequirements: { requirement: 'x', learner: BE },
    });
    expect(
      seen[0],
      'learner context diverged from the shared formatter: generateQuizContent',
    ).toContain(formatLearnerContext(BE).trim());
  });

  test('CHIỀU ĐỎ: không hồ sơ thì hai prompt không mang dấu vết nào', async () => {
    for (const outline of [slideOutline, quizOutline]) {
      const { aiCall, seen } = spyCall();
      await generateSceneContent(outline, aiCall, {});
      expect(seen[0]).not.toContain('Bi');
      expect(seen[0]).not.toContain('Student Profile');
    }
  });
});
