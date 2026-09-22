/**
 * Câu neo đi trọn đường tới màn — và chỉ có MỘT nguồn.
 *
 * Lượt nghiệm thu thứ nhất tìm ra hai lỗ cùng hình dạng: thân gói ĐƯỢC đưa
 * vào lời nhắc — bài học thật sự có neo — nhưng câu neo không bao giờ về tới
 * màn, nên phụ huynh đọc đúng dòng cảnh báo «máy đang đoán». Sai theo chiều
 * nguy nhất: nói dối về chính độ tin của mình.
 *
 * Ba vòng sau đó thêm một lớp lỗi nữa: câu neo XIN MÔ HÌNH qua bốn khuôn lời
 * nhắc viết tay, và «khuôn này nói ba khoá, khuôn kia nói bốn» không bao giờ
 * đóng được. Lối A gỡ hẳn: câu neo suy trong code từ gói + dàn ý. Bài này ghim
 * cả hai — đường tới màn còn nguyên, và không khuôn nào còn hỏi mô hình.
 *
 * Bài này soi CẤU TRÚC (mã nguồn và khuôn lời nhắc) chứ không chạy giao diện,
 * vì lỗ nằm ở chỗ nối chứ không ở hành vi một thành phần — và một thành phần
 * đúng nối vào một chỗ sai thì bài kiểm thành phần vẫn xanh.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');

const OUTLINE_TEMPLATES = [
  'packages/@openmaic/generation/templates/requirements-to-outlines/user.md',
  'packages/@openmaic/generation/templates/requirements-to-outlines/system.md',
  'lib/prompts/templates/interactive-outlines/user.md',
  'lib/prompts/templates/interactive-outlines/system.md',
  'lib/prompts/templates/task-engine-outlines/user.md',
  'lib/prompts/templates/task-engine-outlines/system.md',
];

describe('câu neo đi trọn đường tới màn', () => {
  it('trang xem trước GHI câu neo vào phiên — không chỉ bắt rồi bỏ', () => {
    const src = read('app/generation-preview/page.tsx');
    // Rút ĐÚNG khối gán của updatedSession — chỗ duy nhất ghi phiên. Cắt rộng
    // hơn là bắt nhầm: tên trường cũng xuất hiện ở lượt rút biến phía trên, nên
    // một lát cắt rộng vẫn xanh khi chính chỗ ghi đã đánh rơi nó.
    // Tệp có ba chỗ ghi phiên; đây là chỗ ghi KẾT QUẢ DÀN Ý (chỗ duy nhất có
    // chú kiểu GenerationSessionState). Bắt bằng tên trần là bắt nhầm chỗ ghi
    // dữ liệu tài liệu ở trên và thước sẽ đỏ oan.
    const start = src.indexOf('const updatedSession: GenerationSessionState');
    expect(start, 'không tìm thấy chỗ ghi phiên').toBeGreaterThan(0);
    const literal = src.slice(start, src.indexOf('};', start));
    expect(
      literal,
      'curriculumAnchor was parsed from the stream but never stored on the session',
    ).toContain('curriculumAnchor,');
  });

  it('đường dự phòng (luồng kết không có sự kiện done) cũng mang câu neo', () => {
    const src = read('app/generation-preview/page.tsx');
    const i = src.indexOf('courseTitle: title,');
    expect(i, 'không tìm thấy đường dự phòng').toBeGreaterThan(0);
    // Đối xứng với courseTitle: bản đầu mang title mà bỏ neo.
    expect(
      src.slice(i, i + 400),
      'the fallback resolve carries courseTitle but drops curriculumAnchor',
    ).toContain('curriculumAnchor');
  });

  it('KHÔNG khuôn dàn ý nào còn xin mô hình câu neo', () => {
    // Chiều đỏ của lối A: một khuôn xin lại khoá thứ tư là mở lại đúng lớp
    // lỗi «khuôn tự mâu thuẫn» đã đóng — dù mọi phép đo hành vi vẫn xanh, vì
    // route không đọc thứ mô hình trả.
    const conXin = OUTLINE_TEMPLATES.filter((p) => read(p).includes('curriculumAnchor'));
    expect(
      conXin,
      `template still asks the model for curriculumAnchor: ${conXin.join(', ')}`,
    ).toEqual([]);
  });

  it('route SUY câu neo trong code, không cào đầu ra mô hình', () => {
    const src = read('app/api/generate/scene-outlines-stream/route.ts')
      .replace(/\/\/[^\n]*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    expect(src, 'route does not derive the anchor from the pack').toContain(
      'deriveCurriculumAnchor(',
    );
    // Soi LỜI GỌI và biểu thức cào, không soi chữ trong chú thích.
    expect(src, 'anchor scraped from model output').not.toMatch(
      /"curriculumAnchor"\s*:|extractCurriculumAnchor\(|CURRICULUM_ANCHOR_RE/,
    );
  });

  it('bộ sinh dàn ý không còn đọc khoá curriculumAnchor từ mô hình', () => {
    const src = read('packages/@openmaic/generation/src/outline-generator.ts')
      .replace(/\/\/[^\n]*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    expect(src, 'generator still parses a model anchor').not.toContain('curriculumAnchor');
  });

  it('dòng cảnh báo «đang đoán» KHÔNG lộ mã giáo trình cho phụ huynh', () => {
    const src = read('app/generation-preview/page.tsx');
    const i = src.indexOf('guessingFor={');
    expect(i, 'không tìm thấy chỗ truyền giáo trình vào dòng cảnh báo').toBeGreaterThan(0);
    expect(
      src.slice(i, i + 900),
      'the guessing banner renders the raw curriculum slug to the parent',
    ).toContain('home.learnerInvite.curriculum.');
  });

  it('nhãn ô chọn môn nêu ĐỦ môn — chương trình (ngôn ngữ) như hợp đồng khai', () => {
    const src = read('components/generation/learner-subject-picker.tsx');
    // Soi ĐÚNG chuỗi nhãn, không soi cả tệp: `s.language` cũng có trong bộ lọc
    // dòng môn hợp lệ phía trên, nên soi cả tệp vẫn xanh khi nhãn đã rơi mất.
    const i = src.indexOf('${s.subject} —');
    expect(i, 'không tìm thấy chuỗi nhãn của ô chọn môn').toBeGreaterThan(0);
    expect(src.slice(i, i + 220), 'subject picker label drops the language').toContain(
      's.language',
    );
  });
});
