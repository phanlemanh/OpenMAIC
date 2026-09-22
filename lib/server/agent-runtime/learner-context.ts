/**
 * Bối cảnh người học ở cửa xưởng Pro.
 *
 * Hồ sơ đi theo YÊU CẦU, không theo phiên: client gửi nó khi mở phiên, route
 * ghi một BẢN CHỤP vào ngăn KV của chủ sở hữu, và bộ chạy đọc bản chụp ấy khi
 * dựng lời nhắc hệ thống. Ba lối khác đã cân nhắc và loại:
 *
 *  - thêm cột vào bảng phiên — bảng ấy nằm trong gói lưu trữ hạng T3, vòng này
 *    không đụng vào đó;
 *  - nhét hồ sơ vào cây phiên dưới dạng `custom_message` — nó tới tay mô hình
 *    như một LỜI NHẮN, không phải dữ liệu hồ sơ;
 *  - để client gửi kèm mỗi lượt — hồ sơ khi ấy thành thứ mô hình thấy người
 *    dùng vừa nói, và một lượt quên gửi là một lượt bé biến mất.
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

export const LEARNER_SNAPSHOT_KEY = 'learner-profile.snapshot';

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
 * Đọc hồ sơ từ thân yêu cầu. NÉM kèm TÊN TRƯỜNG sai — một lời từ chối chung
 * chung buộc người gọi đoán, và đoán sai thì im lặng gửi hồ sơ rỗng.
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

export async function saveLearnerSnapshot(
  connectionString: string,
  ownerId: string,
  learner: LearnerContext,
): Promise<void> {
  const { kvStore } = await getServerPersistenceProvider(connectionString);
  await kvStore.set(ownerId, LEARNER_SNAPSHOT_KEY, learner);
}

export async function readLearnerSnapshot(
  connectionString: string,
  ownerId: string,
): Promise<LearnerContext | null> {
  const { kvStore } = await getServerPersistenceProvider(connectionString);
  return kvStore.get<LearnerContext>(ownerId, LEARNER_SNAPSHOT_KEY);
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
