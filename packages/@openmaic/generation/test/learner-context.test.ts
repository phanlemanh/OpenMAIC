import { describe, expect, test } from 'vitest';
import { formatLearnerContext, type LearnerContext } from '@openmaic/generation';

const BE: LearnerContext = {
  nickname: 'Bi',
  gradeLabel: 'lớp 7',
  school: 'Emasi',
  subjects: [
    {
      subject: 'Toán',
      curriculum: 'cambridge-lower-secondary',
      language: 'vi-VN',
      textbook: "Learner's Book 8",
      packId: 'cambridge-lower-secondary-maths-8',
    },
  ],
};

describe('formatLearnerContext', () => {
  test('hồ sơ trống cho ra chuỗi RỖNG — không khối, không hồi quy', () => {
    expect(formatLearnerContext(undefined)).toBe('');
    expect(formatLearnerContext({ nickname: '', gradeLabel: '', subjects: [] })).toBe('');
  });

  test('môn CÓ gói: khối nêu bé, lớp, môn và nhúng thân gói', () => {
    const out = formatLearnerContext(BE, '## Mạch\n- Unit 3 — Tỉ lệ và tỉ số');
    expect(out).toContain('Bi');
    expect(out).toContain('lớp 7');
    expect(out).toContain('Unit 3 — Tỉ lệ và tỉ số');
    expect(out).not.toContain('chưa có gói khung');
  });

  test('môn CHƯA có gói: khối khai đang đoán, đúng hai câu ghim', () => {
    const moet: LearnerContext = {
      ...BE,
      subjects: [{ subject: 'Toán', curriculum: 'moet', language: 'vi-VN' }],
    };
    const out = formatLearnerContext(moet);
    expect(out).toContain('chưa có gói khung');
    expect(out).toContain('neo chưa kiểm chứng');
  });

  test('CHIỀU ĐỎ: bỏ câu khai đang-đoán thì phép đo này phải đỏ', () => {
    // đối chứng dương ở trên; đây là vế phá vật: một hồ sơ KHÔNG có môn nào
    // thiếu gói thì tuyệt đối không được mang câu khai đoán.
    expect(formatLearnerContext(BE, '## Mạch')).not.toContain('chưa có gói khung');
  });
});
