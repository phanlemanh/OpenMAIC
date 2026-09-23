# Quét không gian tiêu chí — hieu-be-dang-hoc-gi (preset entity-feature, 2026-09-22)

## Ngữ cảnh
- Sản phẩm: OpenMAIC — soạn lớp học đa-agent từ một yêu cầu; hai cửa: bấm-một-phát (`app/page.tsx` → `app/generation-preview`) và xưởng Pro chat với agent (`app/api/agent/sessions`) [SUY-TỪ-REPO: README.md]. Danh tính = cookie ẩn danh theo chủ sở hữu, đi máy khác bằng mã dùng-một-lần [SUY-TỪ-REPO: lib/server/agent-runtime/owner.ts, lib/persistence/claim-code.ts]. Hồ sơ người dùng hiện có: biệt danh + giới thiệu tự do, đã chảy vào soạn [SUY-TỪ-REPO: lib/store/user-profile.ts, lib/types/generation.ts]. Prompt hệ thống của agent ghép từ các khối tuỳ chọn (skill, tài liệu, roster, giọng) [SUY-TỪ-REPO: lib/server/agent-runtime/course-tools.ts]. Có tiền lệ gói chương trình dạng skill builtin [SUY-TỪ-REPO: skills/agent-runtime/k12-core-literacy-planning/SKILL.md].
- Chân sản phẩm: đào repo (chưa có mục Product Context — đề nghị lưu sau vòng). Thị trường: phụ huynh Việt Nam có con học trường tích hợp (MOET + Cambridge) [GIẢ ĐỊNH: từ chủ kho, một ca].
- Chân ngành: [NGÀNH: MagicSchool.ai — bộ sinh giáo án nhận «subject, grade level, standards, and instructional goals»] · [NGÀNH: Khanmigo — có chế độ cho phụ huynh, «gently guides your child»] · [NGÀNH: Common Standards Project — chuẩn học tập dạng dữ liệu tra cứu, chỉ 50 bang Mỹ] · [NGÀNH: Cambridge Lower Secondary — khung có mã mục tiêu, sau cổng đăng nhập trường].

## Trục
- Trục A — Vòng đời hồ sơ: khai lần đầu | sửa (lên lớp, thêm/bớt môn) | đi theo máy khác | xoá [thước CE: hành trình phụ huynh + Khanmigo parent mode]
- Trục B — Nơi hồ sơ tác dụng: ô chọn môn trước soạn | dàn ý (neo) | nội dung slide/quiz | lời giảng | prompt hệ thống xưởng Pro | câu neo trong chat [thước CE: ba đường vào soạn trong repo [SUY-TỪ-REPO: app/api/generate/scene-outlines-stream/route.ts, lib/server/agent-runtime/runner.ts, packages/@openmaic/generation/src/scene-generator.ts]]
- Trục C — Trạng thái hiểu biết về giáo trình: có gói khớp | có chương trình, chưa có gói (đoán) | không khai gì (như hôm nay) [thước CE: MagicSchool — có/không «standards» cho ra bài khác nhau]
- Actor × quyền gộp vào cross-cutting: một actor (phụ huynh = chủ sở hữu ẩn danh); bé không đăng nhập; giáo viên ngoài vòng.

Tích 4 × 6 × 3 = 72 ô; quét theo lát Trục C.

## Core (9 / ~40 ô có nghĩa)
1. A-khai × C-có-gói: thẻ 5 câu, gói tự gắn khi khớp môn + chương trình + lớp — không có gói thì không có gì để neo.
2. A-sửa: đổi lớp / thêm môn → gói gắn lại cùng đường code với khai — bé lên lớp là chuyện mỗi năm.
3. A-đi-máy-khác: hồ sơ đăng ký vào bộ kho theo tài khoản → mã nhận-lại mang theo — cơ chế có sẵn, một dòng đăng ký, mất là mất cả lý do «đi theo người».
4. A-xoá: «xoá bộ nhớ đệm» xoá cả hồ sơ bé — dữ liệu trẻ em phải xoá được.
5. B-chọn-môn + B-dàn-ý × C-có-gói: ô «Soạn cho: …» + thân gói vào prompt dàn ý + dòng neo bằng tiếng phụ huynh trên màn xem trước — đây là chỗ phụ huynh THẤY tính năng.
6. B-slide/quiz + B-lời-giảng × C-có-gói: nội dung nhận bối cảnh người học qua ô có sẵn/ô mới — từ vựng và ký hiệu đúng sách.
7. B-prompt-Pro + B-chat × C-có-gói: khối người học trong prompt hệ thống, trỏ tên gói; agent nói neo trước khi soạn.
8. Mọi B × C-đoán: dòng neo ⚠ «chưa có gói — đang đoán»; agent nói cùng câu — phụ huynh tin neo sai nếu máy im.
9. Mọi B × C-không-khai: hành vi y hệt hôm nay, không hồi quy — người dùng cũ không thấy gì đổi.

## Later
- Nhiều gói cùng khớp một môn (vd hai bộ sách) → ô chọn gói.
- Nhắc đầu năm học: «bé lên lớp 8 chưa?» — trục thời gian, vòng sau.
- Gói MOET Toán lớp 7 — nội dung, không phải cơ chế.
- Nhiều bé trong một tài khoản — bọc thêm một lớp danh sách.
- Ràng buộc máy-kiểm cho gói (`outline-constraints.json`) — khi nội dung gói ổn định.
- Lưu neo vào stage đã sinh để phiên sau đọc lại.
- [NGÀNH: Common Standards Project] chuẩn dạng dữ liệu có API — chỉ khi có nguồn mở cho Cambridge/MOET; hiện không có.

## Never
- Nhập hồ sơ từ file / API — một bé, năm câu, gõ tay rẻ hơn.
- Phát hiện & gộp hồ sơ trùng — chỉ có một hồ sơ.
- Chia sẻ hồ sơ bé cho giáo viên / người khác — dữ liệu trẻ em, ngoài phạm vi trách nhiệm vòng này.
- Bé tự đăng nhập, tự sửa hồ sơ — không có tài khoản trẻ em.
- [NGÀNH: MagicSchool «district-customized tools»] cấu hình cấp trường — persona là phụ huynh đơn lẻ.

## Cross-cutting áp mọi ô Core
- Dữ liệu cá nhân trẻ em: chỉ giữ tên gọi, lớp, trường, môn — không họ tên đầy đủ, không ngày sinh; xoá được (Core 4); không rời deployment ngoài prompt mô hình (kênh biệt danh/giới thiệu hôm nay đã đi). Khung pháp lý VN: [GIẢ ĐỊNH: Luật Bảo vệ dữ liệu cá nhân 2025, hiệu lực 01/2026 theo preset — ⏱ chưa tra lại trong lượt này].
- Trạng thái trống / đang tải / lỗi của thẻ 5 câu và ô chọn môn; i18n đủ 12 locale (CI kiểm khoá).
- Không hồi quy khi hồ sơ trống (Core 9) — mọi ô mới có mặc định rỗng.
- Tiếng phụ huynh: mã/stage đứng sau tên unit và tên sách.

## [GIẢ ĐỊNH] gom về Coverage của hợp đồng (người gạch một lượt tại Cổng 1)
- G1: «lớp 7» hệ VN ↔ Stage 8 Cambridge — tuỳ trường; gói khai tương đương, phụ huynh sửa được.
- G2: phụ huynh nhận ra neo đúng qua TÊN unit trong mục lục sách bé — không cần biết mã.
- G3: mốc luật dữ liệu cá nhân VN như preset ghi.
- G4: thị trường một ca (chủ kho); «nhiều người dùng repo cũng vậy» chưa có số.
