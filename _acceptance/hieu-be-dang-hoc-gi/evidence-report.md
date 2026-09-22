# Evidence Report: hieu-be-dang-hoc-gi

```
---
schema_version: 2
feature_slug: hieu-be-dang-hoc-gi
verdict: REJECT
failed_evals: [E13gen, E1, E5, E7]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 33f626afc0a1aad91c96451aa86e8af277998246
human_signoff:
---
```

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | FAIL |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | ui-check | FAIL |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | FAIL |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13gen | AC-13 | script | FAIL |
| E13 | AC-13 | judgment | UNCERTAIN |
| E14 | AC-14 | judgment | UNCERTAIN |
| E15 | AC-15 | script | PASS |
| E16 | AC-16 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-hieu-be-dang-hoc-gi-E1-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-22T19:05:00Z
  screenshot: _acceptance/hieu-be-dang-hoc-gi/evidence/E1-the-trong.png
  observed: |
    Đọc từng frame đã lưu bằng Read: 8 khung sống đủ tên (E1-the-trong, E1-the-dang-dien,
    E1-mon-co-goi, E1-mon-chua-goi, E1-da-luu, E1-doi-lop, E1-loi-luu, E1-bot-mon).
    12/17 assertion PASS. FRAME E1-da-luu.png là khung SỐNG nhưng nội dung là thẻ TRỐNG
    (5 ô rỗng, nút Lưu mờ) chứ không phải trạng thái "đã lưu, nút Lưu mờ lại" — vi phạm
    thẳng "Sau tải lại giá trị còn nguyên". Nguyên nhân gốc: dev_server.start không đặt
    DATABASE_URL nên GET /api/persistence/kv/entries/learner-profile-storage trả 404
    PERSISTENCE_NOT_CONFIGURED (không phải KEY_NOT_FOUND), KeyState chuyển "unavailable"
    ngay lần đọc đầu của phiên — mọi lần bấm Lưu, kể cả bước bình thường, đều báo
    "Chưa lưu được". E1-loi-luu.png (chặn 500 chủ động) đúng như kỳ vọng: toast lỗi,
    không có toast "Đã lưu". NETWORK TRUTH: /api/stages và /api/folders (cùng origin,
    không thuộc miễn trừ kv/*) trả 404 x4 mỗi tuyến → app-fail theo đúng luật scoping.
  network_observed: app-fail

- eval: E1b
  run_id: minted-hieu-be-dang-hoc-gi-E1b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api
  verified_at: 2026-09-22T19:14:00Z
  output: |
    Tests  8548 passed | 43 skipped (8591)
    Start at  19:12:46
    Duration  74.27s (transform 42.21s, setup 10.71s, import 356.30s, tests 222.19s, environment 48.29s)

- eval: E2
  run_id: minted-hieu-be-dang-hoc-gi-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api
  verified_at: 2026-09-22T19:14:00Z
  output: |
    Tests  8548 passed | 43 skipped (8591)
    Start at  19:12:46
    Duration  74.27s (transform 42.21s, setup 10.71s, import 356.30s, tests 222.19s, environment 48.29s)

- eval: E3
  run_id: minted-hieu-be-dang-hoc-gi-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api
  verified_at: 2026-09-22T19:14:00Z
  output: |
    Tests  8548 passed | 43 skipped (8591)
    Start at  19:12:46
    Duration  74.27s (transform 42.21s, setup 10.71s, import 356.30s, tests 222.19s, environment 48.29s)

- eval: E4
  run_id: minted-hieu-be-dang-hoc-gi-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api
  verified_at: 2026-09-22T19:14:00Z
  output: |
    Tests  8548 passed | 43 skipped (8591)
    Start at  19:12:46
    Duration  74.27s (transform 42.21s, setup 10.71s, import 356.30s, tests 222.19s, environment 48.29s)

- eval: E5
  run_id: minted-hieu-be-dang-hoc-gi-E5-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-22T19:20:00Z
  screenshot: _acceptance/hieu-be-dang-hoc-gi/evidence/E5-moi-khai.png
  observed: |
    E5-moi-khai.png: hồ sơ trống — dòng mời khai đúng, KHÔNG có ô "Soạn cho". PASS.
    E5-san-sang.png: ô "Soạn cho" hiện "Toán — Cambridge Lower Secondary" nhưng KHÔNG có
    phần ngôn ngữ ("(tiếng Anh)") — trái với nhãn "môn — chương trình (ngôn ngữ)" mà
    AC-5/design.md đòi (learner-subject-picker.tsx:90 không tham chiếu s.language). FAIL.
    E5-nho-lua-chon.png: sau tải lại trang, TOÀN BỘ hồ sơ mất — quay về màn mời khai
    thay vì "vẫn ở MOET" — vì learner-profile-storage (account scope) không có
    localStorage fallback và PERSISTENCE_NOT_CONFIGURED khiến hydrate luôn null. FAIL.
    E5-neo-khong.png: hồ sơ trống → không có node data-state^="ST-neo-" nào trong DOM,
    đúng kỳ vọng. PASS. NETWORK TRUTH: /api/stages, /api/folders 404 cùng origin, không
    miễn trừ cho E5 → app-fail.
  network_observed: app-fail

- eval: E5b
  run_id: minted-hieu-be-dang-hoc-gi-E5b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api
  verified_at: 2026-09-22T19:14:00Z
  output: |
    Tests  8548 passed | 43 skipped (8591)
    Start at  19:12:46
    Duration  74.27s (transform 42.21s, setup 10.71s, import 356.30s, tests 222.19s, environment 48.29s)

- eval: E6
  run_id: minted-hieu-be-dang-hoc-gi-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.generation
  verified_at: 2026-09-22T19:12:49Z
  output: |
    Tests  163 passed (163)
    Start at  19:12:47
    Duration  1.33s (transform 5.52s, setup 0ms, import 10.44s, tests 200ms, environment 1ms)

- eval: E7
  run_id: E7-hieu-be-dang-hoc-gi-20260922
  exit_code: 1
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-22T19:22:00Z
  screenshot: _acceptance/hieu-be-dang-hoc-gi/evidence/E7-neo-co-goi.html
  observed: |
    Fallback HTML (không phải .png — lý do đã khai trong khối: ui-capture.mjs không mang
    theo session state, đọc bằng Read). DOM sống lúc SSE "done" (11/11 scenes): dưới
    tiêu đề "Scene outline / 11 scenes total" là <p data-state="ST-neo-dang-doan">
    "⚠ No curriculum pack for cambridge-lower-secondary yet — this is an informed
    guess, not a checked match." KHÔNG có phần tử data-state="ST-neo-co-goi" nào trong
    trang tại thời điểm đó (querySelectorAll xác nhận null). Đối chiếu network log:
    SSE POST /api/generate/scene-outlines-stream CÓ event
    {"type":"curriculumAnchor","data":"Unit 12 — Ratio and proportion, sách Cambridge
    Lower Secondary Mathematics Learner's Book 8."} — tức mô hình ĐÃ trả anchor nhưng
    dòng neo vẫn hiện nhánh "đang đoán". Đúng chiều đỏ được eval nêu tên: "dàn ý sinh
    xong mà không dòng neo dù mô hình đã trả curriculumAnchor". Nguyên nhân xác nhận
    qua đọc mã: app/generation-preview/page.tsx dòng ~689 dựng updatedSession không
    copy trường curriculumAnchor từ outlineResult (dòng 640) nên session?.curriculumAnchor
    luôn undefined.
  network_observed: clean

- eval: E7b
  run_id: minted-hieu-be-dang-hoc-gi-E7b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api
  verified_at: 2026-09-22T19:14:00Z
  output: |
    Tests  8548 passed | 43 skipped (8591)
    Start at  19:12:46
    Duration  74.27s (transform 42.21s, setup 10.71s, import 356.30s, tests 222.19s, environment 48.29s)

- eval: E8
  run_id: minted-hieu-be-dang-hoc-gi-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.generation
  verified_at: 2026-09-22T19:12:49Z
  output: |
    Tests  163 passed (163)
    Start at  19:12:47
    Duration  1.33s (transform 5.52s, setup 0ms, import 10.44s, tests 200ms, environment 1ms)

- eval: E8b
  run_id: tab-11 @ http://localhost:3002/generation-preview (2nd dev-server instance, started 19:28 after the pre-existing one died mid-run)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-22T19:30:00Z
  screenshot: evidence/E8-neo-dang-doan.png
  observed: |
    Frame sống của /generation-preview: card "Scene outline / 10 scenes total" với ngay
    dưới header một dòng cảnh báo hổ phách, icon tam giác-chấm-than: "⚠ No curriculum
    pack for moet yet — this is an informed guess, not a checked match." Xác nhận trực
    tiếp từ outerHTML: <p data-state="ST-neo-dang-doan" class="...border-amber-500/40
    bg-amber-500/5...">. Đúng MỘT khung mang data-state đó, không có khung thứ hai.
    Khung có chữ cảnh báo VÀ nêu tên chương trình chưa có gói ("moet") — đúng kỳ vọng
    ST-neo-dang-doan, không đọc như có gói.
  network_observed: clean

- eval: E9
  run_id: minted-hieu-be-dang-hoc-gi-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.generation
  verified_at: 2026-09-22T19:12:49Z
  output: |
    Tests  163 passed (163)
    Start at  19:12:47
    Duration  1.33s (transform 5.52s, setup 0ms, import 10.44s, tests 200ms, environment 1ms)

- eval: E10
  run_id: minted-hieu-be-dang-hoc-gi-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.generation
  verified_at: 2026-09-22T19:12:49Z
  output: |
    Tests  163 passed (163)
    Start at  19:12:47
    Duration  1.33s (transform 5.52s, setup 0ms, import 10.44s, tests 200ms, environment 1ms)

- eval: E11
  run_id: minted-hieu-be-dang-hoc-gi-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api
  verified_at: 2026-09-22T19:14:00Z
  output: |
    Tests  8548 passed | 43 skipped (8591)
    Start at  19:12:46
    Duration  74.27s (transform 42.21s, setup 10.71s, import 356.30s, tests 222.19s, environment 48.29s)

- eval: E12
  run_id: minted-hieu-be-dang-hoc-gi-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api
  verified_at: 2026-09-22T19:14:00Z
  output: |
    Tests  8548 passed | 43 skipped (8591)
    Start at  19:12:46
    Duration  74.27s (transform 42.21s, setup 10.71s, import 356.30s, tests 222.19s, environment 48.29s)

- eval: E13gen
  run_id: minted-hieu-be-dang-hoc-gi-E13gen-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.dan_y_mu
  verified_at: 2026-09-22T19:15:00Z
  output: |
    at defaultImportModuleDynamicallyForModule (node:internal/modules/esm/utils:222:31) {
      code: 'ERR_MODULE_NOT_FOUND',
      url: 'file:///Users/manhphan/dev/OpenMAIC/lib/server/curriculum-packs.js'
    }
    Node.js v22.23.2

- eval: E13
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: UNCERTAIN
  run_id: minted-hieu-be-dang-hoc-gi-E13gen-r1
  rationale: |
    - domain-correctness: UNCERTAIN — Cả hai file bằng chứng bắt buộc (E13-dan-y-A.md,
      E13-dan-y-B.md) không tồn tại — thư mục evidence/ của tính năng còn chưa được
      tạo (E13gen exit 1, xem block trên). Không có gì để đối chiếu với mục lục
      Cambridge Learner's Book 8 nên không thể phân biệt bài nào có gói.
    - operational-feasibility: UNCERTAIN — Hai file bằng chứng bắt buộc không tồn tại
      trên đĩa. Không thể đánh giá liệu bài có gói có phân biệt được qua tên
      unit/từ vựng/ký hiệu hay không; theo luật persona, thiếu bằng chứng bắt buộc
      phải trả UNCERTAIN chứ không tự tìm file khác.
    - spec-alignment: UNCERTAIN — Cả hai file input đều không tồn tại, không có nội
      dung dàn ý nào để đối chiếu với mục lục Learner's Book 8, và không có mã lượt
      chạy ở dòng đầu để xác nhận nguồn sinh thật theo đúng luật chấm của AC-13.
  required_evidence:
    - Tạo hai file _acceptance/hieu-be-dang-hoc-gi/evidence/E13-dan-y-A.md và
      E13-dan-y-B.md bằng script scripts/gen-dan-y-mu.mjs (khoá
      executors.script.dan_y_mu) cho đề «tỉ lệ và tỉ số», một bản có gói Cambridge
      Stage 8 Toán một bản không, mỗi file có mã lượt chạy ở dòng đầu — thiếu mã lượt
      chạy ở dòng đầu của tệp nào thì tệp đó vẫn không được chấm.
  human_override:

- eval: E14
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: UNCERTAIN
  rationale: |
    - domain-correctness: UNCERTAIN — Cả hai file bằng chứng bắt buộc (E1-the-dang-dien.png,
      E7-neo-co-goi.png) không tồn tại trong thư mục evidence/ (thư mục rỗng lúc phán
      xét), nên không có ảnh chụp thẻ 5 câu hay dòng neo để đối chiếu với câu hỏi
      phán xét về việc phụ huynh non-tech có hiểu được hay gặp từ kỹ thuật/«Stage».
    - operational-feasibility: UNCERTAIN — Cả hai file không tồn tại; design.md chỉ
      là đặc tả dự định, không phải ảnh chụp giao diện thật nên không thể phán độ dễ
      hiểu bằng mắt phụ huynh non-tech.
    - spec-alignment: UNCERTAIN — Cả hai file bằng chứng bắt buộc đều không tồn tại.
      Không có ảnh thẻ 5 câu hay dòng neo để đối chiếu với câu hỏi phán xét, nên
      không thể kết luận PASS hay FAIL.
  required_evidence:
    - Chụp màn hình thẻ 5 câu ở trạng thái đang điền (ST-the-dang-dien), lưu đúng
      đường dẫn _acceptance/hieu-be-dang-hoc-gi/evidence/E1-the-dang-dien.png — để xem
      phụ huynh non-tech có hiểu phải điền gì không (nhãn ô, không thuật ngữ kỹ thuật).
    - Chụp màn hình dòng neo ở trạng thái có gói (ST-neo-co-goi), lưu đúng đường dẫn
      _acceptance/hieu-be-dang-hoc-gi/evidence/E7-neo-co-goi.png — để kiểm tra chữ
      "Stage" hay mã khung có xuất hiện ở chỗ không giải thích hay không.
  human_override:

- eval: E15
  run_id: minted-hieu-be-dang-hoc-gi-E15-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.gate
  verified_at: 2026-09-22T19:16:00Z
  output: |
    (design-gate-changed.mjs — kết quả JSON, sàn thẩm mỹ P0 đạt trên các file giao diện
    vòng đụng: tương phản, tiêu điểm, bàn phím, trạng thái trống/đang tải/lỗi)

- eval: E16
  run_id: minted-hieu-be-dang-hoc-gi-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api
  verified_at: 2026-09-22T19:14:00Z
  output: |
    Tests  8548 passed | 43 skipped (8591)
    Start at  19:12:46
    Duration  74.27s (transform 42.21s, setup 10.71s, import 356.30s, tests 222.19s, environment 48.29s)

### Lệnh suite (hồi quy)

- cmd: ./scripts/with-pinned-node.sh pnpm --filter @openmaic/storage test
  run_id: minted-hieu-be-dang-hoc-gi-SUITE-filter-r1
  exit_code: 0
  verified_at: 2026-09-22T19:14:46Z

## Known limits

## Ngoài hợp đồng

## Analyst

Non-discriminating (green trên CẢ HEAD lẫn baseline — chứng minh harness chứ không
phải feature; đã đối chiếu với danh sách máy tính sẵn):
- E6, E8, E9, E10 (lệnh: `./scripts/with-pinned-node.sh pnpm --filter @openmaic/generation test`)
- E15 (lệnh: `./scripts/with-pinned-node.sh node scripts/design-gate-changed.mjs`)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E13gen, E1, E5, E7 failed — E7: SSE trả curriculumAnchor nhưng
app/generation-preview/page.tsx bỏ trường này khi dựng lại session state nên dòng
neo không bao giờ hiện; E1/E5: dev_server.start không có DATABASE_URL nên GET
persistence trả PERSISTENCE_NOT_CONFIGURED (không phải KEY_NOT_FOUND), khiến mọi
lần Lưu báo lỗi và hồ sơ mất sạch sau tải lại; E13gen: script import sai đường dẫn
module (`lib/server/curriculum-packs.js` không tồn tại) nên không sinh được cặp dàn
ý mù. Returned to implementation.
