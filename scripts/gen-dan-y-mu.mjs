#!/usr/bin/env node
/**
 * Sinh CẶP DÀN Ý MÙ cho phép thử của Cổng Giá trị.
 *
 * Ngưỡng đã ký ở Cổng Đáng có một vế là phép thử mù: đặt hai dàn ý cùng đề
 * cạnh mục lục sách của bé, một bài sinh CÓ gói khung một bài KHÔNG, và xem
 * người đọc có nhận ra bài nào có gói — và nói được vì sao.
 *
 * Vì sao phải là một script chứ không phải hai tệp ai đó viết tay: một cặp
 * viết tay (hoặc sinh một lần rồi sửa) làm hội đồng phân biệt đúng trong khi
 * CHƯA có dàn ý thật nào chạy qua gói. Lúc ấy phép thử mù xanh mà thứ nó định
 * đo thì chưa từng tồn tại. Nên hai tệp phải đến từ CHÍNH tuyến soạn thật, mang
 * mã lượt chạy ở dòng đầu, và hội đồng chỉ chấm tệp có mã.
 *
 * Dùng: node scripts/gen-dan-y-mu.mjs [--slug <slug>] [--de "<đề bài>"]
 * Cần: DATABASE_URL không bắt buộc; cần khoá mô hình phía máy chủ như mọi lượt
 * soạn thật. Thiếu khoá → thoát 2 và nói rõ, KHÔNG dựng dữ liệu giả.
 */
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(name);
  return i === -1 ? fallback : argv[i + 1];
};

const slug = opt('--slug', 'hieu-be-dang-hoc-gi');
const de = opt('--de', 'tỉ lệ và tỉ số');
const outDir = join(process.cwd(), '_acceptance', slug, 'evidence');

const LEARNER = {
  nickname: 'Bi',
  gradeLabel: 'lớp 7',
  school: 'Emasi',
  subjects: [
    {
      subject: 'Toán',
      curriculum: 'cambridge-lower-secondary',
      language: 'en-US',
      textbook: "Cambridge Lower Secondary Mathematics Learner's Book 8",
    },
  ],
};

async function outlineFor({ withPack }) {
  const { generateSceneOutlinesFromRequirements } = await import('@openmaic/generation');
  const { findPack, readPackBody } = await import('../lib/server/curriculum-packs.js');
  const { callLLM } = await import('../lib/server/generation-ai-call.js').catch(() => ({}));
  if (typeof callLLM !== 'function') {
    process.stderr.write(
      'gen-dan-y-mu: không tìm được đường gọi mô hình phía máy chủ — chạy script này trong môi trường đã khai khoá nhà cung cấp.\n',
    );
    process.exit(2);
  }
  const pack = withPack ? findPack('Toán', 'cambridge-lower-secondary', 'lớp 7') : null;
  if (withPack && !pack) {
    process.stderr.write(
      'gen-dan-y-mu: both outlines generated without a curriculum pack — không tìm thấy gói Toán Cambridge cho lớp 7.\n',
    );
    process.exit(1);
  }
  const res = await generateSceneOutlinesFromRequirements(
    { requirement: de, ...(withPack ? { learner: LEARNER } : {}) },
    undefined,
    undefined,
    callLLM,
    withPack ? { curriculumContext: readPackBody(pack.id) } : {},
  );
  if (!res.success || !res.data) {
    process.stderr.write(`gen-dan-y-mu: soạn dàn ý thất bại: ${res.error ?? 'không rõ'}\n`);
    process.exit(1);
  }
  return res.data;
}

function render(runId, data) {
  const lines = [
    `<!-- run_id: ${runId} -->`,
    '',
    `# ${data.courseTitle ?? de}`,
    '',
    ...data.outlines.flatMap((o, i) => [
      `## ${i + 1}. ${o.title}`,
      '',
      o.description ?? '',
      '',
      ...(o.keyPoints ?? []).map((k) => `- ${k}`),
      '',
    ]),
  ];
  return lines.join('\n');
}

const runId = `blind-${randomUUID()}`;
const withPack = await outlineFor({ withPack: true });
const withoutPack = await outlineFor({ withPack: false });

// Xáo thứ tự: hội đồng không được đoán theo vị trí tệp.
const aIsPack = Math.random() < 0.5;
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'E13-dan-y-A.md'), render(runId, aIsPack ? withPack : withoutPack));
writeFileSync(join(outDir, 'E13-dan-y-B.md'), render(runId, aIsPack ? withoutPack : withPack));
writeFileSync(
  join(outDir, 'E13-khoa.txt'),
  [
    `run_id: ${runId}`,
    `A = ${aIsPack ? 'CÓ gói khung' : 'KHÔNG gói khung'}`,
    `B = ${aIsPack ? 'KHÔNG gói khung' : 'CÓ gói khung'}`,
    '',
    'Hội đồng KHÔNG đọc tệp này.',
  ].join('\n'),
);

process.stdout.write(`gen-dan-y-mu: run_id ${runId} · hai dàn ý + tệp khoá → ${outDir}\n`);
