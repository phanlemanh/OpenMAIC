---
schema_version: 2
feature_slug: hieu-be-dang-hoc-gi
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d96920e43ea1ef48244dd25a40bd9e8842a78ba0
human_signoff: Manh Phan 2026-09-23
---

# Evidence Report: hieu-be-dang-hoc-gi (round 5)

Mọi eval đều xanh trong vòng này. Hai eval từng chặn vòng 4 nay đã sạch: **E7** (chụp sống dòng neo có gói — dùng fallback DOM `.html` giống các vòng trước, một khung sống duy nhất phủ `ST-neo-co-goi`, tên unit đứng trước tên sách, không chữ "Stage", sự kiện SSE `curriculumAnchor` đúng thiết kế) và **E8b** (chụp sống dòng neo đang-đoán — cùng nội dung UI/DOM PASS như vòng 4, nhưng lần này network-truth cũng sạch: không còn lượt `GET /api/curriculum-packs` bị từ chối kết nối lúc bootstrap/HMR như vòng 4; `network_observed: clean` cho cả hai khung E7 và E8b). Bộ `pnpm test` chạy lại cho hai eval end-to-end **E7b**, **E7c** — vẫn xanh, không phân biệt được với baseline (xem `## Analyst`). Lệnh suite `@openmaic/storage` chạy lại, xanh. Chín eval `test`/`script` khác trong nhóm `pnpm test` (E1b, E2, E3, E4, E5b, E10b, E11, E12, E16) cùng bảy eval khác (E1, E5, E6, E8, E9, E10c, E13gen, E15) **carry-forward nguyên trạng từ round 4** — delta vòng này không chạm paths của chúng — cộng một eval (E10) carry-forward từ round 1 (đã không đổi qua bốn vòng liên tiếp). Quan trọng nhất: hội đồng đã chấm lại hai judgment item trên bằng chứng đầy đủ — **E13** giữ PASS (dàn ý mù A/B vẫn phân biệt được rõ theo tên unit/từ vựng/ký hiệu Cambridge) và **E14** chuyển từ UNCERTAIN sang **PASS** (bằng chứng cho cả "điền gì" — E1 — và "neo vào đâu" — E7 — nay đều nằm trong phạm vi hội đồng được đọc, không còn thiếu file). Không còn eval nào pending người quyết. Nội dung dưới đây thay trọn round 4 cũ; lịch sử từng round nằm trong `## Iterations`.

## Bảng kết quả

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | ui-check | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | PASS |
| E7b | AC-7 | test | PASS |
| E7c | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E10c | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13gen | AC-13 | script | PASS |
| E13 | AC-13 | judgment | PASS |
| E14 | AC-14 | judgment | PASS |
| E15 | AC-15 | script | PASS |
| E16 | AC-16 | test | PASS |

## Evidence

- eval: E7
  run_id: minted-hieu-be-dang-hoc-gi-E7-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-09-22T23:30:00Z
  screenshot: /Users/manhphan/dev/OpenMAIC/_acceptance/hieu-be-dang-hoc-gi/evidence/E7-neo-co-goi.html
  observed: |
    Read evidence/E7-neo-co-goi.html (fallback for the requested .png — see reason below) with Read/grep/python after saving it. Body contains exactly ONE element matching [data-state^="ST-neo"]: <p data-state="ST-neo-co-goi" ...><svg class="lucide-book-open".../><span>Unit 12 · Ratio and proportion — Cambridge Lower Secondary Mathematics Learner's Book 8</span></p>, sitting directly under the "Scene outline" / "10 scenes total" header, i.e. on top of the outline as required. Confirmed: unit name ("Unit 12 · Ratio and proportion") leads the sentence, book title ("Cambridge Lower Secondary Mathematics Learner's Book 8") follows it, the word "Stage" does not appear anywhere in the file body, and the raw pack id "cambridge-lower-secondary-maths-8" does not appear either (grep -c both = 0). This matches Expected exactly (unit name first, no code/Stage leading). I also watched this same moment live via mcp__Claude_Browser__computer screenshot before capturing the HTML — the on-screen card showed the identical amber-free, book-icon anchor line above 10 numbered scenes, with a "Confirm and generate course" button below (outline fully streamed, not the transient blue "still streaming" placeholder). No contradiction between the two observations, so the assertion is a real PASS, not a frame-labeling accident.
  network_observed: clean
  output: |
    - No code was modified. No destructive action taken.

    VERDICT: every assertion for E7/AC-7 passed. No red-flag condition (no missing-anchor-with-pack case, no code/"Stage" leading the anchor) was observed. exitCode = 0.

- eval: E7b
  run_id: minted-hieu-be-dang-hoc-gi-E7b-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-22T23:20:46Z
  output: |
    Tests  8593 passed | 43 skipped (8636)
    Start at  06:20:03
    Duration  42.54s (transform 29.55s, setup 4.57s, import 157.43s, tests 172.37s, environment 23.31s)
    (lệnh `./scripts/with-pinned-node.sh pnpm test` — bộ này phủ 11 eval: E1b, E2, E3, E4, E5b, E7b, E7c, E10b, E11, E12, E16; vòng này chỉ E7b/E7c là phép đo mới, chín eval còn lại carry-forward nguyên trạng từ round 4 — xem `### Carry-forward`.)

- eval: E7c
  run_id: minted-hieu-be-dang-hoc-gi-E7c-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-22T23:20:46Z
  output: |
    Tests  8593 passed | 43 skipped (8636)
    Start at  06:20:03
    Duration  42.54s (transform 29.55s, setup 4.57s, import 157.43s, tests 172.37s, environment 23.31s)
    (cùng lệnh `./scripts/with-pinned-node.sh pnpm test` với E7b — xem output đầy đủ ở khối E7b.)

- eval: E8b
  run_id: verifier-ui-E8b-round5-2026-09-22T23-39Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-09-22T23:39:00Z
  screenshot: /Users/manhphan/dev/OpenMAIC/_acceptance/hieu-be-dang-hoc-gi/evidence/E8-neo-dang-doan.html
  observed: |
    Đọc lại file evidence/E8-neo-dang-doan.html (fallback DOM-live, không phải PNG — xem lý do dưới) bằng Read: nội dung là outerHTML của khối "Review your outline" thật, chụp bằng script JS atomic (poll rồi serialize trong CÙNG một lệnh, không có khoảng hở giữa lúc tìm thấy phần tử và lúc lưu). Trong đó: đúng MỘT phần tử data-state="ST-neo-dang-doan" (thẻ <p>), text = "⚠ No curriculum pack for MOET yet — this is an informed guess, not a checked match." — có icon cảnh báo (triangle-alert), tên chương trình "MOET" là NHÃN ĐÃ DỊCH (Settings > Learner hiện option "MOET (Vietnam)"), không phải mã máy chữ thường "moet". Không có dòng ST-neo nào khác trong tài liệu tại thời điểm chụp (kiểm bằng document.querySelectorAll('[data-state^="ST-neo"]').length === 1). Kết quả này lặp lại giống hệt nhau ở BA lượt sinh dàn ý độc lập trong phiên này (cùng câu, cùng data-state, cùng tên MOET viết hoa đúng) — không phải một lần trùng hợp. Cũng đọc lại evidence/E8b-step2-neo-dang-doan.html (bản sao cùng nội dung, đặt tên theo bước 2) — khớp. File PNG cũ evidence/E8-neo-dang-doan.png / E8b-step2.png (từ vòng trước, 20:0x) KHÔNG được phiên này ghi lại — không dùng làm căn cứ.
  network_observed: clean
  output: |
    KHÔNG sửa code. KHÔNG tắt dev server (dùng chung, không phải do phiên này start). File evidence/E8b-step2.html, E8-neo-dang-doan.png, E8b-step2.png cũ (từ vòng 4, đã bị round-4 ghi nhận có lỗi "moet" chữ thường) KHÔNG bị phiên này đụng vào/xoá — chỉ thêm evidence/E8-neo-dang-doan.html, evidence/E8b-step2-neo-dang-doan.html (bản mới), evidence/E8b-network.txt (ghi đè, round 5).

    KẾT LUẬN: exitCode=0 — mọi assertion UI/DOM PASS sạch, network-truth "clean" cho lượt bằng chứng cuối, không phát hiện lỗi sản phẩm nào ở AC-8 cho ca «Soạn cho Toán — MOET (chưa có gói)».

### Lệnh suite (hồi quy)

- cmd: ./scripts/with-pinned-node.sh pnpm --filter @openmaic/storage test
  run_id: minted-hieu-be-dang-hoc-gi-SUITE-filter-r5
  exit_code: 0
  verified_at: 2026-09-22T23:21:45Z

### Carry-forward (round 4 — delta round 5 không chạm paths của các eval)

- eval: E1
  run_id: manual-verifier-E1-round4-ui
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-09-22T15:39:52Z
  carried_from_round: 4
  note: carry-forward từ round 4 — delta không chạm paths của eval. Khung gốc xem round 4 trong Iterations.

- eval: E1b
  run_id: minted-hieu-be-dang-hoc-gi-E1b-r4
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:39:52Z
  carried_from_round: 4
  note: carry-forward từ round 4 — delta không chạm paths của eval. Khung gốc xem round 4 trong Iterations.

- eval: E2
  run_id: minted-hieu-be-dang-hoc-gi-E2-r4
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:39:52Z
  carried_from_round: 4
  note: carry-forward từ round 4 — delta không chạm paths của eval. Khung gốc xem round 4 trong Iterations.

- eval: E3
  run_id: minted-hieu-be-dang-hoc-gi-E3-r4
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:39:52Z
  carried_from_round: 4
  note: carry-forward từ round 4 — delta không chạm paths của eval. Khung gốc xem round 4 trong Iterations.

- eval: E4
  run_id: minted-hieu-be-dang-hoc-gi-E4-r4
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:39:52Z
  carried_from_round: 4
  note: carry-forward từ round 4 — delta không chạm paths của eval. Khung gốc xem round 4 trong Iterations.

- eval: E5
  run_id: minted-hieu-be-dang-hoc-gi-E5-r4
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-09-22T15:39:52Z
  carried_from_round: 4
  note: carry-forward từ round 4 — delta không chạm paths của eval. Khung gốc xem round 4 trong Iterations.

- eval: E5b
  run_id: minted-hieu-be-dang-hoc-gi-E5b-r4
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:39:52Z
  carried_from_round: 4
  note: carry-forward từ round 4 — delta không chạm paths của eval. Khung gốc xem round 4 trong Iterations.

- eval: E6
  run_id: minted-hieu-be-dang-hoc-gi-E6-r4
  exit_code: 0
  verifier: config:executors.test.generation
  verified_at: 2026-09-22T15:39:52Z
  carried_from_round: 4
  note: carry-forward từ round 4 — delta không chạm paths của eval. Khung gốc xem round 4 trong Iterations.

- eval: E8
  run_id: minted-hieu-be-dang-hoc-gi-E8-r4
  exit_code: 0
  verifier: config:executors.test.generation
  verified_at: 2026-09-22T15:39:52Z
  carried_from_round: 4
  note: carry-forward từ round 4 — delta không chạm paths của eval. Khung gốc xem round 4 trong Iterations.

- eval: E9
  run_id: minted-hieu-be-dang-hoc-gi-E9-r4
  exit_code: 0
  verifier: config:executors.test.generation
  verified_at: 2026-09-22T15:39:52Z
  carried_from_round: 4
  note: carry-forward từ round 4 — delta không chạm paths của eval. Khung gốc xem round 4 trong Iterations.

- eval: E10b
  run_id: minted-hieu-be-dang-hoc-gi-E10b-r4
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:39:52Z
  carried_from_round: 4
  note: carry-forward từ round 4 — delta không chạm paths của eval. Khung gốc xem round 4 trong Iterations.

- eval: E10c
  run_id: minted-hieu-be-dang-hoc-gi-E10c-r4
  exit_code: 0
  verifier: config:executors.test.dsl
  verified_at: 2026-09-22T15:39:52Z
  carried_from_round: 4
  note: carry-forward từ round 4 — delta không chạm paths của eval. Khung gốc xem round 4 trong Iterations.

- eval: E11
  run_id: minted-hieu-be-dang-hoc-gi-E11-r4
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:39:52Z
  carried_from_round: 4
  note: carry-forward từ round 4 — delta không chạm paths của eval. Khung gốc xem round 4 trong Iterations.

- eval: E12
  run_id: minted-hieu-be-dang-hoc-gi-E12-r4
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:39:52Z
  carried_from_round: 4
  note: carry-forward từ round 4 — delta không chạm paths của eval. Khung gốc xem round 4 trong Iterations.

- eval: E13gen
  run_id: blind-34d83b3d-d487-4107-8e9d-52e1c6899f06
  exit_code: 0
  verifier: config:executors.script.dan_y_mu
  verified_at: 2026-09-22T15:39:52Z
  carried_from_round: 4
  note: carry-forward từ round 4 — delta không chạm paths của eval. Khung gốc xem round 4 trong Iterations.

- eval: E15
  run_id: minted-hieu-be-dang-hoc-gi-E15-r4
  exit_code: 0
  verifier: config:executors.design.gate
  verified_at: 2026-09-22T15:39:52Z
  carried_from_round: 4
  note: carry-forward từ round 4 — delta không chạm paths của eval. Khung gốc xem round 4 trong Iterations.

- eval: E16
  run_id: minted-hieu-be-dang-hoc-gi-E16-r4
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:39:52Z
  carried_from_round: 4
  note: carry-forward từ round 4 — delta không chạm paths của eval. Khung gốc xem round 4 trong Iterations.

### Carry-forward (round 1 — delta round 5 không chạm paths của eval)

- eval: E10
  run_id: minted-hieu-be-dang-hoc-gi-E10-r1
  exit_code: 0
  verifier: config:executors.test.generation
  verified_at: 2026-09-22T12:10:28Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval. Khung gốc xem round 1 trong Iterations.

### Judgment

- eval: E13
  run_id: blind-34d83b3d-d487-4107-8e9d-52e1c6899f06
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment — fresh context)
  verdict: PASS
  rationale: |
    Cả hai tệp evidence/E13-dan-y-A.md và evidence/E13-dan-y-B.md mang cùng mã lượt chạy (blind-34d83b3d-...) ở dòng đầu nên đủ điều kiện chấm. Dàn ý A neo đích danh "Unit 12 — Ratio and proportion" (gọi lại đúng Unit 7 — Fractions), dùng đúng từ vựng/ký hiệu tiếng Anh của gói (ratio, term, equivalent, simplify, unitary method, "3 : 2") và đúng cấu trúc sư phạm Cambridge (tình huống thật trước ký hiệu, mạch hiểu-sai-thường-gặp, luyện ba tầng, thảo luận cặp đôi). Dàn ý B không nêu unit nào, dùng thuật ngữ Việt hoá (tỉ lệ thức, tích chéo, tỉ lệ nghịch — chủ đề ngoài Unit 12) và ký hiệu ngoài chuẩn. Ba tín hiệu độc lập (tên unit, từ vựng, ký hiệu) đồng nhất về một hướng — đủ căn cứ để hội đồng phân biệt và nói được vì sao.
  votes:
    - domain-correctness: PASS — Cả hai tệp mang cùng mã run_id ở dòng đầu (blind-34d83b3d-...), đủ điều kiện chấm. Dàn ý A neo đích danh "Unit 12 — Ratio and proportion, sách Cambridge Lower Secondary Mathematics Learner's Book 8" — đúng thứ tự mục lục Learner's Book 8 (mục 12), dùng đúng bộ từ vựng tiếng Anh (ratio, term, equivalent, simplify, unitary method, direct proportion), ký hiệu chuẩn "3 : 2", và bám đúng cấu trúc sư phạm Cambridge mô tả trong SKILL.md (tình huống đời thực trước ký hiệu, gọi lại Unit 7 — Fractions, mạch "hiểu sai thường gặp", luyện tập ba tầng, thảo luận cặp đôi). Dàn ý B không nêu unit nào, không dùng từ vựng tiếng Anh, dùng ký hiệu ngoài chuẩn ("k.x" thay vì "k × x"), và đưa "tỉ lệ nghịch" — một chủ đề không thuộc Unit 12 Cambridge Stage 8 theo mục lục đã đối chiếu. Ba tín hiệu (tên unit, từ vựng, ký hiệu) đồng nhất chỉ về một hướng: A có gói, B không — đủ căn cứ để hội đồng phân biệt và nói được vì sao.
    - operational-feasibility: PASS — Cả hai tệp đều mang mã lượt chạy hợp lệ ở dòng đầu. Đặt cạnh mục lục Cambridge (trong SKILL.md): dàn ý A neo đích danh "Unit 12 — Ratio and proportion" và gọi lại "Unit 7 — Fractions" — khớp chính xác tên và thứ tự unit trong mục lục — dùng từ vựng/ký hiệu tiếng Anh đúng gói (ratio, term, equivalent, simplify, "3 : 2") và đi đúng cấu trúc sư phạm của gói (tình huống trước ký hiệu, mạch "hiểu sai thường gặp", luyện tập ba tầng gọi tên "tầng 2"/"tầng 3", hoạt động cặp đôi); dàn ý B không nêu unit nào, dùng thuật ngữ Việt hoá kiểu chương trình khác (tỉ lệ thức, tích chéo, tỉ lệ nghịch) không có trong khung Cambridge Stage 8 và không có cấu trúc ba tầng hay mạch hiểu-sai. Khác biệt đủ rõ và có căn cứ cụ thể (tên unit khớp mục lục) để người đọc không chuyên chỉ ra được bài nào có gói và vì sao, không phải đoán.
    - spec-alignment: PASS — Dàn ý A neo đích danh "Unit 12 — Ratio and proportion" và "Unit 7 — Fractions" đúng tên và đúng số thứ tự trong mục lục Learner's Book 8, dùng đúng bộ từ vựng/ký hiệu tiếng Anh của SKILL.md (numerator, denominator, equivalent, simplify, term, unitary method, ratio viết "3 : 2") và đúng nhịp sư phạm Cambridge (tình huống thật trước ký hiệu, ôn unit trước, mục "hiểu sai thường gặp", ba tầng luyện tập, gợi mở Unit 10 Percentages). Dàn ý B hoàn toàn bằng thuật ngữ Việt phổ thông (tỉ lệ thức, tích chéo, tỉ lệ thuận/nghịch) không có tên unit, không tiếng Anh, không ký hiệu Cambridge, và còn đưa "tỉ lệ nghịch" — chủ đề không nằm trong unit 12 của gói. Sự khác biệt đủ rõ và có căn cứ cụ thể (tên unit, từ vựng, ký hiệu, cấu trúc) để hội đồng chỉ ra được bài nào có gói và vì sao, không phải đoán mò; cả hai tệp đều mang mã lượt chạy ở dòng đầu.

- eval: E14
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment — fresh context)
  verdict: PASS
  rationale: |
    Vòng này hội đồng E14 chấm trên đủ cả hai nửa câu hỏi: "điền gì" (khối E1 — thẻ 5 câu) và "neo vào đâu" (khối E7 — dòng neo), cả hai đều nằm trong evidence được duyệt cho vòng 5. Thẻ 5 câu dùng nhãn tiếng Việt thuần (Tên gọi của bé, Lớp, Trường, Các môn, Sách), không có mã khung hay chữ "Stage". Dòng neo "Unit 12 · Ratio and proportion — Cambridge Lower Secondary Mathematics Learner's Book 8" nêu đích danh tên unit và tên sách thật, không có mã kỹ thuật hay "Stage" trần trụi. Không còn khoảng trống bằng chứng như round 4 (khi đó .png chưa có mặt trong Input của câu hỏi này).
  votes:
    - domain-correctness: PASS — Thẻ 5 câu (E1) dùng nhãn tiếng Việt thuần: "Tên gọi của bé", "Lớp", "Trường (không bắt buộc)", "Các môn", "Sách (không bắt buộc)" — phụ huynh không chuyên nhìn là biết điền gì, không mã khung, không chữ "Stage". Dòng neo (E7) "Unit 12 · Ratio and proportion — Cambridge Lower Secondary Mathematics Learner's Book 8" nêu đúng tên unit và tên sách (thứ phụ huynh có thể đối chiếu với sách vật lý của con), không chèn mã kiểu "8Nf" hay chữ "Stage" trần trụi như thiết kế đã cấm.
    - operational-feasibility: PASS — Thẻ 5 câu (E1) dùng nhãn tiếng Việt thường ngày (Tên gọi của bé, Lớp, Trường, Các môn, Sách) không có mã khung hay chữ "Stage"; dòng xác nhận chỉ nêu tên chương trình/sách bằng tên riêng công khai. Dòng neo (E7) "Unit 12 · Ratio and proportion — Cambridge Lower Secondary Mathematics Learner's Book 8" nêu đích danh unit và tên sách, không có mã kỹ thuật hay "Stage" trần trụi — khớp đúng trạng thái ST-the-mon-co-goi/ST-neo-co-goi mà design.md mô tả là điều phụ huynh không kỹ thuật đọc được.
    - spec-alignment: PASS — E1 cho thấy thẻ 5 câu dùng nhãn tiếng Việt rõ nghĩa (Tên gọi của bé, Lớp, Trường, Các môn) và dòng xác nhận bằng lời thường "✓ máy biết chương trình này — Cambridge Lower Secondary Mathematics Learner's Book 8", không có mã khung hay từ "Stage" nào xuất hiện. E7 cho thấy dòng neo "Unit 12 · Ratio and proportion — Cambridge Lower Secondary Mathematics Learner's Book 8" — chỉ nêu tên unit và tên sách thật (thứ phụ huynh cầm trên tay), không có mã lớp/mục tiêu, không có chữ "Stage" đứng một mình không giải thích. Cả hai bằng chứng đều khớp đúng hai trạng thái đích (ST-the-dang-dien, ST-neo-co-goi) mà không lộ thuật ngữ kỹ thuật nội bộ nào.

## Known limits

## Ngoài hợp đồng

## Analyst

Eval máy (`test`) xanh trên CẢ HAI phía (HEAD và diffBase) trong lượt chạy mới của vòng này — chứng minh harness chứ không phải feature; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:

- E7b, E7c (`./scripts/with-pinned-node.sh pnpm test`)

Các eval carry-forward từ round 4 (E1b, E2, E3, E4, E5b, E10b, E11, E12, E16, E6, E8, E9, E10c, E15) không được chạy lại đối chiếu baseline trong vòng này (paths không đổi) — trạng thái non-discriminating của chúng đã ghi ở `## Analyst` của round 4, xem `## Iterations`. Lệnh suite `./scripts/with-pinned-node.sh pnpm --filter @openmaic/storage test` xanh-cả-hai-phía là regression-guard bình thường, không liệt ở đây.

## Variance

none — every multi-run eval is uniform (không eval nào trong vòng 5 có `runs` > 1).

## Iterations

Round 1: 3 lỗi tìm ra ở vòng nghiệm thu thứ nhất (commit `409cc620`) — trả về implementation, đã sửa.
Round 2: E1, E5, E6, E7, E7b, E15 và suite `@openmaic/storage` xanh; E8b không đạt (network-truth: 404 app-origin, ngoài khai của Expected); E13gen không chạy được (thiếu dev server) → verdict BLOCKED.
Round 3: E6, E9, E7b, E15, E7 và suite `@openmaic/storage` xanh; E1 không đạt (thiếu khung sống ST-the-dang-luu — file đặt tên cho khung này thực chất chụp ST-the-da-luu); E8b không đạt (network-truth: 404 app-origin, cùng nguyên nhân round 2, chưa fix); E13gen không đạt (tuyến dàn ý không trả kết quả, thiếu khoá nhà cung cấp) → verdict REJECT, failed_evals=[E13gen, E1, E8b].
Round 4: E1 sửa xong (khung ST-the-dang-luu bắt bằng DOM-live .html); E13gen sửa xong (máy chủ + khoá mô hình sẵn, sinh cặp dàn ý mù thành công) → E13 (judgment) nâng UNCERTAIN→PASS; 16 eval test/script khác đều xanh và không phân biệt được với baseline; E14 vẫn UNCERTAIN (Input của câu hỏi này chưa liệt kê evidence/E7-neo-co-goi.png dù file đã tồn tại); E8b không đạt với nguyên nhân MỚI (2 lượt GET /api/curriculum-packs bị từ chối kết nối nhất thời lúc bootstrap/HMR, khác 404 round 2/3 đã sửa) → verdict REJECT, failed_evals=[E8b].
Round 5: E7b/E7c (bộ `pnpm test`) chạy lại xanh, không phân biệt với baseline; E7 và E8b (ui-check) đều xanh sạch — network-truth `clean` lần đầu tiên cho cả hai (nguyên nhân network của E8b ở round 4 không tái diễn); hội đồng chấm lại E13 (giữ PASS) và E14 (UNCERTAIN→PASS, nay có đủ cả bằng chứng "điền gì" và "neo vào đâu" trong phạm vi Input); 17 eval khác carry-forward nguyên trạng (16 từ round 4, 1 — E10 — từ round 1), delta vòng này không chạm paths của chúng → mọi eval PASS, verdict PASS.

### Re-pin lần 1 — 2026-09-23, do hoá cũ do chính commit chữ ký
run_id: repin-20260923T010135Z-93312
sha: d96920e43ea1ef48244dd25a40bd9e8842a78ba0 · suites: 2 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E1, E5, E7, E8b, E13 (E13 không khai paths), E14 (E14 không khai paths) · AC không có chốt máy: AC-14
