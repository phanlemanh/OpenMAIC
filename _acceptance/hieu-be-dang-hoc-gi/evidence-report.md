---
schema_version: 2
feature_slug: hieu-be-dang-hoc-gi
verdict: REJECT
failed_evals: ["E13gen", "E1", "E8b"]
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 09acf1dca699b8b086f90646be66cc2796671447
human_signoff:
---

# Evidence Report: hieu-be-dang-hoc-gi (round 3)

Ba eval đỏ độc lập trong vòng này: **E13gen** (script sinh cặp dàn ý mù thoát mã 2 — tuyến `/api/generate/scene-outlines-stream` trả 500, thiếu khoá nhà cung cấp phía máy chủ, không dựng dữ liệu giả), **E1** (chụp sống thẻ hồ sơ — thiếu khung sống cho dòng trạng thái `ST-the-dang-luu`: file đặt tên cho khung này, `evidence/E1-dang-luu.png`, trên thực tế chụp trạng thái `ST-the-da-luu` — xem chi tiết trong khối E1 bên dưới) và **E8b** (chụp sống dòng neo đang-đoán — nội dung UI đúng nhưng network-truth FAIL: các 404 app-origin trên `/api/persistence/kv/*`, `/api/stages`, `/api/folders` mà `expected` của E8b không khai là ngoại lệ, cùng nguyên nhân đã ghi ở round 2, chưa được sửa). Nội dung dưới đây thay trọn round 2 cũ; lịch sử từng round nằm trong mục `## Iterations`. Mười một eval carry-forward giữ nguyên PASS (paths không đổi trong delta round 3) và hai mục judgment (E13, E14) vẫn UNCERTAIN vì thiếu đúng các file input mà chúng cần.

## Bảng kết quả

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | FAIL |
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
| E13gen | AC-13 | script | FAIL (exit 2 — cannot-run, không phải lỗi dữ liệu) |
| E13 | AC-13 | judgment | UNCERTAIN |
| E14 | AC-14 | judgment | UNCERTAIN |
| E15 | AC-15 | script | PASS |
| E16 | AC-16 | test | PASS |

## Evidence

- eval: E6
  run_id: minted-hieu-be-dang-hoc-gi-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.generation
  verified_at: 2026-09-22T20:58:21Z
  output: |
    Tests  163 passed (163)
    Start at  20:58:21
    Duration  991ms (transform 3.74s, setup 0ms, import 7.63s, tests 196ms, environment 1ms)

- eval: E9
  run_id: minted-hieu-be-dang-hoc-gi-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.generation
  verified_at: 2026-09-22T20:58:21Z
  output: |
    Tests  163 passed (163)
    Start at  20:58:21
    Duration  991ms (transform 3.74s, setup 0ms, import 7.63s, tests 196ms, environment 1ms)
    (cùng lệnh `pnpm --filter @openmaic/generation test` với E6 — bộ này phủ cả hai eval.)

- eval: E7b
  run_id: minted-hieu-be-dang-hoc-gi-E7b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-22T20:58:21Z
  output: |
    Tests  8556 passed | 43 skipped (8599)
    Start at  20:58:21
    Duration  40.51s (transform 32.40s, setup 4.48s, import 159.38s, tests 188.40s, environment 23.01s)

- eval: E13gen
  run_id: minted-hieu-be-dang-hoc-gi-E13gen-r3
  exit_code: 2
  baseline: n-a
  cannot_run: true
  verifier: config:executors.script.dan_y_mu
  verified_at: 2026-09-22T20:58:40Z
  output: |
    with-dev-server: máy chủ sẵn sàng sau 4s.
    gen-dan-y-mu: tuyến dàn ý trả 500 — cần một máy chủ đang chạy tại http://localhost:3002 đã khai khoá nhà cung cấp.
  note: |
    Script đúng thiết kế thoát mã 2 và nói rõ thiếu gì (không dựng dữ liệu giả) khi tuyến `/api/generate/scene-outlines-stream` trả 500 vì máy chủ chưa khai khoá nhà cung cấp. Không dựng được evidence/E13-dan-y-A.md và evidence/E13-dan-y-B.md, nên E13 (judgment) tiếp tục không có gì để chấm (xem khối E13 bên dưới). Đây là lần thứ hai liên tiếp (round 2: ECONNREFUSED — không có server; round 3: có server nhưng thiếu khoá nhà cung cấp) eval này không sinh được hai file bắt buộc.

- eval: E15
  run_id: minted-hieu-be-dang-hoc-gi-E15-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.gate
  verified_at: 2026-09-22T20:58:55Z
  output: |
    }

    PASS — All 8 changed files scanned with no P0 issues

- eval: E1
  run_id: minted-hieu-be-dang-hoc-gi-E1-r3
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-09-22T13:00:00Z
  screenshot: evidence/E1-the-trong.png
  observed: |
    Đọc trực tiếp 9 file PNG trong _acceptance/hieu-be-dang-hoc-gi/evidence/ (đối chiếu component nguồn components/settings/learner-profile-settings.tsx dòng 169-178 và 340-358 để biết chính xác data-state nào tạo ra nội dung nào):
    - E1-the-trong.png: 5 ô trống, nút "Lưu" màu tím nhạt (đã đo pixel: RGB≈(180,150,225), khớp trạng thái disabled) = ST-the-trong. ĐÚNG.
    - E1-the-dang-dien.png: tên "An", lớp 7, 1 dòng Toán/Cambridge/Tiếng Anh, nút Lưu tím đậm (enabled) = ST-the-dang-dien. ĐÚNG.
    - E1-mon-co-goi.png: dòng Cambridge hiện "✓ máy biết chương trình này — Cambridge Lower Secondary Mathematics Learner's Book 8" = ST-the-mon-co-goi. ĐÚNG, lớp 7 Cambridge CÓ gói (không phải đỏ (b)).
    - E1-mon-chua-goi.png: thêm dòng Toán/MOET/Tiếng Việt, hiện "Chưa có gói cho chương trình này — máy sẽ đoán và nói rõ là đang đoán" = ST-the-mon-chua-goi. ĐÚNG.
    - E1-dang-luu.png: toast "Đã lưu" (icon check) NỔI ở góc trên, và dưới "+ Thêm môn" có dòng chữ tĩnh "Đã lưu" — KHÔNG thấy nút Lưu nào ở khu vực đó dù đã crop rộng đến hết viewport (y=600-900). Theo mã nguồn dòng 345-349, đoạn text "Đã lưu" CHỈ render khi save==='saved' (không phải 'saving' — nhánh 'saving' không render đoạn text nào, chỉ có nút disabled). Toast cũng chỉ gọi sau khi await xong (dòng 165-166). => Đây thực chất là khung ST-the-da-luu (đã lưu xong), KHÔNG PHẢI ST-the-dang-luu (đang đọc lại để xác nhận, nút mờ). Cửa sổ ST-the-dang-luu (save==='saving') coi như KHÔNG bắt được.
    - E1-da-luu.png: sau khi "tải lại trang", card hiện nút Lưu tím ĐẬM (enabled), KHÔNG có toast, KHÔNG có chữ "Đã lưu" tĩnh. Bản thân evidence/E1-assertions.json (dòng note đi kèm) đã tự nhận: state lúc này là ST-the-dang-dien (vì sau reload `touched` bật lại true còn `save` reset về 'idle' theo đúng công thức mã nguồn dòng 169-178) — tức đây KHÔNG PHẢI khung ST-the-da-luu, chỉ dùng để xác nhận "sau tải lại giá trị còn nguyên" (tên, lớp, 2 dòng môn đều đúng — phần này ĐẠT).
    - E1-doi-lop.png: lớp 8, dòng Cambridge chuyển "Chưa có gói cho chương trình này..." = đúng hành vi đổi lớp không có gói Stage 9. ĐÚNG (khung hành vi, không tính vào 7 dòng bắt buộc).
    - E1-bot-mon.png: trang chủ, ô "Soạn cho: Toán — Cambridge Lower Secondary (tiếng Anh)", toast "Đã lưu" — sau khi bớt môn MOET, ô rơi về môn còn lại, không giữ lựa chọn mồ côi. ĐÚNG (khung hành vi AC-5, không tính vào 7 dòng bắt buộc).
    - E1-loi-luu.png: toast lỗi "Các thay đổi của bạn không được lưu vì ứng dụng không truy cập được vùng dữ liệu của nó..." + banner đỏ "Chưa lưu được — thứ vừa gõ vẫn còn trên màn. Thử lại nhé." + ô tên vẫn còn "An (thử lưu hỏng)", KHÔNG có toast "Đã lưu" nào = ST-the-loi-luu. ĐÚNG. E1-network.txt xác nhận lỗi ghi là tự người đo dựng (console: "[KVPersist] ... forced by E1 verifier (local-first substitute for network block)"), đúng luật cho phép của đề bài (500/lỗi ghi ở bước ép-hỏng do chính người đo dựng là đúng thiết kế) dù phương pháp thực tế là ép hỏng tầng lưu cục bộ (localStorage) thay vì chặn HTTP /api/persistence/kv — hợp lý vì log mạng xác nhận tuyến kv route KHÔNG hề được gọi trong lối local-first (0 lượt gọi suốt phiên), nên chặn HTTP route là bất khả thi ở cấu hình này.

    KẾT LUẬN PHỦ KHUNG: 6/7 dòng ST-the-* có khung sống đúng (trong, dang-dien, mon-co-goi, mon-chua-goi, da-luu [nội dung thực nằm ở file dang-luu.png], loi-luu). Dòng THIẾU: ST-the-dang-luu — không file nào trong 9 file thật sự hiện trạng thái "đang lưu, nút Lưu mờ trong lúc đọc lại xác nhận" (save==='saving'); file được đặt tên cho trạng thái này (E1-dang-luu.png) trên thực tế lại chụp trạng thái ST-the-da-luu (toast + chữ "Đã lưu" tĩnh). evidence/E1-assertions.json ghi "savingDisabled=true caught=true" cho khung này — đây là tuyên bố SAI/gây hiểu lầm: nút bị disabled ở CẢ hai state 'saving' VÀ 'saved' (theo `disabled={!complete || save==='saved' || save==='saving'}`), nên chỉ kiểm tra disabled=true không chứng minh được đã bắt đúng cửa sổ 'saving' — và nội dung khung (toast + text "Đã lưu") chỉ render ở state 'saved'. Bước 6 của đề bài tự lường trước khả năng này ("khung này có thể rất ngắn; không bắt kịp thì khai thẳng") nhưng bộ evidence không khai thẳng mà báo PASS.

    Network truth: đọc toàn bộ evidence/E1-network.txt (287 dòng) — 0 request 4xx/5xx trên bất kỳ origin nào (24 lệnh gọi /api/* đều 200). Không có gọi /api/persistence/kv nào (khớp lối local-first — BrowserKVStore dùng localStorage thẳng). Cổng máy chủ dev thực tế là 3010, khác cổng khai trong config.yaml (3002) — không gây đỏ vì toàn bộ traffic app-scope nằm trên một origin nhất quán và đều 200, nhưng đáng ghi chú cho vòng sau.
  network_observed: clean
  output: |
    Assertion-by-assertion (đối chiếu độc lập bằng cách đọc pixel từng PNG + đọc mã nguồn components/settings/learner-profile-settings.tsx, KHÔNG dựa vào evidence/E1-assertions.json):
    1. [PASS] ST-the-trong sống — 5 ô trống, nút Lưu tím nhạt (disabled, đo pixel xác nhận).
    2. [PASS] ST-the-dang-dien sống — tên+lớp+1 dòng môn, nút Lưu tím đậm (enabled).
    3. [PASS] ST-the-mon-co-goi sống, lớp 7 Cambridge CÓ gói — không rơi vào đỏ (b).
    4. [PASS] ST-the-mon-chua-goi sống — dòng MOET hiện "chưa có gói".
    5. [FAIL] ST-the-dang-luu KHÔNG có khung sống nào. File E1-dang-luu.png thực chất chụp trạng thái ST-the-da-luu (toast + text tĩnh "Đã lưu", không nút — chỉ render khi save==='saved'). Không file nào trong 9 file thể hiện đúng "nút Lưu mờ trong lúc đọc lại để xác nhận" mà KHÔNG kèm toast/text đã-lưu. => vi phạm LUẬT PHỦ KHUNG, nêu đích danh dòng thiếu: ST-the-dang-luu.
    6. [PASS, có ghi chú] "Sau tải lại giá trị còn nguyên" đạt — nhưng bản thân khung này không hiện lại UI của ST-the-da-luu vì sau reload state luôn reset về 'idle' (touched=true → ST-the-dang-dien) theo đúng thiết kế; không phải khung thay cho dòng ST-the-da-luu (dòng đó đã được phủ bởi nội dung thực của E1-dang-luu.png ở trên).
    7. [PASS] Khung đổi-lớp: lớp 8, Cambridge chuyển "chưa có gói" (không có Stage 9) — đúng.
    8. [PASS] ST-the-loi-luu sống: banner đỏ, giá trị "An (thử lưu hỏng)" còn trên form, KHÔNG có toast đã-lưu. Lỗi ghi TỰ người đo dựng, đúng luật miễn trừ của đề bài.
    9. [PASS] Khung bớt-môn AC-5: ô "Soạn cho" rơi về "Toán — Cambridge Lower Secondary (tiếng Anh)" sau khi bớt dòng MOET.
    10. [PASS] Network truth: 0 request 4xx/5xx trên bất kỳ origin nào trong evidence/E1-network.txt.
    11. [Lưu ý phụ] Cổng máy chủ dev thực tế 3010 khác cổng khai trong config.yaml (3002) — không gây đỏ theo luật scoping vì traffic app-scope nằm trên một origin nhất quán, nhưng đáng ghi chú cho vòng sau.
    12. [Lưu ý độ tin cậy evidence] evidence/E1-assertions.json (do bên tạo evidence sinh ra, KHÔNG phải phiên nghiệm thu này) ghi "savingDisabled=true caught=true" — SAI/gây hiểu lầm như phân tích ở mục 5.
    KẾT QUẢ: exitCode=1 (FAIL). Lý do đỏ theo đúng "Chiều đỏ (a)": thiếu khung sống cho dòng ST-the-dang-luu; evidence/E1-assertions.json khai "caught=true" không đúng sự thật thay vì khai thẳng theo đúng yêu cầu bước 6 của đề bài. Khuyến nghị vòng chụp lại: bắt khoảnh khắc save==='saving' bằng cách làm chậm nhân tạo lượt đọc-lại-để-xác-nhận (mock storage.getItem có độ trễ ngắn) rồi chụp NGAY trước khi toast xuất hiện.

- eval: E7
  run_id: minted-hieu-be-dang-hoc-gi-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-09-22T13:40:00Z
  screenshot: evidence/E7-neo-co-goi.html
  observed: |
    Đọc trực tiếp evidence/E7-neo-co-goi.html (mở bằng Read, không suy diễn): khối "Scene outline" / "10 scenes total..." rồi ngay bên dưới là <p data-state="ST-neo-co-goi"> với <span>Unit 12 — Ratio and proportion, sách Cambridge Lower Secondary Mathematics Learner's Book 8.</span> — outerHTML này chép nguyên văn từ document.querySelector('[data-state^="ST-neo"]') đọc SỐNG qua javascript_tool ngay tại màn xem trước dàn ý (không phải suy diễn/tái dựng). Tên unit "Unit 12 — Ratio and proportion" đứng TRƯỚC, tên sách "sách Cambridge Lower Secondary Mathematics Learner's Book 8" theo sau, KHÔNG có mã khung mở đầu câu — khớp Expected "tên unit đứng trước, không mã đứng trước". sessionStorage.generationSession.curriculumAnchor đọc cùng lúc khớp byte-for-byte với DOM. previewPhase vẫn "review" tại thời điểm đọc — không rơi vào chiều đỏ "dàn ý sinh xong mà không dòng neo". Đọc evidence/E7-network.txt: thân SSE thô có dòng data: {"type":"curriculumAnchor","data":"Unit 12 â€” Ratio and proportion, sÃ¡ch Cambridge Lower Secondary Mathematics Learner's Book 8."} — một sự kiện SSE type=curriculumAnchor RIÊNG, tách biệt khỏi 10 sự kiện type=outline — khớp Expected "luồng SSE có sự kiện curriculumAnchor". Route POST /api/generate/scene-outlines-stream trả 200 OK trong lượt đo được trích dẫn.
  network_observed: clean
  output: |
    Dev server tự khởi (PORT=3002, pid 5854 + con 5881 next-server v16.3.3) đã TẮT sau khi đo xong (kill 5854, kill 5881 → lsof -ti :3002 rỗng). Không có server nào khác trên :3002 trước khi start.
    exitCode=0: mọi assertion PASS. File evidence: _acceptance/hieu-be-dang-hoc-gi/evidence/E7-neo-co-goi.html, evidence/E7-network.txt (cả hai đã viết lại cho vòng 3, thay nội dung vòng 2 cũ). KHÔNG sửa bất kỳ file mã nguồn nào trong repo.

- eval: E8b
  run_id: verifier-E8b-r3-tab13@localhost:3002-20260922T140900Z
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-09-22T14:09:00Z
  screenshot: evidence/E8b-step2.html
  observed: |
    Opened _acceptance/hieu-be-dang-hoc-gi/evidence/E8b-step2.html with Read (extracted the anchor region to a scratch file first since the full file is one 82KB unbroken line, exceeding Read's token cap; the extraction was mechanical byte-offset slicing around the exact string `data-state="ST-neo-dang-doan"`, not a paraphrase). The captured DOM shows, immediately under the "Scene outline" card header (inside the live generation-preview page, not a mock): exactly one node `<p data-state="ST-neo-dang-doan" class="...border-amber-500/40 bg-amber-500/5...">` with a triangle-alert icon and `<span>⚠ No curriculum pack for MOET yet — this is an informed guess, not a checked match.</span>`. This matches Expected precisely: one live frame covering ST-neo-dang-doan, warning wording present, curriculum name "MOET" stated plainly, not styled/worded as if it had a pack. A DOM query run via javascript_tool immediately before the capture (`document.querySelectorAll('[data-state^="ST-neo"]')`) independently confirmed count=1, state="ST-neo-dang-doan", text matching byte-for-byte. Cross-checked against GET /api/curriculum-packs on the live server — MOET genuinely has no pack. Below the anchor the outline was still mid-stream at the instant of capture — expected, it does not gate on scene completion. Note on label casing: the older committed evidence/E8b-step2.png shows lowercase "...for moet yet..." — that file is stale relative to current source (lib/i18n/locales/en-US.json maps code "moet" -> label "MOET"; app/generation-preview/page.tsx:1327 passes that translated label). The current, correct rendering is uppercase "MOET", exactly what this round's fresh capture shows; the old .png should not be treated as this round's evidence.
  network_observed: app-fail
  output: |
    Verifier: independent, fresh-context, did not write any implementation code this session (doer != grader honored). Round 3, eval E8b (criterion AC-8).
    Dev server: a `next dev` server was ALREADY listening on :3002 before verification started (pid 5875/5881, pre-existing, not started by this session) — reused it per "port already has a server: share it, do not stop it". Confirmed running with NEXT_PUBLIC_PERSISTENCE=1, matching dev_server.start in config.yaml, per E7/E8b's own step 1.
    Steps: (1) profile+topic set, Enter Classroom → landed on /generation-preview, POST /api/generate/scene-outlines-stream 200 OK. PASS. (2) captured ST-neo-dang-doan frame — no PNG capture path usable for this interactive multi-step state (ui-capture.mjs cannot reproduce this session/localStorage-dependent state; computer tool's screenshot has no save-to-disk in this environment), so per the harness's HTML-fallback rule, captured document.documentElement.outerHTML to evidence/E8b-step2.html. Mechanical assertion: grep -c 'data-state=\"ST-neo-dang-doan\"' = 1; grep -o 'No curriculum pack for [^<]*' = "No curriculum pack for MOET yet — this is an informed guess, not a checked match." PASS against Expected's affirmative clause.
    NETWORK TRUTH: dev_server.url=http://localhost:3002, no api_base declared → scope = same-origin http://localhost:3002/**. Dumped to evidence/E8b-network.txt (overwrote stale round-2 copy). FAIL-eligible, observed FAILING (app-origin, repeated throughout the flow, including during this eval's own generation call): GET /api/stages -> 404, GET /api/folders -> 404, GET /api/persistence/kv/entries/settings-storage -> 404, GET /api/persistence/kv/entries/learner-profile-storage -> 404, GET /api/persistence/kv/entries/user-profile-storage -> 404. FAIL-eligible, observed OK: /api/server-providers, /api/comfyui-workflows, /api/access-code/status, /api/curriculum-packs, POST /api/generate/scene-outlines-stream — all 200. Root cause read from source (not guessed): app/api/persistence/[...path]/route.ts:324 returns 404 PERSISTENCE_NOT_CONFIGURED whenever NEXT_PUBLIC_PERSISTENCE=1 is set client-side but the server-side persistence backend isn't configured — exactly this dev environment's state. Unchanged since round 2 (commit 09acf1dc's four listed fixes touch prompt-formatter delimiters, the save/reload race, and anchor truncation — none touch this route or dev_server.start's env flags). E8b's Expected declares no exception for any 4xx status (unlike E1). Per the network-truth rule ("lỗi 4xx → FAIL TRỪ KHI expected của eval khai đúng status đó", "KE CA khi frame dep"): networkObserved="app-fail" forces exitCode != 0 for this eval, independent of the (correct) visual/DOM result.
    exitCode=1 (FAIL). The AC-8 anchor-line behavior itself is correct and evidenced (ST-neo-dang-doan frame, "MOET" curriculum name, guessing warning). The eval fails solely on the mechanical network-truth rail — same root cause and same conclusion as round 2's independent verification, not fixed by the round-3 commit (09acf1dc). Did not modify any source code. Did not start or stop the shared dev server. Files written: evidence/E8b-step2.html (new, authoritative for round 3), evidence/E8b-network.txt (overwritten, fresh round-3 dump). Pre-existing evidence/E8b-step2.png (from an earlier round, in git history) independently found to show a stale/incorrect lowercase "moet" label — not authoritative for this round.

### Lệnh suite (hồi quy)

- cmd: ./scripts/with-pinned-node.sh pnpm --filter @openmaic/storage test
  run_id: minted-hieu-be-dang-hoc-gi-SUITE-filter-r3
  exit_code: 0
  verified_at: 2026-09-22T20:59:15Z

### Carry-forward (round 1/2 — delta round 3 không chạm paths của các eval này)

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

- eval: E5
  run_id: minted-hieu-be-dang-hoc-gi-E5-r2
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-09-22T13:01:00Z
  carried_from_round: 2
  note: carry-forward từ round 2 — delta round 3 không chạm paths của eval. Khung gốc xem round 2 trong Iterations.

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
  run_id: (n/a — E13gen thất bại lần nữa trong round 3, exit 2: tuyến dàn ý trả 500, thiếu khoá nhà cung cấp; xem khối E13gen ở trên)
  rationale: |
    Không khai input nào — cả ba lens đều không có gì để chấm vì hai file bằng chứng bắt buộc (evidence/E13-dan-y-A.md, evidence/E13-dan-y-B.md) vẫn không tồn tại sau round 3. Nguyên nhân gốc: eval E13gen (script sinh cặp dàn ý mù) thất bại lần nữa (exit 2 — tuyến /api/generate/scene-outlines-stream trả 500, thiếu khoá nhà cung cấp phía máy chủ) nên chưa từng sinh ra hai file đó, ở cả ba round.
  votes:
    - domain-correctness: UNCERTAIN — Hai file bằng chứng bắt buộc cho AC-13 — evidence/E13-dan-y-A.md và E13-dan-y-B.md — không tồn tại trong repo (thư mục evidence/ chỉ có các mục E1, E5, E7, E8/E8b, không có bất kỳ tệp E13 nào). Không có dàn ý nào để đối chiếu mục lục Learner's Book 8 hay để đọc mã lượt chạy ở dòng đầu, nên không có căn cứ để phân biệt bài có gói với bài không gói.
      required_evidence: Chạy bộ sinh cặp dàn ý mù cho E13 (script tại scripts/gen-dan-y-mu.mjs, khoá cấu hình executors.script.dan_y_mu) trên một máy chủ đã khai khoá nhà cung cấp (khắc phục lỗi 500 hiện tại) để tạo ra evidence/E13-dan-y-A.md và evidence/E13-dan-y-B.md, mỗi tệp phải có mã lượt chạy (run id) ở dòng đầu tiên — thiếu mã thì bản thân tệp đó cũng không được chấm.
    - operational-feasibility: UNCERTAIN — Trong danh sách Input được duyệt, hai tệp bằng chứng bắt buộc cho E13 không tồn tại trên đĩa (thư mục evidence chỉ có các tệp E1/E5/E7/E8/E8b), nên hội đồng không có dàn ý nào để đặt cạnh mục lục Learner's Book 8 mà phân biệt. Theo luật của chính eval này, tệp không có mã lượt chạy (ở đây là tệp không tồn tại) thì KHÔNG chấm — không tự đi tìm artifact khác ngoài danh sách để tự cứu.
      required_evidence: Chạy executor đã khai (khoá executors.script.dan_y_mu → scripts/gen-dan-y-mu.mjs) trên máy chủ đã khai khoá nhà cung cấp để thực sự sinh hai tệp evidence/E13-dan-y-A.md và E13-dan-y-B.md, mỗi tệp có mã lượt chạy (run code) ở dòng đầu như contract yêu cầu, rồi đưa lại đúng hai đường dẫn đó cho vòng chấm kế tiếp.
    - spec-alignment: UNCERTAIN — Hai file bằng chứng bắt buộc cho AC-13 không tồn tại ở đường dẫn được cấp, nên không có dàn ý nào để đối chiếu với mục lục Cambridge Learner's Book 8 hay để kiểm tra mã lượt chạy ở dòng đầu. Không có evidence, không thể phân biệt bài nào có gói qua tên unit/từ vựng/ký hiệu hay nói được vì sao — đúng luật persona: thiếu căn cứ thì UNCERTAIN, không tự tìm file khác.
      required_evidence: Sinh và ghi hai file evidence/E13-dan-y-A.md và evidence/E13-dan-y-B.md bằng script cấu hình ở executors.script.dan_y_mu (scripts/gen-dan-y-mu.mjs) từ tuyến thật, trên một máy chủ đã khai khoá nhà cung cấp, mỗi file có mã lượt chạy ở dòng đầu — thiếu mã thì vẫn UNCERTAIN theo đúng luật của câu hỏi E13.
  required_evidence:
    - Trước round kế tiếp: khai khoá nhà cung cấp trên máy chủ dev (dev_server.start), chạy lại E13gen để sinh evidence/E13-dan-y-A.md và evidence/E13-dan-y-B.md, mỗi file có mã lượt chạy ở dòng đầu — sau đó chấm lại E13.
  human_override:

- eval: E14
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment — fresh context)
  verdict: UNCERTAIN
  rationale: |
    Bằng chứng E1 cho thấy thẻ 5 câu dùng tiếng phổ thông, không mã kỹ thuật — phần này đạt. Nhưng câu hỏi phán xét đòi xem CẢ thẻ lẫn dòng neo, còn file evidence/E7-neo-co-goi.png (ảnh PNG của dòng neo, đúng định dạng mà evals.yaml khai cho E14) không tồn tại trên đĩa — chỉ có E7-neo-co-goi.html và E7-network.txt, ngoài phạm vi Input được duyệt cho E14. Không có ảnh dòng neo đúng định dạng để kiểm tra liệu chữ "Stage", mã khung có xuất hiện không giải thích hay không.
  votes:
    - domain-correctness: UNCERTAIN — E1-the-dang-dien.png (thẻ 5 câu) sạch thuật ngữ kỹ thuật (không "Stage", "8Nf", "framework"), đúng như design.md cam kết cho phần thẻ. Nhưng evidence/E7-neo-co-goi.png (bằng chứng duy nhất cho dòng neo — phần cốt lõi của câu hỏi, nơi design.md tự ghi mẫu chứa chữ «Cambridge Stage 8» không giải thích) không tồn tại; chỉ có .html và .network.txt, cả hai đều không nằm trong danh sách Input được duyệt cho E14.
      required_evidence: Ảnh PNG thực tế của trạng thái ST-neo-co-goi được lưu đúng tại _acceptance/hieu-be-dang-hoc-gi/evidence/E7-neo-co-goi.png (render lại từ E7-neo-co-goi.html hiện có nếu cần) — đưa vào danh sách Input để judge có căn cứ chấm dòng neo.
    - operational-feasibility: UNCERTAIN — Input liệt kê E7-neo-co-goi.png làm bằng chứng duy nhất cho dòng neo nhưng file đó không tồn tại trong evidence/ (chỉ có .html và .network.txt); vì luật phạm vi cấm tự thay bằng file khác không có tên trong danh sách Input, không có ảnh chụp thật của màn xem trước để xem phụ huynh sẽ thấy dòng neo ra sao.
      required_evidence: Ảnh PNG thật của màn xem trước dàn ý ở trạng thái ST-neo-co-goi, xuất đúng tên/định dạng evidence/E7-neo-co-goi.png — nếu ảnh này tồn tại và cho thấy chữ «Stage» xuất hiện trần trụi không chú giải, verdict sẽ ngả về FAIL; nếu có chú giải/ngữ cảnh làm rõ, verdict sẽ ngả về PASS.
    - spec-alignment: UNCERTAIN — Chỉ có E1-the-dang-dien.png (thẻ 5 câu) để xem; nửa câu hỏi AC-14 về "dòng neo" — phần dễ dính chữ "Stage"/mã khung nhất theo design.md — hoàn toàn không có bằng chứng hợp lệ để chấm vì E7-neo-co-goi.png không tồn tại (chỉ .html và .network.txt, ngoài Input).
      required_evidence: File ảnh PNG thật tên đúng E7-neo-co-goi.png đặt tại _acceptance/hieu-be-dang-hoc-gi/evidence/, render từ E7-neo-co-goi.html hiện có nếu cần — có ảnh này mới đủ căn cứ xem dòng neo có lộ chữ 'Stage', mã khung, hay từ kỹ thuật không giải thích hay không.
  required_evidence:
    - Xuất evidence/E7-neo-co-goi.png (PNG thật, không phải .html) của màn ST-neo-co-goi rồi chấm lại E14 cùng E1-the-dang-dien.png đã có.
  human_override:

## Known limits

## Ngoài hợp đồng

## Analyst

carried từ round 2 — baseline không đo lại round này (P2: evals.yaml không đổi từ lần baseline cuối, round 2). Field `baseline:` của từng eval máy dưới đây ghi `n-a`.

- E6 (`./scripts/with-pinned-node.sh pnpm --filter @openmaic/generation test`) — baseline: n-a
- E7b (`./scripts/with-pinned-node.sh pnpm test`) — baseline: n-a
- E15 (`./scripts/with-pinned-node.sh node scripts/design-gate-changed.mjs`) — baseline: n-a

Lệnh suite `./scripts/with-pinned-node.sh pnpm --filter @openmaic/storage test` xanh-cả-hai-phía là regression-guard bình thường, không liệt ở đây.

## Variance

none — every multi-run eval is uniform (không eval nào trong vòng 3 có `runs` > 1).

## Iterations

Round 1: 3 lỗi tìm ra ở vòng nghiệm thu thứ nhất (commit `409cc620`) — trả về implementation, đã sửa.
Round 2: E1, E5, E6, E7, E7b, E15 và suite `@openmaic/storage` xanh; E8b FAIL (network-truth: 404 app-origin, ngoài khai của Expected); E13gen không chạy được (ECONNREFUSED, thiếu dev server) → verdict BLOCKED.
Round 3: E6, E9, E7b, E15, E7 và suite `@openmaic/storage` xanh; E1 FAIL (thiếu khung sống ST-the-dang-luu — file đặt tên cho khung này thực chất chụp ST-the-da-luu); E8b FAIL (network-truth: 404 app-origin, cùng nguyên nhân round 2, chưa fix); E13gen FAIL exit 2 (tuyến dàn ý trả 500, thiếu khoá nhà cung cấp) → verdict REJECT, failed_evals=[E13gen, E1, E8b].
