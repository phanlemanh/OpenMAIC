---
schema_version: 2
feature_slug: hieu-be-dang-hoc-gi
verdict: BLOCKED
failed_evals: ["E8b"]
reason: "Lệnh `./scripts/with-pinned-node.sh node scripts/gen-dan-y-mu.mjs` (eval E13gen) không chạy được: Dev server not running at http://localhost:3002. Script requires running server (dev_server.start profile) with provider unlocked. Error: ECONNREFUSED."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 409cc620cfa9bbebd15838cc95db83dd324c6c54
human_signoff:
---

# Evidence Report: hieu-be-dang-hoc-gi (round 2)

⚠ Round 2: E13gen không chạy được vì môi trường thiếu (dev server tại `http://localhost:3002` không lắng nghe — ECONNREFUSED), nên toàn vòng khai `BLOCKED` theo quy tắc BLOCKED (verifier không chạy được, không phải lỗi mã nguồn). Riêng E8b có kết quả FAIL độc lập (network-truth: 404 app-origin không được `expected` khai) — liệt trong `failed_evals` để không lẫn với lý do BLOCKED. Mọi eval khác trong vòng này (E6, E7b, E15, E1, E5, E7 và bộ suite `@openmaic/storage`) đều chạy xong và xanh; 11 eval carry-forward từ round 1 giữ nguyên PASS (xem cột `carried_from_round` trong từng khối). Hai mục judgment E13/E14 vẫn UNCERTAIN (E13 vì thiếu chính hai file đầu vào mà E13gen lẽ ra sinh ra; E14 vì thiếu ảnh PNG của dòng neo).

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
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | ui-check | FAIL |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13gen | AC-13 | script | BLOCKED (cannot-run — ECONNREFUSED) |
| E13 | AC-13 | judgment | UNCERTAIN |
| E14 | AC-14 | judgment | UNCERTAIN |
| E15 | AC-15 | script | PASS |
| E16 | AC-16 | test | PASS |

## Evidence

- eval: E6
  run_id: minted-hieu-be-dang-hoc-gi-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.generation
  verified_at: 2026-09-22T20:01:28Z
  output: |
          Tests  163 passed (163)
       Start at  20:01:28
       Duration  1.50s (transform 6.53s, setup 0ms, import 12.20s, tests 255ms, environment 1ms)

- eval: E7b
  run_id: minted-hieu-be-dang-hoc-gi-E7b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-22T20:01:25Z
  output: |
         Tests  8553 passed | 43 skipped (8596)
      Start at  20:01:25
      Duration  71.31s (transform 43.09s, setup 9.49s, import 326.52s, tests 229.36s, environment 47.86s)

- eval: E15
  run_id: minted-hieu-be-dang-hoc-gi-E15-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.gate
  verified_at: 2026-09-22T20:03:30Z
  output: |
    Verification: PASS — all 8 files scanned passed design gate checks with no P0 violations

- eval: E13gen
  run_id: minted-hieu-be-dang-hoc-gi-E13gen-r2
  exit_code: 1
  baseline: red
  cannot_run: true
  verifier: config:executors.script.dan_y_mu
  verified_at: 2026-09-22T20:04:00Z
  output: |
    gen-dan-y-mu: không gọi được http://localhost:3002 — cần một máy chủ đang chạy (dev_server.start của hồ sơ) đã khai khoá nhà cung cấp. Chi tiết: ECONNREFUSED
  note: |
    Nguyên nhân BLOCKED của toàn vòng. Không phải lỗi mã nguồn — là lệnh chưa chạy được vì dev server ở http://localhost:3002 không lắng nghe lúc lệnh này thực thi. Chưa dựng được evidence/E13-dan-y-A.md và evidence/E13-dan-y-B.md, nên E13 (judgment) không có gì để chấm (xem khối E13 bên dưới).

- eval: E1
  run_id: minted-hieu-be-dang-hoc-gi-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-09-22T19:10:00Z
  screenshot: evidence/E1-the-trong.png
  observed: |
    Opened mỗi PNG bằng Read (không đoán từ script) và đối chiếu Expected:
    - E1-the-trong.png: dialog Cài đặt › Người học, cả 3 ô trống (tên/lớp/trường), dòng môn trống, nút "Lưu" tím-nhạt/mờ (disabled) → khớp ST-the-trong.
    - E1-the-dang-dien.png: "Tên gọi của bé"="An", Lớp="lớp 7", dòng môn Toán/Cambridge Lower Secondary/Tiếng Anh đã điền, nút Lưu đã đậm màu (enabled) → khớp ST-the-dang-dien.
    - E1-mon-co-goi.png: dòng Cambridge hiện dòng xanh "✓ máy biết chương trình này — Cambridge Lower Secondary Mathematics Learner's Book 8" → khớp ST-the-mon-co-goi, đúng tên sách kỳ vọng.
    - E1-mon-chua-goi.png: thêm dòng 2 Toán/MOET (Việt Nam)/Tiếng Việt, hiện "Chưa có gói cho chương trình này — máy sẽ đoán và nói rõ là đang đoán." → khớp ST-the-mon-chua-goi.
    - E1-dang-luu.png: chụp ngay sau click Lưu (không settle-delay, có CPU-throttle 12x qua CDP để nới khung) nhưng NHỊP GHI CỤC BỘ (localStorage đồng bộ) vẫn nhanh hơn một vòng screenshot — khung chụp được đã là ST-the-da-luu (toast "Đã lưu" + text "Đã lưu" + nút Lưu đậm lại), KHÔNG bắt được nút-Lưu-mờ. Khai thẳng theo đúng cho phép của design.md ("khung này có thể rất ngắn; không bắt kịp thì khai thẳng"), file vẫn tồn tại, phủ đủ dòng ST-the-dang-luu về mặt "có khung", nhưng nội dung không phải trạng thái đang-lưu.
    - E1-da-luu.png: sau reload + mở lại Người học, "An"/"lớp 7"/2 dòng môn (Cambridge có gói, MOET chưa có gói) còn nguyên → giá trị sống sót qua tải lại, đúng yêu cầu AC-1.
    - E1-doi-lop.png: đổi Lớp → "lớp 8", dòng Cambridge chuyển thành "Chưa có gói cho chương trình này…" (đúng — chỉ có Stage 8/lớp 7 trong registry) → khớp mô tả bước 8.
    - E1-loi-luu.png: input tên "An (thử lưu hỏng)" còn nguyên trên form, dòng đỏ "Chưa lưu được — thứ vừa gõ vẫn còn trên màn. Thử lại nhé." + toast lỗi cùng nội dung, KHÔNG có toast "Đã lưu" nào trong khung này → không vướng lằn đỏ (c). Badge "4 Issues" góc dưới-trái là overlay dev-only của Next.js (cảnh báo instrumentation.ts dùng process.once ở Edge Runtime), không phải lỗi người dùng thấy ở production, không tính vào network truth.
    - E1-bot-mon.png: sau khi xoá dòng MOET (đang được "Soạn cho" nhớ) và lưu, về trang chủ, ô "Soạn cho" hiện đúng "Toán — Cambridge Lower Secondary (tiếng Anh)" — môn còn lại, KHÔNG kẹt ở lựa chọn mồ côi đã xoá → khớp AC-5.
    Không dòng ST-the-* nào thiếu khung. Không gặp lằn đỏ (a)/(b)/(c). Máy chủ 3010 đã tắt, worktree tạm đã dọn.
  network_observed: clean

- eval: E5
  run_id: minted-hieu-be-dang-hoc-gi-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-09-22T19:25:00Z
  screenshot: evidence/E5-moi-khai.png
  observed: |
    4 khung, mỗi khung đọc trực tiếp từ file PNG vừa lưu (Read tool, không đoán từ log):
    E5-moi-khai.png — hồ sơ trống: dưới "Chào Bạn học" chỉ có dòng "☞ Soạn cho bé nhà mình? Khai 5 câu →", KHÔNG có ô select nào cạnh nó. Khớp ST-chon-moi-khai.
    E5-san-sang.png — sau khi khai đủ 2 dòng môn (Toán·Cambridge Lower Secondary·tiếng Anh và Toán·MOET·tiếng Việt) và Lưu (toast "Đã lưu" còn hiện): dòng "Soạn cho:" kèm ô select hiện "Toán — Cambridge Lower Secondary (tiếng Anh) ▾" — đủ 3 phần môn — chương trình (ngôn ngữ). Khớp ST-chon-san-sang.
    E5-nho-lua-chon.png — sau khi đổi ô sang MOET rồi tải lại trang thật (đợi 1.8s cho animation ổn định trước khi chụp): ô "Soạn cho:" hiện "Toán — MOET (tiếng Việt) ▾" — lựa chọn sống sót qua tải lại, đủ 3 phần nhãn.
    E5-neo-khong.png — sau khi xoá dữ liệu cục bộ (gõ DELETE, xác nhận, trang tự reload) và soạn dàn ý bất kỳ: màn "Xem lại đề cương" hiện các thẻ cảnh ngay dưới dòng phụ đề, không có khung bo-viền-icon nào (không book-icon ST-neo-co-goi, không warning-icon ST-neo-dang-doan) chen giữa. DOM count `[data-state="ST-neo-co-goi"],[data-state="ST-neo-dang-doan"]` = 0. Khớp ST-neo-khong.
    Cả 3 dòng luật-phủ-khung bắt buộc (ST-chon-moi-khai, ST-chon-san-sang, ST-neo-khong) đều có ít nhất một khung sống, không thiếu dòng nào. Xem thêm evidence/E5-assertions.json (10 assertion, PASS hết). KHÔNG sửa code sản phẩm. Máy chủ tự dựng (cổng 3004, worktree e5-worktree) đã TẮT trước khi trả kết quả.
  network_observed: clean

- eval: E7
  run_id: minted-hieu-be-dang-hoc-gi-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-09-22T19:50:00Z
  screenshot: evidence/E7-neo-co-goi.html
  observed: |
    Đã Read lại evidence/E7-neo-co-goi.html (file vừa ghi, cũng đã tự mở và soi bằng screenshot trong Browser pane): khung hiển thị đúng "Scene outline / 9 scenes total", ngay dưới là dòng neo data-state="ST-neo-co-goi" với nội dung "Unit 12 — Ratio and proportion, sách Cambridge Lower Secondary Mathematics Learner's Book 8." — tên unit đứng trước, tên sách theo sau, không có mã khung nào mở đầu câu, câu đọc được tự nhiên. Nội dung sao chép nguyên văn từ outerHTML DOM thật đọc bằng javascript_tool ngay tại màn xem trước dàn ý sống, đối chiếu khớp 100% với sessionStorage.generationSession.curriculumAnchor tại đúng thời điểm. Lặp lại độc lập lần 2 (tab khác, cùng hồ sơ, cùng câu hỏi) cho cùng cấu trúc, khớp Expected. Không mâu thuẫn Expected ở bất cứ điểm nào đã đọc được.
  network_observed: clean

- eval: E8b
  run_id: verifier-E8b-tab13@localhost:3002-20260922T130736Z
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-09-22T13:07:36Z
  screenshot: evidence/E8b-step2.png
  observed: |
    Opened evidence/E8b-step2.png with Read (image, viewed directly): a "Scene outline" review card on the real running app (not a mock). Directly under the "2 scenes total..." line sits exactly ONE amber-outlined box with a warning-triangle icon: "⚠ No curriculum pack for moet yet — this is an informed guess, not a checked match." Below it are the two seeded scenes ("Phân số là gì" / "Ôn tập phân số"). No pack-style anchor ("Bài này theo Unit ... · Learner's Book ...") is present anywhere on the frame — matches the ST-neo-dang-doan variant, not ST-neo-co-goi. DOM check confirms mechanically: document.querySelectorAll('[data-state^="ST-neo"]') returned exactly one node, {state: "ST-neo-dang-doan", text: "⚠ No curriculum pack for moet yet — this is an informed guess, not a checked match."}. Cross-checked against GET /api/curriculum-packs on the live dev server: its only fixture pack is Toán/cambridge-lower-secondary — there is genuinely no pack for "moet", so the guessing state is the factually correct one. An unrelated toast ("Your changes aren't being saved because the app can't access its stored data...") and a dev "11 Issues" badge are also visible in the frame — both are pre-existing environment noise (see networkObserved) unconnected to the AC-8 anchor line.
  network_observed: app-fail
  fail_reason: |
    Visual/DOM assertions for AC-8 all PASS (đúng một khung ST-neo-dang-doan, đúng cảnh báo + tên chương trình chưa có gói). Nhưng network-truth FAIL: GET /api/stages, GET /api/folders, GET /api/persistence/kv/entries/settings-storage, GET /api/persistence/kv/entries/learner-profile-storage, GET /api/persistence/kv/entries/user-profile-storage đều 404 app-origin trong lúc chạy, không được Expected của E8b khai (root cause đọc từ nguồn: app/api/persistence/[...path]/route.ts:324 trả PERSISTENCE_NOT_CONFIGURED vì NEXT_PUBLIC_PERSISTENCE=1 phía client nhưng backend chưa cấu hình phía máy chủ trong môi trường dev này). Chi tiết đầy đủ: evidence/E8b-network.txt.

### Lệnh suite (hồi quy)

- cmd: ./scripts/with-pinned-node.sh pnpm --filter @openmaic/storage test
  run_id: minted-hieu-be-dang-hoc-gi-SUITE-filter-r2
  exit_code: 0
  verified_at: 2026-09-22T20:02:50Z

### Carry-forward (round 1 — delta round 2 không chạm paths của các eval này)

- eval: E1b
  run_id: minted-hieu-be-dang-hoc-gi-E1b-r1
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-09-22T12:10:28Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval. Khung gốc xem round 1 trong Iterations.

- eval: E2
  run_id: minted-hieu-be-dang-hoc-gi-E2-r1
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-09-22T12:10:28Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval. Khung gốc xem round 1 trong Iterations.

- eval: E3
  run_id: minted-hieu-be-dang-hoc-gi-E3-r1
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-09-22T12:10:28Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval. Khung gốc xem round 1 trong Iterations.

- eval: E4
  run_id: minted-hieu-be-dang-hoc-gi-E4-r1
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-09-22T12:10:28Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval. Khung gốc xem round 1 trong Iterations.

- eval: E5b
  run_id: minted-hieu-be-dang-hoc-gi-E5b-r1
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-09-22T12:10:28Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval. Khung gốc xem round 1 trong Iterations.

- eval: E8
  run_id: minted-hieu-be-dang-hoc-gi-E8-r1
  exit_code: 0
  verifier: config:executors.test.generation
  verified_at: 2026-09-22T12:10:28Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval. Khung gốc xem round 1 trong Iterations.

- eval: E9
  run_id: minted-hieu-be-dang-hoc-gi-E9-r1
  exit_code: 0
  verifier: config:executors.test.generation
  verified_at: 2026-09-22T12:10:28Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval. Khung gốc xem round 1 trong Iterations.

- eval: E10
  run_id: minted-hieu-be-dang-hoc-gi-E10-r1
  exit_code: 0
  verifier: config:executors.test.generation
  verified_at: 2026-09-22T12:10:28Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval. Khung gốc xem round 1 trong Iterations.

- eval: E11
  run_id: minted-hieu-be-dang-hoc-gi-E11-r1
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-09-22T12:10:28Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval. Khung gốc xem round 1 trong Iterations.

- eval: E12
  run_id: minted-hieu-be-dang-hoc-gi-E12-r1
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-09-22T12:10:28Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval. Khung gốc xem round 1 trong Iterations.

- eval: E16
  run_id: minted-hieu-be-dang-hoc-gi-E16-r1
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-09-22T12:10:28Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval. Khung gốc xem round 1 trong Iterations.

### Judgment

- eval: E13
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment — fresh context)
  verdict: UNCERTAIN
  run_id: (n/a — E13gen chưa chạy được lần nào trong vòng này; xem khối E13gen ở trên)
  rationale: |
    Không khai input nào — cả ba lens đều không có gì để chấm vì hai file bằng chứng bắt buộc (evidence/E13-dan-y-A.md, evidence/E13-dan-y-B.md) không tồn tại. Nguyên nhân gốc: eval E13gen (script sinh cặp dàn ý mù) không chạy được trong vòng này (ECONNREFUSED, dev server không chạy) nên chưa từng sinh ra hai file đó.
  votes:
    - domain-correctness: UNCERTAIN — Hai file bằng chứng bắt buộc của E13 (E13-dan-y-A.md, E13-dan-y-B.md) không tồn tại trong _acceptance/hieu-be-dang-hoc-gi/evidence/ — không có gì để đối chiếu với mục lục Cambridge Learner's Book 8 hay để kiểm mã lượt chạy ở dòng đầu. Theo đúng luật của câu hỏi phán xét (tệp không có mã lượt chạy thì KHÔNG chấm), việc thiếu hẳn tệp càng không đủ căn cứ để phán PASS hay FAIL.
      required_evidence: Chạy bộ sinh cặp dàn ý mù cho E13 (khoá config executors.script.dan_y_mu trỏ scripts/gen-dan-y-mu.mjs, theo Notes của contract.md) để tạo ra hai file _acceptance/hieu-be-dang-hoc-gi/evidence/E13-dan-y-A.md và E13-dan-y-B.md, mỗi file có mã lượt chạy (run-code) ở dòng đầu, một bài sinh có gói Cambridge Stage 8 và một bài sinh không có gói, không đánh dấu bài nào là bài nào.
    - operational-feasibility: UNCERTAIN — Hai file input bắt buộc cho E13 (evidence/E13-dan-y-A.md và evidence/E13-dan-y-B.md) không tồn tại trong thư mục evidence — thư mục chỉ có bằng chứng cho E1/E5/E7/E8/E8b, không có gì cho E13. Theo đúng luật của câu hỏi phán xét ("tệp không có mã [lượt chạy] thì KHÔNG chấm, trả UNCERTAIN") và luật blind-judge (không tự đi tìm file khác để tự cứu), không có căn cứ nào để đọc và so hai dàn ý với mục lục Learner's Book 8, nên không thể phân biệt bài nào có gói hay đánh giá operational-feasibility của luồng neo.
      required_evidence: Chạy executor script.dan_y_mu (scripts/gen-dan-y-mu.mjs, đã khai ở contract.md phần Notes) từ tuyến thật để sinh cặp dàn ý mù cho đề «tỉ lệ và tỉ số» lớp 7, ghi ra đúng hai file _acceptance/hieu-be-dang-hoc-gi/evidence/E13-dan-y-A.md và E13-dan-y-B.md, mỗi file có mã lượt chạy (run id) ở dòng đầu tiên — thiếu bước này thì không có gì để hội đồng đọc và đối chiếu với mục lục Learner's Book 8.
    - spec-alignment: UNCERTAIN — Cả hai file bằng chứng bắt buộc cho AC-13 — /Users/manhphan/dev/OpenMAIC/_acceptance/hieu-be-dang-hoc-gi/evidence/E13-dan-y-A.md và E13-dan-y-B.md — đều không tồn tại (Read báo "File does not exist"; thư mục evidence/ liệt kê chỉ có các file E1/E5/E7/E8/E8b, không có E13-dan-y-A.md hay E13-dan-y-B.md). Không có dàn ý nào để đối chiếu mục lục Cambridge Stage 8 hay để phân biệt bài nào có gói, nên không có căn cứ để chấm PASS hay FAIL.
      required_evidence: Tạo hai file /Users/manhphan/dev/OpenMAIC/_acceptance/hieu-be-dang-hoc-gi/evidence/E13-dan-y-A.md và E13-dan-y-B.md bằng đúng bộ sinh cặp dàn ý mù (khoá config executors.script.dan_y_mu trỏ scripts/gen-dan-y-mu.mjs, ghi trong contract.md mục Notes), mỗi file có mã lượt chạy (run code) ở dòng đầu tiên — thiếu mã thì vẫn UNCERTAIN theo đúng luật đề bài.
  required_evidence:
    - Chạy lại eval E13gen (cần dev server tại http://localhost:3002, provider mở khoá) để sinh evidence/E13-dan-y-A.md và evidence/E13-dan-y-B.md, mỗi file có mã lượt chạy ở dòng đầu — sau đó chấm lại E13.
  human_override:

- eval: E14
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment — fresh context)
  verdict: UNCERTAIN
  rationale: |
    Ba lens đồng thuận UNCERTAIN vì file evidence/E7-neo-co-goi.png (định dạng PNG của dòng neo, nơi mã khung/"Stage" thực sự có thể xuất hiện theo design.md) không tồn tại ở đường dẫn kỳ vọng — thư mục evidence chỉ có E7-neo-co-goi.html và E7-network.txt. Phần thẻ 5 câu (E1-the-dang-dien.png) đọc được và sạch (không mã kỹ thuật), nhưng đó chỉ là một nửa câu hỏi AC-14.
  votes:
    - domain-correctness: UNCERTAIN — File bằng chứng E7-neo-co-goi.png (dòng neo — đúng phần chứa mã khung/«Stage» mà câu hỏi AC-14 nhắm tới) không tồn tại ở đường dẫn được liệt — thư mục evidence chỉ có E7-neo-co-goi.html và E7-network.txt, không phải .png trong danh sách Input. E1-the-dang-dien.png (thẻ 5 câu) đọc được và không thấy thuật ngữ kỹ thuật hay «Stage» trên thẻ, nhưng đó chỉ là một trong hai màn câu hỏi hỏi tới; thiếu bằng chứng cho màn dòng neo — nơi mã khung thực sự xuất hiện theo design.md — nên không đủ căn cứ phán cho toàn bộ câu hỏi.
      required_evidence: Xuất/chụp lại E7-neo-co-goi.png đúng định dạng PNG tại _acceptance/hieu-be-dang-hoc-gi/evidence/ (hiện chỉ có .html và -network.txt) — ảnh chụp màn xem trước ở trạng thái ST-neo-co-goi cho thấy dòng neo thật (ví dụ «Bài này theo Unit 3 — Tỉ lệ và tỉ số · Cambridge Stage 8 · Learner's Book 8») để xem chữ «Stage»/mã khung có đứng lẻ loi không giải thích hay được đặt sau tên unit, in nhỏ, như design.md mục 'Hành vi' yêu cầu.
    - operational-feasibility: UNCERTAIN — E1-the-dang-dien.png cho thấy thẻ 5 câu (tên gọi, lớp, trường, dòng môn) dùng nhãn thuần Việt, không có "Stage" hay mã kỹ thuật — phần này phụ huynh non-tech đọc được. Nhưng file evidence.E7-neo-co-goi.png (dòng neo) mà câu hỏi phán xét đòi hỏi lại không tồn tại ở đường dẫn được liệt — chỉ có E7-neo-co-goi.html cùng thư mục, một tên file khác, ngoài phạm vi input được duyệt của phiên này — nên không có căn cứ để phán phần "dòng neo" của câu hỏi.
      required_evidence: File ảnh đúng tên /Users/manhphan/dev/OpenMAIC/_acceptance/hieu-be-dang-hoc-gi/evidence/E7-neo-co-goi.png (định dạng .png, không phải .html) cần được sinh ra và liệt vào danh sách Input của lượt judge kế tiếp — hiện tại chỉ có E7-neo-co-goi.html ở đúng thư mục, không được đọc do ngoài phạm vi khai báo.
    - spec-alignment: UNCERTAIN — E1-the-dang-dien.png cho thấy thẻ 5 câu (tên gọi, lớp, trường, dòng môn/chương trình/ngôn ngữ/sách) với thông báo "✓ máy biết chương trình này — Cambridge Lower Secondary Mathematics Learner's Book 8" — không có mã khung hay chữ "Stage" trên thẻ, đọc được bằng tiếng phổ thông. Nhưng câu hỏi E14 đòi cả dòng neo, mà file evidence/E7-neo-co-goi.png trong danh sách Input không tồn tại trên đĩa (chỉ có E7-neo-co-goi.html, ngoài phạm vi được liệt) nên không có căn cứ hình ảnh nào cho phần "bài neo vào đâu — hay gặp chữ «Stage» ở chỗ không giải thích".
      required_evidence: Tạo lại/đúng định dạng file evidence/E7-neo-co-goi.png: xuất ảnh PNG thật của màn xem trước dàn ý ở trạng thái ST-neo-co-goi (dòng neo có gói), ví dụ render lại E7-neo-co-goi.html hiện có thành .png bằng công cụ chụp ảnh chuẩn của bộ acceptance rồi lưu đúng đường dẫn evidence/E7-neo-co-goi.png — có ảnh này mới đủ căn cứ xét dòng neo có lộ mã kỹ thuật (Stage, mã mục tiêu) không giải thích hay không.
  required_evidence:
    - Xuất evidence/E7-neo-co-goi.png (PNG thật, không phải .html) của màn ST-neo-co-goi rồi chấm lại E14 cùng E1-the-dang-dien.png đã có.
  human_override:

## Known limits

## Ngoài hợp đồng

## Analyst

Eval xanh trên CẢ HEAD lẫn baseline (không phân biệt — chứng minh harness chứ không phải feature; cân nhắc viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):
- E6 (`./scripts/with-pinned-node.sh pnpm --filter @openmaic/generation test`) — baseline: green
- E7b (`./scripts/with-pinned-node.sh pnpm test`) — baseline: green
- E15 (`./scripts/with-pinned-node.sh node scripts/design-gate-changed.mjs`) — baseline: green

Lệnh suite `./scripts/with-pinned-node.sh pnpm --filter @openmaic/storage test` xanh-cả-hai-phía là regression-guard bình thường, không liệt ở đây.

## Variance

none — every multi-run eval is uniform (không eval nào trong vòng này có `runs` > 1).

## Iterations

Round 1: 3 lỗi tìm ra ở vòng nghiệm thu thứ nhất (xem commit `409cc620`) — trả về implementation, đã sửa; 11 eval carry-forward ở trên giữ nguyên kết quả round 1 (PASS, verified_at 2026-09-22T12:10:28Z) vì delta round 2 không chạm paths của chúng.
Round 2: E1, E5, E6, E7, E7b, E15 và suite `@openmaic/storage` đều xanh; E8b FAIL độc lập (network-truth: 404 app-origin trên /api/persistence, /api/stages, /api/folders, không được Expected khai); E13gen không chạy được — thiếu dev server tại localhost:3002 (ECONNREFUSED) → verdict tổng BLOCKED, chờ dev server rồi verify lại E13gen (kéo theo chấm lại E13).
