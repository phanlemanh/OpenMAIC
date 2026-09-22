'use client';

/**
 * «Soạn cho: <môn — giáo trình>» — cửa vào bối cảnh người học trên trang chủ.
 *
 * Hai trạng thái, và trạng thái thứ nhất mới là trạng thái quan trọng: phụ
 * huynh CHƯA khai hồ sơ thì không có ô nào, chỉ một lời mời. Một ô chọn rỗng
 * trên trang chủ của người chưa dùng tính năng là tiếng ồn; một lời mời thì
 * nói được nó dùng để làm gì.
 */
import { useEffect, useSyncExternalStore } from 'react';
import { GraduationCap } from 'lucide-react';

import { useI18n } from '@/lib/hooks/use-i18n';
import { useLearnerProfileStore } from '@/lib/store/learner-profile';
import {
  readRememberedSubject,
  readRememberedSubjectOnServer,
  rememberSubject,
  resolveSelectedSubject,
  subjectKey,
  subscribeRememberedSubject,
} from '@/lib/store/selected-subject';
import type { LearnerSubject } from '@openmaic/generation';

export interface LearnerSubjectPickerProps {
  /** Mở mục Cài đặt › Người học — dùng cho lời mời khi chưa có hồ sơ. */
  onOpenSettings: () => void;
  /** Báo lên trang chủ môn nào sẽ đi cùng yêu cầu soạn. */
  onSubjectChange: (subject: LearnerSubject | null) => void;
}

export function LearnerSubjectPicker({
  onOpenSettings,
  onSubjectChange,
}: LearnerSubjectPickerProps) {
  const { t } = useI18n();
  const learner = useLearnerProfileStore((s) => s.learner);
  // Đọc thẳng kho ngoài: không bản sao trong trạng thái React nên không cần
  // effect nào để đồng bộ, và ảnh chụp phía máy chủ luôn «chưa nhớ gì» nên hai
  // bên dựng ra cùng một thứ.
  const remembered = useSyncExternalStore(
    subscribeRememberedSubject,
    readRememberedSubject,
    readRememberedSubjectOnServer,
  );

  const selected = resolveSelectedSubject(learner, remembered);

  useEffect(() => {
    onSubjectChange(selected);
    // Lựa chọn đang nhớ trỏ một môn đã bị xoá → dọn luôn, đừng để một mã mồ
    // côi nằm lại chờ một hồ sơ tương lai tình cờ khớp. `rememberSubject` ghi
    // vào kho ngoài và tự báo, nên đây KHÔNG phải setState trong effect.
    if (selected && remembered && subjectKey(selected) !== remembered) {
      rememberSubject(subjectKey(selected));
    } else if (!selected && remembered) {
      rememberSubject(null);
    }
  }, [selected, remembered, onSubjectChange]);

  if (!selected) {
    return (
      <button
        type="button"
        data-state="ST-chon-moi-khai"
        onClick={onOpenSettings}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <GraduationCap className="h-3.5 w-3.5" aria-hidden />
        {t('home.learnerInvite.prompt')}
        <span aria-hidden>→</span>
      </button>
    );
  }

  const options = (learner?.subjects ?? []).filter((s) => s.subject && s.language && s.curriculum);

  return (
    <label data-state="ST-chon-san-sang" className="inline-flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{t('home.learnerInvite.composeFor')}</span>
      <select
        data-role="soan-cho"
        className="h-8 rounded-md border border-input bg-background px-2 text-sm"
        value={subjectKey(selected)}
        onChange={(e) => rememberSubject(e.target.value)}
      >
        {options.map((s) => (
          <option key={subjectKey(s)} value={subjectKey(s)}>
            {`${s.subject} — ${t(`home.learnerInvite.curriculum.${s.curriculum}`)} (${t(
              `home.learnerInvite.language.${s.language}`,
            )})`}
          </option>
        ))}
      </select>
    </label>
  );
}
