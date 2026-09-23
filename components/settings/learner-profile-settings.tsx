'use client';

/**
 * Cài đặt › Người học — thẻ 5 câu.
 *
 * Người dùng là phụ huynh không chuyên sư phạm, không kỹ thuật. Ba luật chi
 * phối mọi dòng dưới đây:
 *
 *  1. Phụ huynh chọn LỚP theo hệ của mình («lớp 7»). Việc lớp 7 tương đương
 *     stage nào của một giáo trình nước ngoài là việc của gói khung — chữ
 *     «Stage» và mọi mã khung KHÔNG được xuất hiện trên thẻ này.
 *  2. Mỗi dòng môn nói thẳng nó có gói khung hay không. «Chưa có gói» không
 *     phải lỗi: nó là lời hứa rằng máy sẽ nói ra mình đang đoán.
 *  3. Lưu hỏng thì KHÔNG báo đã lưu và KHÔNG mất thứ vừa gõ. Tầng lưu bền từ
 *     chối ghi khi khoá chưa nạp được; im lặng ở đó là mất-không-ai-biết.
 *
 * Mọi trạng thái mang id `ST-the-*` khớp bảng trạng thái trong đặc tả UX của
 * hồ sơ nghiệm thu — phép đo chụp sống của Cổng Bằng chứng bám vào các id này.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GraduationCap, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isProWorkbenchEnabled } from '@/lib/config/feature-flags';
import { useI18n } from '@/lib/hooks/use-i18n';
import { isAccountSyncEnabled } from '@/lib/persistence/enabled';
import { isPersistUnavailable } from '@/lib/store/persist-health';
import {
  isCompleteLearner,
  useLearnerProfileStore,
  type LearnerContext,
  type LearnerSubject,
} from '@/lib/store/learner-profile';

/** Hình dạng một gói khung như tuyến danh sách trả về. */
interface PackRow {
  id: string;
  subject: string;
  curriculum: string;
  gradesVn: string[];
  textbooks: string[];
}

/** Giáo trình người dùng chọn được. Nhãn là chữ cho người, mã là chữ cho máy. */
const CURRICULA = [
  { value: 'moet', labelKey: 'settings.learnerProfile.curriculumMoet' },
  { value: 'cambridge-lower-secondary', labelKey: 'settings.learnerProfile.curriculumCambridge' },
  { value: 'ib-myp', labelKey: 'settings.learnerProfile.curriculumIb' },
  { value: 'other', labelKey: 'settings.learnerProfile.curriculumOther' },
] as const;

const LANGUAGES = [
  { value: 'vi-VN', labelKey: 'settings.learnerProfile.langVi' },
  { value: 'en-US', labelKey: 'settings.learnerProfile.langEn' },
] as const;

const MAX_NICKNAME = 40;
const MAX_FREE_TEXT = 80;

const emptySubject = (): LearnerSubject => ({ subject: '', curriculum: '', language: '' });

type SaveState = 'idle' | 'saving' | 'saved' | 'failed';

export function LearnerProfileSettings() {
  const { t } = useI18n();
  const stored = useLearnerProfileStore((s) => s.learner);
  const setLearner = useLearnerProfileStore((s) => s.setLearner);

  const [draft, setDraft] = useState<LearnerContext>(
    () => stored ?? { nickname: '', gradeLabel: '', school: '', subjects: [emptySubject()] },
  );
  const [packs, setPacks] = useState<PackRow[]>([]);
  const [save, setSave] = useState<SaveState>('idle');

  useEffect(() => {
    let alive = true;
    // Gói khung là dữ liệu của máy chủ; không đọc được thì thẻ vẫn dùng được,
    // chỉ là mọi dòng môn hiện «chưa có gói» — đúng sự thật lúc ấy.
    fetch('/api/curriculum-packs')
      .then((r) => (r.ok ? r.json() : { packs: [] }))
      .then((d: { packs?: PackRow[] }) => alive && setPacks(d.packs ?? []))
      .catch(() => alive && setPacks([]));
    return () => {
      alive = false;
    };
  }, []);

  const touched =
    Boolean(draft.nickname || draft.gradeLabel || draft.school) ||
    draft.subjects.some((s) => s.subject || s.curriculum || s.language || s.textbook);
  const complete = isCompleteLearner(draft);

  const packFor = useCallback(
    (s: LearnerSubject): PackRow | null =>
      packs.find(
        (p) =>
          p.subject === s.subject &&
          p.curriculum === s.curriculum &&
          p.gradesVn.includes(draft.gradeLabel),
      ) ?? null,
    [packs, draft.gradeLabel],
  );

  const patch = (next: Partial<LearnerContext>) => {
    setSave('idle');
    setDraft((d) => ({ ...d, ...next }));
  };
  const patchSubject = (i: number, next: Partial<LearnerSubject>) => {
    setSave('idle');
    setDraft((d) => ({
      ...d,
      subjects: d.subjects.map((s, j) => (j === i ? { ...s, ...next } : s)),
    }));
  };

  const onSave = async () => {
    if (!complete) return;
    // Mã gói tính LÚC LƯU từ bộ đăng ký đang có, nhưng không phải sự thật đóng
    // băng: mỗi lần hiển thị lại tính lại, nên thêm gói mới là hồ sơ cũ hưởng.
    const learner: LearnerContext = {
      ...draft,
      school: draft.school?.trim() || undefined,
      subjects: draft.subjects
        .filter((s) => s.subject && s.curriculum && s.language)
        .map((s) => {
          const pack = packFor(s);
          return { ...s, textbook: s.textbook?.trim() || undefined, packId: pack?.id };
        }),
    };
    setSave('saving');
    setLearner(learner);

    // ĐỌC THẲNG NGĂN LƯU trước khi dám nói «đã lưu».
    //
    // Hai cách làm trước đều sai, và sai theo cùng một kiểu — hỏi một thứ
    // KHÔNG PHẢI là ngăn lưu:
    //   1. Hỏi cờ sức khoẻ ngay sau khi gọi: việc ghi bất đồng bộ nên lúc hỏi
    //      thì một lượt ghi hỏng chưa kịp bật cờ.
    //   2. Gọi nạp-lại rồi so với trạng thái trong bộ nhớ: khi ngăn lưu trả về
    //      RỖNG, zustand hoà một giá trị `undefined` vào trạng thái hiện có,
    //      tức giữ nguyên thứ vừa đặt trong bộ nhớ — nên phép so LUÔN đúng,
    //      đúng ở ca nó sinh ra để bắt.
    // Lối duy nhất trả lời được là hỏi chính ngăn lưu mà kho đang dùng: rỗng
    // là chưa ghi được, và đó là một câu trả lời, không phải một sự vắng mặt.
    const persistOptions = useLearnerProfileStore.persist.getOptions();
    const persistName = persistOptions.name ?? 'learner-profile-storage';
    let landed = false;
    try {
      const raw = (await persistOptions.storage?.getItem(persistName)) as
        | { state?: { learner?: LearnerContext | null } }
        | null
        | undefined;
      landed =
        !isPersistUnavailable(persistName) &&
        JSON.stringify(raw?.state?.learner) === JSON.stringify(learner);
    } catch {
      landed = false;
    }

    if (!landed) {
      setSave('failed');
      toast.error(t('settings.learnerProfile.saveFailed'));
      return;
    }
    setSave('saved');
    toast.success(t('settings.learnerProfile.saved'));
  };

  const cardState =
    save === 'failed'
      ? 'ST-the-loi-luu'
      : save === 'saving'
        ? 'ST-the-dang-luu'
        : save === 'saved'
          ? 'ST-the-da-luu'
          : touched
            ? 'ST-the-dang-dien'
            : 'ST-the-trong';

  /**
   * Nhãn lớp KHÔNG đi qua bộ dịch, có chủ ý. Gói khung khớp theo đúng chuỗi
   * này (`gradesVn`), nên một bản dịch sẽ làm mọi gói thôi khớp khi người dùng
   * đổi ngôn ngữ giao diện — hồ sơ vẫn đó, gói im lặng biến mất. «Lớp 7» là
   * tên riêng của hệ giáo dục Việt Nam, đúng như «Learner's Book 8» là tên
   * riêng của bộ sách; cả hai đứng nguyên ở mọi ngôn ngữ.
   */
  const grades = useMemo(() => Array.from({ length: 12 }, (_, i) => `lớp ${i + 1}`), []);

  return (
    <div data-state={cardState} className="space-y-6">
      <header className="space-y-1">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <GraduationCap className="h-4 w-4" aria-hidden />
          {t('settings.learnerProfile.title')}
        </h3>
        <p className="text-sm text-muted-foreground">{t('settings.learnerProfile.description')}</p>
        {/*
          Nói thẳng một giới hạn của bản triển khai, không giấu: xưởng Pro đọc
          hồ sơ từ ngăn tài khoản trên máy chủ. Tắt đồng bộ thì hồ sơ chỉ nằm
          trong trình duyệt này, và xưởng soạn cho một học sinh chung chung.
          Chỉ hiện khi xưởng có thật trên bản này — không doạ người không dùng.
        */}
        {isProWorkbenchEnabled() && !isAccountSyncEnabled() && (
          <p
            data-note="workbench-needs-sync"
            className="rounded-md border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-sm"
          >
            {t('settings.learnerProfile.workbenchNeedsSync')}
          </p>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium">{t('settings.learnerProfile.nickname')}</span>
          <Input
            data-role="ten-be"
            value={draft.nickname}
            maxLength={MAX_NICKNAME}
            placeholder={t('settings.learnerProfile.nicknamePlaceholder')}
            onChange={(e) => patch({ nickname: e.target.value })}
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium">{t('settings.learnerProfile.grade')}</span>
          <select
            data-role="lop"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={draft.gradeLabel}
            onChange={(e) => patch({ gradeLabel: e.target.value })}
          >
            <option value="">{t('settings.learnerProfile.gradePlaceholder')}</option>
            {grades.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium">{t('settings.learnerProfile.school')}</span>
          <Input
            data-role="truong"
            value={draft.school ?? ''}
            maxLength={MAX_FREE_TEXT}
            placeholder={t('settings.learnerProfile.schoolPlaceholder')}
            onChange={(e) => patch({ school: e.target.value })}
          />
        </label>
      </div>

      <section className="space-y-3">
        <h4 className="text-sm font-medium">{t('settings.learnerProfile.subjects')}</h4>
        {draft.subjects.map((s, i) => {
          const pack = s.subject && s.curriculum ? packFor(s) : null;
          const rowState =
            !s.subject || !s.curriculum
              ? undefined
              : pack
                ? 'ST-the-mon-co-goi'
                : 'ST-the-mon-chua-goi';
          return (
            <div key={i} data-state={rowState} className="space-y-2 rounded-md border p-3">
              <div className="grid gap-2 sm:grid-cols-4">
                <Input
                  data-role="mon"
                  value={s.subject}
                  maxLength={MAX_FREE_TEXT}
                  placeholder={t('settings.learnerProfile.subjectPlaceholder')}
                  onChange={(e) => patchSubject(i, { subject: e.target.value })}
                />
                <select
                  data-role="giao-trinh"
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={s.curriculum}
                  onChange={(e) => patchSubject(i, { curriculum: e.target.value })}
                >
                  <option value="">{t('settings.learnerProfile.curriculumPlaceholder')}</option>
                  {CURRICULA.map((c) => (
                    <option key={c.value} value={c.value}>
                      {t(c.labelKey)}
                    </option>
                  ))}
                </select>
                <select
                  data-role="ngon-ngu"
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={s.language}
                  onChange={(e) => patchSubject(i, { language: e.target.value })}
                >
                  <option value="">{t('settings.learnerProfile.languagePlaceholder')}</option>
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {t(l.labelKey)}
                    </option>
                  ))}
                </select>
                <Input
                  data-role="sach"
                  value={s.textbook ?? ''}
                  maxLength={MAX_FREE_TEXT}
                  placeholder={t('settings.learnerProfile.textbookPlaceholder')}
                  onChange={(e) => patchSubject(i, { textbook: e.target.value })}
                />
              </div>

              {rowState === 'ST-the-mon-co-goi' && (
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  {t('settings.learnerProfile.packFound')} — {pack?.textbooks[0]}
                </p>
              )}
              {rowState === 'ST-the-mon-chua-goi' && (
                <p className="text-sm text-muted-foreground">
                  {t('settings.learnerProfile.packMissing')}
                </p>
              )}

              {draft.subjects.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-role="bot-mon"
                  onClick={() => {
                    setSave('idle');
                    setDraft((d) => ({ ...d, subjects: d.subjects.filter((_, j) => j !== i) }));
                  }}
                >
                  <X className="mr-1 h-3.5 w-3.5" aria-hidden />
                  {t('settings.learnerProfile.removeSubject')}
                </Button>
              )}
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          data-role="them-mon"
          onClick={() => {
            setSave('idle');
            setDraft((d) => ({ ...d, subjects: [...d.subjects, emptySubject()] }));
          }}
        >
          <Plus className="mr-1 h-3.5 w-3.5" aria-hidden />
          {t('settings.learnerProfile.addSubject')}
        </Button>
      </section>

      {save === 'failed' && (
        <p role="alert" className="text-sm text-destructive">
          {t('settings.learnerProfile.saveFailed')}
        </p>
      )}
      {save === 'saved' && (
        <p role="status" className="text-sm text-muted-foreground">
          {t('settings.learnerProfile.saved')}
        </p>
      )}

      <Button
        type="button"
        data-role="luu"
        disabled={!complete || save === 'saved' || save === 'saving'}
        onClick={onSave}
      >
        {t('settings.learnerProfile.save')}
      </Button>
    </div>
  );
}
