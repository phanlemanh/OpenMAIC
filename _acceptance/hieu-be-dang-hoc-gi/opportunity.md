---
schema_version: 1
slug: hieu-be-dang-hoc-gi
feature: Bài học bám đúng thứ bé đang học ở trường — không phải kể lại bối cảnh mỗi lần
owner: Manh Phan
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Phụ huynh dùng OpenMAIC soạn bài cho con: bé lớp 7, trường Emasi (Việt Nam),
học theo chương trình Cambridge Lower Secondary. Mỗi lần ngồi xuống soạn là mất
những phút đầu kể lại cùng một câu chuyện — lớp mấy, trường nào, sách nào, đang
học tới đâu — rồi bài ra vẫn là «toán lớp 7» chung chung, không bám đúng thứ bé
đang học tuần này ở trường. Nỗi đau là **lặp lại** (kể lại bối cảnh) và **lệch**
(bài không khớp lớp học thật). Nguồn: chủ kho tự khai 22/09/2026, buổi khai thác
bằng `/product-management:brainstorm`.

Ý ban đầu là «làm như tính năng bối cảnh cá nhân của Claude Desktop / OpenClaw /
Hermes». Buổi khai thác tách ý đó thành ba tầng, giá và giá trị khác nhau:

| Tầng | Là gì | Bản chất |
|---|---|---|
| 1. Hồ sơ người học | lớp, trường, sách, ngôn ngữ — khai một lần, máy nhớ | ô ghi nhớ |
| 2. Neo giáo trình | bài bám đúng khung Cambridge Stage 8: mục tiêu có mã, mạch kiến thức | nguồn tri thức |
| 3. Kết quả thật của bé | bé sai gì, chưa nắm gì — tích luỹ qua thời gian | mô hình người học |

Các sản phẩm được lấy làm mẫu **chỉ có tầng 1**. Vòng này làm **tầng 1 + tầng 2**;
tầng 3 để vòng sau (xem Out of scope).

Đọc được trong kho, không phải suy đoán:

- Bộ soạn khoá không có khái niệm nào về cấp lớp hay giáo trình: bộ sinh
  outline và các kiểu prompt không có từ nào trong họ audience / grade / level /
  curriculum (`packages/@openmaic/generation/src/outline-generator.ts`,
  `prompts/types.ts`). Bối cảnh người học hôm nay chỉ vào được qua chính câu
  prompt người gõ — nên mới phải gõ lại.
- Tài liệu tải lên đã có hai đời sống: thư viện **theo chủ sở hữu**, bền
  (`lib/persistence/owner-materials.ts` — «the owner's durable library») và
  danh sách **theo phiên** mà agent nhìn thấy
  (`lib/server/agent-runtime/session-materials.ts` — «Session-scoped»). Kho
  giữ được tài liệu qua nhiều phiên rồi; thiếu đúng một nhịp: phiên mới không
  tự mang tài liệu đã ghim vào.
- Skill do người dùng tạo đã bền và có bộ công cụ tạo/sửa
  (`lib/server/agent-runtime/user-skill-store.ts`) — một «gói khung giáo trình»
  có chỗ để cắm vào mà không cần cơ chế mới.
- Vòng «cấu hình đi theo người» vừa merge (PR #2) đã nối phạm vi `account` qua
  danh tính (`lib/store/kv-persist.ts`). Hồ sơ người học là một giá trị phạm
  vi `account` nữa trên cùng cái móng đó.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Bài có khung Cambridge trong tay **khác biệt nhìn thấy được** so với bài «toán lớp 7» chung — phụ huynh đặt cạnh vở bé là nhận ra | Tầng 2 là giá trị vô hình; vòng co lại còn tầng 1 (một ô text) | Hai bài cùng đề, một có khung một không, không đánh dấu; phụ huynh chọn bài khớp vở bé và nói vì sao. Chủ kho chọn làm trước rồi thử trên sản phẩm thật → thành phép đo UAT đầu tiên | Chưa thử |
| 2 | «Tuần này học tới đâu» lấy từ **unit của sách trên bàn bé** là đủ, không cần scheme of work của trường | Bài đúng cấp nhưng lệch tuần — máy đoán con trỏ sai liên tục, phụ huynh phải dịch tay = lại lặp lại | Hai tuần dùng thật, đếm số lần máy hỏi «Unit N phải không?» bị sửa | Chưa thử |
| 3 | Khung Cambridge (tải công khai) chép thành gói skill được về **bản quyền** | Gói chỉ giữ mã + tên chủ đề, không chép lời mục tiêu — vẫn neo được nhưng mỏng hơn | Đọc điều khoản sử dụng khung của Cambridge International, 30 phút | Chưa thử |
| 4 | Tài liệu ghim theo người dựng được trên **thư viện chủ sở hữu đã có**, không cần kho mới | Phải làm một kho tài liệu mới — vòng phình | Đọc điểm agent nạp `session-materials` và `owner-materials`, xem nối một nhịp «phiên mới tự nạp tài liệu đã ghim» có đủ không | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Phụ huynh đã khai hồ sơ bé **một lần**, tuần sau ngồi xuống soạn bài — bài ra có bám đúng thứ bé đang học ở trường mà không phải kể lại bối cảnh không?
- Kết quả nào là SỐNG: [đề xuất] trong 2 tuần dùng thật, ít nhất 4 trên 5 bài soạn ra dùng được cho bé mà không gõ lại lớp / trường / sách lần nào, VÀ trong phép thử mù (giả định 1) phụ huynh nhận ra bài có khung đúng ít nhất 2 trên 3 lần
- Kết quả nào là CHẾT: [đề xuất] vẫn phải kể lại bối cảnh từ 2 bài trở lên trong một tuần, HOẶC phép thử mù không phân biệt được bài có khung với bài «toán lớp 7» chung
- Timebox: [đề xuất] 3 ngày dựng, 2 tuần chờ tín hiệu — hai tuần vì con trỏ tuần phải dịch ít nhất hai lần mới đo được giả định 2

## Kết quả prototype

Chưa dựng. Chủ kho chọn lối làm-trước-thử-trên-thật (22/09): không dựng prototype
riêng, phép thử mù của giả định 1 chạy ngay trên bản đầu tiên.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Khung chương trình Cambridge Lower Secondary (Stage 7–9, theo môn) — mục tiêu học tập có mã, xếp theo mạch | Cambridge International, tài liệu công khai | triết-lý/logic | có — với điều kiện giả định 3 đứng | — |
| Tính năng «bối cảnh cá nhân» của Claude Desktop / OpenClaw / Hermes | sản phẩm ngoài | ngôn-ngữ-thiết-kế/hình-thái (khuôn tương tác «một người, một ô nhớ») | **không** — chúng chỉ có tầng 1; chép nguyên khuôn là làm cái rẻ nhất mà kỳ vọng giá trị của cái đắt nhất | — |

## Cổng Đáng

- **decision = …** Căn cứ: …
- **disposition = …** Căn cứ: …
- **Ngưỡng UAT chốt cùng lúc ký:** …

## Thước đo thành công → ứng viên criterion

- Số lần phải khai lại bối cảnh (lớp / trường / sách / unit) trong một tuần soạn bài
- Tỉ lệ bài có khung được phụ huynh nhận ra đúng trong phép thử mù
- Số lần máy đoán con trỏ tuần sai trên số tuần
- Số bài soạn ra dùng được cho bé mà không sửa đề
- Bản chưa cài gói khung nào vẫn soạn được, và **nói rõ** là đang đoán cấp lớp

## Out of scope từ khám phá

- **Tầng 3 — mô hình người học từ kết quả thật của bé**: giá trị cao nhất nhưng là dữ liệu học tập của trẻ em trong một kho mã nguồn mở ai cũng tự cài được; cần câu trả lời về ai giữ / giữ ở đâu / xoá thế nào trước khi viết dòng code đầu. Vòng sau, sau khi tầng 2 chứng minh giá trị nhìn thấy được.
- **Ship sẵn mọi khung (Cambridge, MOET, IB…) trong repo**: bản quyền + bảo trì mãi mãi + không bao giờ đủ. Đi đường gói cộng đồng qua skill người dùng.
- **Giáo viên soạn cho ba mươi học sinh**: ba mươi hồ sơ dưới một người soạn là mô hình dữ liệu khác hẳn «hồ sơ của tôi đi theo tôi». Vòng này: một người soạn, một người học.
- **Bộ chấm bám khung sau khi soạn** (soạn tự do rồi đối chiếu, báo thiếu): cần có khung để chấm — chỉ có nghĩa sau khi gói khung tồn tại.
- **Hai giáo trình song song trên cùng một bé** (Toán MOET tiếng Việt + Maths Cambridge tiếng Anh, kiểu trường tích hợp như Emasi): câu hỏi mở, chủ kho chưa xác nhận bé có học thế không. Hồ sơ vòng 1 nhận một giáo trình; nếu ca thật là hai, đó là vòng nới hồ sơ chứ không đổi hướng.
