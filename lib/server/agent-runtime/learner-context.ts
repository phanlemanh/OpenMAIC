/**
 * Bối cảnh người học ở cửa xưởng Pro.
 *
 * Hồ sơ đi theo NGƯỜI, và chỉ có MỘT bản: kho `learner-profile-storage` mà
 * trình duyệt ghi vào ngăn tài khoản của chủ sở hữu. Bộ chạy đọc thẳng khoá ấy
 * khi dựng lời nhắc hệ thống — không có bản chụp thứ hai, không có trường
 * `learner` trên yêu cầu mở phiên. Ba lối khác đã cân nhắc và loại:
 *
 *  - thêm cột vào bảng phiên — bảng ấy nằm trong gói lưu trữ hạng T3;
 *  - nhét hồ sơ vào cây phiên dưới dạng `custom_message` — nó tới tay mô hình
 *    như một LỜI NHẮN, không phải dữ liệu hồ sơ;
 *  - client gửi kèm lúc mở phiên, máy chủ chép ra một khoá riêng — đó là bản
 *    cũ của vòng này, và nó tạo ra một khoá mồ côi mà «Xoá bộ nhớ đệm» không
 *    với tới, cùng một bản sao có thể lệch với hồ sơ thật.
 *
 * Hệ quả nói thẳng: bản triển khai bật xưởng Pro mà TẮT đồng bộ tài khoản
 * (hồ sơ chỉ nằm trong trình duyệt) thì máy chủ không thấy hồ sơ — không khối,
 * không chặn, và thẻ 5 câu nói điều đó với phụ huynh.
 *
 * Khối lời nhắc GỌI chính bộ định dạng dùng chung của đường soạn rồi bọc thêm
 * tiêu đề và câu trỏ tên gói — nó KHÔNG tự ghép chuỗi riêng.
 */
import {
  formatLearnerContext,
  type LearnerContext,
  type LearnerSubject,
} from '@openmaic/generation';

import { getServerPersistenceProvider } from '@/lib/persistence/server-provider';
import { findPack } from '@/lib/server/curriculum-packs';
import { LEARNER_PROFILE_STORE_NAME } from '@/lib/store/learner-profile-key';

const MAX_NICKNAME = 40;
const MAX_FREE_TEXT = 80;
const MAX_SUBJECTS = 12;

export class LearnerShapeError extends Error {
  constructor(readonly field: string) {
    super(`learner.${field} is invalid`);
    this.name = 'LearnerShapeError';
  }
}

function str(value: unknown, field: string, max: number, required: boolean): string | undefined {
  if (value === undefined || value === null || value === '') {
    if (required) throw new LearnerShapeError(field);
    return undefined;
  }
  if (typeof value !== 'string' || value.length > max) throw new LearnerShapeError(field);
  return value;
}

/**
 * Đọc hồ sơ từ một giá trị chưa tin được (ngăn lưu là dữ liệu do trình duyệt
 * ghi, không phải hợp đồng máy chủ tự kiểm). NÉM kèm TÊN TRƯỜNG sai — một lời
 * từ chối chung chung buộc người gọi đoán, và đoán sai thì im lặng gửi hồ sơ rỗng.
 */
export function parseLearner(raw: unknown): LearnerContext {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new LearnerShapeError('root');
  }
  const src = raw as Record<string, unknown>;
  const nickname = str(src.nickname, 'nickname', MAX_NICKNAME, true) as string;
  const gradeLabel = str(src.gradeLabel, 'gradeLabel', MAX_FREE_TEXT, true) as string;
  const school = str(src.school, 'school', MAX_FREE_TEXT, false);
  if (!Array.isArray(src.subjects) || src.subjects.length === 0) {
    throw new LearnerShapeError('subjects');
  }
  if (src.subjects.length > MAX_SUBJECTS) throw new LearnerShapeError('subjects');
  const subjects: LearnerSubject[] = src.subjects.map((item, i) => {
    if (typeof item !== 'object' || item === null) throw new LearnerShapeError(`subjects[${i}]`);
    const s = item as Record<string, unknown>;
    return {
      subject: str(s.subject, `subjects[${i}].subject`, MAX_FREE_TEXT, true) as string,
      curriculum: str(s.curriculum, `subjects[${i}].curriculum`, MAX_FREE_TEXT, true) as string,
      language: str(s.language, `subjects[${i}].language`, MAX_FREE_TEXT, true) as string,
      textbook: str(s.textbook, `subjects[${i}].textbook`, MAX_FREE_TEXT, false),
      packId: str(s.packId, `subjects[${i}].packId`, MAX_FREE_TEXT, false),
    };
  });
  return { nickname, gradeLabel, school, subjects };
}

/**
 * Bóc hồ sơ khỏi phong bì mà zustand `persist` ghi: `{ state: { learner }, version }`.
 *
 * Tách riêng và thuần để đo được không cần cơ sở dữ liệu. Mọi hình dạng khác —
 * khoá vắng, phong bì lạ, hồ sơ đã xoá (`learner: null`), hồ sơ sai hình — đều
 * là «không có hồ sơ», KHÔNG phải lỗi: bài soạn kém đi, phiên vẫn chạy.
 */
export function unwrapStoredLearner(stored: unknown): LearnerContext | null {
  if (typeof stored !== 'object' || stored === null) return null;
  const state = (stored as { state?: unknown }).state;
  if (typeof state !== 'object' || state === null) return null;
  const learner = (state as { learner?: unknown }).learner;
  if (learner === null || learner === undefined) return null;
  try {
    return parseLearner(learner);
  } catch (error) {
    if (error instanceof LearnerShapeError) return null;
    throw error;
  }
}

/**
 * Hồ sơ của chủ sở hữu, đọc từ CHÍNH kho mà trình duyệt ghi — ngăn `account`,
 * khoá `learner-profile-storage`. Đây là bản duy nhất; xoá ở thẻ Cài đặt là
 * xoá ở đây.
 */
export async function readLearnerProfileForOwner(
  connectionString: string,
  ownerId: string,
): Promise<LearnerContext | null> {
  const { kvStore } = await getServerPersistenceProvider(connectionString);
  return unwrapStoredLearner(
    await kvStore.get<unknown>(ownerId, LEARNER_PROFILE_STORE_NAME, 'account'),
  );
}

/**
 * Khối người học cho lời nhắc hệ thống của agent.
 *
 * Trỏ TÊN SKILL gói khung cho từng môn có gói: agent đã thấy skill trong danh
 * sách của nó, khối này chỉ nói cái nào cần đọc TRƯỚC khi soạn môn nào. Không
 * có dòng ấy thì agent phải tự đoán gói nào liên quan, và nó sẽ đoán sai.
 */
export function learnerPromptBlock(learner: LearnerContext | null): string {
  if (!learner) return '';
  const body = formatLearnerContext(learner);
  if (!body) return '';
  const packLines = learner.subjects
    .map((s) => {
      const pack = s.packId ?? findPack(s.subject, s.curriculum, learner.gradeLabel)?.id;
      return pack
        ? `- Trước khi soạn môn ${s.subject}, đọc skill \`${pack}\` để biết khung giáo trình.`
        : null;
    })
    .filter(Boolean);
  return ['## Learner', '', body, ...(packLines.length ? ['', ...packLines] : [])].join('\n');
}
