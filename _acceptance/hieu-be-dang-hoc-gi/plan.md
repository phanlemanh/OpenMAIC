# Hiểu bé đang học gì — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phụ huynh khai một lần bé học gì, rồi mọi bài soạn ở cả hai cửa đều bám đúng giáo trình của bé và nói ra nó neo vào đâu.

**Architecture:** Một lõi làm một lần — kho hồ sơ phạm vi `account`, bộ đăng ký gói khung đọc từ skill builtin, và MỘT bộ định dạng sinh khối hồ sơ — cộng hai bộ chuyển mỏng: cửa bấm-một-phát đổ hồ sơ + thân gói vào prompt dàn ý rồi hiện dòng neo, cửa xưởng Pro ghi bản chụp hồ sơ vào ngăn KV của chủ sở hữu rồi dựng một khối mới trong prompt hệ thống. Không file nào chạm `t3_paths`.

**Tech Stack:** Next.js 16 · React 19 · TypeScript 5 · zustand + persist · `@openmaic/storage` KVStore · vitest · pnpm workspace.

**Spec:** `_acceptance/hieu-be-dang-hoc-gi/design.md` (kèm `contract.md` 16 AC và `evals.yaml` 21 phép đo — executor đọc cả ba)

## Global Constraints

- Hạng **T2**. TUYỆT ĐỐI không sửa file trong `t3_paths`: `middleware.ts`, `lib/server/access-token*.ts`, `app/api/access-code/**`, `lib/persistence/**`, `app/api/persistence/**`, `packages/@openmaic/storage/**`. Được GỌI chúng, không được SỬA.
- Mọi chuỗi mặt người phải có mục trong **cả 12** tệp `lib/i18n/locales/*.json` — CI có bài kiểm khoá (`scripts/check-i18n-keys.mjs`), nguồn là `en-US.json`.
- Node ghim: chạy mọi lệnh qua `./scripts/with-pinned-node.sh` (kho ghim Node 22; Node 24 làm 46 bài đỏ giả).
- Prettier: file mới theo prettier kho. KHÔNG thêm tên nào vào khối kit trong `.prettierignore`.
- Chữ mặt phụ huynh: KHÔNG dùng «Stage», mã mục tiêu, hay từ kỹ thuật trên thẻ 5 câu và ô chọn môn. Trong dòng neo, tên unit và tên sách đứng trước; mã (nếu có) đứng sau, in nhỏ.
- Gói khung: KHÔNG chép mã mục tiêu hay câu mục tiêu nguyên văn của Cambridge (tài liệu gated, bản quyền). Chỉ tên unit/chủ đề, cấu trúc mạch, hướng dẫn diễn giải, từ vựng/ký hiệu.
- Dữ liệu trẻ em: hồ sơ chỉ giữ tên gọi, lớp, trường, môn, sách. KHÔNG họ tên đầy đủ, KHÔNG ngày sinh.
- **Luật sinh phép đo** (bắt buộc mỗi task): một phép đo mới chỉ tính XONG khi có cặp hai chiều trên CÙNG một dữ liệu dựng sẵn — vật lành → xanh, phá vật thật trong bản sao → ĐỎ với thông điệp ghim đúng chuỗi đã khai trong `evals.yaml`. Thiếu cặp = task chưa xong.

---

## File Structure

| File | Trách nhiệm |
|---|---|
| `packages/@openmaic/generation/src/learner-types.ts` | Kiểu `LearnerContext`, `LearnerSubject` — dùng chung cả hai cửa |
| `packages/@openmaic/generation/src/prompt-formatters.ts` | Thêm `formatLearnerContext` — NGUỒN DUY NHẤT của khối hồ sơ |
| `lib/server/curriculum-packs.ts` | Bộ đăng ký gói: quét `curriculum-pack.json`, `findPack`, `readPackBody` |
| `app/api/curriculum-packs/route.ts` | Danh sách gói cho thẻ 5 câu |
| `skills/agent-runtime/cambridge-lower-secondary-maths-8/` | Gói mẫu: `SKILL.md` + `curriculum-pack.json` |
| `lib/store/learner-profile.ts` | Kho hồ sơ, phạm vi `account` |
| `lib/store/account-stores.ts` | Đăng ký kho mới (sổ đăng ký là nguồn cho cả nạp lại lẫn xoá) |
| `components/settings/learner-profile-settings.tsx` | Thẻ 5 câu |
| `components/generation/curriculum-anchor-line.tsx` | Dòng neo, ba biến thể |
| `lib/server/agent-runtime/learner-context.ts` | Bản chụp KV + `learnerPromptBlock` (bọc quanh bộ định dạng chung) |
| `scripts/gen-dan-y-mu.mjs` | Sinh cặp dàn ý mù cho phép đo E13 |

---

### Task 1: Kiểu người học + bộ định dạng dùng chung

`independent: true` — không phụ thuộc task nào.

**Files:**
- Create: `packages/@openmaic/generation/src/learner-types.ts`
- Modify: `packages/@openmaic/generation/src/prompt-formatters.ts` (cuối file), `packages/@openmaic/generation/src/outline-types.ts:23-31`, `packages/@openmaic/generation/src/index.ts` (thêm export)
- Test: `packages/@openmaic/generation/test/learner-context.test.ts`

**Interfaces:**
- Produces: `LearnerContext`, `LearnerSubject`, `formatLearnerContext(learner?: LearnerContext, packBody?: string): string`, `UserRequirements.learner?: LearnerContext`

- [ ] **Step 1: Viết bài kiểm đỏ trước**

```ts
// packages/@openmaic/generation/test/learner-context.test.ts
import { describe, expect, test } from 'vitest';
import { formatLearnerContext, type LearnerContext } from '@openmaic/generation';

const BE: LearnerContext = {
  nickname: 'Bi',
  gradeLabel: 'lớp 7',
  school: 'Emasi',
  subjects: [
    { subject: 'Toán', curriculum: 'cambridge-lower-secondary', language: 'vi-VN',
      textbook: "Learner's Book 8", packId: 'cambridge-lower-secondary-maths-8' },
  ],
};

describe('formatLearnerContext', () => {
  test('hồ sơ trống cho ra chuỗi RỖNG — không khối, không hồi quy', () => {
    expect(formatLearnerContext(undefined)).toBe('');
    expect(formatLearnerContext({ nickname: '', gradeLabel: '', subjects: [] })).toBe('');
  });

  test('môn CÓ gói: khối nêu bé, lớp, môn và nhúng thân gói', () => {
    const out = formatLearnerContext(BE, '## Mạch\n- Unit 3 — Tỉ lệ và tỉ số');
    expect(out).toContain('Bi');
    expect(out).toContain('lớp 7');
    expect(out).toContain('Unit 3 — Tỉ lệ và tỉ số');
    expect(out).not.toContain('chưa có gói khung');
  });

  test('môn CHƯA có gói: khối khai đang đoán, đúng hai câu ghim', () => {
    const moet: LearnerContext = { ...BE, subjects: [
      { subject: 'Toán', curriculum: 'moet', language: 'vi-VN' }] };
    const out = formatLearnerContext(moet);
    expect(out).toContain('chưa có gói khung');
    expect(out).toContain('neo chưa kiểm chứng');
  });

  test('CHIỀU ĐỎ: bỏ câu khai đang-đoán thì phép đo này phải đỏ', () => {
    const moet: LearnerContext = { ...BE, subjects: [
      { subject: 'Toán', curriculum: 'moet', language: 'vi-VN' }] };
    // đối chứng dương ở trên; đây là vế phá vật: một hồ sơ KHÔNG có môn nào
    // thiếu gói thì tuyệt đối không được mang câu khai đoán.
    expect(formatLearnerContext(BE, '## Mạch')).not.toContain('chưa có gói khung');
  });
});
```

- [ ] **Step 2: Chạy để thấy nó đỏ**

Run: `./scripts/with-pinned-node.sh pnpm --filter @openmaic/generation test learner-context`
Expected: FAIL — `formatLearnerContext is not exported`

- [ ] **Step 3: Viết kiểu**

```ts
// packages/@openmaic/generation/src/learner-types.ts
/** Một môn bé đang học, kèm giáo trình và ngôn ngữ học môn đó. */
export interface LearnerSubject {
  subject: string;
  /** Mã giáo trình, vd 'cambridge-lower-secondary' | 'moet'. */
  curriculum: string;
  /** BCP-47 của ngôn ngữ học môn này, vd 'vi-VN' | 'en-US'. */
  language: string;
  textbook?: string;
  /** Gói khung đã khớp. Vắng = chưa có gói → chế độ đoán. */
  packId?: string;
}

/**
 * Bối cảnh người học. Một bé, nhiều môn — trường tích hợp dạy song song hai
 * giáo trình trên cùng một đứa (MOET tiếng Việt + Cambridge tiếng Anh).
 * CỐ Ý không có họ tên đầy đủ và ngày sinh: dữ liệu trẻ em, giữ tối thiểu.
 */
export interface LearnerContext {
  nickname: string;
  /** Nhãn lớp theo hệ người dùng khai, vd 'lớp 7'. Quy đổi sang stage là việc của gói. */
  gradeLabel: string;
  school?: string;
  subjects: LearnerSubject[];
}
```

- [ ] **Step 4: Viết bộ định dạng**

```ts
// cuối packages/@openmaic/generation/src/prompt-formatters.ts
import type { LearnerContext } from './learner-types';

/**
 * NGUỒN DUY NHẤT của khối hồ sơ người học. Cả hai cửa soạn gọi hàm này —
 * cửa xưởng Pro bọc thêm tiêu đề khối, không tự ghép chuỗi riêng. Ba bản chép
 * tay trước đây (outline-generator, route dàn ý, trang xem trước) đã gỡ.
 */
export function formatLearnerContext(learner?: LearnerContext, packBody?: string): string {
  if (!learner?.nickname || !learner.gradeLabel || !learner.subjects?.length) return '';
  const head = `## Student Profile\n\nHọc sinh: ${learner.nickname} — ${learner.gradeLabel}${
    learner.school ? ` tại ${learner.school}` : ''
  }`;
  const lines = learner.subjects.map((s) => {
    const base = `- ${s.subject} · ${s.curriculum} · ${s.language}${
      s.textbook ? ` · ${s.textbook}` : ''
    }`;
    return s.packId
      ? base
      : `${base}\n  (chưa có gói khung cho giáo trình này — neo bằng hiểu biết chung và PHẢI nói rõ với người dùng rằng neo chưa kiểm chứng)`;
  });
  const pack = packBody?.trim() ? `\n\n### Khung giáo trình\n\n${packBody.trim()}` : '';
  return `${head}\n\n${lines.join('\n')}${pack}\n\n---`;
}
```

- [ ] **Step 5: Nối vào kiểu yêu cầu và export**

Trong `outline-types.ts`, thêm vào `UserRequirements`:

```ts
  /** Bối cảnh người học có cấu trúc. Vắng = hành vi y như trước vòng này. */
  learner?: LearnerContext;
```

Trong `index.ts`: `export * from './learner-types';` và thêm `formatLearnerContext` vào khối export của `prompt-formatters`.

- [ ] **Step 6: Chạy lại, phải xanh**

Run: `./scripts/with-pinned-node.sh pnpm --filter @openmaic/generation test learner-context`
Expected: PASS, 4 bài.

- [ ] **Step 7: Phá vật thật để chứng thước có răng**

Tạm xoá câu `chưa có gói khung` khỏi hàm, chạy lại → phải ĐỎ ở bài thứ ba với chuỗi đó. Khôi phục.

- [ ] **Step 8: Commit**

```bash
git add packages/@openmaic/generation/src/learner-types.ts packages/@openmaic/generation/src/prompt-formatters.ts packages/@openmaic/generation/src/outline-types.ts packages/@openmaic/generation/src/index.ts packages/@openmaic/generation/test/learner-context.test.ts
git commit -m "feat(generation): một bộ định dạng cho bối cảnh người học"
```

**Phục vụ:** E8 (chế độ đoán), nền cho E6, E9, E10.

---

### Task 2: Bộ đăng ký gói khung + gói mẫu Toán Cambridge

`independent: true`

**Files:**
- Create: `lib/server/curriculum-packs.ts`, `app/api/curriculum-packs/route.ts`, `skills/agent-runtime/cambridge-lower-secondary-maths-8/SKILL.md`, `skills/agent-runtime/cambridge-lower-secondary-maths-8/curriculum-pack.json`
- Test: `tests/curriculum/curriculum-packs.test.ts`

**Interfaces:**
- Produces: `findPack(subject, curriculum, gradeLabel): CurriculumPack | null`, `readPackBody(packId): Promise<string>`, `listPacks(): CurriculumPack[]`, kiểu `CurriculumPack { id, subject, curriculum, stage, gradesVn: string[], language, textbooks: string[] }`

- [ ] **Step 1: Viết bài kiểm đỏ trước**

```ts
// tests/curriculum/curriculum-packs.test.ts
import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadPacksFrom, findPackIn } from '@/lib/server/curriculum-packs';

function fixtureDir() {
  const root = mkdtempSync(join(tmpdir(), 'packs-'));
  const write = (id: string, body: unknown) => {
    mkdirSync(join(root, id), { recursive: true });
    writeFileSync(join(root, id, 'curriculum-pack.json'), JSON.stringify(body));
    writeFileSync(join(root, id, 'SKILL.md'), `---\nname: ${id}\n---\nthân gói ${id}`);
  };
  write('p-stage8', { subject: 'Toán', curriculum: 'cambridge-lower-secondary',
    stage: 8, gradesVn: ['lớp 7'], language: 'en-US', textbooks: ["Learner's Book 8"] });
  write('p-stage9', { subject: 'Toán', curriculum: 'cambridge-lower-secondary',
    stage: 9, gradesVn: ['lớp 8'], language: 'en-US', textbooks: ["Learner's Book 9"] });
  mkdirSync(join(root, 'p-hong'), { recursive: true });
  writeFileSync(join(root, 'p-hong', 'curriculum-pack.json'), '{ khong phai json');
  return root;
}

describe('bộ đăng ký gói khung', () => {
  it('khớp theo môn + giáo trình + LỚP', () => {
    const packs = loadPacksFrom(fixtureDir());
    expect(findPackIn(packs, 'Toán', 'cambridge-lower-secondary', 'lớp 7')?.id).toBe('p-stage8');
    expect(findPackIn(packs, 'Toán', 'cambridge-lower-secondary', 'lớp 8')?.id).toBe('p-stage9');
  });

  it('giáo trình chưa có gói thì trả null, không đoán bừa', () => {
    const packs = loadPacksFrom(fixtureDir());
    expect(findPackIn(packs, 'Toán', 'moet', 'lớp 7')).toBeNull();
  });

  it('gói hỏng bị bỏ qua kèm cảnh báo có tên tệp, gói lành vẫn nạp', () => {
    const warns: string[] = [];
    const packs = loadPacksFrom(fixtureDir(), (m) => warns.push(m));
    expect(packs.map((p) => p.id).sort()).toEqual(['p-stage8', 'p-stage9']);
    expect(warns.join(' ')).toContain('p-hong');
  });

  it('CHIỀU ĐỎ: bỏ bộ lọc lớp thì hai gói cùng khớp — thước phải bắt được', () => {
    const packs = loadPacksFrom(fixtureDir());
    const khongLocLop = packs.filter(
      (p) => p.subject === 'Toán' && p.curriculum === 'cambridge-lower-secondary',
    );
    expect(
      khongLocLop.length,
      'pack matched without grade equivalence',
    ).toBeGreaterThan(1);
    expect(findPackIn(packs, 'Toán', 'cambridge-lower-secondary', 'lớp 7')?.stage).toBe(8);
  });
});
```

- [ ] **Step 2: Chạy để thấy nó đỏ**

Run: `./scripts/with-pinned-node.sh pnpm test curriculum-packs`
Expected: FAIL — `Cannot find module '@/lib/server/curriculum-packs'`

- [ ] **Step 3: Viết bộ đăng ký**

```ts
// lib/server/curriculum-packs.ts
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
      (p) => p.subject === subject && p.curriculum === curriculum && p.gradesVn.includes(gradeLabel),
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
```

- [ ] **Step 4: Viết gói mẫu**

`skills/agent-runtime/cambridge-lower-secondary-maths-8/curriculum-pack.json`:

```json
{
  "subject": "Toán",
  "curriculum": "cambridge-lower-secondary",
  "stage": 8,
  "gradesVn": ["lớp 7"],
  "language": "en-US",
  "textbooks": ["Cambridge Lower Secondary Mathematics Learner's Book 8"]
}
```

`SKILL.md` — frontmatter `name`/`title`/`description` theo nếp các gói builtin khác; thân gói viết theo bốn mục: **Mạch và unit** (tên unit/chủ đề theo mục lục Learner's Book 8, KHÔNG mã mục tiêu, KHÔNG câu mục tiêu nguyên văn) · **Cách Cambridge dựng bài** (diễn giải lại, không trích) · **Từ vựng và ký hiệu tiếng Anh nên dùng** · **Luật nói neo**: trước khi soạn phải nêu bài neo vào unit nào bằng ngôn ngữ của người học, tên unit đứng trước tên sách.

- [ ] **Step 5: Viết tuyến danh sách gói**

```ts
// app/api/curriculum-packs/route.ts
import { NextResponse } from 'next/server';
import { listPacks } from '@/lib/server/curriculum-packs';

export function GET() {
  // Thẻ 5 câu chỉ cần biết gói nào tồn tại để hiện «có gói / chưa có gói».
  return NextResponse.json({ packs: listPacks() });
}
```

- [ ] **Step 6: Chạy lại, phải xanh**

Run: `./scripts/with-pinned-node.sh pnpm test curriculum-packs`
Expected: PASS, 4 bài.

- [ ] **Step 7: Phá vật thật**

Tạm bỏ `p.gradesVn.includes(gradeLabel)` khỏi `findPackIn`, chạy lại → bài thứ nhất đỏ (lớp 8 trả về stage 8). Khôi phục.

- [ ] **Step 8: Commit**

```bash
git add lib/server/curriculum-packs.ts app/api/curriculum-packs skills/agent-runtime/cambridge-lower-secondary-maths-8 tests/curriculum
git commit -m "feat(curriculum): bộ đăng ký gói khung và gói Toán Cambridge Stage 8"
```

**Phục vụ:** E2.

---

### Task 3: Kho hồ sơ người học + sổ đăng ký là nguồn của cả nạp lại lẫn xoá

`independent: true`

**Files:**
- Create: `lib/store/learner-profile.ts`
- Modify: `lib/store/account-stores.ts:29-41`, `components/settings/general-settings.tsx:69-78`
- Test: `tests/persistence/learner-profile-store.test.ts`

**Interfaces:**
- Produces: `useLearnerProfileStore` với state `{ learner: LearnerContext | null; setLearner; clearLearner; isComplete(): boolean }`, persist name `learner-profile-storage`

- [ ] **Step 1: Viết bài kiểm đỏ trước**

```ts
// tests/persistence/learner-profile-store.test.ts
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isCompleteLearner } from '@/lib/store/learner-profile';

const FULL = { nickname: 'Bi', gradeLabel: 'lớp 7', school: 'Emasi',
  subjects: [{ subject: 'Toán', curriculum: 'cambridge-lower-secondary', language: 'en-US' }] };

describe('hồ sơ người học', () => {
  it('đủ ba phần bắt buộc mới là hợp lệ', () => {
    expect(isCompleteLearner(FULL)).toBe(true);
    expect(isCompleteLearner({ ...FULL, nickname: '' })).toBe(false);
    expect(isCompleteLearner({ ...FULL, gradeLabel: '' })).toBe(false);
    expect(isCompleteLearner({ ...FULL, subjects: [] })).toBe(false);
    expect(isCompleteLearner({ ...FULL, subjects: [{ subject: 'Toán', curriculum: '', language: 'en-US' }] })).toBe(false);
  });

  it('CHIỀU ĐỎ: trạng thái gói KHÔNG được ghi cứng vào hồ sơ lúc lưu', () => {
    const src = readFileSync(join(process.cwd(), 'lib/store/learner-profile.ts'), 'utf8');
    expect(src, 'pack match frozen into the stored profile').not.toMatch(/findPack|curriculum-packs/);
  });

  it('danh sách xoá bộ nhớ đệm rút từ sổ đăng ký, không chép tay', () => {
    const src = readFileSync(join(process.cwd(), 'components/settings/general-settings.tsx'), 'utf8');
    expect(src, 'clear-cache skipped an account store: hand-written list').toContain('ACCOUNT_SCOPE_STORES');
    expect(src).not.toMatch(/clearPersistedStore\(\s*useSettingsStore\.persist/);
  });
});
```

- [ ] **Step 2: Chạy để thấy nó đỏ**

Run: `./scripts/with-pinned-node.sh pnpm test learner-profile-store`
Expected: FAIL — module chưa có.

- [ ] **Step 3: Viết kho** — chép đúng khuôn `lib/store/user-profile.ts` (kể cả biến `recovery` phá vòng kiểu và `purgeLegacyPersistKey`), đổi `name` thành `'learner-profile-storage'`, state là `{ learner: LearnerContext | null }` + `setLearner` + `clearLearner`. Thêm hàm thuần `isCompleteLearner(l)` trả true khi có `nickname`, `gradeLabel`, và ít nhất một môn đủ `subject`+`curriculum`+`language`. KHÔNG import bộ đăng ký gói — trạng thái gói tính lúc hiển thị, không lưu cứng.

- [ ] **Step 4: Khai vào sổ đăng ký**

Thêm vào `ACCOUNT_SCOPE_STORES` của `lib/store/account-stores.ts`:

```ts
  learnerProfile: {
    persistName: 'learner-profile-storage',
    persist: useLearnerProfileStore.persist,
    getState: () => useLearnerProfileStore.getState() as unknown as Record<string, unknown>,
  },
```

- [ ] **Step 5: Xoá bộ nhớ đệm rút từ sổ đăng ký**

Trong `components/settings/general-settings.tsx`, thay hai dòng chép tay bằng:

```ts
        clearPersistedStores: async () => {
          // Rút từ sổ đăng ký, không chép tay: thêm một kho account mà quên
          // thêm vào đây là lớp lỗi đã xảy ra một lần (cau-hinh-di-theo-nguoi#F1).
          await Promise.all(
            Object.values(ACCOUNT_SCOPE_STORES).map((s) =>
              clearPersistedStore(s.persist, s.persistName),
            ),
          );
        },
```

- [ ] **Step 6: Chạy hai bộ, phải xanh**

Run: `./scripts/with-pinned-node.sh pnpm test learner-profile-store && ./scripts/with-pinned-node.sh pnpm test account-scope-wiring`
Expected: PASS cả hai — bài `account-scope-wiring` đã có sẵn và tự rút danh sách từ mã nguồn, nên nó chứng luôn rằng kho mới không bị bỏ sót.

- [ ] **Step 7: Phá vật thật**

Tạm gỡ mục `learnerProfile` khỏi `ACCOUNT_SCOPE_STORES`, chạy `account-scope-wiring` → phải ĐỎ với `account key set drifted from the declared scope: learner-profile`. Khôi phục.

- [ ] **Step 8: Commit**

```bash
git add lib/store/learner-profile.ts lib/store/account-stores.ts components/settings/general-settings.tsx tests/persistence/learner-profile-store.test.ts
git commit -m "feat(store): hồ sơ người học đi theo tài khoản, xoá theo sổ đăng ký"
```

**Phục vụ:** E1b, E3, E4.

---

### Task 4: Ô template mới + mặc định rỗng + ảnh chụp prompt nền

Phụ thuộc Task 1.

**Files:**
- Modify: `packages/@openmaic/generation/templates/requirements-to-outlines/user.md`, `.../slide-content/user.md`, `.../quiz-content/user.md`, `packages/@openmaic/generation/src/prompts/loader.ts:15-20`, `lib/prompts/templates/interactive-outlines/user.md`, `lib/prompts/templates/task-engine-outlines/user.md`, `lib/prompts/loader.ts`
- Test: `packages/@openmaic/generation/test/no-regression-prompt.test.ts`

**Interfaces:**
- Consumes: `formatLearnerContext` (Task 1)
- Produces: ô `{{curriculumContext}}` trong template dàn ý, `{{learnerContext}}` trong slide/quiz; mặc định rỗng cho cả hai ở `PROMPT_VARIABLE_DEFAULTS`

- [ ] **Step 1: Ghim ảnh chụp nền TRƯỚC khi sửa gì**

```bash
git stash list  # cây phải sạch
node -e "require('child_process').execSync('git rev-parse HEAD')"  # ghi lại
./scripts/with-pinned-node.sh node scripts/pin-prompt-baseline.mjs --out packages/@openmaic/generation/test/__baseline__/prompts-40f1cf9.json
```

Bộ ghim là một script nhỏ (viết ở bước này) gọi `buildOutlinePrompt`, `buildPrompt('slide-content'|'quiz-content'|'slide-actions')` với fixture cố định KHÔNG có learner, ghi JSON. Tên tệp mang bảy ký tự đầu của commit nền `40f1cf9` — phép đo đối chiếu hash trong tên với `prototype.base_commit` của `opportunity.md`.

- [ ] **Step 2: Viết bài kiểm không-hồi-quy**

```ts
// packages/@openmaic/generation/test/no-regression-prompt.test.ts
import { describe, expect, test } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { buildOutlinePrompt } from '../src';

const DIR = join(__dirname, '__baseline__');
const BASE_COMMIT = '40f1cf954f5d2a5b6593e5d1dfe0ef85a05b26f9';

test('ảnh chụp nền ghim đúng commit nền đã khai', () => {
  const files = readdirSync(DIR);
  expect(files, 'baseline snapshot postdates the round').toContain(
    `prompts-${BASE_COMMIT.slice(0, 7)}.json`,
  );
});

test('hồ sơ trống: prompt bằng TỪNG BYTE với nền', () => {
  const base = JSON.parse(readFileSync(join(DIR, `prompts-${BASE_COMMIT.slice(0, 7)}.json`), 'utf8'));
  const now = buildOutlinePrompt({ requirement: 'Teach recursion to beginners' },
    { researchContext: '', teacherContext: '' });
  expect(now).toEqual(base.outline);
});

test('CHIỀU ĐỎ: ô mới không có mặc định thì lộ ra ngay', () => {
  const p = buildOutlinePrompt({ requirement: 'x' }, {});
  expect(p.user, 'unresolved template variable: {{curriculumContext}}').not.toContain('{{');
});
```

- [ ] **Step 3: Chạy — bài thứ ba phải ĐỎ sau khi thêm ô vào template, xanh sau khi thêm mặc định**

- [ ] **Step 4: Thêm ô vào template**

`requirements-to-outlines/user.md`: thêm `{{curriculumContext}}` ngay dưới `{{userProfile}}`. `slide-content/user.md` và `quiz-content/user.md`: thêm `{{learnerContext}}` cạnh `{{teacherContext}}`. Hai template app-owned: thêm `{{curriculumContext}}` dưới `{{userProfile}}`.

- [ ] **Step 5: Thêm mặc định rỗng ở CẢ HAI bộ nạp**

```ts
const PROMPT_VARIABLE_DEFAULTS = {
  'pbl-actions': { /* … giữ nguyên … */ },
  'requirements-to-outlines': { curriculumContext: '' },
  'slide-content': { learnerContext: '' },
  'quiz-content': { learnerContext: '' },
} satisfies PromptVariableDefaults;
```

Làm tương tự trong `lib/prompts/loader.ts` cho `interactive-outlines` và `task-engine-outlines`.

- [ ] **Step 6: Chạy toàn bộ test gói generation**

Run: `./scripts/with-pinned-node.sh pnpm --filter @openmaic/generation test`
Expected: PASS — kể cả `outline-prompt.test.ts` đã có (snapshot cũ không đổi vì ô mới rỗng).

- [ ] **Step 7: Commit**

```bash
git add packages/@openmaic/generation/templates packages/@openmaic/generation/src/prompts/loader.ts packages/@openmaic/generation/test lib/prompts
git commit -m "feat(prompts): ô bối cảnh người học và khung giáo trình, mặc định rỗng"
```

**Phục vụ:** E9.

---

### Task 5: Cửa bấm-một-phát — hợp nhất ba chỗ định dạng, tra gói ở route, phát sự kiện neo

Phụ thuộc Task 1, 2, 4.

**Files:**
- Modify: `packages/@openmaic/generation/src/outline-generator.ts:82-118`, `app/api/generate/scene-outlines-stream/route.ts:287-340,550-575`, `app/generation-preview/page.tsx:600-660,950-965`, `app/page.tsx:600-620`
- Test: `tests/api/outline-stream-learner.test.ts`

**Interfaces:**
- Consumes: `formatLearnerContext`, `findPack`, `readPackBody`
- Produces: sự kiện SSE `{ type: 'curriculumAnchor', data: string }`

- [ ] **Step 1: Viết phép đo ĐẦU-CUỐI (đây là phép đo P0 của lượt phản biện)**

```ts
// tests/api/outline-stream-learner.test.ts — rút gọn, xem evals.yaml E7b cho đủ ba assert
it('hồ sơ đi từ thân yêu cầu tới prompt, thân gói do ROUTE tự tra', async () => {
  const seen: { system: string; user: string }[] = [];
  vi.mock('@/lib/server/ai-call', () => ({ aiCall: (s: string, u: string) => {
    seen.push({ system: s, user: u });
    return JSON.stringify({ languageDirective: 'vi', courseTitle: 'x',
      curriculumAnchor: 'Unit 3 — Tỉ lệ và tỉ số', outlines: [] });
  } }));
  const res = await POST(new NextRequest('http://localhost/api/generate/scene-outlines-stream', {
    method: 'POST',
    body: JSON.stringify({ requirements: { requirement: 'tỉ lệ và tỉ số',
      learner: { nickname: 'Bi', gradeLabel: 'lớp 7', subjects: [
        { subject: 'Toán', curriculum: 'cambridge-lower-secondary', language: 'en-US' }] } } }),
  }));
  const body = await res.text();
  // (a) thân gói có mặt — route tự tra, thân yêu cầu KHÔNG hề chứa nó
  expect(seen[0].user, 'curriculum pack body missing from outline prompt').toContain('Unit 3');
  // (b) khối hồ sơ do bộ định dạng chung sinh
  expect(seen[0].user, 'learner dropped between request and outline prompt').toContain('Bi');
  // (c) sự kiện neo đi cùng luồng
  expect(body, 'curriculumAnchor event missing from outline stream').toContain('"type":"curriculumAnchor"');
});
```

- [ ] **Step 2: Chạy để thấy đỏ cả ba assert**

Run: `./scripts/with-pinned-node.sh pnpm test outline-stream-learner`

- [ ] **Step 3: Gỡ bản chép tay trong bộ sinh dàn ý**

Trong `outline-generator.ts`, thay khối `userProfileText` (dòng 89-92) bằng `formatLearnerContext(requirements.learner)`; giữ đường cũ cho `userNickname`/`userBio` khi `learner` vắng (không vỡ người dùng cũ). Thêm `curriculumContext` vào biến prompt. Trong hệ thống prompt dàn ý, thêm luật: khi có khung giáo trình, trả thêm khoá `curriculumAnchor` — một câu bằng ngôn ngữ của người học nêu bài neo vào unit nào, tên unit trước tên sách.

- [ ] **Step 4: Route tra gói và phát sự kiện**

Trong route: đọc `requirements.learner`, chọn môn theo `subjectIndex` trong thân yêu cầu, gọi `findPack(...)` rồi `readPackBody(...)`, truyền vào `generateSceneOutlinesFromRequirements` qua `options.curriculumContext`. GỠ bản chép tay `## Student Profile` ở dòng 317-320. Sau khi có `courseTitle`, phát thêm sự kiện `curriculumAnchor` theo đúng khuôn hai sự kiện đã có.

- [ ] **Step 5: Gỡ bản chép tay thứ ba**

Trong `app/generation-preview/page.tsx:958-961`, thay chuỗi `Student: …` bằng `formatLearnerContext(session.requirements.learner)`; bắt sự kiện `curriculumAnchor` như đang bắt `courseTitle`, cất vào state phiên.

- [ ] **Step 6: Trang chủ gửi hồ sơ**

Trong `app/page.tsx` chỗ dựng `UserRequirements` (dòng ~607), thêm `learner: useLearnerProfileStore.getState().learner ?? undefined` và môn đang chọn.

- [ ] **Step 7: Chạy, phải xanh; rồi đếm lại số bản chép tay**

Run: `./scripts/with-pinned-node.sh pnpm test outline-stream-learner`
Run: `grep -rn "## Student Profile" --include=*.ts --include=*.tsx lib app packages | wc -l` → phải còn **2** (hai chỗ của lớp học đang chạy, cố ý ngoài phạm vi).

- [ ] **Step 8: Phá vật thật**

Bỏ dòng `findPack` trong route → assert (a) đỏ với chuỗi đã ghim. Khôi phục.

- [ ] **Step 9: Commit**

```bash
git add packages/@openmaic/generation/src/outline-generator.ts app/api/generate/scene-outlines-stream/route.ts app/generation-preview/page.tsx app/page.tsx tests/api/outline-stream-learner.test.ts
git commit -m "feat(generate): một bộ định dạng, route tra gói khung, sự kiện neo"
```

**Phục vụ:** E6, E7b.

---

### Task 6: Nội dung slide, quiz và lời giảng nhận bối cảnh

Phụ thuộc Task 1, 4, 5.

**Files:**
- Modify: `packages/@openmaic/generation/src/scene-generator.ts:710-725,867-875,1664-1770`
- Test: `packages/@openmaic/generation/test/learner-in-scene-prompts.test.ts`

- [ ] **Step 1: Bài kiểm — ba đường đều lấy từ CÙNG một hàm**

Dựng một `UserRequirements` có learner, gọi lần lượt ba bộ sinh với AI giả ghi lại prompt, assert cả ba prompt chứa đúng chuỗi mà `formatLearnerContext` trả về (so chuỗi con, không so ba bản vàng riêng). Chiều đỏ: cho một đường tự ghép chuỗi → đỏ với `learner context diverged from the shared formatter: <tên hàm>`.

- [ ] **Step 2: Chạy thấy đỏ.** - [ ] **Step 3: Nối `learnerContext` vào ba chỗ dựng biến.** - [ ] **Step 4: Chạy thấy xanh.** - [ ] **Step 5: Phá vật thật rồi khôi phục.**

- [ ] **Step 6: Commit**

```bash
git commit -am "feat(generation): slide, quiz và lời giảng nhận bối cảnh người học"
```

**Phục vụ:** E10.

---

### Task 7: Thẻ 5 câu

Phụ thuộc Task 2, 3.

**Files:**
- Create: `components/settings/learner-profile-settings.tsx`
- Modify: `components/settings/index.tsx:770-910,1119-1171`, `lib/types/settings.ts:3-15`
- Test: `tests/components/learner-profile-settings.test.tsx`

- [ ] **Step 1: Bài kiểm sáu trạng thái** — render thẻ, assert từng trạng thái `ST-the-*` có mặt qua thuộc tính `data-state="ST-the-…"` (cùng nếp mục «Máy của tôi» đã dùng, để phép đo chụp sống bám vào). Sáu dòng: trống · đang điền · môn có gói · môn chưa gói · đã lưu · chưa lưu được.
- [ ] **Step 2: Chạy thấy đỏ.**
- [ ] **Step 3: Viết thẻ.** Một cột cuộn. Tên gọi (≤40 ký tự) · lớp (dropdown 1–12) · trường (≤80) · danh sách dòng môn (môn ▾ · chương trình ▾ · ngôn ngữ ▾ · sách) với «+ thêm môn» · nút Lưu chỉ bật khi `isCompleteLearner`. Mỗi dòng môn gọi `/api/curriculum-packs` một lần rồi khớp tại chỗ để hiện «✓ có gói khung — <tên sách>» hoặc «chưa có gói cho chương trình này — máy sẽ đoán và nói rõ». Lưu hỏng → toast «chưa lưu được — giá trị vẫn giữ trên màn», KHÔNG phát toast đã lưu. TUYỆT ĐỐI không có chuỗi «Stage» trên thẻ.
- [ ] **Step 4: Thêm `'learner'` vào `SettingsSection` và một mục nav + pane trong dialog.**
- [ ] **Step 5: Chạy thấy xanh.**
- [ ] **Step 6: Phá vật thật** — bỏ nhánh lỗi lưu → bài trạng thái `ST-the-loi-luu` đỏ. Khôi phục.
- [ ] **Step 7: Commit**

```bash
git commit -am "feat(settings): thẻ 5 câu khai bé đang học gì"
```

**Phục vụ:** E1, E15.

---

### Task 8: Ô «Soạn cho» và dòng mời trên trang chủ

Phụ thuộc Task 3, 7.

**Files:**
- Modify: `app/page.tsx:890-930,1355-1450`
- Create: `lib/store/selected-subject.ts` (lựa chọn nhớ, phạm vi máy — localStorage như các công tắc trang chủ)
- Test: `tests/components/selected-subject.test.ts`

- [ ] **Step 1: Bài kiểm bốn nhánh hàm thuần** `resolveSelectedSubject(learner, remembered)`: trống → null · một môn → môn đó · nhớ hợp lệ → giữ · nhớ trỏ môn đã xoá → môn đầu còn lại. Chiều đỏ: trả thẳng lựa chọn nhớ → `remembered subject survived its own deletion`.
- [ ] **Step 2: Chạy thấy đỏ.** - [ ] **Step 3: Viết hàm + nối vào trang chủ** (dòng mời khi trống, ô chọn khi có). - [ ] **Step 4: Chạy thấy xanh.** - [ ] **Step 5: Phá vật thật rồi khôi phục.**
- [ ] **Step 6: Commit**

```bash
git commit -am "feat(home): ô «Soạn cho» và dòng mời khai hồ sơ"
```

**Phục vụ:** E5, E5b.

---

### Task 9: Dòng neo trên màn xem trước

Phụ thuộc Task 5.

**Files:**
- Create: `components/generation/curriculum-anchor-line.tsx`
- Modify: `components/generation/outlines-editor.tsx`, `app/generation-preview/page.tsx`
- Test: `tests/components/curriculum-anchor-line.test.tsx`

- [ ] **Step 1: Bài kiểm ba biến thể** — `ST-neo-co-goi` (tên unit trước, tên sách sau, mã nếu có thì in nhỏ và KHÔNG đứng đầu) · `ST-neo-dang-doan` (có cảnh báo, nêu tên giáo trình chưa có gói) · `ST-neo-khong` (hồ sơ trống → không render gì). Chiều đỏ: dòng neo mở đầu bằng mã → đỏ.
- [ ] **Step 2–5: đỏ → viết → xanh → phá vật thật.**
- [ ] **Step 6: Commit**

```bash
git commit -am "feat(preview): dòng neo nói bài bám vào unit nào"
```

**Phục vụ:** E7, E8b.

---

### Task 10: Cửa xưởng Pro — bản chụp KV và khối người học

Phụ thuộc Task 1, 2, 3.

**Files:**
- Create: `lib/server/agent-runtime/learner-context.ts`
- Modify: `app/api/agent/sessions/route.ts:28-95,150-165`, `app/api/agent/sessions/[id]/messages/route.ts:85-95`, `lib/server/agent-runtime/course-tools.ts:276-318`, `lib/server/agent-runtime/runner.ts:1461-1472`
- Test: `tests/agent-runtime/learner-context.test.ts`

**Interfaces:**
- Produces: `parseLearner(raw: unknown): LearnerContext` (ném lỗi có tên trường), `saveLearnerSnapshot(ownerId, learner)`, `readLearnerSnapshot(ownerId)`, `learnerPromptBlock(learner, packs): string`, `CoursePromptBlocks.learner?: string`

- [ ] **Step 1: Bài kiểm** — ba vế: hồ sơ sai hình (subjects không phải mảng · tên >40 ký tự · curriculum không phải chuỗi) → 400 nêu tên trường; hồ sơ đúng hình → 201 và ngăn KV (PGlite) có khoá `learner-profile.snapshot` đúng nội dung; lược đồ bảng phiên KHÔNG có cột mới. Cộng: `learnerPromptBlock` nêu tên bé, các môn và dòng «đọc skill `<tên gói>` trước khi soạn môn Toán»; bản chụp vắng → không khối. Hai chiều đỏ: bỏ kiểm hình → `malformed learner accepted`; xoá dòng trỏ tên skill → `learner block does not name the curriculum pack skill`.
- [ ] **Step 2: Chạy thấy đỏ.**
- [ ] **Step 3: Viết `learner-context.ts`** — `learnerPromptBlock` GỌI `formatLearnerContext` rồi bọc thêm tiêu đề khối và câu trỏ tên skill; KHÔNG tự ghép chuỗi. Bản chụp qua `getServerPersistenceProvider(...).kvStore.set(ownerId, 'learner-profile.snapshot', learner)` — chỉ GỌI, không sửa gì trong `lib/persistence`.
- [ ] **Step 4: Nối route và runner.** Thêm `learner?: string` vào `CoursePromptBlocks` và một dòng trong `courseSystemPrompt` ngay trước khối tài liệu.
- [ ] **Step 5: Chạy thấy xanh.** - [ ] **Step 6: Phá vật thật rồi khôi phục.**
- [ ] **Step 7: Commit**

```bash
git commit -am "feat(agent): khối người học trong prompt hệ thống, bản chụp theo chủ sở hữu"
```

**Phục vụ:** E11, E12, E8 (vế agent).

---

### Task 11: Bộ sinh cặp dàn ý mù + khoá cấu hình

Phụ thuộc Task 5.

**Files:**
- Create: `scripts/gen-dan-y-mu.mjs`
- Modify: `_acceptance/config.yaml` (khoá `executors.script.dan_y_mu`)

- [ ] **Step 1: Viết script** — gọi tuyến dàn ý thật hai lần cùng đề «tỉ lệ và tỉ số», cùng hồ sơ lớp 7: một lượt có gói, một lượt không. Ghi `_acceptance/hieu-be-dang-hoc-gi/evidence/E13-dan-y-{A,B}.md`, dòng đầu mỗi tệp là mã lượt chạy; thứ tự A/B xáo ngẫu nhiên; bản ghi nào là bản nào ghi ra `evidence/E13-khoa.txt`. Chiều đỏ: cả hai lượt cùng đi đường không-gói → thoát khác 0 với `both outlines generated without a curriculum pack`.
- [ ] **Step 2: Khai khoá cấu hình bằng script splice chung, KHÔNG sửa tay**

```bash
node "$(node /Users/manhphan/.claude/plugins/cache/acceptance-gate-kit/feature-loop/2.18.1/scripts/resolve-plugin.mjs --plugin acceptance-gate)/scripts/config-patch.mjs" --config _acceptance/config.yaml --key executors.script.dan_y_mu --value "./scripts/with-pinned-node.sh node scripts/gen-dan-y-mu.mjs" --write
```

- [ ] **Step 3: Chạy thử script, kiểm hai tệp có mã lượt chạy ở dòng đầu.**
- [ ] **Step 4: Commit**

```bash
git add scripts/gen-dan-y-mu.mjs _acceptance/config.yaml
git commit -m "test(acceptance): bộ sinh cặp dàn ý mù cho phép thử của Cổng Giá trị"
```

**Phục vụ:** E13gen.

---

### Task 12: i18n đủ 12 ngôn ngữ

Phụ thuộc Task 7, 8, 9.

**Files:**
- Modify: cả 12 tệp `lib/i18n/locales/*.json`

- [ ] **Step 1:** Gom mọi chuỗi mới vào khối `settings.learnerProfile.*`, `home.learnerInvite.*`, `preview.curriculumAnchor.*` trong `en-US.json` (nguồn).
- [ ] **Step 2:** Dịch sang 11 tệp còn lại. Tiếng Việt là ngôn ngữ của persona — soi kỹ nhất; giữ chữ mặt phụ huynh, không «Stage», không mã.
- [ ] **Step 3:** Run `./scripts/with-pinned-node.sh pnpm check:i18n-keys` → phải báo 12 tệp khớp.
- [ ] **Step 4: Commit**

```bash
git commit -am "i18n: chuỗi cho hồ sơ người học và dòng neo"
```

---

### Task 13: Khoá cấp kho — prettier, eslint, typecheck, toàn bộ test

Phụ thuộc mọi task.

- [ ] **Step 1:** `./scripts/with-pinned-node.sh pnpm check` → sạch (file mới theo prettier kho).
- [ ] **Step 2:** `./scripts/with-pinned-node.sh pnpm lint` → 0 lỗi.
- [ ] **Step 3:** `./scripts/with-pinned-node.sh npx tsc --noEmit` → exit 0.
- [ ] **Step 4:** `./scripts/with-pinned-node.sh pnpm test && ./scripts/with-pinned-node.sh pnpm --filter @openmaic/generation test`.
- [ ] **Step 5:** `./scripts/with-pinned-node.sh node scripts/design-gate-changed.mjs` → sàn P0 đạt trên file giao diện vòng đụng.
- [ ] **Step 6:** Đặt `status: implemented` trong `_acceptance/hieu-be-dang-hoc-gi/contract.md` — đây là hành động CUỐI của người thi công.
- [ ] **Step 7: Commit**

```bash
git commit -am "chore(acceptance): contract về status implemented"
```

---

## Self-Review

**Độ phủ spec:** 16 AC → AC-1 T7+T3 · AC-2 T2+T7 · AC-3 T3 · AC-4 T3 · AC-5 T8 · AC-6 T5 · AC-7 T5+T9 · AC-8 T1+T9+T10 · AC-9 T4 · AC-10 T6 · AC-11 T10 · AC-12 T10 · AC-13 T11 · AC-14 T7+T9 (mắt hội đồng) · AC-15 T13 · AC-16 T3+T7. Không AC nào không có task.

**Quét chỗ trống:** không có TBD/TODO; mọi bước code có khối mã thật hoặc chỉ dẫn đủ cụ thể để thi công không phải đoán tên hàm.

**Nhất quán kiểu:** `LearnerContext`/`LearnerSubject` khai ở T1 và dùng nguyên tên ở T3, T5, T10. `formatLearnerContext` một tên duy nhất ở mọi chỗ. `findPack`/`readPackBody`/`listPacks` khai ở T2, dùng nguyên tên ở T5, T7, T10. `isCompleteLearner` khai T3 dùng T7.

**Task độc lập (chạy song song được):** T1, T2, T3.

## Lối A (2026-09-22) — sửa khuôn sau ba vòng nghiệm thu

Ba việc thay cho phần tương ứng của Task 5, 9 và 10 ở trên (giữ lại làm lịch sử):

1. **Hồ sơ ở đúng tầng tuổi thọ.** `LearnerContext` sống ở `@openmaic/dsl` và `Stage.learner?`
   (trường tuỳ chọn thêm; `build:schema`). Màn xem trước đóng `stage.learner`; túi tiếp-tục và
   lớp học mở lại mang nó; `lib/hooks/continuation-requirements.ts` là hàm thuần duy nhất dựng
   `requirements` cho trang 2..N ở cả hai chỗ gọi.
2. **Không bản sao mồ côi.** `lib/store/learner-profile-key.ts` giữ MỘT tên kho; máy chủ
   (`readLearnerProfileForOwner`) đọc thẳng `learner-profile-storage` ở ngăn account và bóc phong
   bì persist; route mở phiên và client không còn mang `learner`; `generate_scene` nhận hồ sơ qua
   deps của bộ công cụ. Thẻ 5 câu ghi chú khi xưởng bật mà đồng bộ tắt.
3. **Câu neo suy trong code.** `lib/server/curriculum-anchor.ts` + mục lục `units` trong
   `curriculum-pack.json`; route phát sự kiện từ bản suy; sáu khuôn dàn ý không còn xin mô hình.

Phép đo: E4, E7, E7b, E7c (mới), E10, E10b (mới), E11, E12 sửa theo; hợp đồng AC-4/7/10/11/12.
