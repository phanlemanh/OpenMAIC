# Thiết kế — hiểu bé đang học gì (hieu-be-dang-hoc-gi)

Ngày 2026-09-22 · từ ô cơ hội đã ký Cổng Đáng (`opportunity.md`) · quét độ phủ ở `coverage-scan.md`.

## Vấn đề

Phụ huynh — không chuyên sư phạm, không kỹ thuật — soạn bài cho con bằng OpenMAIC. Mỗi lần
ngồi xuống phải kể lại lớp, trường, sách, chương trình; bài ra vẫn là «toán lớp 7» chung
chung, không bám thứ bé đang học tuần này ở trường. Hai nỗi đau: **lặp lại** và **lệch**.

## Vì sao hôm nay nó thế

- Bộ soạn không có khái niệm cấp lớp hay giáo trình. Kênh duy nhất là biệt danh + một đoạn
  giới thiệu tự do (`userNickname`/`userBio` trong `UserRequirements`), và khối định dạng
  nó được chép tay ở hai chỗ giống hệt nhau cộng một chỗ thứ ba khác kiểu.
- Xưởng Pro không nhận hồ sơ nào: prompt hệ thống của agent ghép từ các khối tuỳ chọn
  (skill, tài liệu, roster, giọng) — không có khối người học.
- Skill là cơ chế duy nhất «đi theo người vào mọi phiên mới»; kho đã có tiền lệ gói chương
  trình dạng skill builtin (`k12-core-literacy-planning`).
- Khung Cambridge có mã mục tiêu nằm sau cổng đăng nhập trường (kiểm 22/09) — không chép được.

## Lối đã chốt

**A hình chữ T**: một lõi làm một lần (hồ sơ có cấu trúc · gói khung có sẵn · một bộ định
dạng) và hai bộ chuyển mỏng cho hai cửa. Tầng 3 (kết quả thật của bé) ngoài vòng.

### Vì sao không phải skill do người dùng tự viết
Phụ huynh non-tech không viết markdown có frontmatter. Gói phải **có sẵn, chọn từ danh sách**.

### Vì sao gói neo bằng tên unit, không phải mã mục tiêu
Tài liệu khung là bản quyền và gated. Tên unit/chủ đề có trên trang công khai và trong mục
lục cuốn sách bé cầm — và đó cũng là thứ phụ huynh nhìn ra. Mã, nếu có, đứng sau và không
là điều kiện.

### Vì sao hồ sơ đi theo yêu cầu, không đi theo phiên
Bảng phiên của agent nằm trong gói lưu trữ (vùng T3). Client gửi hồ sơ khi mở phiên; route
ghi bản chụp vào ngăn KV của chủ sở hữu (`PgKVStore.set(owner, key)` đã có); runner đọc
bản chụp khi dựng prompt. Không sửa bảng phiên, không nhét hồ sơ vào lời nhắn. Hạng T2.

### Vì sao không lưu con trỏ tuần
Chủ đề là thứ duy nhất đổi mỗi lần soạn và phụ huynh vốn gõ nó. Gói ánh xạ chủ đề → unit;
máy nói ra neo ở màn duyệt dàn ý / trong chat; phụ huynh gật hay sửa ở đó.

## Kiến trúc

```
hồ sơ người học (kho zustand, phạm vi account, đăng ký vào account-stores)
  bé: tên gọi · lớp (hệ VN) · trường?
  môn[]: môn · chương trình · ngôn ngữ · sách? · packId? (máy gắn khi khớp)
          │
          ├── bấm-một-phát: app/page.tsx → UserRequirements.learner + môn đã chọn
          │     → route dàn ý: formatLearnerContext + thân gói → {{userProfile}} + {{curriculumContext}}
          │     → mô hình trả curriculumAnchor (SSE, như courseTitle) → màn xem trước: dòng neo
          │     → slide/quiz/lời giảng: {{learnerContext}} (mặc định rỗng)
          │
          └── xưởng Pro: POST /api/agent/sessions { learner } → KV owner 'learner-profile.snapshot'
                → runner: learnerPromptBlock(snapshot, packs) → CoursePromptBlocks.learner
                → khối trỏ tên skill gói; agent đọc skill, nói neo trước khi soạn

gói khung = skills/agent-runtime/<id>/SKILL.md + curriculum-pack.json (cạnh, như outline-constraints.json)
bộ đăng ký = lib/server/curriculum-packs.ts quét curriculum-pack.json; GET /api/curriculum-packs cho thẻ
```

### Các mảnh

| Mảnh | Đụng đâu | Việc |
|---|---|---|
| Kho hồ sơ | `lib/store/learner-profile.ts` (mới), `lib/store/account-stores.ts` | `useLearnerProfileStore`, persist `learner-profile-storage`, phạm vi account; đăng ký để mã nhận mang theo và «xoá bộ nhớ đệm» xoá cùng |
| Kiểu chung | `packages/@openmaic/generation/src/outline-types.ts`, `lib/types/generation.ts` | `LearnerContext`, `LearnerSubject`; `UserRequirements.learner?` |
| Bộ định dạng | `packages/@openmaic/generation/src/prompt-formatters.ts` | `formatLearnerContext(learner, packBody?)` — thay ba bản chép tay (`outline-generator.ts`, `scene-outlines-stream/route.ts`, `generation-preview/page.tsx`). **Cả hai cửa dùng chung hàm này**: phía máy chủ nhập được gói soạn (`lib/server/*` đã nhập ở năm chỗ), nên `learnerPromptBlock` của xưởng Pro GỌI nó rồi bọc thêm tiêu đề khối và câu «đọc skill gói trước khi soạn» — không tự ghép chuỗi riêng |
| Ô template | `templates/requirements-to-outlines/*.md`, `slide-content/user.md`, `quiz-content/user.md`, `lib/prompts/templates/{interactive,task-engine}-outlines/user.md`, hai `loader.ts` | `{{curriculumContext}}`, `{{learnerContext}}` + mặc định rỗng; luật `curriculumAnchor` trong system prompt dàn ý |
| Gói mẫu | `skills/agent-runtime/cambridge-lower-secondary-maths-8/` | SKILL.md (mạch → unit → chủ đề; cách trình bày; từ vựng/ký hiệu; luật nói neo) + `curriculum-pack.json` (subject, curriculum, stage, grades.vn, language, textbooks) |
| Bộ đăng ký | `lib/server/curriculum-packs.ts` (mới), `app/api/curriculum-packs/route.ts` (mới) | quét `skillsDir/*/curriculum-pack.json`; `findPack(subject, curriculum, gradeLabel)`, `readPackBody(id)` |
| Cửa bấm-một-phát | `app/page.tsx`, `app/api/generate/scene-outlines-stream/route.ts`, `app/generation-preview/page.tsx`, `components/generation/outlines-editor.tsx` | ô «Soạn cho», learner vào yêu cầu; route lấy thân gói, phát sự kiện `curriculumAnchor`; màn xem trước hiện dòng neo |
| Cửa xưởng Pro | `app/api/agent/sessions/route.ts`, `.../[id]/messages/route.ts`, `lib/server/agent-runtime/learner-context.ts` (mới), `course-tools.ts`, `runner.ts` | nhận `learner`, ghi bản chụp KV; `learnerPromptBlock` = bọc quanh `formatLearnerContext`; `CoursePromptBlocks.learner` |
| Thẻ 5 câu | `components/settings/learner-profile-settings.tsx` (mới), `components/settings/index.tsx`, `lib/types/settings.ts`, `lib/i18n/locales/*.json` (12) | mục «Người học»; dòng mời trên trang chủ |

## Xử lý lỗi

- Lưu hồ sơ thất bại (ngăn KV không ghi được) → kho giữ giá trị đang có, thông báo qua kênh
  `persist-health` như các kho khác; không mất thứ vừa gõ.
- Gói không đọc được (JSON hỏng) → bộ đăng ký cảnh báo có tên tệp và **bỏ gói đó**; hồ sơ
  hiện «chưa có gói» thay vì đổ vỡ.
- `learner` sai hình ở route mở phiên → 400 nêu tên trường; đúng hình mới ghi bản chụp.
- Bản chụp KV vắng (deployment không có DATABASE_URL, hoặc client cũ) → không khối người học,
  prompt như hôm nay.
- Mô hình không trả `curriculumAnchor` → màn xem trước không hiện dòng neo; không đỏ.

## Kiểm thử

Máy: bộ định dạng (cặp hai chiều trên cùng fixture), bộ đăng ký (fixture gói giả, lọc lớp),
không còn `{{…}}` sót sau khi đổ biến, tập kho account rút từ khai báo (mở rộng bài kiểm có
sẵn), snapshot prompt khi hồ sơ trống (không hồi quy), route mở phiên từ chối hồ sơ sai hình,
runner dựng khối người học từ bản chụp. Nhìn thấy: thẻ 5 câu qua các trạng thái, ô chọn môn,
dòng neo. Phán xét: cặp dàn ý mù có/không gói; thẻ đọc được bởi phụ huynh non-tech.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: trang chủ (chưa có hồ sơ) → dòng mời «Soạn cho bé nhà mình? Khai 5 câu» → thẻ 5 câu (tên · lớp · trường · môn/chương trình/ngôn ngữ · sách) → Lưu → về trang chủ, ô «Soạn cho: Toán — Cambridge ▾» → gõ chủ đề → Tạo → màn xem trước có dòng neo «Bài này theo Unit 3 — Tỉ lệ và tỉ số (Cambridge Stage 8, Learner's Book 8)» → gật hoặc sửa dàn ý như thường (điểm ra: lớp học đã sinh)
- Biên: hồ sơ có môn nhưng chưa có gói (Toán MOET) → dòng môn ghi «chưa có gói — máy sẽ đoán», dòng neo mang ⚠; hồ sơ trống → không ô chọn, không dòng neo, mọi thứ như hôm nay
- Lỗi & quay lại: lưu không được → toast «chưa lưu được, giá trị vẫn giữ trên màn» → bấm Lưu lại; mô hình không trả neo → màn xem trước không có dòng neo, dàn ý vẫn duyệt được

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Thẻ 5 câu (mục «Người học» trong Cài đặt) | Khai bé học gì để bài bám đúng | dòng mời trang chủ, nav Cài đặt / trang chủ |
| Ô «Soạn cho» (trang chủ) | Chọn môn — chương trình cho bài sắp soạn | trang chủ / màn xem trước |
| Dòng neo (màn xem trước dàn ý) | Nói bài neo vào unit nào bằng tiếng phụ huynh | màn xem trước / sửa dàn ý hoặc tạo |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-the-trong | Thẻ 5 câu | 5 câu trống, nút Lưu mờ, gợi ý «Bé tên gì?» | điền tên, lớp, ≥1 môn |
| ST-the-dang-dien | Thẻ 5 câu | các ô đang điền; dropdown lớp 1–12; dòng môn: môn ▾ · chương trình ▾ · ngôn ngữ ▾ · sách; «+ thêm môn» | điền tiếp / Lưu |
| ST-the-mon-co-goi | Thẻ 5 câu (dòng môn) | «✓ có gói khung — Cambridge Lower Secondary Mathematics, Learner's Book 8» | không cần làm gì |
| ST-the-mon-chua-goi | Thẻ 5 câu (dòng môn) | «chưa có gói cho chương trình này — máy sẽ đoán và nói rõ» | chấp nhận hoặc đổi chương trình |
| ST-the-dang-luu | Thẻ 5 câu | nút Lưu mờ trong lúc đọc lại từ ngăn lưu để xác nhận | chờ |
| ST-the-da-luu | Thẻ 5 câu | toast «đã lưu», nút Lưu mờ lại | về trang chủ |
| ST-the-loi-luu | Thẻ 5 câu | toast «chưa lưu được — giá trị vẫn giữ trên màn» | Lưu lại |
| ST-chon-moi-khai | Trang chủ | dòng mời «Soạn cho bé nhà mình? Khai 5 câu →» dưới lời chào | bấm mở thẻ |
| ST-chon-san-sang | Trang chủ | ô «Soạn cho: Toán — Cambridge (tiếng Anh) ▾» cạnh các công tắc | chọn môn / gõ chủ đề |
| ST-neo-co-goi | Màn xem trước | «Bài này theo Unit 3 — Tỉ lệ và tỉ số · Cambridge Stage 8 · Learner's Book 8» | gật, hoặc sửa dàn ý |
| ST-neo-dang-doan | Màn xem trước | «⚠ chưa có gói khung cho MOET lớp 7 — máy đang đoán theo hiểu biết chung» | gật với dè dặt, hoặc đổi môn |
| ST-neo-khong | Màn xem trước | không dòng neo (hồ sơ trống) — y như hôm nay | như hôm nay |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Lưu chỉ bật khi có tên gọi + lớp + ≥1 dòng môn đủ (môn + chương trình + ngôn ngữ).
- Bấm Lưu thì ĐỌC LẠI từ ngăn lưu trước khi dám nói «đã lưu»: việc ghi là bất đồng bộ, nên hỏi cờ sức khoẻ ngay sau khi gọi là hỏi quá sớm và màn sẽ báo đã lưu cho một lượt ghi vừa trượt. Hàng đợi ghi theo khoá là tuần tự nên lượt đọc xếp sau lượt ghi.
- Tên gọi ≤ 40 ký tự; trường và sách ≤ 80; không họ tên đầy đủ, không ngày sinh (dữ liệu trẻ em).
- Gói tự gắn lại mỗi khi đổi lớp / môn / chương trình; không có nút «chọn gói» ở vòng này.
- Ô «Soạn cho» nhớ lựa chọn gần nhất (device scope, localStorage như các công tắc trang chủ).
- Không chuỗi «Stage», «8Nf», «framework» trên thẻ; mã chỉ trong dòng neo, in nhỏ, sau tên unit.
- Bàn phím: Tab qua từng ô; Enter trong ô cuối = Lưu; Esc đóng dialog như các mục Cài đặt khác.
- Breakpoint: dòng môn xếp dọc dưới 640px.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Dialog + nav Cài đặt (`components/settings/index.tsx`) | mở rộng | thêm một mục, giữ khuôn ba cột |
| Select/Input/Button/Toast (ui nền của repo) | dùng | thẻ là form ngắn, không cần widget mới |
| Dòng môn (`LearnerSubjectRow`) | tạo | tổ hợp 4 ô + trạng thái gói, lặp N dòng |
| Dòng mời trang chủ | ghép | một dòng text + link, đặt dưới Greeting Bar sẵn có |
| Dòng neo (`CurriculumAnchorLine`) | tạo | một dòng trạng thái có 3 biến thể (có gói / đoán / không) |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: 5 câu vừa một màn, không có bước phụ thuộc nhau → wizard là thừa; MagicSchool.ai cũng nhận «subject, grade level, standards» trong một form phẳng [NGÀNH]. Không tra Mobbin: hai khuôn còn lại (wizard, hội-thoại) loại được bằng lý do trên.
<!-- UX-SPEC-TEMPLATE>>> -->
