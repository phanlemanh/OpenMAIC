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
  write('p-stage8', {
    subject: 'Toán',
    curriculum: 'cambridge-lower-secondary',
    stage: 8,
    gradesVn: ['lớp 7'],
    language: 'en-US',
    textbooks: ["Learner's Book 8"],
  });
  write('p-stage9', {
    subject: 'Toán',
    curriculum: 'cambridge-lower-secondary',
    stage: 9,
    gradesVn: ['lớp 8'],
    language: 'en-US',
    textbooks: ["Learner's Book 9"],
  });
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
    expect(khongLocLop.length, 'pack matched without grade equivalence').toBeGreaterThan(1);
    expect(findPackIn(packs, 'Toán', 'cambridge-lower-secondary', 'lớp 7')?.stage).toBe(8);
  });
});
