# Hình tại điểm quyết định — Cổng Phạm vi, hieu-be-dang-hoc-gi

Kê từ tạo tác cuối S1 (sổ quyết định chờ seal · lệch so với ô cơ hội · [GIẢ ĐỊNH] trong Coverage · finding gap-probe xử lý human-gate1). Ngưỡng N5: từ ba bước nối tiếp hoặc từ hai nhánh rẽ → cần hình.

| Điểm | Đếm | Hình |
|---|---|---|
| A đầy đủ hai cửa, hình chữ T (d-…-5) — B / C / A | 3 nhánh, luồng ≥3 bước | F1 |
| Hồ sơ đi theo yêu cầu, không theo bảng phiên (d-…-4) — bảng phiên / custom_message / KV chủ sở hữu | 3 nhánh | F1 (chú thích lối chở) |
| Hồ sơ 1 bé N môn (d-…-1) — a / b / c | 3 nhánh | F2 |
| Gói builtin, không skill người dùng (d-…-2) | 2 nhánh | F2 |
| Gói neo bằng tên unit, không chép khung (d-…-3) | 2 nhánh | F2 |
| Không lưu con trỏ tuần (d-…-6) | 2 nhánh | F2 |
| Không ghim tài liệu (d-…-7) · không gói MOET (d-…-8) · bỏ design-pass (d-…-10) | 2 nhánh mỗi điểm | F2 |
| Lệch so với ô cơ hội: «gói cộng đồng qua skill người dùng» → gói builtin | 2 nhánh | F2 (cùng nút với d-…-2) |
| [GIẢ ĐỊNH] G1 lớp 7 ↔ Stage 8 · G2 nhận neo qua tên unit · G3 luật dữ liệu trẻ em · G4 thị trường một ca | dưới ngưỡng: 1 nhánh mỗi điểm (gật/gạch) | — |
| Duyệt UI bằng chữ (design-pass bỏ): 3 màn, 11 trạng thái | ≥3 bước nối tiếp | F3 |

## Đề bài

### F1 — Luồng hồ sơ qua hai cửa (data flow / sequence)
Loại: sơ đồ luồng dữ liệu. Nút: Hồ sơ người học (kho account) · Gói khung (skill + curriculum-pack.json) · Bộ định dạng (một) · Cửa bấm-một-phát: trang chủ → route dàn ý → mô hình → SSE curriculumAnchor → màn xem trước (dòng neo) · Cửa xưởng Pro: POST sessions → KV chủ sở hữu (bản chụp) → runner → khối người học → agent đọc skill → câu neo trong chat. Chú thích lối chở bị loại: bảng phiên (T3), custom_message (tới mô hình như lời nhắn). Nhãn bằng chữ; AC liên quan: AC-6, AC-7, AC-11, AC-12. Nguồn: design.md mục Kiến trúc.

### F2 — Bản đồ quyết định (solution tree / disposition map)
Loại: cây quyết định, nhánh đã chọn tô đậm, nhánh loại có một dòng lý do. Gốc: «Bài học bám đúng bé». Các nút: hình dạng hồ sơ (a/b/c → b) · nguồn gói (skill người dùng / builtin → builtin) · nội dung gói (chép khung / tên unit → tên unit) · phạm vi cửa (B / C / A → A) · lối chở hồ sơ (bảng phiên / custom_message / KV → KV) · con trỏ tuần (lưu / suy → suy) · ghim tài liệu (làm / hoãn → hoãn) · gói MOET (làm / hoãn → hoãn) · design-pass (chạy / bỏ → bỏ, preflight). Nguồn: decisions.jsonl + contract Out of scope.

### F3 — Màn và trạng thái (wireflow)
Loại: wireflow ba màn với trạng thái. Màn: Thẻ 5 câu (ST-the-trong → ST-the-dang-dien → ST-the-mon-co-goi / ST-the-mon-chua-goi → ST-the-da-luu / ST-the-loi-luu) · Trang chủ (ST-chon-moi-khai → ST-chon-san-sang) · Màn xem trước (ST-neo-co-goi / ST-neo-dang-doan / ST-neo-khong). Mũi tên: dòng mời → thẻ → trang chủ → tạo → xem trước. Chữ bằng tiếng phụ huynh, không mã. Nguồn: design.md mục Đặc tả UX (bảng trạng thái).
