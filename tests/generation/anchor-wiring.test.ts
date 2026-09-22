/**
 * Hai lỗ mà lượt nghiệm thu thứ nhất tìm ra, nay ghim thành thước.
 *
 * Cả hai cùng một hình dạng và cùng một hậu quả: thân gói khung ĐƯỢC đưa vào
 * lời nhắc — bài học thật sự có neo — nhưng câu neo không bao giờ về tới màn,
 * nên phụ huynh đọc đúng dòng cảnh báo «máy đang đoán, chưa phải một khớp đã
 * kiểm». Sai theo chiều nguy nhất: nói dối về chính độ tin của mình.
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

  it('MỌI khuôn dàn ý nhận thân gói đều PHẢI xin câu neo', () => {
    const templates = [
      'packages/@openmaic/generation/templates/requirements-to-outlines/user.md',
      'lib/prompts/templates/interactive-outlines/user.md',
      'lib/prompts/templates/task-engine-outlines/user.md',
    ];
    const thieu = templates.filter((p) => {
      const t = read(p);
      return t.includes('{{curriculumContext}}') && !t.includes('curriculumAnchor');
    });
    expect(thieu, `template nhận thân gói mà không xin câu neo: ${thieu.join(', ')}`).toEqual([]);
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
