# Review Findings: hieu-be-dang-hoc-gi (round 1)

## Trong hợp đồng

### curriculumAnchor is parsed from the stream but never stored on the session — the anchor line can never render
- file: `app/generation-preview/page.tsx:689`
- severity: high
- AC: AC-7
- source: conventions

The outline-stream promise resolves with `curriculumAnchor: anchor` (line 640), but the object that is actually persisted into React state — `const updatedSession: GenerationSessionState = { ...currentSession, sceneOutlines, languageDirective, courseTitle, taskEngineMode, previewPhase }` at line 689 — never copies it. `persistSession(updatedSession)` is the only writer of `session`, so `session?.curriculumAnchor` read at line 1313 is permanently `undefined`.

Consequence: `<CurriculumAnchorLine>` can never reach its `ST-neo-co-goi` branch. Whenever a learner profile exists it falls through to `guessingFor` (line 1318, gated on `!session?.curriculumAnchor`) and shows the amber warning "No curriculum pack for {{curriculum}} yet — this is an informed guess, not a checked match" — even when a pack WAS matched and its body WAS injected into the prompt. The feature's primary visible surface is therefore both dead and actively misleading. The fallback resolve at line 653 (stream ends without a `done` event) drops the anchor too, asymmetrically with the sibling `courseTitle` field. `tests/components/curriculum-anchor-line.test.ts` only exercises the component in isolation, so nothing catches this wiring gap.

### interactive-outlines and task-engine-outlines inject the pack body but never request `curriculumAnchor`
- file: `lib/prompts/templates/interactive-outlines/user.md:12`
- severity: medium
- AC: AC-7
- source: conventions

Only `packages/@openmaic/generation/templates/requirements-to-outlines/user.md:15` carries the instruction "Also return a `curriculumAnchor` field...". The two app-owned outline templates got the `{{#if curriculumContext}}{{curriculumContext}}{{/if}}` slot (interactive-outlines/user.md:12-14, task-engine-outlines/user.md:10-12) but no corresponding instruction, and `app/api/generate/scene-outlines-stream/route.ts:471` passes `curriculumContext` to both.

Failure scenario: a learner profile with a matched pack generates in Ultra/interactive mode or vocational (task-engine) mode. The framework body is injected — the lesson really is anchored — but the model is never asked to emit `curriculumAnchor`; `extractCurriculumAnchor` finds nothing, and the UI falls to `guessingFor`, telling the parent there is no curriculum pack and the anchor is an unchecked guess — the exact opposite of what happened.

### curriculumAnchor is parsed from the stream then dropped — the anchor line always falls to the amber "unverified guess" warning
- file: `app/generation-preview/page.tsx:689`
- severity: high
- AC: AC-7
- source: bugs

Same wiring gap as above, confirmed against a concrete fixture: learner profile = {Toán, cambridge-lower-secondary, lớp 7}, the pack IS found, the model returns `curriculumAnchor: "Bài này theo Unit 3 …"`, the route emits the `curriculumAnchor` SSE event (route.ts:641-646) and the client receives it — yet `CurriculumAnchorLine` renders `guessingFor`, telling the parent "⚠ No curriculum pack for cambridge-lower-secondary yet — this is an informed guess, not a checked match." The one user-visible surface of the whole feature is inverted: it claims the anchor is unverified in exactly the case where it is verified. `tests/generation/outline-stream-learner.test.ts` only asserts the SSE bytes, so nothing catches the drop.

### Learner profile save reports "Saved" on a write that failed — health check is synchronous, the KV write is not
- file: `components/settings/learner-profile-settings.tsx:130`
- severity: high
- AC: AC-16
- source: bugs

`onSave` does `setLearner(learner)` then immediately checks `isPersistUnavailable('learner-profile-storage')` and otherwise shows `toast.success(saved)`. The persist adapter's `setItem` (lib/store/kv-persist.ts:798-828) is async: it queues, awaits `kvStorage.setItem`, and only then calls `onFailure(...)` → `reportPersistHealth(name, 'unavailable')`. The synchronous check therefore only ever observes health raised by an *earlier* hydration failure.

Failure scenario: hydration succeeded, then the KV backend goes down (or the request 500s). Parent fills the 5-question card, hits Save. The toast says "Saved" and the button goes disabled, the write rejects a moment later, health flips to unavailable, and the profile is gone on reload — precisely the failure rule #3 in the file's own header comment forbids ("Lưu hỏng thì KHÔNG báo đã lưu"). This is not a theoretical scenario — E1's live run reproduces it: `[KVPersist] Refusing to persist "learner-profile-storage" while its storage is unavailable` fires on the very first ordinary Save, not only under the eval's forced-500 step.

### Interactive / Task-Engine outline modes get the curriculum pack but are never asked for `curriculumAnchor`
- file: `app/api/generate/scene-outlines-stream/route.ts:458`
- severity: medium
- AC: AC-7
- source: bugs

`curriculumContext` is computed once (~line 347) and passed to both `buildOutlinePrompt` and the `taskEngineMode || interactiveMode` branch (line 473), but the "Also return a curriculumAnchor field" instruction exists only in `packages/@openmaic/generation/templates/requirements-to-outlines/user.md` — a repo-wide grep confirms `curriculumAnchor` appears in no other template. Failure scenario: learner profile with a matching pack + Ultra Mode on. The framework body is injected, the outline really is anchored, the model is never asked for the anchor field, no `curriculumAnchor` event is emitted, and the preview shows the amber "informed guess" warning — a false claim in these two modes whenever a pack was used.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Frozen packId in the saved profile contradicts the store's stated invariant and produces a self-contradicting prompt**
  Người dùng thấy gì: Nếu bộ nhớ gói khung chưa tải kịp lúc phụ huynh bấm Lưu, hồ sơ có thể ghi nhớ sai là «chưa có gói» mãi mãi dù sau này gói đã có — bài soạn cho môn đó có thể vừa dùng đúng khung vừa nói với người dùng là đang đoán, gây khó hiểu.
  file: `components/settings/learner-profile-settings.tsx`
  severity: medium
  Đề xuất: new-contract

- **`learner` is unvalidated at the /api/generate/scene-outlines-stream boundary while the sibling route validates the identical payload**
  Người dùng thấy gì: Nếu phụ huynh gửi một hồ sơ có dữ liệu môn học sai định dạng ở cửa soạn nhanh (không phải xưởng Pro), sản phẩm có thể báo lỗi chung chung thay vì chỉ rõ cần sửa gì, và các trường như tên bé/trường/sách có thể không bị giới hạn độ dài trước khi đưa vào bài soạn.
  file: `app/api/generate/scene-outlines-stream/route.ts`
  severity: medium
  Đề xuất: new-contract

- **Server caps subjects at 12 and hard-fails session creation; the settings card has no cap**
  Người dùng thấy gì: Nếu phụ huynh thêm quá 12 môn vào hồ sơ, mọi lần mở xưởng Pro sau đó sẽ thất bại mà không có gợi ý nào chỉ ra nguyên nhân là do hồ sơ có quá nhiều môn.
  file: `lib/server/agent-runtime/learner-context.ts`
  severity: medium
  Đề xuất: known-limits

- **`slice(0, 200)` on the streamed anchor is dead — normalizeStreamedTitle already caps at 120**
  Người dùng thấy gì: Với những dòng neo dài (khoảng 121-200 ký tự), bản xem trước theo thời gian thực có thể cắt cụt câu neo giữa chừng, trong khi các đường soạn khác giữ nguyên câu đầy đủ.
  file: `app/api/generate/scene-outlines-stream/route.ts`
  severity: low
  Đề xuất: known-limits

- **Unused import `subjectKey` in app/page.tsx**
  Người dùng thấy gì: Một dòng import không dùng tới có thể khiến việc kiểm tra chất lượng mã tự động báo lỗi, không ảnh hưởng gì đến trải nghiệm phụ huynh.
  file: `app/page.tsx`
  severity: low
  Đề xuất: wont-fix

- **Server-side learner snapshot is never deleted — child's name/school keeps being injected into agent prompts after the user clears everything**
  Người dùng thấy gì: Sau khi phụ huynh dùng «Xoá bộ nhớ đệm» để xoá dữ liệu của bé, tên và trường của bé vẫn có thể tiếp tục được đưa vào các phiên soạn bài xưởng Pro sau đó, vì bản sao lưu phía máy chủ không được xoá theo.
  file: `lib/server/agent-runtime/learner-context.ts`
  severity: medium
  Đề xuất: new-contract

- **`packId` frozen into the stored profile at save time contradicts the server's live pack lookup**
  Người dùng thấy gì: Nếu bộ nhớ gói khung chưa tải kịp lúc phụ huynh bấm Lưu, hoặc gói được thêm sau khi đã lưu hồ sơ, hồ sơ có thể ghi nhớ sai trạng thái gói mãi mãi — bài soạn có thể vừa dùng đúng khung vừa nói với người dùng là đang đoán.
  file: `components/settings/learner-profile-settings.tsx`
  severity: medium
  Đề xuất: new-contract

- **A profile with more than 12 subjects makes every Pro session creation fail with 400, and the UI has no cap**
  Người dùng thấy gì: Nếu phụ huynh thêm quá 12 môn vào hồ sơ, mọi lần mở xưởng Pro sau đó sẽ thất bại mà không có gợi ý nào chỉ ra nguyên nhân là do hồ sơ có quá nhiều môn.
  file: `lib/server/agent-runtime/learner-context.ts`
  severity: medium
  Đề xuất: known-limits

- **Blind-pair evidence script imports a module that does not exist and reports it as a missing provider key**
  Người dùng thấy gì: Kịch bản dùng để tạo cặp bài soạn có/không gói khung cho phiên nghiệm thu hiện không chạy được — báo lỗi hiểu nhầm là thiếu cấu hình nhà cung cấp mô hình, khiến việc chuẩn bị phép thử mù bị chặn mà không rõ lý do thật.
  file: `scripts/gen-dan-y-mu.mjs`
  severity: low
  Đề xuất: new-contract

- **Hình dạng 5 — tuyên quét LỚP nhưng chỉ có điểm-case: ảnh nền không-hồi-quy chỉ ghim prompt dàn ý**
  Người dùng thấy gì: Bài kiểm tra chống thụt lùi chỉ so sánh lại đúng phần dàn ý, còn năm mặt khác của prompt (nội dung slide, quiz, lời giảng, prompt hệ thống) không có bản đối chiếu — nếu vòng sau vô tình làm hỏng các mặt đó, sẽ không có cảnh báo nào bật lên.
  file: `packages/@openmaic/generation/test/no-regression-prompt.test.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 1 — đo CHỈ DẪN thay vì ĐẦU RA: «xoá bộ nhớ đệm» đo bằng grep tên biến trong mã nguồn**
  Người dùng thấy gì: Phép kiểm «Xoá bộ nhớ đệm có xoá hồ sơ bé không» hiện chỉ soi tên biến trong mã nguồn chứ không thực sự bấm nút và kiểm tra hồ sơ có biến mất hay không — một thay đổi âm thầm làm hồ sơ bé sống sót qua «Xoá bộ nhớ đệm» có thể không bị phát hiện.
  file: `tests/persistence/learner-profile-store.test.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 5 — tuyên ba đường soạn, chỉ đo hai: generateSceneActions không có assert nào**
  Người dùng thấy gì: Một trong các nơi bài soạn dùng hồ sơ người học không được kiểm tra là có dùng đúng bối cảnh hồ sơ hay không — nếu chỗ này lệch chuẩn, sẽ không có cảnh báo nào.
  file: `packages/@openmaic/generation/test/learner-in-scene-prompts.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 — lời hứa là QUAN HỆ «có gói ⇒ dàn ý khác», nhưng hai mẫu mù khác nhau ở HAI biến**
  Người dùng thấy gì: Cặp bài soạn dùng để so sánh «có gói khung» và «không có gói khung» trong phiên nghiệm thu hiện khác nhau ở nhiều điểm cùng lúc, nên người chấm có thể phân biệt được hai bài nhờ chi tiết khác chứ không hẳn nhờ gói khung — làm sai lệch kết quả phép thử.
  file: `scripts/gen-dan-y-mu.mjs`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 1 — đo LỜI KHAI của bên ghi thay vì sự thật: cờ prompt_surface_unchanged là hằng số**
  Người dùng thấy gì: Một cờ dùng để cảnh báo «ảnh chụp prompt đã cũ» luôn được ghi cứng là an toàn bất kể thực tế, nên cảnh báo này sẽ không bao giờ tự bật lên dù ảnh chụp đã lỗi thời.
  file: `packages/@openmaic/generation/test/no-regression-prompt.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — đo KHOÁ i18n thay vì chữ người đọc: quét «chuỗi kỹ thuật» chạy trên bản dịch giả**
  Người dùng thấy gì: Phép kiểm «không có chữ kỹ thuật lộ ra trên thẻ hồ sơ» hiện chạy trên dữ liệu giả lập, không phải trên chữ thật mà phụ huynh nhìn thấy ở bất kỳ ngôn ngữ nào — nếu bản dịch thật có sót từ kỹ thuật, phép kiểm này sẽ không phát hiện ra.
  file: `tests/settings/learner-profile-settings.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — assert «chuỗi có mặt» trong khi lời hứa là QUAN HỆ môn+lớp → gói trong sổ đăng ký**
  Người dùng thấy gì: Phép kiểm «ghép đúng gói khung theo môn và lớp» hiện chưa từng thử trường hợp thật sự tra cứu sổ đăng ký gói — nếu việc tra cứu đó bị hỏng, phép kiểm vẫn báo xanh.
  file: `tests/agent-runtime/learner-context.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — đo HÀM KIỂM thay vì ĐẦU RA của tuyến: E11 hứa 400/201 + khoá KV, bài kiểm chỉ gọi parseLearner**
  Người dùng thấy gì: Phép kiểm cho yêu cầu «mở phiên xưởng Pro với hồ sơ sai phải báo lỗi rõ ràng, hồ sơ đúng phải lưu lại» hiện chưa thực sự gọi qua đường mở phiên thật — nếu bước lưu hoặc bước báo lỗi bị bỏ sót, phép kiểm này không phát hiện ra.
  file: `tests/agent-runtime/learner-context.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — thông điệp ghim của chiều đỏ gắn vào assert chỉ soi FIXTURE, không gọi hàm bị đo**
  Người dùng thấy gì: Thông điệp cảnh báo gắn cho một phép kiểm về gói khung theo lớp học không khớp với phần thực sự có thể báo lỗi — người đọc kết quả kiểm sau này có thể hiểu nhầm lý do bài kiểm đỏ.
  file: `tests/curriculum/curriculum-packs.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 — assertion âm-tính-một-mình: cấm ghi cứng trạng thái gói, không có đối chứng dương**
  Người dùng thấy gì: Phép kiểm «gói khung không được lưu cứng vào hồ sơ» hiện chỉ cấm một vài cách viết mã cụ thể chứ chưa thực sự xác nhận trạng thái gói luôn được tính lại đúng lúc hiển thị — một cách lưu cứng khác có thể lọt qua mà không bị phát hiện.
  file: `tests/persistence/learner-profile-store.test.ts`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 9/24 lỗi rơi vào file không bộ đo nào phủ (packages/@openmaic/generation/test/no-regression-prompt.test.ts, tests/persistence/learner-profile-store.test.ts, packages/@openmaic/generation/test/learner-in-scene-prompts.test.ts, tests/settings/learner-profile-settings.test.ts, tests/agent-runtime/learner-context.test.ts, tests/curriculum/curriculum-packs.test.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
