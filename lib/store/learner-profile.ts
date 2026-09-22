/**
 * Learner Profile Store
 *
 * Bé đang học gì — khai một lần, mọi bài soạn bám theo. Lưu bền qua KVStore của
 * `@openmaic/storage` ở phạm vi `account`: đây là hồ sơ của chính người dùng,
 * đúng loại dữ liệu mà một bản triển khai có máy chủ phải mang theo giữa các
 * máy, chứ không phải tuỳ chọn riêng của một cái máy.
 *
 * CỐ Ý không lưu trạng thái gói khung: gói nào khớp với giáo trình nào là thứ
 * tính LÚC HIỂN THỊ. Đóng băng nó vào hồ sơ lúc lưu thì hôm sau thêm gói mới,
 * hồ sơ cũ vẫn nói «chưa có gói» mãi mãi. Vì vậy file này KHÔNG import bộ đăng
 * ký gói.
 *
 * Dữ liệu trẻ em: chỉ tên gọi, lớp, trường, môn, sách. KHÔNG họ tên đầy đủ,
 * KHÔNG ngày sinh.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { LearnerContext } from '@openmaic/generation';

import { createKVPersistStorage, purgeLegacyPersistKey } from '@/lib/store/kv-persist';

export type { LearnerContext, LearnerSubject } from '@openmaic/generation';

/**
 * Bound after the store exists; see `onWriteRefused` for why it is not inlined.
 * The explicit annotation is what breaks the type cycle — inferring this from
 * the store would put the store back in its own definition.
 */
const recovery: { rehydrate?: () => void | Promise<void> } = {};

/**
 * Hồ sơ đã đủ để bám giáo trình chưa.
 *
 * Hàm THUẦN, không đụng kho: cả thẻ 5 câu lẫn hai cửa soạn đều hỏi cùng một
 * câu hỏi này, nên nó không được phép nằm trong trạng thái của một cái kho.
 * Một môn chỉ tính khi đủ cả tên môn, giáo trình và ngôn ngữ — thiếu một cái
 * thì khối hồ sơ đổ vào prompt sẽ nói dối là đã neo.
 */
export function isCompleteLearner(learner: LearnerContext | null | undefined): boolean {
  if (!learner) return false;
  if (!learner.nickname?.trim()) return false;
  if (!learner.gradeLabel?.trim()) return false;
  return (
    Array.isArray(learner.subjects) &&
    learner.subjects.some(
      (s) =>
        Boolean(s?.subject?.trim()) &&
        Boolean(s?.curriculum?.trim()) &&
        Boolean(s?.language?.trim()),
    )
  );
}

export interface LearnerProfileState {
  /** `null` = chưa khai lần nào; hành vi y như trước vòng này. */
  learner: LearnerContext | null;
  setLearner: (learner: LearnerContext) => void;
  clearLearner: () => void;
}

export const useLearnerProfileStore = create<LearnerProfileState>()(
  persist(
    (set) => ({
      learner: null,
      setLearner: (learner) => set({ learner }),
      clearLearner: () => set({ learner: null }),
    }),
    {
      name: 'learner-profile-storage',
      storage: createKVPersistStorage<LearnerProfileState>('account', {
        // One recovery attempt when a write is refused because hydration never
        // succeeded — the backend may have come back since. Routed through a
        // variable assigned below rather than naming the store directly: a
        // self-reference here would make the store's own type circular and
        // silently widen every selector to `any`.
        onWriteRefused: () => recovery.rehydrate?.(),
      }),
    },
  ),
);

// Bound after the store exists so the `onWriteRefused` hook above stays free of
// a self-reference (see the comment there).
recovery.rehydrate = () => useLearnerProfileStore.persist.rehydrate();

// Best-effort, fire-and-forget: drop the pre-cutover raw `localStorage` blob.
// It is never read (this store does not migrate legacy data), so a leftover is
// only garbage. No correctness depends on it.
purgeLegacyPersistKey('learner-profile-storage');
