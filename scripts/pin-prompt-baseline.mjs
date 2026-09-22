#!/usr/bin/env node
/**
 * Ghim ảnh chụp prompt NỀN — chạy TRƯỚC khi sửa dòng template đầu tiên.
 *
 * Phép đo không-hồi-quy chỉ có răng khi ảnh nền được sinh trên commit NỀN.
 * Sinh nó sau khi đã sửa template thì nó bằng chính bản đã sửa: xanh trống
 * rỗng. Tên tệp mang bảy ký tự đầu của commit nền, và bài kiểm đối chiếu
 * hash ấy với `prototype.base_commit` trong opportunity.md — ảnh nền sinh
 * muộn thì lộ ra ở tên, không cần tin lời ai.
 *
 * Bộ ghim TỪ CHỐI ghi khi mặt prompt đã đổi so với commit nền — nên tệp ảnh
 * nền tồn tại là bằng chứng máy, không phải lời hứa của người chạy nó.
 *
 * Dùng: node scripts/pin-prompt-baseline.mjs --base <sha nền> --out <.json>
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { buildOutlinePrompt } from '@openmaic/generation';

const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf(name);
  return i === -1 ? undefined : argv[i + 1];
};
const out = opt('--out');
const base = opt('--base');
if (!out || !base) {
  process.stderr.write('pin-prompt-baseline: --base <sha> và --out <file> đều bắt buộc\n');
  process.exit(2);
}

const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();

/**
 * Mặt prompt: mọi chỗ mà một thay đổi ở đó làm ảnh nền thôi là ảnh NỀN.
 * Ghim ở HEAD khác commit nền vẫn hợp lệ — MIỄN LÀ khoảng giữa không đụng
 * mặt này. Đụng thì từ chối, vì lúc ấy ảnh chụp chính bản đã sửa.
 */
const PROMPT_SURFACE = ['packages/@openmaic/generation', 'lib/prompts', 'app/api/generate'];
const drift = execFileSync('git', ['diff', '--name-only', `${base}..${head}`, '--', ...PROMPT_SURFACE], {
  encoding: 'utf8',
})
  .split('\n')
  .filter(Boolean)
  // Chính tệp ảnh nền nằm trong mặt prompt — nó đổi là chuyện đương nhiên.
  .filter((f) => !f.includes('/test/__baseline__/'));
if (drift.length) {
  process.stderr.write(
    `pin-prompt-baseline: baseline snapshot postdates the round — mặt prompt đã đổi giữa ${base.slice(0, 7)} và ${head.slice(0, 7)}:\n` +
      drift.map((f) => `  ${f}\n`).join(''),
  );
  process.exit(1);
}

/** Dữ liệu dựng sẵn CỐ ĐỊNH — đổi nó là đổi ý nghĩa của ảnh nền. */
const FIXTURES = {
  outlineBare: [{ requirement: 'Teach recursion to beginners' }, { researchContext: '', teacherContext: '' }],
  outlineLegacyProfile: [
    { requirement: 'Dạy tỉ lệ và tỉ số', userNickname: 'Bi', userBio: 'học sinh lớp 7' },
    { researchContext: '', teacherContext: '' },
  ],
};

const snapshot = {
  base_commit: base,
  pinned_at_sha: head,
  /** Máy đã chứng: không tệp nào của mặt prompt đổi giữa hai mốc trên. */
  prompt_surface_unchanged: true,
  fixtures: Object.keys(FIXTURES),
  outline: buildOutlinePrompt(...FIXTURES.outlineBare),
  outlineLegacyProfile: buildOutlinePrompt(...FIXTURES.outlineLegacyProfile),
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(snapshot, null, 2) + '\n');
process.stdout.write(
  `pin-prompt-baseline: nền ${base.slice(0, 7)} · ghim tại ${head.slice(0, 7)} · mặt prompt không đổi → ${out}\n`,
);
