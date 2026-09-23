'use client';

/**
 * Dòng neo — câu nói bài học bám vào đâu, đặt trên đầu dàn ý.
 *
 * Đây là chỗ phụ huynh THẤY tính năng. Ba biến thể, và biến thể thứ hai là
 * biến thể quan trọng nhất: khi chưa có gói khung cho giáo trình của bé, máy
 * PHẢI nói thẳng mình đang đoán. Phụ huynh không chuyên sư phạm sẽ tin một cái
 * neo sai — giáo viên nhìn ra lệch, phụ huynh thì không — nên im lặng ở đây
 * đắt hơn nhiều so với một dòng cảnh báo.
 *
 * Luật chữ: TÊN UNIT và tên sách đứng trước; mã khung, nếu có, đứng sau và in
 * nhỏ. Không chữ «Stage» ở đầu câu.
 */
import { AlertTriangle, BookOpen } from 'lucide-react';

import { useI18n } from '@/lib/hooks/use-i18n';

export interface CurriculumAnchorLineProps {
  /** Câu neo mô hình trả về. Vắng = không có gói, hoặc không có hồ sơ. */
  anchor?: string;
  /** Tên giáo trình của môn đang soạn khi hồ sơ CÓ khai mà chưa có gói. */
  guessingFor?: string;
}

export function CurriculumAnchorLine({ anchor, guessingFor }: CurriculumAnchorLineProps) {
  const { t } = useI18n();

  if (anchor) {
    return (
      <p
        data-state="ST-neo-co-goi"
        className="flex items-start gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm"
      >
        <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <span>{anchor}</span>
      </p>
    );
  }

  if (guessingFor) {
    return (
      <p
        data-state="ST-neo-dang-doan"
        className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-sm"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        <span>{t('preview.curriculumAnchor.guessing', { curriculum: guessingFor })}</span>
      </p>
    );
  }

  // Hồ sơ trống: không dòng nào — màn hình y như trước vòng này.
  return null;
}
