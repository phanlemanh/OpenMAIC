## Trong hợp đồng

### New `curriculumAnchor` instruction contradicts the same prompt's "exactly three top-level keys" rule — the AC-7 fix rests on model luck
- AC: AC-7
- file: `lib/prompts/templates/interactive-outlines/user.md:15`
- severity: high
- source: conventions

The block added this round (`interactive-outlines/user.md:14-19`, `task-engine-outlines/user.md:12-17`) tells the model "Also return a `curriculumAnchor` field", but both templates hard-lock the output shape against it:

- `lib/prompts/templates/interactive-outlines/system.md:255` — "Your entire response MUST be a single JSON **object** with exactly these three top-level keys", followed by "**Never** wrap the response in any other structure" and `:308` "That object MUST have `languageDirective`, `courseTitle`, and `outlines` as top-level keys".
- `lib/prompts/templates/interactive-outlines/user.md:127` — the LAST line of the user message: "**Final reminder**: your entire response must be a JSON **object** with exactly three top-level keys …". The new instruction sits 112 lines above it and is overridden by recency and by the stronger "NON-NEGOTIABLE" framing.
- `lib/prompts/templates/task-engine-outlines/system.md:76` — same three-key shape.

This round's own captured evidence shows the model resolving the conflict against the new instruction: `_acceptance/hieu-be-dang-hoc-gi/evidence/E7-network.txt` records the anchor arriving **nested inside the first outline object** (`data: {"type":"outline","data":{"id":"scene_1", … ,"curriculumAnchor":"Unit 12 — Ratio and proportion, …"}}`), not as a top-level key.

Failure scenario: a learner profile with a matched pack generates in Ultra/interactive or vocational mode. The model obeys the emphatic three-key rule and omits `curriculumAnchor` entirely (or buries it where no consumer looks). `extractCurriculumAnchor` finds nothing, no SSE event is emitted, and `CurriculumAnchorLine` falls through to `guessingFor` and tells the parent the anchor is an unverified guess — exactly the AC-7 bug this commit claims to close, unchanged.

Two consumers also disagree about where the field lives, so the two generation paths behave differently for the same model output: `app/api/generate/scene-outlines-stream/route.ts:78` regexes the **whole** buffer (`CURRICULUM_ANCHOR_RE`), so it accidentally recovers a nested anchor — and ships the stray key inside the `SceneOutline` it streams and persists; `packages/@openmaic/generation/src/outline-generator.ts:179` reads only `parsed.curriculumAnchor` at the top level and silently drops a nested one.

The new guard does not catch this: `tests/generation/anchor-wiring.test.ts:50` only asserts the literal string `curriculumAnchor` appears somewhere in a template that contains `{{curriculumContext}}`, so it is green whether or not the prompt actually permits the field. Fixing this means amending the three-key output-shape statements (system.md and the final reminder) to admit an optional fourth key when a framework was supplied.

### The "đang đoán" banner prints the raw curriculum code to the parent (`No curriculum pack for moet yet`)
- AC: AC-14
- file: `app/generation-preview/page.tsx:1324`
- severity: medium
- source: conventions

`guessingFor` is fed `session.requirements.learner.subjects[0].curriculum` — the machine code (`moet`, `cambridge-lower-secondary`, `ib-myp`) — and `CurriculumAnchorLine` interpolates it straight into `t('preview.curriculumAnchor.guessing', { curriculum: guessingFor })`.

Confirmed by this round's captured evidence, `_acceptance/hieu-be-dang-hoc-gi/evidence/E8b-step2-neo-dang-doan.html:151`, which shows the live DOM text: "⚠ No curriculum pack for moet yet — this is an informed guess, not a checked match."

This breaks three things at once:
- CONTRIBUTING.md PR guidelines: "All UI text must be internationalized (i18n) — do not hardcode user-facing strings". The interpolated value is an untranslated identifier in all 12 locales.
- The feature's own stated rule, written in `components/settings/learner-profile-settings.tsx:9-11` ("chữ «Stage» và mọi mã khung KHÔNG được xuất hiện") and restated in `components/generation/curriculum-anchor-line.tsx:12-13` ("Luật chữ: … mã khung, nếu có, đứng sau và in nhỏ").
- The banner's whole purpose — it is the safety message aimed at a non-technical parent, and it is the one line of the feature that must read as plain language.

The existing pattern is one file over and was touched in this same commit: `components/generation/learner-subject-picker.tsx:90` renders the identical value as `t(\`home.learnerInvite.curriculum.${s.curriculum}\`)`. Verified those four keys (`moet`, `cambridge-lower-secondary`, `ib-myp`, `other`) exist in all 12 locale files, so the fix is to route `guessingFor` through the same translation before passing it down.

### Save read-back cannot tell "stored" from "storage returned nothing" — still reports Saved for a dropped write
- AC: AC-16
- file: `components/settings/learner-profile-settings.tsx:141`
- severity: medium
- source: conventions

`onSave` now does `await useLearnerProfileStore.persist.rehydrate()` and then compares `useLearnerProfileStore.getState().learner` against the value it just wrote. That comparison cannot fail in the case it is meant to detect.

When `getItem` resolves `null`, zustand's `hydrate()` (`node_modules/zustand/esm/middleware.mjs:387-419`) computes `[false, undefined]` and calls the default `merge` (`:333` — `{ ...currentState, ...persistedState }`) with `persistedState === undefined`, so `set(...)` writes the state back unchanged. The in-memory `learner` set moments earlier by `setLearner` survives the rehydrate, and `JSON.stringify(stored) === JSON.stringify(learner)` is trivially true. "Nothing is in storage" is therefore indistinguishable from "the value is in storage".

The second half of the guard, `isPersistUnavailable('learner-profile-storage')`, does not cover the gap, because two of the persist seam's refusal paths log without raising the health signal (`lib/store/kv-persist.ts:305-326`, `KeyState.admitWrite`): a write refused while the key is still `unhydrated` (logged as "A write to … issued before its storage hydrated was dropped; the stored value stands", `:257-263`, then `reportPersistHealth(name,'recovered')`), and a write refused while the key is `clearing` (no health report and no recovery request at all).

Failure scenario: the user opens Settings → Người học and saves while the key is still `unhydrated` (account-sync deployment, where the first `getItem` is a network round-trip) or races a "Xoá bộ nhớ đệm" clear. `admitWrite` refuses the write and it is never persisted; health stays clean because the refusal came from `unhydrated`/`clearing`; the subsequent read finds an empty key and returns `null`; rehydrate keeps the in-memory profile; `landed` is true and the card shows `ST-the-da-luu` plus the success toast — the exact "báo đã lưu cho một lượt ghi vừa trượt" the commit set out to remove, and the violation of rule #3 in this file's own header comment.

The repo already exposes the right question for this, with a doc comment saying so: `didLastReadFindStoredValue(name)` in `lib/store/kv-persist.ts:68` ("Bên gọi dùng nó để thôi hứa là đã thay một thứ máy kia chưa bao giờ đặt"), already consumed by `lib/store/account-stores.ts:110`. The check should combine it with the value comparison rather than relying on rehydrate's merge semantics.

### Curriculum anchor is silently truncated to 120 chars; the 200-char cap next to it is dead code
- AC: AC-7
- file: `app/api/generate/scene-outlines-stream/route.ts:114`
- severity: medium
- source: bugs

`extractCurriculumAnchor` does `normalizeStreamedTitle(match[1])` and then `.slice(0, 200)`, but `normalizeStreamedTitle` (`route.ts:83-92`) already ends with `normalized.slice(0, 120)` — it was written for course titles. The outer `.slice(0, 200)` can therefore never fire, and every anchor is cut at 120 characters mid-word before it is enqueued as the `curriculumAnchor` SSE event and rendered verbatim by `CurriculumAnchorLine`. The prompt (`packages/@openmaic/generation/templates/requirements-to-outlines/user.md` and the two `lib/prompts/templates/*-outlines/user.md`) asks for one sentence naming the unit *and* then the textbook name; the shipped pack's textbook string alone is 53 chars ("Cambridge Lower Secondary Mathematics Learner's Book 8"), so a compliant Vietnamese anchor routinely exceeds 120 and the parent sees a sentence chopped off. The non-streaming path in `packages/@openmaic/generation/src/outline-generator.ts:180` caps the same field at 200, so the two paths disagree on the same value. Use a dedicated normalizer with the 200 cap instead of reusing the title one.

### Anchor "guessing" warning renders the raw curriculum slug instead of the translated label
- AC: AC-14
- file: `app/generation-preview/page.tsx:1320`
- severity: low
- source: bugs

`guessingFor` is set from `session.requirements.learner.subjects[0].curriculum`, which is the machine code (`moet`, `ib-myp`, `cambridge-lower-secondary`), and `CurriculumAnchorLine` interpolates it straight into `preview.curriculumAnchor.guessing`. The parent reads "⚠ Chưa có gói khung cho ib-myp — máy đang đoán…". Every other surface translates the code first — `components/generation/learner-subject-picker.tsx` uses `t('home.learnerInvite.curriculum.' + s.curriculum)`, and those keys exist in all 12 locale files — and `components/settings/learner-profile-settings.tsx`'s header comment states the rule explicitly: no framework codes on parent-facing surfaces. Pass `t('home.learnerInvite.curriculum.' + code)` here as well.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Save-confirmation compares objects by JSON key order, so a successful save reports "couldn't save" on any Postgres-backed account scope**
  Người dùng thấy gì: Trên các bản triển khai dùng cơ sở dữ liệu máy chủ, việc lưu hồ sơ con thực ra thành công nhưng màn hình vẫn báo "chưa lưu được", khiến phụ huynh tưởng nhầm và có thể thử lưu lại nhiều lần không cần thiết.
  file: `components/settings/learner-profile-settings.tsx`
  severity: high
  Đề xuất: known-limits

- **formatLearnerContext tells the model "no curriculum pack — say you're guessing" in the same prompt that carries the pack body**
  Người dùng thấy gì: Nếu một gói khung mới ra mắt sau khi hồ sơ bé đã được lưu, bài soạn ra có thể vừa nói với phụ huynh "chưa có gói, máy đang đoán" vừa thực ra dùng đúng nội dung sách giáo trình — lời cảnh báo không khớp với bài thật.
  file: `packages/@openmaic/generation/src/prompt-formatters.ts`
  severity: high
  Đề xuất: known-limits

- **Curriculum pack registry only guards against unparseable JSON, not malformed shape, so one bad pack file crashes every caller**
  Người dùng thấy gì: Nếu một tệp gói khung giáo trình bị lỗi định dạng (ví dụ thiếu thông tin khối lớp), toàn bộ việc soạn bài có thể bị gián đoạn cho mọi phụ huynh cho tới khi máy chủ khởi động lại.
  file: `lib/server/curriculum-packs.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 — assert «chuỗi có mặt» trong mã nguồn, trong khi lời hứa là QUAN HỆ giữa giá trị luồng và giá trị phiên**
  Người dùng thấy gì: Bài kiểm chỉ dò tên biến trong mã nguồn chứ chưa thực sự bật trang xem trước lên để kiểm dòng neo, nên nếu dòng neo bị lỗi trong tương lai, phép kiểm này có thể không phát hiện ra.
  file: `tests/generation/anchor-wiring.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình 4 — assertion âm-tính-một-mình: bộ lọc rỗng-là-xanh, không đối chứng dương rằng có khuôn nào được soi**
  Người dùng thấy gì: Phép kiểm hiện tại có thể báo "đạt" ngay cả khi không còn khuôn soạn bài nào thực sự được kiểm tra, nếu tên trường dữ liệu trong khuôn bị đổi.
  file: `tests/generation/anchor-wiring.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 — tuyên nhãn ĐỦ ba phần «môn — chương trình (ngôn ngữ)» nhưng chỉ có một điểm-case**
  Người dùng thấy gì: Phép kiểm hiện chỉ xác nhận một phần của nhãn "môn — chương trình (ngôn ngữ)" ở ô chọn môn, nên nếu phần tên chương trình học bị rớt khỏi nhãn hiển thị trong tương lai, phép kiểm vẫn có thể báo đạt.
  file: `tests/generation/anchor-wiring.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 — luật phủ khung khai BẢY dòng trạng thái nhưng bộ assert chỉ có SÁU, dòng thứ bảy được miễn ngay trong cùng bước**
  Người dùng thấy gì: Tài liệu nghiệm thu cho phép bỏ qua việc chụp ảnh minh chứng cho một trạng thái màn hình mới thêm (đang lưu), nên vòng nghiệm thu vẫn có thể coi là đạt dù trạng thái đó chưa từng được nhìn thấy thật.
  file: `_acceptance/hieu-be-dang-hoc-gi/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình 2 — kho giả VIẾT TAY đúng khuôn bên đọc: chốt «không được báo đã lưu» không round-trip qua bên ghi thật**
  Người dùng thấy gì: Bài kiểm dùng một kho lưu giả tự dựng thay vì đường lưu thật của sản phẩm, nên một lỗi thật ở đường lưu (ví dụ báo sai kết quả đã lưu) có thể không bị phát hiện bởi riêng bài kiểm này.
  file: `tests/settings/learner-profile-settings.test.ts`
  severity: medium
  Đề xuất: known-limits

- **`learner` is unvalidated at the /api/generate/scene-outlines-stream boundary while the sibling route validates the identical payload (r1)**
  Người dùng thấy gì: Nếu phụ huynh gửi một hồ sơ có dữ liệu môn học sai định dạng ở cửa soạn nhanh (không phải xưởng Pro), sản phẩm có thể báo lỗi chung chung thay vì chỉ rõ cần sửa gì, và các trường như tên bé/trường/sách có thể không bị giới hạn độ dài trước khi đưa vào bài soạn.
  file: `app/api/generate/scene-outlines-stream/route.ts`
  severity: medium
  Đề xuất: new-contract

- **Server caps subjects at 12 and hard-fails session creation; the settings card has no cap (r1)**
  Người dùng thấy gì: Nếu phụ huynh thêm quá 12 môn vào hồ sơ, mọi lần mở xưởng Pro sau đó sẽ thất bại mà không có gợi ý nào chỉ ra nguyên nhân là do hồ sơ có quá nhiều môn.
  file: `lib/server/agent-runtime/learner-context.ts`
  severity: medium
  Đề xuất: known-limits

- **`slice(0, 200)` on the streamed anchor is dead — normalizeStreamedTitle already caps at 120 (r1)**
  Người dùng thấy gì: Với những dòng neo dài (khoảng 121-200 ký tự), bản xem trước theo thời gian thực có thể cắt cụt câu neo giữa chừng, trong khi các đường soạn khác giữ nguyên câu đầy đủ.
  file: `app/api/generate/scene-outlines-stream/route.ts`
  severity: low
  Đề xuất: known-limits

- **Unused import `subjectKey` in app/page.tsx (r1)**
  Người dùng thấy gì: Một dòng import không dùng tới có thể khiến việc kiểm tra chất lượng mã tự động báo lỗi, không ảnh hưởng gì đến trải nghiệm phụ huynh.
  file: `app/page.tsx`
  severity: low
  Đề xuất: wont-fix

- **Server-side learner snapshot is never deleted — child's name/school keeps being injected into agent prompts after the user clears everything (r1)**
  Người dùng thấy gì: Sau khi phụ huynh dùng «Xoá bộ nhớ đệm» để xoá dữ liệu của bé, tên và trường của bé vẫn có thể tiếp tục được đưa vào các phiên soạn bài xưởng Pro sau đó, vì bản sao lưu phía máy chủ không được xoá theo.
  file: `lib/server/agent-runtime/learner-context.ts`
  severity: medium
  Đề xuất: new-contract

- **A profile with more than 12 subjects makes every Pro session creation fail with 400, and the UI has no cap (r1)**
  Người dùng thấy gì: Nếu phụ huynh thêm quá 12 môn vào hồ sơ, mọi lần mở xưởng Pro sau đó sẽ thất bại mà không có gợi ý nào chỉ ra nguyên nhân là do hồ sơ có quá nhiều môn.
  file: `lib/server/agent-runtime/learner-context.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét LỚP nhưng chỉ có điểm-case: ảnh nền không-hồi-quy chỉ ghim prompt dàn ý (r1)**
  Người dùng thấy gì: Bài kiểm tra chống thụt lùi chỉ so sánh lại đúng phần dàn ý, còn năm mặt khác của prompt (nội dung slide, quiz, lời giảng, prompt hệ thống) không có bản đối chiếu — nếu vòng sau vô tình làm hỏng các mặt đó, sẽ không có cảnh báo nào bật lên.
  file: `packages/@openmaic/generation/test/no-regression-prompt.test.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 1 — đo CHỈ DẪN thay vì ĐẦU RA: «xoá bộ nhớ đệm» đo bằng grep tên biến trong mã nguồn (r1)**
  Người dùng thấy gì: Phép kiểm «Xoá bộ nhớ đệm có xoá hồ sơ bé không» hiện chỉ soi tên biến trong mã nguồn chứ không thực sự bấm nút và kiểm tra hồ sơ có biến mất hay không — một thay đổi âm thầm làm hồ sơ bé sống sót qua «Xoá bộ nhớ đệm» có thể không bị phát hiện.
  file: `tests/persistence/learner-profile-store.test.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 5 — tuyên ba đường soạn, chỉ đo hai: generateSceneActions không có assert nào (r1)**
  Người dùng thấy gì: Một trong các nơi bài soạn dùng hồ sơ người học không được kiểm tra là có dùng đúng bối cảnh hồ sơ hay không — nếu chỗ này lệch chuẩn, sẽ không có cảnh báo nào.
  file: `packages/@openmaic/generation/test/learner-in-scene-prompts.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 — đo LỜI KHAI của bên ghi thay vì sự thật: cờ prompt_surface_unchanged là hằng số (r1)**
  Người dùng thấy gì: Một cờ dùng để cảnh báo «ảnh chụp prompt đã cũ» luôn được ghi cứng là an toàn bất kể thực tế, nên cảnh báo này sẽ không bao giờ tự bật lên dù ảnh chụp đã lỗi thời.
  file: `packages/@openmaic/generation/test/no-regression-prompt.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — assert «chuỗi có mặt» trong khi lời hứa là QUAN HỆ môn+lớp → gói trong sổ đăng ký (r1)**
  Người dùng thấy gì: Phép kiểm «ghép đúng gói khung theo môn và lớp» hiện chưa từng thử trường hợp thật sự tra cứu sổ đăng ký gói — nếu việc tra cứu đó bị hỏng, phép kiểm vẫn báo xanh.
  file: `tests/agent-runtime/learner-context.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — đo HÀM KIỂM thay vì ĐẦU RA của tuyến: E11 hứa 400/201 + khoá KV, bài kiểm chỉ gọi parseLearner (r1)**
  Người dùng thấy gì: Phép kiểm cho yêu cầu «mở phiên xưởng Pro với hồ sơ sai phải báo lỗi rõ ràng, hồ sơ đúng phải lưu lại» hiện chưa thực sự gọi qua đường mở phiên thật — nếu bước lưu hoặc bước báo lỗi bị bỏ sót, phép kiểm này không phát hiện ra.
  file: `tests/agent-runtime/learner-context.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — thông điệp ghim của chiều đỏ gắn vào assert chỉ soi FIXTURE, không gọi hàm bị đo (r1)**
  Người dùng thấy gì: Thông điệp cảnh báo gắn cho một phép kiểm về gói khung theo lớp học không khớp với phần thực sự có thể báo lỗi — người đọc kết quả kiểm sau này có thể hiểu nhầm lý do bài kiểm đỏ.
  file: `tests/curriculum/curriculum-packs.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 — assertion âm-tính-một-mình: cấm ghi cứng trạng thái gói, không có đối chứng dương (r1)**
  Người dùng thấy gì: Phép kiểm «gói khung không được lưu cứng vào hồ sơ» hiện chỉ cấm một vài cách viết mã cụ thể chứ chưa thực sự xác nhận trạng thái gói luôn được tính lại đúng lúc hiển thị — một cách lưu cứng khác có thể lọt qua mà không bị phát hiện.
  file: `tests/persistence/learner-profile-store.test.ts`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 5/13 lỗi rơi vào file không bộ đo nào phủ (tests/generation/anchor-wiring.test.ts, _acceptance/hieu-be-dang-hoc-gi/evals.yaml, tests/settings/learner-profile-settings.test.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.