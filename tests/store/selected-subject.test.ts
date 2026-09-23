/**
 * Môn đang soạn — bốn nhánh, và nhánh thứ tư là nhánh dễ sót: môn đang được
 * nhớ bị xoá khỏi hồ sơ. Trả thẳng thứ đang nhớ là gửi một mã mồ côi vào yêu
 * cầu soạn, rồi route tra gói cho một môn không còn tồn tại.
 */
import { describe, expect, it } from 'vitest';

import { resolveSelectedSubject, subjectKey, withChosenFirst } from '@/lib/store/selected-subject';

const toan = { subject: 'Toán', curriculum: 'cambridge-lower-secondary', language: 'en-US' };
const ly = { subject: 'Lý', curriculum: 'moet', language: 'vi-VN' };
const be = (subjects: (typeof toan)[]) => ({ nickname: 'Bi', gradeLabel: 'lớp 7', subjects });

describe('môn đang soạn', () => {
  it('hồ sơ trống: không môn nào', () => {
    expect(resolveSelectedSubject(null, null)).toBeNull();
    expect(resolveSelectedSubject(be([]), null)).toBeNull();
  });

  it('một môn: chính môn đó, bất kể đang nhớ gì', () => {
    expect(resolveSelectedSubject(be([toan]), null)?.subject).toBe('Toán');
    expect(resolveSelectedSubject(be([toan]), 'Lý::moet')?.subject).toBe('Toán');
  });

  it('nhiều môn, lựa chọn nhớ còn hợp lệ: giữ nguyên', () => {
    expect(resolveSelectedSubject(be([toan, ly]), subjectKey(ly))?.subject).toBe('Lý');
  });

  it('CHIỀU ĐỎ: môn đang nhớ đã bị xoá → rơi về môn còn lại, không trả mã mồ côi', () => {
    const got = resolveSelectedSubject(be([toan]), subjectKey(ly));
    expect(got?.subject, 'remembered subject survived its own deletion').toBe('Toán');
    expect(subjectKey(got!)).not.toBe(subjectKey(ly));
  });

  it('dòng môn khai thiếu thì không được chọn — khối hồ sơ sẽ nói dối là đã neo', () => {
    const thieu = { subject: 'Toán', curriculum: '', language: 'en-US' };
    expect(resolveSelectedSubject(be([thieu]), null)).toBeNull();
  });
});

describe('lựa chọn đi tới máy chủ bằng THỨ TỰ, không bằng chỉ số riêng', () => {
  it('môn đang chọn lên đầu, các môn còn lại vẫn đi theo', () => {
    const hs = be([toan, ly]);
    const out = withChosenFirst(hs, ly);
    expect(out.subjects.map((s) => s.subject)).toEqual(['Lý', 'Toán']);
  });

  it('không chọn gì thì giữ nguyên thứ tự — không xáo hồ sơ của người', () => {
    const hs = be([toan, ly]);
    expect(withChosenFirst(hs, null).subjects.map((s) => s.subject)).toEqual(['Toán', 'Lý']);
  });

  it('CHIỀU ĐỎ: môn được chọn không còn trong hồ sơ → giữ nguyên, không chèn bừa', () => {
    const hs = be([toan]);
    const out = withChosenFirst(hs, ly);
    expect(out.subjects, 'a deleted subject was injected back into the profile').toHaveLength(1);
    expect(out.subjects[0].subject).toBe('Toán');
  });
});
