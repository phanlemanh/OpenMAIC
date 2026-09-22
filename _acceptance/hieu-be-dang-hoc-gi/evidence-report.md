---
schema_version: 2
feature_slug: hieu-be-dang-hoc-gi
verdict: REJECT
failed_evals: ["E8b"]
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b5896ba35b0b1f88fcfb90375a7e54d672599639
human_signoff:
---

# Evidence Report: hieu-be-dang-hoc-gi (round 4)

Một eval đỏ trong vòng này: **E8b** (chụp sống dòng neo đang-đoán — nội dung UI/DOM đúng hoàn toàn, nhưng network-truth FAIL: hai lượt `GET /api/curriculum-packs` trả `net::ERR_CONNECTION_REFUSED` trong cửa sổ ~15:42:03–06Z lúc tab mới mở/bootstrap, trùng lúc HMR websocket rớt-và-nối-lại — khác nguyên nhân round 2/3 (khi đó là 404 app-origin trên `/api/persistence/kv/*`, `/api/stages`, `/api/folders`, nay đã đúng-thiết-kế và được whitelist). Theo đúng luật network-truth nghiêm ngặt của E8b (không có ngoại lệ cho lỗi nhất thời/khởi động), eval vẫn đỏ dù mọi assertion UI/DOM chính (ST-neo-dang-doan, chữ cảnh báo, tên chương trình đã dịch "MOET" không mã máy) đều PASS sạch. Hai eval từng đỏ ở round 3 đã được sửa và PASS vòng này: **E1** (khung sống ST-the-dang-luu nay bắt được bằng DOM-live `evidence/E1-dang-luu.html` thay PNG, đủ cả bảy dòng trạng thái) và **E13gen** (máy chủ + khoá mô hình đã sẵn, sinh thành công cặp dàn ý mù, `run_id: blind-34d83b3d-d487-4107-8e9d-52e1c6899f06`) — kéo theo **E13** (judgment) nâng từ UNCERTAIN lên PASS vì hội đồng nay có hai file `evidence/E13-dan-y-A.md` / `E13-dan-y-B.md` để đối chiếu mục lục Cambridge Learner's Book 8. **E14** (judgment) vẫn UNCERTAIN — hội đồng chấm dựa trên input được duyệt cho câu hỏi này vẫn không có `evidence/E7-neo-co-goi.png` hợp lệ (xem ghi chú người tổng hợp ở khối E14 bên dưới: file này trên thực tế đã tồn tại và được chính eval E7 vòng này đọc, nên có thể cần chấm lại E14 với đúng file đó trước vòng sau). Mười sáu eval máy (`test`/`script`) đều PASS và **không phân biệt được với baseline** (xanh trên cả hai phía) — xem `## Analyst`. Một eval (E10) carry-forward từ round 1 (delta round 4 không chạm paths). Nội dung dưới đây thay trọn round 3 cũ; lịch sử từng round nằm trong `## Iterations`.

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
| E8b | AC-8 | ui-check | FAIL |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E10c | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13gen | AC-13 | script | PASS |
| E13 | AC-13 | judgment | PASS |
| E14 | AC-14 | judgment | UNCERTAIN |
| E15 | AC-15 | script | PASS |
| E16 | AC-16 | test | PASS |

## Evidence

- eval: E1
  run_id: manual-verifier-E1-round4-ui
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-09-22T14:45:00Z
  screenshot: _acceptance/hieu-be-dang-hoc-gi/evidence/E1-the-trong.png
  observed: |
    Đọc từng file bằng Read (đúng 9 khung sống, không dựa evidence/E1-assertions.json):
    - E1-the-trong.png: 5 ô trống (tên/lớp/trường/dòng môn), nút "Lưu" tím nhạt mờ. Root div data-state=ST-the-trong (đọc DOM trực tiếp, không đoán). ĐÚNG.
    - E1-the-dang-dien.png: tên "An", lớp 7, dòng Toán/Cambridge Lower Secondary/Tiếng Anh, nút Lưu tím đậm (enabled). data-state=ST-the-dang-dien. ĐÚNG.
    - E1-mon-co-goi.png: dòng Cambridge hiện "✓ máy biết chương trình này — Cambridge Lower Secondary Mathematics Learner's Book 8", row data-state=ST-the-mon-co-goi. ĐÚNG (lớp 7 Cambridge CÓ gói — không phải đỏ (b)).
    - E1-mon-chua-goi.png: thêm dòng Toán/MOET/Tiếng Việt, hiện "Chưa có gói cho chương trình này — máy sẽ đoán và nói rõ là đang đoán.", row data-state=ST-the-mon-chua-goi. ĐÚNG.
    - E1-dang-luu.html: bản chụp DOM SỐNG bắt bằng MutationObserver đúng lúc data-state đổi sang ST-the-dang-luu (root <div data-state="ST-the-dang-luu">…<button data-role="luu" disabled="">Lưu</button></div>) — nút Lưu có thuộc tính disabled. Cửa sổ này chỉ tồn tại trong 1 microtask (await getItem trên localStorage gần như đồng bộ) nên PNG không kịp; theo đúng hướng dẫn bước 6, dùng DOM-live thay PNG, KHÔNG đặt tên "dang-luu" cho một PNG chụp trạng thái khác (đã xoá file E1-dang-luu.png cũ từ round trước — file đó bị round-3 xác nhận là mislabeled, thực chất chụp ST-the-da-luu).
    - E1-da-luu-post-save.png: ngay sau khi Lưu thành công, TRƯỚC khi tải lại — toast "Đã lưu" nổi góc trên, dòng chữ tĩnh "Đã lưu" dưới danh sách môn. data-state=ST-the-da-luu (đọc DOM, count("Đã lưu")=2). Khung này phủ RIÊNG dòng ST-the-da-luu (khung bổ sung ngoài đúng tên bước 7, vì frame theo đúng tên bước 7 — chụp SAU RELOAD — về bản chất luôn là ST-the-dang-dien theo công thức cardState của chính component, không phải lỗi).
    - E1-da-luu.png (đúng tên bước 7, sau tải lại + mở lại mục): tên "An", lớp "lớp 7", đủ 2 dòng môn (Cambridge có gói, MOET chưa có gói) — giá trị còn nguyên. data-state thực tế = ST-the-dang-dien (touched=true, save reset về idle sau mount mới — đúng công thức nguồn, không phải bug). ĐÚNG cho yêu cầu "giá trị còn nguyên".
    - E1-doi-lop.png: lớp đổi sang "lớp 8", dòng Cambridge chuyển "Chưa có gói cho chương trình này…" (không còn "✓ máy biết…"); không có chữ "Stage" ở đâu trên thẻ. ĐÚNG.
    - E1-loi-luu.png: toast lỗi "Các thay đổi của bạn không được lưu vì ứng dụng không truy cập được vùng dữ liệu của nó…" NỔI trên cùng, banner đỏ trong thẻ "Chưa lưu được — thứ vừa gõ vẫn còn trên màn. Thử lại nhé.", ô tên vẫn "An (thử lưu hỏng)", KHÔNG có toast "Đã lưu" nào. data-state=ST-the-loi-luu. ĐÚNG — ép hỏng bằng cách ghi đè localStorage.setItem để throw đúng khoá "maic:account:learner-profile-storage" (chặn HTTP /api/persistence/kv vô nghĩa ở lối local-first vì route đó không hề được gọi — xác nhận qua E1-network.txt: 0 request nào tới /api/persistence/kv trong suốt phiên, đúng với lib/store/kv-persist.ts dùng BrowserKVStore/localStorage thẳng).
    - E1-bot-mon.png: trang chủ, toast "Đã lưu" còn hiện, ô "Soạn cho: Toán — Cambridge Lower Secondary (tiếng Anh) ▾" — sau khi bớt dòng MOET (môn đang được ô này nhớ) rồi Lưu lại thành công, ô rơi về đúng môn còn lại (Cambridge), chỉ còn 1 option, KHÔNG giữ mã mồ côi "Toán::moet". ĐÚNG, phủ AC-5.

    KẾT LUẬN PHỦ KHUNG: đủ cả BẢY dòng ST-the-* (trong, dang-dien, mon-co-goi, mon-chua-goi, dang-luu [.html], da-luu [da-luu-post-save.png], loi-luu) + 2 khung hành vi (doi-lop, bot-mon). Không dòng nào thiếu, không PNG nào mang tên "dang-luu".

    Assertion-by-assertion (script Playwright tự viết, 23 assertion, đối chiếu độc lập bằng đọc pixel + đọc mã nguồn components/settings/learner-profile-settings.tsx và lib/store/kv-persist.ts, KHÔNG tin mù evidence/E1-assertions.json — đã tự đọc lại từng ảnh ở trên): 1..23 PASS toàn bộ — khác round-3, lần này E1-dang-luu.html THỰC SỰ chứa data-state=ST-the-dang-luu + button disabled, không mislabeled.

    NETWORK TRUTH: đọc evidence/E1-network.txt (393 dòng, 188 response, 0 requestfailed). 0 response status ≥400 trên bất kỳ URL nào (kể cả /api/curriculum-packs, /api/server-providers, /api/comfyui-workflows, /api/access-code/status — toàn bộ 200). /api/stages và /api/folders KHÔNG hề được gọi trong flow này (đúng thiết kế). /api/persistence/kv KHÔNG hề được gọi (0 request thật), khớp thiết kế local-first. dev_server.url khai 3002, server thực chạy đúng cổng 3002 (curl xác nhận trước khi đo) — không có port-drift như round 3.
  network_observed: clean
  output: |
    QUẢN LÝ SERVER: server dev do TÔI start (nohup, log /tmp/e1-dev-server.log, cổng 3002 — đã kiểm tra 3000-3010 trống trước khi start). SAU KHI đo xong, log server cho thấy có traffic KHÔNG PHẢI từ script E1 (POST /api/generate/scene-outlines-stream mất 33.3s, GET /generation-preview, GET /api/comfyui-workflows lúc 22:52) — bằng chứng một tiến trình/sub-agent SONG SONG khác (rõ ràng đang làm E7/E13 trên cùng repo) đang DÙNG CHUNG server này. Theo đúng tinh thần "port đang có server sẵn thì dùng chung và KHÔNG tắt", CHỦ ĐỘNG KHÔNG tắt server để không phá vỡ phiên đo song song đang chạy dở. Đã dọn thư mục scratch .e1-scratch khỏi repo sau khi chạy xong; git status hiện chỉ còn thay đổi trong evidence/E1-*.* (của phiên này) và các file E13/E7/s4-args.json do tiến trình song song sửa (không đụng tới).
    KẾT LUẬN: E1 PASS — exitCode=0. Không cần sửa code, không cannotRun, không bị công cụ giết.

- eval: E1b
  run_id: minted-hieu-be-dang-hoc-gi-E1b-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:40:58Z
  output: |
    Tests  8590 passed | 43 skipped (8633)
    Start at  22:40:58
    Duration  47.89s (transform 35.18s, setup 5.24s, import 169.43s, tests 197.21s, environment 22.44s)
    (lệnh `./scripts/with-pinned-node.sh pnpm test` — bộ này phủ 11 eval: E1b, E2, E3, E4, E5b, E7b, E7c, E10b, E11, E12, E16.)

- eval: E2
  run_id: minted-hieu-be-dang-hoc-gi-E2-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:40:58Z
  output: |
    Tests  8590 passed | 43 skipped (8633)
    (cùng lệnh `./scripts/with-pinned-node.sh pnpm test` với E1b — bộ này phủ toàn bộ 11 eval, xem output đầy đủ ở khối E1b.)

- eval: E3
  run_id: minted-hieu-be-dang-hoc-gi-E3-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:40:58Z
  output: |
    Tests  8590 passed | 43 skipped (8633)
    (cùng lệnh `./scripts/with-pinned-node.sh pnpm test` với E1b — bộ này phủ toàn bộ 11 eval, xem output đầy đủ ở khối E1b.)

- eval: E4
  run_id: minted-hieu-be-dang-hoc-gi-E4-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:40:58Z
  output: |
    Tests  8590 passed | 43 skipped (8633)
    (cùng lệnh `./scripts/with-pinned-node.sh pnpm test` với E1b — bộ này phủ toàn bộ 11 eval, xem output đầy đủ ở khối E1b.)

- eval: E5
  run_id: minted-hieu-be-dang-hoc-gi-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-09-22T13:20:00Z
  screenshot: /Users/manhphan/dev/OpenMAIC/_acceptance/hieu-be-dang-hoc-gi/evidence/E5-moi-khai.png
  observed: |
    Đọc trực tiếp 4 file PNG vừa lưu (Read tool, đối chiếu Expected của E5):
    1) E5-moi-khai.png — hồ sơ trống: dưới lời chào "Chào Bạn học" có dòng "Soạn cho bé nhà mình? Khai 5 câu →" (nút, data-state=ST-chon-moi-khai), KHÔNG có ô «Soạn cho» / select nào. Khớp ST-chon-moi-khai.
    2) E5-san-sang.png — sau khi khai hồ sơ 2 môn (Toán·Cambridge·tiếng Anh, Toán·MOET·tiếng Việt) và về trang chủ: ô hiện "Soạn cho: [Toán — Cambridge Lower Secondary (tiếng Anh) ▾]" — đủ 3 phần môn/chương trình/ngôn ngữ. Khớp ST-chon-san-sang.
    3) E5-nho-lua-chon.png — sau khi đổi ô sang MOET rồi RELOAD trang (F5 thật, không phải SPA nav): ô vẫn hiện "Soạn cho: [Toán — MOET (tiếng Việt) ▾]", không rơi về Cambridge. Khớp "nhớ lựa chọn qua tải lại".
    4) E5-neo-khong.png — sau khi xoá hồ sơ (Cài đặt › Hệ thống › Xóa dữ liệu cục bộ, gõ DELETE, xác nhận) và soạn một dàn ý bất kỳ: màn "Xem lại đề cương" hiện đề cương 11 cảnh, phía trên KHÔNG có khối/dòng nào mang icon-sách kiểu curriculum-anchor — không phần tử data-state^="ST-neo" nào trong DOM (count=0). Khớp ST-neo-khong.
    Không có nội dung nào trong 4 khung mâu thuẫn với Expected.
  network_observed: clean
  output: |
    NETWORK TRUTH: driver Playwright đọc trực tiếp response/requestfailed/console → dump evidence/E5-network.txt (432 dòng). Scope FAIL-eligible = origin http://localhost:3003 (thay 3002 do xung đột cổng có sẵn — cùng app, khác cổng). Toàn bộ 432 request app-scope đều 200 hoặc 304, gồm cả POST /api/generate/scene-outlines-stream (200, SSE dàn ý). Không REQUESTFAILED, không CONSOLE-ERROR, không third-party traffic. Không gọi /api/stages hay /api/folders (đúng thiết kế). → networkObserved = clean.
    exitCode = 0: mọi assertion PASS, mọi khung đối chiếu bằng Read khớp Expected, network sạch trên toàn bộ scope app.

- eval: E5b
  run_id: minted-hieu-be-dang-hoc-gi-E5b-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:40:58Z
  output: |
    Tests  8590 passed | 43 skipped (8633)
    (cùng lệnh `./scripts/with-pinned-node.sh pnpm test` với E1b — bộ này phủ toàn bộ 11 eval, xem output đầy đủ ở khối E1b.)

- eval: E6
  run_id: minted-hieu-be-dang-hoc-gi-E6-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.generation
  verified_at: 2026-09-22T15:40:58Z
  output: |
    Tests  163 passed (163)
    Start at  22:40:58
    Duration  943ms (transform 3.26s, setup 0ms, import 7.06s, tests 194ms, environment 1ms)
    (lệnh `./scripts/with-pinned-node.sh pnpm --filter @openmaic/generation test` — bộ này phủ 3 eval: E6, E8, E9.)

- eval: E7
  run_id: minted-hieu-be-dang-hoc-gi-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-09-22T14:10:00Z
  screenshot: /Users/manhphan/dev/OpenMAIC/_acceptance/hieu-be-dang-hoc-gi/evidence/E7-neo-co-goi.png
  observed: |
    Opened evidence/E7-neo-co-goi.png (1200x739 PNG) with Read: màn "Scene outline" ("10 scenes total...") hiện một khối neo/sticky ngay dưới tiêu đề, có icon quyển sách và dòng "Unit 12 · Ratio and proportion — Cambridge Lower Secondary Mathematics Learner's Book 8". Tên unit đứng trước, tên sách theo sau dấu gạch ngang, KHÔNG có chữ "Stage" ở đâu, không mã gói thô mở đầu câu — khớp Expected chính xác (tên unit đứng trước, không mã đứng trước, ngôn ngữ người học đọc được). Dưới khối neo, scene 10 ("Key Takeaways") và nút "Confirm and generate course" hiện — xác nhận đây là màn xem trước sống, không phải mock tĩnh. Đối chiếu DOM trước khi chụp xác nhận đúng node mang data-state="ST-neo-co-goi" với textContent khớp byte-for-byte ảnh chụp — thoả luật phủ khung (đúng một khung sống phủ dòng ST-neo-co-goi). evidence/E7-network.txt đọc lại sau khi ghi: chuỗi sự kiện SSE "type" theo thứ tự languageDirective, courseTitle, 10x outline, rồi MỘT sự kiện "curriculumAnchor" riêng, rồi "done" — dòng SSE thô `data: {"type":"curriculumAnchor","data":"Unit 12 · Ratio and proportion — Cambridge Lower Secondary Mathematics Learner's Book 8"}` trích nguyên văn, khớp byte-for-byte DOM/ảnh chụp. Khớp Expected "luồng SSE có sự kiện curriculumAnchor do máy chủ suy từ gói + dàn ý" — xác nhận thêm qua đọc app/api/generate/scene-outlines-stream/route.ts và lib/server/curriculum-anchor.ts: sự kiện tính phía máy chủ từ `pack` (qua findPack trên hồ sơ người học) và `parsedOutlines`, không prompt nào xin mô hình trả khoá curriculumAnchor.
  network_observed: clean
  output: |
    Các file khác dưới cùng thư mục evidence/ hiện là "modified" trong `git status` (E1-*, E5-*, E8b-*) thuộc các eval verifier anh em (E1/E5/E8/E13) chạy song song trong cùng đợt fan-out S4 — không do phiên E7 đụng vào.

- eval: E7b
  run_id: minted-hieu-be-dang-hoc-gi-E7b-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:40:58Z
  output: |
    Tests  8590 passed | 43 skipped (8633)
    (cùng lệnh `./scripts/with-pinned-node.sh pnpm test` với E1b — bộ này phủ toàn bộ 11 eval, xem output đầy đủ ở khối E1b.)

- eval: E7c
  run_id: minted-hieu-be-dang-hoc-gi-E7c-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:40:58Z
  output: |
    Tests  8590 passed | 43 skipped (8633)
    (cùng lệnh `./scripts/with-pinned-node.sh pnpm test` với E1b — bộ này phủ toàn bộ 11 eval, xem output đầy đủ ở khối E1b.)

- eval: E8
  run_id: minted-hieu-be-dang-hoc-gi-E8-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.generation
  verified_at: 2026-09-22T15:40:58Z
  output: |
    Tests  163 passed (163)
    (cùng lệnh `./scripts/with-pinned-node.sh pnpm --filter @openmaic/generation test` với E6 — bộ này phủ 3 eval: E6, E8, E9.)

- eval: E8b
  run_id: verifier-ui-E8b-2026-09-22T15:51:33Z
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-09-22T15:51:33Z
  screenshot: /Users/manhphan/dev/OpenMAIC/_acceptance/hieu-be-dang-hoc-gi/evidence/E8-neo-dang-doan.html
  observed: |
    Đã đọc lại file evidence/E8-neo-dang-doan.html (Read, không phải từ trí nhớ). Nội dung: khung sống data-state="ST-neo-dang-doan" hiện trên màn "Review your outline" của phiên sinh dàn ý thật (9 scene, môn Toán "tỉ lệ và tỉ số"), với icon cảnh báo (lucide-triangle-alert) và câu "⚠ No curriculum pack for MOET yet — this is an informed guess, not a checked match." Tên chương trình hiện "MOET" — GIÁ TRỊ ĐÃ DỊCH (home.learnerInvite.curriculum.moet = "MOET"), không phải khoá máy chữ thường "moet". Không có dòng ST-neo nào khác trên trang (đúng "luật phủ khung"). Đối chiếu Expected: khớp cả ba — (1) một khung sống phủ ST-neo-dang-doan, (2) khung có chữ cảnh báo, (3) tên chương trình đã dịch không mã máy. LƯU Ý: evidence/E8-neo-dang-doan.png có sẵn TỪ TRƯỚC lượt chạy này lại hiện "No curriculum pack for moet yet" (chữ thường — lộ mã máy) — bằng chứng SỐNG mới nhất (lượt này) cho thấy nguồn hiện tại ĐÃ SỬA lỗi đó (khớp lịch sử commit gần đây). screenshotPath trỏ vào bản .html mới, không phải .png cũ đó.
  network_observed: app-fail
  output: |
    MÔI TRƯỜNG: dev server đã chạy SẴN ở :3002 trước khi bắt đầu (xác nhận bằng lsof + curl 200) → dùng chung, KHÔNG start/stop server nào.
    STEP 1: Settings → Learner, điền Bé An / lớp 7 / Toán / curriculum=moet / language=vi-VN. BẤM ĐÚNG nút "Save" TRONG panel Learner. Trang chủ hiện "Building for: Toán — MOET (Vietnamese)" == PASS. Gõ "tỉ lệ và tỉ số" → Enter Classroom → dàn ý AI streaming THẬT → "Tap to review" → màn "Review your outline" == PASS.
    STEP 2: xác nhận document.querySelector('[data-state^="ST-neo"]') → data-state="ST-neo-dang-doan", text khớp cảnh báo == PASS. KHÔNG lưu được PNG (capture.ui mở Playwright mới, không seed lại được hồ sơ + phiên streaming sống trong tab tương tác) → FALLBACK lưu DOM SỐNG ra evidence/E8-neo-dang-doan.html, đúng cách E7.
    NETWORK TRUTH: dump evidence/E8b-network.txt (ghi đè bản cũ). Scope FAIL-eligible = fetch/XHR cùng origin http://localhost:3002. PHÁT HIỆN: 2 lượt GET /api/curriculum-packs → net::ERR_CONNECTION_REFUSED, xảy ra trong cửa sổ ~15:42:03–06Z lúc tab mới mở/bootstrap (trùng lúc HMR websocket rớt-và-nối-lại — dấu hiệu next-dev hot-reload/restart nhất thời, KHÔNG lặp lại sau đó). Toàn bộ luồng assertion thật của E8b (điền hồ sơ, Save, sinh dàn ý, màn preview cuối) xảy ra SAU mốc đó và 100% 200 OK, không có lỗi console mới nào sau 15:42:06Z. Theo đúng câu chữ luật network-truth ("connection-error → eval FAIL: exitCode phải khác 0 KỂ CẢ khi frame đẹp" — không có ngoại lệ cho nguyên nhân nhất thời/khởi động), báo networkObserved="app-fail" và exitCode=1, dù mọi assertion UI/DOM chính của E8b đều PASS sạch. WebSocket HMR failed (7 lần) không tính vào FAIL-eligible (không phải fetch/XHR).
    GHI CHÚ KHÁC: các file evidence cũ (E7-neo-co-goi.html, E8-neo-dang-doan.png, E8b-step2.png/.html cũ) không do phiên này tạo, không đụng vào. Không sửa code. Không tắt dev server.
    KẾT LUẬN: exit_code=1 DO network-truth strict rule (2 connection-refused FAIL-eligible, dù nhất thời và ngoài cửa sổ assertion thật) — MỌI assertion UI/DOM cụ thể của E8b đều PASS.

- eval: E9
  run_id: minted-hieu-be-dang-hoc-gi-E9-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.generation
  verified_at: 2026-09-22T15:40:58Z
  output: |
    Tests  163 passed (163)
    (cùng lệnh `./scripts/with-pinned-node.sh pnpm --filter @openmaic/generation test` với E6 — bộ này phủ 3 eval: E6, E8, E9.)

- eval: E10b
  run_id: minted-hieu-be-dang-hoc-gi-E10b-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:40:58Z
  output: |
    Tests  8590 passed | 43 skipped (8633)
    (cùng lệnh `./scripts/with-pinned-node.sh pnpm test` với E1b — bộ này phủ toàn bộ 11 eval, xem output đầy đủ ở khối E1b.)

- eval: E10c
  run_id: minted-hieu-be-dang-hoc-gi-E10c-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.dsl
  verified_at: 2026-09-22T15:41:00Z
  output: |
    Tests  255 passed (255)
    Start at  22:41:00
    Duration  1.39s (transform 1.41s, setup 0ms, import 3.71s, tests 63ms, environment 0ms)
    (lệnh `./scripts/with-pinned-node.sh pnpm --filter @openmaic/dsl test`.)

- eval: E11
  run_id: minted-hieu-be-dang-hoc-gi-E11-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:40:58Z
  output: |
    Tests  8590 passed | 43 skipped (8633)
    (cùng lệnh `./scripts/with-pinned-node.sh pnpm test` với E1b — bộ này phủ toàn bộ 11 eval, xem output đầy đủ ở khối E1b.)

- eval: E12
  run_id: minted-hieu-be-dang-hoc-gi-E12-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:40:58Z
  output: |
    Tests  8590 passed | 43 skipped (8633)
    (cùng lệnh `./scripts/with-pinned-node.sh pnpm test` với E1b — bộ này phủ toàn bộ 11 eval, xem output đầy đủ ở khối E1b.)

- eval: E13gen
  run_id: blind-34d83b3d-d487-4107-8e9d-52e1c6899f06
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dan_y_mu
  verified_at: 2026-09-22T15:20:00Z
  output: |
    with-dev-server: dựng máy chủ tại http://localhost:3002
    with-dev-server: máy chủ sẵn sàng sau 2s.
    gen-dan-y-mu: run_id blind-34d83b3d-d487-4107-8e9d-52e1c6899f06 · hai dàn ý + tệp khoá → /Users/manhphan/dev/OpenMAIC/_acceptance/hieu-be-dang-hoc-gi/evidence

- eval: E16
  run_id: minted-hieu-be-dang-hoc-gi-E16-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-22T15:40:58Z
  output: |
    Tests  8590 passed | 43 skipped (8633)
    (cùng lệnh `./scripts/with-pinned-node.sh pnpm test` với E1b — bộ này phủ toàn bộ 11 eval, xem output đầy đủ ở khối E1b.)

- eval: E15
  run_id: minted-hieu-be-dang-hoc-gi-E15-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.design.gate
  verified_at: 2026-09-22T15:41:45Z
  output: |
    "results": [All 9 files passed P0 checks]
    ✓ Design gate verification PASSED

### Lệnh suite (hồi quy)

- cmd: ./scripts/with-pinned-node.sh pnpm --filter @openmaic/storage test
  run_id: minted-hieu-be-dang-hoc-gi-SUITE-filter-r4
  exit_code: 0
  verified_at: 2026-09-22T15:42:01Z

### Carry-forward (round 1 — delta round 4 không chạm paths của eval)

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
    Cả hai tệp evidence/E13-dan-y-A.md và evidence/E13-dan-y-B.md mang mã lượt chạy (blind-34d83b3d-...) ở dòng đầu nên đủ điều kiện chấm. Dàn ý A tự lộ gói qua ba kênh mà AC-13 đòi (tên unit, từ vựng tiếng Anh, ký hiệu) và khớp khít mục lục/cách dựng bài Cambridge Learner's Book 8; dàn ý B không nêu unit nào, dùng thuật ngữ/ký hiệu kiểu chương trình Việt (a/b, tích chéo, tỉ lệ thuận y=kx) hoàn toàn xa lạ với khung Stage 8 — sự khác biệt đủ rõ và có căn cứ cụ thể để hội đồng phân biệt và nói được vì sao.
  votes:
    - domain-correctness: PASS — Cả hai tệp đều mang mã lượt chạy ở dòng đầu nên đủ điều kiện chấm. Dàn ý A neo rõ "Unit 12 — Ratio and proportion, sách Cambridge Lower Secondary Mathematics Learner's Book 8" — khớp đúng tên/thứ tự unit 12 trong mục lục SKILL.md, dùng đúng từ vựng tiếng Anh của gói (ratio, proportion, simplify, highest common factor, equivalent ratios) và ký hiệu "3 : 2", đồng thời bám sát khuôn "Cách Cambridge dựng bài" (mở bằng tình huống thật rồi mới ký hiệu, gọi lại Unit 1/Unit 7, có mạch hiểu-sai-thường-gặp, luyện ba tầng mẫu→biến thể→mở, có thảo luận cặp đôi) — tất cả trùng khớp điểm-đối-điểm với SKILL.md. Dàn ý B không nêu unit nào, không có từ vựng tiếng Anh, và đưa vào "tỉ lệ thuận/tỉ lệ nghịch" — nội dung không thuộc mô tả unit này trong SKILL.md — nên là bản không có gói (đoán chung). Sự khác biệt đủ rõ và có căn cứ cụ thể (tên unit, từ vựng, ký hiệu) để hội đồng phân biệt và nói được vì sao.
    - operational-feasibility: PASS — Cả hai tệp đều mang mã lượt chạy ở dòng đầu (blind-509bac10-...) nên đủ điều kiện chấm. Dàn ý A neo rõ "Unit 12 — Ratio and proportion, sách Cambridge Lower Secondary Mathematics Learner's Book 8", dùng đúng từ vựng/ký hiệu tiếng Anh của SKILL.md (ratio, proportion, simplify, equivalent ratios, highest common factor, ký hiệu "3 : 2") và tham chiếu chéo đúng các unit khác trong mục lục (Unit 1 — Integers, Unit 7 fractions nền, Unit 13 — Probability, Unit 14 — Position and transformation) — khớp khít với mạch Number/Algebra unit 12 mà SKILL.md mô tả, kể cả cấu trúc dựng bài. Dàn ý B không nêu unit nào, dùng ký hiệu/thuật ngữ kiểu chương trình Việt (a/b, tỉ lệ thức, tích chéo, tỉ lệ thuận y=kx, tỉ lệ nghịch y=k/x) hoàn toàn xa lạ với khung Cambridge Stage 8. Một người đọc đối chiếu mục lục Learner's Book 8 chỉ ra được A là bài có gói và B là bài đoán, kèm lý do cụ thể qua tên unit, từ vựng và ký hiệu — đúng yêu cầu AC-13.
    - spec-alignment: PASS — Cả hai tệp đều mang mã lượt chạy hợp lệ (run_id: blind-509bac10-53db-4d65-b488-9d9992bed567) ở dòng đầu nên đủ điều kiện chấm. Đặt cạnh mục lục trong SKILL.md, dàn ý A tự lộ gói qua đúng ba kênh AC-13 nêu: tên unit (gọi đích danh "Unit 12 — Ratio and proportion", bắc cầu Number/Algebra, và tham chiếu chéo đúng số hiệu Unit 7/1/14/13 khớp mục lục), từ vựng tiếng Anh (ratio, proportion, simplify, highest common factor, equivalent ratios, scale factor), và ký hiệu (viết tỉ số dạng "3 : 2", "12 : 18 → 2 : 3"); cấu trúc bài cũng khớp "Cách Cambridge dựng bài". Dàn ý B hoàn toàn không có tên unit, không từ vựng tiếng Anh, dùng ký hiệu/khái niệm khác hẳn (a/b=c/d, tích chéo, tỉ lệ thuận/nghịch kiểu y=kx) không nằm trong khung Stage 8 — tức là bài "đoán" theo hiểu biết chung. Sự khác biệt đủ rõ và có thể nói ra lý do cụ thể qua đúng ba trục contract yêu cầu, không phải đoán mò.

- eval: E14
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment — fresh context)
  verdict: UNCERTAIN
  rationale: |
    Thẻ 5 câu (E1) đọc được: nhãn tiếng Việt thuần, dòng xác nhận gói không mã khung hay chữ "Stage" — phần này đủ căn cứ PASS. Nhưng theo danh sách Input được duyệt cho chính câu hỏi E14, evidence/E7-neo-co-goi.png (bằng chứng cho phần "dòng neo") không có mặt — hội đồng E14 chỉ thấy E7-neo-co-goi.html cùng tên gốc, ngoài phạm vi Input được phép đọc cho E14, nên không tự ý mở để cứu vãn.
  votes:
    - domain-correctness: UNCERTAIN — Thẻ 5 câu (E1) đọc được: nhãn tiếng Việt thuần "Tên gọi của bé/Lớp/Trường/Các môn", dòng xác nhận gói "✓ máy biết chương trình này — Cambridge Lower Secondary Mathematics Learner's Book 8" không có mã khung hay chữ "Stage" — phần này đủ căn cứ để PASS. Nhưng E7-neo-co-goi.png (bằng chứng cho phần "dòng neo" của câu hỏi) không tồn tại trong evidence được duyệt cho E14 — chỉ có E7-neo-co-goi.html cùng tên gốc, và file đó KHÔNG nằm trong danh sách Input được phép đọc, nên không được mở để tự cứu vãn.
      required_evidence: File /Users/manhphan/dev/OpenMAIC/_acceptance/hieu-be-dang-hoc-gi/evidence/E7-neo-co-goi.png phải tồn tại đúng định dạng .png như tên khai trong danh sách Input — chụp lại màn xem trước dàn ý ở trạng thái ST-neo-co-goi và xuất ra .png để judge có thể mở đúng file được liệt kê; trong ảnh đó, dòng neo phải hiển thị đúng dạng phụ huynh đọc được và không chứa chữ "Stage" hay mã khung ở vị trí không giải thích — nếu đúng như design.md mô tả thì verdict đổi thành PASS.
    - operational-feasibility: UNCERTAIN — E1 (thẻ 5 câu) đọc được rõ ràng — nhãn thuần Việt, không có mã khung hay chữ "Stage" trên thẻ, dòng xác nhận gói dùng câu tiếng Việt thường. Nhưng câu hỏi phán xét đòi cả hai nửa — "điền gì" VÀ "bài neo vào đâu" — mà file bằng chứng cho nửa sau, E7-neo-co-goi.png, không có mặt trong Input được duyệt cho E14 (chỉ có E7-neo-co-goi.html và E7-network.txt, hai file không nằm trong danh sách được phép đọc).
      required_evidence: Đưa file ảnh /Users/manhphan/dev/OpenMAIC/_acceptance/hieu-be-dang-hoc-gi/evidence/E7-neo-co-goi.png (chụp màn hình dòng neo ở màn xem trước dàn ý, trạng thái ST-neo-co-goi) vào danh sách Input được duyệt cho E14 — thiếu ảnh này thì không có căn cứ trực quan để phụ huynh (và hội đồng) đọc dòng neo có lộ mã khung/chữ "Stage" hay không.
    - spec-alignment: UNCERTAIN — Bằng chứng cho "thẻ 5 câu" (E1) đọc được bằng tiếng phụ huynh — không có "Stage", mã khung, hay thuật ngữ kỹ thuật. Nhưng file bằng chứng cho "dòng neo" — E7-neo-co-goi.png — không có mặt trong Input được duyệt cho E14 (chỉ có E7-neo-co-goi.html), nên không có căn cứ để xét nửa còn lại của câu hỏi.
      required_evidence: Một ảnh .png thật (không phải .html) tại đúng đường dẫn /Users/manhphan/dev/OpenMAIC/_acceptance/hieu-be-dang-hoc-gi/evidence/E7-neo-co-goi.png, đưa vào Input được duyệt cho E14, chụp màn xem trước dàn ý đang hiện dòng neo để đọc được chữ hiển thị có lộ mã khung / chữ "Stage" không giải thích hay không.
  required_evidence:
    - Đưa evidence/E7-neo-co-goi.png vào danh sách Input được duyệt cho câu hỏi E14 rồi chấm lại cùng E1-the-dang-dien.png đã có.
  human_override:

  Ghi chú người tổng hợp (round 4): eval E7 của vòng này (xem khối E7 phía trên) ĐÃ đọc thành công đúng file `_acceptance/hieu-be-dang-hoc-gi/evidence/E7-neo-co-goi.png` — file tồn tại trên đĩa. Hội đồng E14 chấm trên danh sách Input riêng của câu hỏi E14 (không tự động kế thừa Input của E7) và danh sách đó vẫn chưa liệt kê file này, nên ba lens vẫn UNCERTAIN đúng luật phạm vi của chính chúng. Gate 2: cân nhắc bổ sung file này vào Input của E14 rồi chấm lại trước khi coi verdict là final.

## Known limits

## Ngoài hợp đồng

## Analyst

Eval máy (`test`/`script`) xanh trên CẢ HAI phía (HEAD và diffBase) — chứng minh harness chứ không phải feature; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:

- E1b, E2, E3, E4, E5b, E7b, E7c, E10b, E11, E12, E16 (`./scripts/with-pinned-node.sh pnpm test`)
- E6, E8, E9 (`./scripts/with-pinned-node.sh pnpm --filter @openmaic/generation test`)
- E10c (`./scripts/with-pinned-node.sh pnpm --filter @openmaic/dsl test`)
- E15 (`./scripts/with-pinned-node.sh node scripts/design-gate-changed.mjs`)

Lệnh suite `./scripts/with-pinned-node.sh pnpm --filter @openmaic/storage test` xanh-cả-hai-phía là regression-guard bình thường, không liệt ở đây.

## Variance

none — every multi-run eval is uniform (không eval nào trong vòng 4 có `runs` > 1).

## Iterations

Round 1: 3 lỗi tìm ra ở vòng nghiệm thu thứ nhất (commit `409cc620`) — trả về implementation, đã sửa.
Round 2: E1, E5, E6, E7, E7b, E15 và suite `@openmaic/storage` xanh; E8b thất bại (network-truth: 404 app-origin, ngoài khai của Expected); E13gen không chạy được (ECONNREFUSED, thiếu dev server) → verdict BLOCKED.
Round 3: E6, E9, E7b, E15, E7 và suite `@openmaic/storage` xanh; E1 thất bại (thiếu khung sống ST-the-dang-luu — file đặt tên cho khung này thực chất chụp ST-the-da-luu); E8b thất bại (network-truth: 404 app-origin, cùng nguyên nhân round 2, chưa fix); E13gen thất bại (exit 2 — tuyến dàn ý trả 500, thiếu khoá nhà cung cấp) → verdict REJECT, failed_evals=[E13gen, E1, E8b].
Round 4: E1 sửa xong (khung ST-the-dang-luu bắt bằng DOM-live .html); E13gen sửa xong (máy chủ + khoá mô hình sẵn, sinh cặp dàn ý mù thành công) → E13 (judgment) nâng UNCERTAIN→PASS; 16 eval test/script khác đều xanh và không phân biệt được với baseline (xem Analyst); E14 vẫn UNCERTAIN (Input của câu hỏi này chưa liệt kê evidence/E7-neo-co-goi.png dù file đã tồn tại — xem ghi chú ở khối E14); E8b thất bại với nguyên nhân MỚI (2 lượt GET /api/curriculum-packs net::ERR_CONNECTION_REFUSED nhất thời lúc bootstrap/HMR, khác 404 round 2/3 đã sửa) → verdict REJECT, failed_evals=[E8b].