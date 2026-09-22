/**
 * Phần `requirements` gửi kèm MỖI trang sinh tiếp trong lớp học.
 *
 * Trang đầu sinh ở màn xem trước nhận trọn yêu cầu của người dùng; các trang
 * sau sinh ở lớp học và trước vòng này chỉ mang cờ task-engine — hồ sơ người
 * học rơi mất ở đúng chỗ này, nên trang 1 soạn cho Bi, trang 2 trở đi soạn cho
 * một học sinh chung chung. Hàm THUẦN, dùng ở CẢ HAI chỗ gọi (vòng sinh nối
 * tiếp và sinh lại một trang): hai bản chép tay là hai chỗ để một trường rơi
 * mất mà không ai thấy.
 *
 * Tách khỏi hook để đo được không cần dựng cả hook (kho, cơ sở dữ liệu, âm thanh).
 */
import type { LearnerContext } from '@openmaic/generation';

import type { UserRequirements } from '@/lib/types/generation';

export interface ContinuationParams {
  taskEngineMode?: boolean;
  learner?: LearnerContext;
}

export function continuationRequirements(
  params: ContinuationParams,
): { requirements: Partial<UserRequirements> } | Record<string, never> {
  const requirements: Partial<UserRequirements> = {
    ...(params.taskEngineMode ? { taskEngineMode: true } : {}),
    ...(params.learner ? { learner: params.learner } : {}),
  };
  return Object.keys(requirements).length ? { requirements } : {};
}
