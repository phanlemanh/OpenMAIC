/**
 * Hồ sơ người học sống trên KHOÁ HỌC, không trên yêu cầu.
 *
 * Yêu cầu chết khi trang đầu sinh xong; khoá học sống tới khi người dùng xoá
 * nó. Trước vòng này hồ sơ đi theo yêu cầu, nên trang 2 trở đi, lượt sinh lại
 * trong lớp học, và xưởng Pro mở lại khoá học đều không thấy bé. Bài này ghim
 * ba chỗ nối bằng lát cắt ĐÚNG khối mã, không soi cả tệp — tên trường xuất
 * hiện ở nhiều chỗ khác trong cùng tệp, nên soi cả tệp là xanh oan.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

describe('hồ sơ đóng lên khoá học', () => {
  it('màn xem trước ĐÓNG hồ sơ lên Stage, cạnh ngôn ngữ dạy', () => {
    const src = read('app/generation-preview/page.tsx');
    const start = src.indexOf('stage.languageDirective = languageDirective;');
    expect(start, 'không tìm thấy chỗ đóng ngôn ngữ dạy lên Stage').toBeGreaterThan(0);
    const end = src.indexOf('stage.name = courseTitle;', start);
    expect(end, 'không tìm thấy chỗ đặt tên khoá học').toBeGreaterThan(start);
    expect(src.slice(start, end), 'learner never stamped on the Stage').toContain(
      'stage.learner = currentSession.requirements.learner',
    );
  });

  it('túi tiếp-tục mang hồ sơ sang lớp học', () => {
    const src = read('app/generation-preview/page.tsx');
    const start = src.indexOf("'generationParams',");
    expect(start, 'không tìm thấy túi tiếp-tục').toBeGreaterThan(0);
    const literal = src.slice(start, src.indexOf('}),', start));
    expect(literal, 'continuation bag drops the learner').toContain('learner: stage.learner');
  });

  it('lớp học sinh tiếp đọc hồ sơ từ túi, rơi về Stage', () => {
    const src = read('components/classroom/ClassroomSurface.tsx');
    const start = src.indexOf('generateRemaining({');
    expect(start, 'không tìm thấy lời gọi sinh tiếp').toBeGreaterThan(0);
    const literal = src.slice(start, src.indexOf('});', start));
    expect(literal, 'classroom resume drops the learner').toContain(
      'learner: params.learner ?? stage.learner',
    );
  });

  it('xưởng Pro: công cụ sinh trang ưu tiên hồ sơ trên Stage rồi mới tới hồ sơ chủ sở hữu', () => {
    const src = read('lib/server/agent-runtime/generation-tools.ts');
    const start = src.indexOf('content = await generateSceneContent(');
    expect(start, 'không tìm thấy lời gọi sinh nội dung trang').toBeGreaterThan(0);
    const literal = src.slice(start, src.indexOf('});', start));
    expect(literal, 'learner dropped between the runner and page generation').toContain(
      'learner: doc.stage.learner ?? deps.learner',
    );
  });
});
