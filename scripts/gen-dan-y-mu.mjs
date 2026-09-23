#!/usr/bin/env node
/**
 * Sinh CẶP DÀN Ý MÙ cho phép thử của Cổng Giá trị.
 *
 * Ngưỡng đã ký ở Cổng Đáng có một vế là phép thử mù: đặt hai dàn ý cùng đề
 * cạnh mục lục sách của bé, một bài sinh CÓ gói khung một bài KHÔNG, và xem
 * người đọc có nhận ra bài nào có gói — và nói được vì sao.
 *
 * ĐIỀU CẶP NÀY CHỨNG, VÀ ĐIỀU NÓ KHÔNG CHỨNG — đọc trước khi chấm:
 *
 * Hai lượt khác nhau ở HAI thứ cùng lúc: một lượt có hồ sơ người học VÀ có gói
 * khung, lượt kia không có gì cả. Đó đúng là câu hỏi của Cổng Giá trị («bài
 * hôm nay» so với «bài sau vòng này»), nhưng nó KHÔNG tách được phần đóng góp
 * của riêng gói khung khỏi phần đóng góp của hồ sơ. Người chấm kết luận được
 * «bài nào khớp sách của bé», KHÔNG kết luận được «gói khung là thứ làm nên
 * khác biệt». Muốn tách thì cần lượt thứ ba (có hồ sơ, không gói) — chưa làm.
 *
 * Vì sao phải là một script chứ không phải hai tệp ai đó viết tay: một cặp
 * viết tay (hoặc sinh một lần rồi sửa) làm hội đồng phân biệt đúng trong khi
 * CHƯA có dàn ý thật nào chạy qua gói. Lúc ấy phép thử mù xanh mà thứ nó định
 * đo thì chưa từng tồn tại. Nên hai tệp phải đến từ CHÍNH tuyến soạn thật, mang
 * mã lượt chạy ở dòng đầu, và hội đồng chỉ chấm tệp có mã.
 *
 * Dùng: node scripts/gen-dan-y-mu.mjs [--slug <slug>] [--de "<đề bài>"] [--base-url <url>] [--model <provider:model>] [--out <thư mục>]
 * Ghi ra: `.acceptance-runs/<slug>/` (mặc định) — xem chú thích ở `outDir`.
 * Cần: một máy chủ đang chạy đã khai khoá nhà cung cấp (mặc định
 * http://localhost:3002, khớp dev_server.url của hồ sơ). Không có máy chủ →
 * thoát 2 và nói rõ, KHÔNG dựng dữ liệu giả.
 *
 * MÔ HÌNH phải nêu tên: tuyến này giải mô hình theo thứ tự «tuyến theo chặng →
 * x-model của client → DEFAULT_MODEL», và trang chủ LUÔN gửi x-model (người
 * dùng chọn trong Cài đặt). Một script gọi cùng tuyến mà không gửi x-model đi
 * một đường KHÁC đường thật, và trên bản dựng không khai DEFAULT_MODEL thì
 * tuyến trả 500 — đúng ca đã chặn lượt nghiệm thu vòng 3. Nêu tên bằng
 * `--model` hoặc biến `OPENMAIC_MODEL`; thiếu thì thoát 2 và liệt kê nhà cung
 * cấp mà máy chủ khai là đã có khoá, KHÔNG tự đoán một mô hình.
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
const baseUrl = opt('--base-url', process.env.OPENMAIC_BASE_URL ?? 'http://localhost:3002');
const model = opt('--model', process.env.OPENMAIC_MODEL ?? process.env.DEFAULT_MODEL ?? '');
// Ghi vào THƯ MỤC LƯỢT CHẠY, không vào hồ sơ nghiệm thu. Lệnh này chạy lại ở
// nhiều nơi (lượt nghiệm thu, làn trước chữ ký, CI); một đường dẫn dưới
// `_acceptance/` sẽ bị ghi đè mỗi lần — kể cả cặp dàn ý hội đồng ĐÃ chấm, sau
// khi hồ sơ qua cổng và cây ấy đã thành sử liệu chỉ đọc. Lượt nghiệm thu muốn
// dùng cặp này làm bằng chứng thì CHÉP sang `evidence/` — đó là việc của lượt,
// không phải tác dụng phụ của lệnh. `--out <thư mục>` đổi nơi ghi.
const outDir = opt('--out', join(process.cwd(), '.acceptance-runs', slug));

/** Nhà cung cấp máy chủ khai là đã có khoá — để thông điệp thiếu-mô-hình chỉ đúng chỗ. */
async function configuredProviders() {
  try {
    const res = await fetch(new URL('/api/server-providers', baseUrl));
    const body = await res.json();
    return Object.keys(body?.data?.providers ?? body?.providers ?? {});
  } catch {
    return [];
  }
}

if (!model) {
  const providers = await configuredProviders();
  process.stderr.write(
    'gen-dan-y-mu: chưa nêu mô hình. Đặt OPENMAIC_MODEL (hoặc --model) dạng «nhà-cung-cấp:mô-hình» — ' +
      'tuyến soạn giải mô hình từ x-model như trang chủ gửi, không tự chọn hộ.' +
      (providers.length
        ? ` Máy chủ tại ${baseUrl} khai đã có khoá cho: ${providers.join(', ')}.`
        : ` Máy chủ tại ${baseUrl} không khai nhà cung cấp nào — khai khoá trước.`) +
      '\n',
  );
  process.exit(2);
}

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

/**
 * Gọi CHÍNH tuyến HTTP mà trang chủ gọi.
 *
 * Bản đầu nhập thẳng mô-đun TypeScript từ một script thuần và không chạy được
 * (Node không dịch `.ts`). Đi qua tuyến HTTP vừa sửa được điều đó vừa đúng hơn:
 * nó chứng luôn cả đường route tra gói khung — thứ mà một lượt gọi thẳng hàm
 * dựng prompt sẽ bỏ qua.
 */
async function outlineFor({ withPack }) {
  let res;
  try {
    res = await fetch(new URL('/api/generate/scene-outlines-stream', baseUrl), {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-model': model },
      body: JSON.stringify({
        requirements: { requirement: de, ...(withPack ? { learner: LEARNER } : {}) },
        researchContext: '',
      }),
    });
  } catch (error) {
    // Nói ra ĐIỀU KIỆN còn thiếu, không đổ vết ngăn xếp: người đọc thông điệp
    // này đang muốn biết phải bật gì, không muốn biết undici gãy ở dòng nào.
    process.stderr.write(
      `gen-dan-y-mu: không gọi được ${baseUrl} — cần một máy chủ đang chạy (dev_server.start của hồ sơ) đã khai khoá nhà cung cấp. Chi tiết: ${String(error?.cause?.code ?? error)}\n`,
    );
    process.exit(2);
  }
  if (!res.ok || !res.body) {
    process.stderr.write(
      `gen-dan-y-mu: tuyến dàn ý trả ${res.status} — cần một máy chủ đang chạy tại ${baseUrl} đã khai khoá nhà cung cấp.\n`,
    );
    process.exit(2);
  }
  const text = await res.text();
  const outlines = [];
  let courseTitle;
  let anchor;
  let streamError;
  for (const line of text.split('\n')) {
    if (!line.startsWith('data: ')) continue;
    let evt;
    try {
      evt = JSON.parse(line.slice(6));
    } catch {
      continue;
    }
    if (evt.type === 'error') streamError = evt.error;
    else if (evt.type === 'outline') outlines.push(evt.data);
    else if (evt.type === 'courseTitle') courseTitle = evt.data;
    else if (evt.type === 'curriculumAnchor') anchor = evt.data;
    else if (evt.type === 'done' && Array.isArray(evt.outlines) && evt.outlines.length) {
      outlines.length = 0;
      outlines.push(...evt.outlines);
      courseTitle = evt.courseTitle ?? courseTitle;
    }
  }
  if (!outlines.length) {
    // NÓI RA lý do tuyến nêu, không chỉ nói «rỗng»: lượt nghiệm thu vòng 3 mất
    // một vòng vì thông điệp cũ im lặng về một lỗi cấu hình phía nhà cung cấp.
    process.stderr.write(
      `gen-dan-y-mu: tuyến dàn ý không trả mục nào${streamError ? ` — tuyến nói: ${streamError}` : ''}.\n`,
    );
    process.exit(1);
  }
  // Lượt CÓ gói phải thật sự neo được: máy chủ chỉ phát câu neo khi nó đã tra
  // được gói (câu neo suy từ gói + dàn ý, không hỏi mô hình), nên câu neo vắng
  // nghĩa là gói không tới nơi — hai dàn ý khi ấy giống nhau về bản chất và
  // phép thử mù mất nghĩa.
  if (withPack && !anchor) {
    process.stderr.write(
      'gen-dan-y-mu: both outlines generated without a curriculum pack — lượt CÓ gói không trả câu neo.\n',
    );
    process.exit(1);
  }
  return { outlines, courseTitle, anchor };
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
