/**
 * Bộ đăng ký gói khung giáo trình. Gói là một skill builtin có thêm một tệp
 * mô tả cạnh `SKILL.md` — cùng nếp với `outline-constraints.json`: frontmatter
 * là hợp đồng với mô hình, tệp này là hợp đồng với bộ khớp.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { agentRuntimeConfig } from '@/lib/server/agent-runtime/config';

export interface CurriculumPack {
  id: string;
  subject: string;
  curriculum: string;
  stage: number;
  /** Nhãn lớp hệ Việt Nam mà stage này tương đương. Phụ huynh chọn lớp, không chọn stage. */
  gradesVn: string[];
  language: string;
  textbooks: string[];
}

export function loadPacksFrom(dir: string, warn: (m: string) => void = () => {}): CurriculumPack[] {
  if (!existsSync(dir)) return [];
  const packs: CurriculumPack[] = [];
  for (const id of readdirSync(dir)) {
    const file = join(dir, id, 'curriculum-pack.json');
    if (!existsSync(file)) continue;
    try {
      const raw = JSON.parse(readFileSync(file, 'utf8')) as Omit<CurriculumPack, 'id'>;
      packs.push({ ...raw, id });
    } catch (err) {
      // Gói hỏng KHÔNG được làm sập bộ đăng ký: hồ sơ hiện «chưa có gói» thay
      // vì đổ vỡ, và tên tệp phải nằm trong cảnh báo để người sửa đúng chỗ.
      warn(`curriculum pack unreadable, skipped: ${file} — ${String(err)}`);
    }
  }
  return packs;
}

export function findPackIn(
  packs: readonly CurriculumPack[],
  subject: string,
  curriculum: string,
  gradeLabel: string,
): CurriculumPack | null {
  return (
    packs.find(
      (p) =>
        p.subject === subject && p.curriculum === curriculum && p.gradesVn.includes(gradeLabel),
    ) ?? null
  );
}

let cache: CurriculumPack[] | undefined;
export function listPacks(): CurriculumPack[] {
  return (cache ??= loadPacksFrom(agentRuntimeConfig.skillsDir, (m) => console.warn(m)));
}

export function findPack(subject: string, curriculum: string, gradeLabel: string) {
  return findPackIn(listPacks(), subject, curriculum, gradeLabel);
}

export function readPackBody(packId: string): string {
  const file = join(agentRuntimeConfig.skillsDir, packId, 'SKILL.md');
  if (!existsSync(file)) return '';
  const text = readFileSync(file, 'utf8');
  // Bỏ frontmatter: thân gói là phần người đọc, không phải hợp đồng máy.
  return text.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
}
