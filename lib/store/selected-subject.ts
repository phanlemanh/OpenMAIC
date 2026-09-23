/**
 * Môn đang được chọn để soạn — lựa chọn của MÁY NÀY, không đi theo người.
 *
 * Vì sao theo máy: đây là «tôi đang soạn môn gì lúc này», không phải một sự
 * thật về đứa trẻ. Hồ sơ bé đi theo người; con trỏ này ở lại cùng cái máy,
 * y như các công tắc khác của trang chủ.
 *
 * Hàm dưới đây THUẦN và là nơi duy nhất trả lời «rốt cuộc đang soạn môn nào»,
 * vì câu trả lời có một ca dễ sót: môn đang được nhớ bị xoá khỏi hồ sơ. Trả
 * thẳng thứ đang nhớ mà không kiểm còn tồn tại là gửi đi một mã mồ côi.
 */
import type { LearnerContext, LearnerSubject } from '@openmaic/generation';

export const SELECTED_SUBJECT_STORAGE_KEY = 'selectedLearnerSubject';

/** Khoá nhận dạng một dòng môn trong hồ sơ. Hồ sơ không có id nên dựng từ nội dung. */
export function subjectKey(s: Pick<LearnerSubject, 'subject' | 'curriculum'>): string {
  return `${s.subject}::${s.curriculum}`;
}

/**
 * Môn sẽ được soạn, theo thứ tự: lựa chọn đang nhớ nếu nó CÒN trong hồ sơ →
 * môn đầu tiên còn lại → không có môn nào.
 */
export function resolveSelectedSubject(
  learner: LearnerContext | null | undefined,
  remembered: string | null | undefined,
): LearnerSubject | null {
  const subjects = learner?.subjects?.filter((s) => s?.subject && s?.curriculum && s?.language);
  if (!subjects?.length) return null;
  if (remembered) {
    const still = subjects.find((s) => subjectKey(s) === remembered);
    if (still) return still;
  }
  return subjects[0];
}

/**
 * Lựa chọn nhớ là một KHO NGOÀI nhỏ, không phải trạng thái React.
 *
 * Vì sao: giao diện chỉ ĐỌC nó, và nó cũng đổi từ ngoài React (một tab khác).
 * Giữ một bản sao trong trạng thái React nghĩa là phải đồng bộ bằng effect, mà
 * đặt setState trong effect đúng là thứ sinh ra render dây chuyền. Đọc thẳng
 * kho ngoài thì không có bản sao nào để lệch.
 */
const listeners = new Set<() => void>();

export function subscribeRememberedSubject(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** Đọc lựa chọn đang nhớ. Không có trình duyệt (dựng phía máy chủ) → không nhớ gì. */
export function readRememberedSubject(): string | null {
  try {
    return globalThis.localStorage?.getItem(SELECTED_SUBJECT_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

/** Ảnh chụp phía máy chủ: luôn «chưa nhớ gì», để hai bên dựng ra cùng một thứ. */
export function readRememberedSubjectOnServer(): null {
  return null;
}

export function rememberSubject(key: string | null): void {
  try {
    if (key) globalThis.localStorage?.setItem(SELECTED_SUBJECT_STORAGE_KEY, key);
    else globalThis.localStorage?.removeItem(SELECTED_SUBJECT_STORAGE_KEY);
  } catch {
    // Trình duyệt chặn lưu trữ: con trỏ không nhớ qua lần tải, sản phẩm vẫn chạy.
  }
  for (const l of listeners) l();
}

/**
 * Hồ sơ với môn đang soạn đứng ĐẦU danh sách.
 *
 * Đây là cách lựa chọn của người đi tới máy chủ: KHÔNG có trường «chỉ số môn»
 * riêng, vì hai kênh mang cùng một sự thật là hai kênh sẽ lệch nhau. Route chỉ
 * cần đọc môn đầu tiên. Các môn còn lại vẫn đi theo — bé học Toán tiếng Việt
 * song song là bối cảnh thật, không phải nhiễu.
 */
export function withChosenFirst(
  learner: LearnerContext,
  chosen: LearnerSubject | null,
): LearnerContext {
  if (!chosen) return learner;
  const key = subjectKey(chosen);
  const rest = learner.subjects.filter((s) => subjectKey(s) !== key);
  const head = learner.subjects.find((s) => subjectKey(s) === key);
  return head ? { ...learner, subjects: [head, ...rest] } : learner;
}
