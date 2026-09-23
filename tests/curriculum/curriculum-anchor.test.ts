/**
 * Câu neo suy trong code — đo được không cần mô hình.
 *
 * Ba vòng trước hỏi mô hình trả khoá `curriculumAnchor` và lớp lỗi «khuôn này
 * nói ba khoá, khuôn kia nói bốn» không bao giờ đóng. Giờ câu neo có đúng một
 * nguồn: gói đã khớp + đề + dàn ý. Luật chữ của đặc tả UX: tên unit trước, tên
 * sách sau, không chữ «Stage», không mã mục tiêu.
 */
import { describe, expect, it } from 'vitest';

import { deriveCurriculumAnchor, matchUnit, unitPhrases } from '@/lib/server/curriculum-anchor';

const BOOK = "Cambridge Lower Secondary Mathematics Learner's Book 8";
const PACK = {
  language: 'en-US',
  textbooks: [BOOK],
  units: [
    { n: 5, en: 'Angles and constructions', vi: 'Góc và dựng hình' },
    { n: 10, en: 'Percentages', vi: 'Phần trăm' },
    { n: 12, en: 'Ratio and proportion', vi: 'Tỉ số và tỉ lệ' },
  ],
};

describe('cụm neo của một unit', () => {
  it('tách theo «and» / «và» / dấu phẩy, bỏ chữ dừng', () => {
    expect(unitPhrases({ n: 12, en: 'Ratio and proportion', vi: 'Tỉ số và tỉ lệ' })).toEqual([
      'ratio',
      'proportion',
      'tỉ số',
      'tỉ lệ',
    ]);
  });
});

describe('câu neo', () => {
  it('đề tiếng Việt khớp unit qua tên tiếng Việt; câu neo bằng ngôn ngữ của môn (en-US)', () => {
    const anchor = deriveCurriculumAnchor({
      pack: PACK,
      requirement: 'tỉ lệ và tỉ số',
      outlines: [],
      language: 'en-US',
    });
    expect(anchor, 'anchor names the wrong unit').toBe(`Unit 12 · Ratio and proportion — ${BOOK}`);
  });

  it('môn học bằng tiếng Việt → tên unit tiếng Việt', () => {
    const anchor = deriveCurriculumAnchor({
      pack: PACK,
      requirement: 'tỉ lệ và tỉ số',
      outlines: [],
      language: 'vi-VN',
    });
    expect(anchor).toBe(`Unit 12 · Tỉ số và tỉ lệ — ${BOOK}`);
  });

  it('đề mơ hồ, dàn ý nói rõ → unit lấy từ dàn ý', () => {
    const anchor = deriveCurriculumAnchor({
      pack: PACK,
      requirement: 'ôn tập tuần này',
      outlines: [{ title: 'Percentages of amounts', description: 'find 15% of 80' }],
    });
    expect(anchor).toBe(`Unit 10 · Percentages — ${BOOK}`);
  });

  it('nhiều unit chạm, unit khớp NHIỀU cụm hơn thắng', () => {
    // «góc» chạm unit 5 (1 cụm); «ratio» + «proportion» chạm unit 12 (2 cụm).
    const unit = matchUnit(PACK.units, 'góc nhìn về ratio and proportion');
    expect(unit?.n, 'anchor names the wrong unit').toBe(12);
  });

  it('CHIỀU ĐỎ (vòng 4): chữ ngắn lọt trong cụm khác KHÔNG ghi điểm — «hình vẽ» không phải «Hình và đối xứng»', () => {
    // Ca hội đồng vòng 4 tìm ra trên gói thật: đề «ôn tập xác suất», một cảnh
    // «Dùng hình vẽ minh hoạ các khả năng xảy ra» → bản cũ trả Unit 8 (Hình và
    // đối xứng) vì «hình» là chuỗi con của «hình vẽ» và unit 8 đứng trước unit 13.
    const units = [
      { n: 8, en: 'Shapes and symmetry', vi: 'Hình và đối xứng' },
      { n: 13, en: 'Probability', vi: 'Xác suất' },
    ];
    const anchor = deriveCurriculumAnchor({
      pack: { language: 'vi-VN', textbooks: [BOOK], units },
      requirement: 'ôn tập xác suất cho bé',
      outlines: [{ title: 'Khả năng', description: 'Dùng hình vẽ minh hoạ các khả năng xảy ra' }],
      language: 'vi-VN',
    });
    expect(anchor, 'anchor names the wrong unit').toBe(`Unit 13 · Xác suất — ${BOOK}`);
  });

  it('CHIỀU ĐỎ (vòng 4): hai unit hoà điểm → KHÔNG để thứ tự mục lục quyết, chỉ nêu tên sách', () => {
    // Hai unit, mỗi unit khớp đúng MỘT chữ — điểm bằng nhau, không có căn cứ
    // nào để chọn; bản cũ chọn unit đứng trước trong mục lục và nói chắc.
    const units = [
      { n: 11, en: 'Graphs', vi: 'Đồ thị' },
      { n: 13, en: 'Probability', vi: 'Xác suất' },
    ];
    const anchor = deriveCurriculumAnchor({
      pack: { language: 'en-US', textbooks: [BOOK], units },
      requirement: 'probability and graphs',
      outlines: [],
    });
    expect(anchor, 'anchor names the wrong unit').toBe(BOOK);
  });

  it('cụm trọn chữ vẫn khớp khi đứng giữa câu, kể cả có dấu câu quanh', () => {
    expect(matchUnit(PACK.units, 'Bài 3: tỉ số, tỉ lệ và ứng dụng.')?.n).toBe(12);
    expect(matchUnit(PACK.units, 'Percentages: finding 15% of 80')?.n).toBe(10);
  });

  it('CHIỀU ĐỎ: không unit nào khớp → chỉ tên sách, KHÔNG bịa unit', () => {
    const anchor = deriveCurriculumAnchor({
      pack: PACK,
      requirement: 'chuẩn bị thi cuối kỳ',
      outlines: [{ title: 'Mở đầu', description: 'ôn tập chung' }],
    });
    expect(anchor).toBe(BOOK);
    expect(anchor, 'anchor invented a unit the outline never mentions').not.toContain('Unit');
  });

  it('không chữ «Stage», không mở đầu bằng mã — ở cả hai dạng', () => {
    for (const requirement of ['tỉ lệ và tỉ số', 'không khớp gì']) {
      const anchor = deriveCurriculumAnchor({ pack: PACK, requirement, outlines: [] })!;
      expect(anchor, 'anchor exposes a framework stage to the parent').not.toMatch(/\bStage\b/);
      expect(anchor, 'anchor opens with a code').toMatch(/^(Unit \d+ · |Cambridge)/);
    }
  });

  it('gói không có sách → null (không câu rỗng)', () => {
    expect(
      deriveCurriculumAnchor({
        pack: { language: 'en-US', textbooks: [], units: PACK.units },
        requirement: 'tỉ lệ',
        outlines: [],
      }),
    ).toBeNull();
  });
});
