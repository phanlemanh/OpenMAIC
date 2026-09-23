---
slug: hieu-be-dang-hoc-gi
at: 2026-09-22T10:44:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
claims_input: ok
---

# Phản biện context sạch — hieu-be-dang-hoc-gi

Một lượt, context sạch, đọc sáu đầu vào: design.md · contract.md · evals.yaml · decisions.jsonl · bài học xuyên vòng (claim-scan) · opportunity.md. Không đọc mã kho — mã chưa tồn tại.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | AC-6 (cross-layer) chỉ có E6 gọi thẳng bộ dựng prompt với thân gói truyền tay. Không phép đo máy nào bắt nhịp yêu cầu → route dàn ý → tra gói → thân gói → prompt | Trang chủ không gửi hồ sơ, hoặc route nhận rồi bỏ qua, hoặc mã gói không đổi thành thân gói. E6 xanh (fixture truyền tay), E7b xanh (chỉ đo sự kiện), E7 hạ về khung tĩnh. Máy xanh hết, Cổng 2 ký, bài soạn ra vẫn «toán lớp 7» chung — đúng chiều CHẾT của Cổng Đáng | E7b thành phép đo đầu-cuối: POST route với hồ sơ trong thân yêu cầu (KHÔNG có thân gói), mô hình giả ghi lại prompt nhận được, assert prompt chứa thân gói của bộ đăng ký tại đúng ô. Chiều đỏ: bỏ dòng tra gói trong route → đỏ ghim 'learner dropped between request and outline prompt' | fixed: E7b viết lại thành backend-effect đầu-cuối; E7 không được thay thế nó |
| P1 | evals | Bảng trạng thái 11 dòng, bốn phép đo chụp hứa 9 khung. ST-the-loi-luu và ST-neo-khong không có khung; không expected nào buộc «số khung = số dòng». Vật bù cho quyết định bỏ design-pass đang mỏng hơn lời khai. Cùng lớp lỗi [cau-hinh-di-theo-nguoi#F3] và chiều GHI hỏng [cau-hinh-di-theo-nguoi#F4] | Ghi hỏng lúc lưu, app hiện «đã lưu», phụ huynh sang máy B thấy trống — mất im lặng. E1 xanh vì năm khung đã khai đều có | E1 thêm bước ép ghi hỏng → khung ST-the-loi-luu; E5 thêm khung ST-neo-khong; expected của cả bốn ghi «số khung = số dòng ST-* của màn đó, thiếu → đỏ nêu tên dòng»; thêm assert kho giữ giá trị khi lưu hỏng | fixed: E1 lên 7 khung, E5 lên 4, luật số-khung vào cả bốn expected, AC-16 + E16 cho chiều ghi hỏng |
| P1 | evals | E9 đòi bằng-từng-byte với ảnh chụp nền nhưng không ghim ai ghi, lúc nào, từ commit nào; E13 lấy hai dàn ý làm đầu vào nhưng không bước nào sinh ra chúng | E9 ghi ảnh nền sau khi đã sửa template → bằng chính nó, hồi quy lọt. E13 người dựng tự viết tay hai dàn ý → hội đồng phân biệt đúng mà chưa có dàn ý thật nào chạy qua gói — đây là AC duy nhất bảo đảm phép thử mù của Cổng Đáng | E9: ghim commit nền, tên tệp mang hash, đỏ khi ảnh nền sinh sau commit nền. E13: thêm bước sinh A/B từ route thật, ghi mã lượt chạy vào đầu mỗi tệp, hội đồng chỉ chấm tệp có mã | fixed: opportunity.base_commit điền 40f1cf95; E9 và E13 viết lại theo đúng thước đề xuất |
| P1 | contract | Đường đo thước 3 khai «số từ: phụ huynh sửa dòng neo» — nhưng dòng neo là dòng trạng thái, không có chỗ sửa. Đây chính là ngưỡng mở lại của quyết định không-lưu-con-trỏ-tuần | Phiên nghiệm thu: phụ huynh thấy neo sai chỉ sửa dàn ý như mọi lần khác, không phân biệt được lý do; con số không đếm được; cửa mở lại không bao giờ bật | Đếm bằng lời: người quan sát ghi tally mỗi lần phụ huynh NÓI neo sai trước khi sửa dàn ý; gật = 0. Ghi vào Notes rằng thước này đếm bằng lời, không bằng giao diện | fixed: sửa dòng Đường đo + một dòng Notes |
| P2 | contract | Trục A giá trị «sửa» chỉ có AC-2 ở tầng bộ đăng ký (fixture thuần). Không đo hai hệ quả giao diện: gắn lại gói khi đổi lớp trên hồ sơ đã lưu; bớt môn đang được ô «Soạn cho» nhớ | Mã gói tính một lần lúc thêm dòng → bé lên lớp 8, thẻ vẫn «có gói», bài neo sai stage. Xoá môn đang nhớ → ô giữ mã mồ côi | E1 thêm hai bước sau khi lưu (đổi lớp → mất gói; bớt môn → ô rơi về môn còn lại); AC-2 và AC-5 thêm mỗi câu một mệnh đề | fixed: AC-2, AC-5 thêm mệnh đề; E1 thêm hai bước và hai khung |

## Điều đã kiểm và ổn

- Mọi ngưỡng ở Cổng Đáng đều có dòng trong Đường đo; timebox superseded đúng chỗ.
- Mọi AC có ≥1 eval; mười eval máy đều có chiều đỏ với thông điệp ghim; cách rút danh sách kho theo khai báo đúng bài học [cau-hinh-di-theo-nguoi#F1].
- AC-11/E11 đủ ba vế cross-layer. Không đường gốc cứng trong các bước.
- Chín quyết định đã chốt được tôn trọng; không finding nào đòi mở lại, ngoài cách ĐẾM cho ngưỡng mở lại của quyết định không-lưu-con-trỏ-tuần.
- Người phản biện không đọc được cấu hình kho nên ngỏ câu «E15 chạy bằng lệnh nào». Đã kiểm tại chỗ: `executors.design.gate` có khai và `scripts/design-gate-changed.mjs` có thật (2.8 KB) — không phải lỗ.
