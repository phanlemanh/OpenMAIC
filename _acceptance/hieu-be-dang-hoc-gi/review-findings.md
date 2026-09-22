# Review Findings: hieu-be-dang-hoc-gi (round 4)

## Trong hợp đồng

### Anchor picks the wrong unit from loose substring matching — a probability lesson is announced as "Unit 8 · Hình và đối xứng"
- file: `lib/server/curriculum-anchor.ts:48`
- severity: high
- AC: AC-7
- source: bugs

`unitPhrases` keeps any phrase of 3+ characters and `matchUnit` scores it with a bare `haystack.includes(phrase)` — no word boundary, no weighting — over the requirement plus every outline title and description concatenated. Ties are broken by table order, so an earlier unit wins on an equal score. Vietnamese unit names produce very common short phrases: unit 5 yields "góc", unit 8 yields "hình".

Verified against the shipped pack (skills/agent-runtime/cambridge-lower-secondary-maths-8/curriculum-pack.json) by calling `deriveCurriculumAnchor` directly:
requirement 'ôn tập xác suất cho bé', one outline described as 'Dùng hình vẽ minh hoạ các khả năng xảy ra', language vi-VN
→ "Unit 8 · Hình và đối xứng — Cambridge Lower Secondary Mathematics Learner's Book 8"

The word "hình" inside an incidental phrase ("hình vẽ minh hoạ") scores unit 8 at 1, ties with unit 13 ("xác suất"), and wins on position. The parent — explicitly the non-expert audience this line is written for — is told, with no hedge, that the lesson is anchored to the wrong unit. This is the exact failure E7c names as red ('anchor names the wrong unit'); the existing tests only exercise requirements that happen to match cleanly.

Suggested fix: require whole-token matches (segment on non-letter boundaries rather than `includes`), raise the minimum phrase length / drop single common tokens, and fall back to the textbook-only anchor when the top score is 1 or the top two scores tie.

Rationale (map to hợp đồng): AC-7 hứa dòng neo chỉ nêu tên unit khi unit đó thật sự khớp đề hoặc dàn ý; finding chứng minh bằng ví dụ tái hiện được rằng cơ chế khớp hiện tại chọn nhầm một unit không liên quan, vi phạm trực tiếp lời hứa này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **@openmaic/dsl publishable source changed without a version bump (CI gate fails)**
  Người dùng thấy gì: Thay đổi này không ảnh hưởng gì tới trải nghiệm phụ huynh; đây là việc quy trình nội bộ (đánh số phiên bản gói) cần xử lý trước khi gộp mã.
  file: `packages/@openmaic/dsl/package.json:3`
  severity: high
  Đề xuất: known-limits

- **@openmaic/generation publishable sources and templates changed without a version bump**
  Người dùng thấy gì: Thay đổi này không ảnh hưởng gì tới trải nghiệm phụ huynh; đây là việc quy trình nội bộ (đánh số phiên bản gói) cần xử lý trước khi gộp mã.
  file: `packages/@openmaic/generation/package.json:3`
  severity: high
  Đề xuất: known-limits

- **Client-supplied `requirements.learner` reaches the prompt with no shape validation**
  Người dùng thấy gì: Nếu dữ liệu gửi lên bị sai định dạng hoặc quá lớn, yêu cầu soạn bài có thể báo lỗi chung chung thay vì một lời nhắc rõ ràng, và không có giới hạn cho lượng dữ liệu về bé được gửi cho mô hình.
  file: `app/api/generate/scene-outlines-stream/route.ts:324`
  severity: medium
  Đề xuất: known-limits

- **Curriculum pack registry only guards JSON parse errors, not pack shape — a malformed pack crashes every generate request**
  Người dùng thấy gì: Nếu một file gói giáo trình trên máy chủ bị thiếu trường dữ liệu, các yêu cầu soạn bài có hồ sơ học sinh có thể bị lỗi, không chỉ môn liên quan tới file đó.
  file: `lib/server/curriculum-packs.ts:42`
  severity: medium
  Đề xuất: known-limits

- **Unused import `subjectKey` left in app/page.tsx**
  Người dùng thấy gì: Không ảnh hưởng gì tới trải nghiệm phụ huynh; đây chỉ là một dòng mã thừa bị công cụ kiểm tra mã nêu ra.
  file: `app/page.tsx:58`
  severity: low
  Đề xuất: known-limits

- **Guess-mode is decided from a frozen packId, so the prompt can declare "no curriculum pack" in the same request that injects the pack**
  Người dùng thấy gì: Có lúc nội dung gửi cho AI có thể nói 'chưa có sách giáo khoa để bám theo' trong khi màn hình lại hiện chắc chắn một đường dẫn tới chương sách cho cùng bài soạn đó, gây thông tin mâu thuẫn.
  file: `packages/@openmaic/generation/src/prompt-formatters.ts:169`
  severity: high
  Đề xuất: known-limits

- **Preview shows the "no curriculum pack — machine is guessing" warning for the whole outline stream, even when a pack exists**
  Người dùng thấy gì: Trong lúc bài đang được soạn, phụ huynh có thể tạm thời thấy dòng cảnh báo 'chưa có sách, máy đang đoán' dù môn đó thực ra có sách, trước khi dòng đúng hiện ra lúc soạn xong.
  file: `app/generation-preview/page.tsx:1329`
  severity: medium
  Đề xuất: known-limits

- **A pack whose SKILL.md is missing yields a confident anchor with no framework text in the prompt**
  Người dùng thấy gì: Trong một số cách cài đặt đặc biệt, máy có thể hiện một đường dẫn chương sách rất chắc chắn cho phụ huynh dù thực ra không có nội dung sách nào được đưa cho AI.
  file: `lib/server/curriculum-packs.ts:73`
  severity: low
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng chỉ có điểm-case: đếm chỗ gọi bằng cận dưới >= 2**
  Người dùng thấy gì: Đây là vấn đề của bộ kiểm thử nội bộ, không phải điều phụ huynh gặp phải; nó có nghĩa một lỗi trong tương lai ở chỗ này có thể lọt qua mà không ai biết.
  file: `tests/hooks/continuation-requirements.test.ts:43`
  severity: high
  Đề xuất: known-limits

- **Assert giá trị có mặt trong khi lời hứa là QUAN HỆ: cờ tự-khai của ảnh nền không bao giờ đỏ được**
  Người dùng thấy gì: Đây là lỗ hổng trong công cụ kiểm tra nội bộ; nó không tự nó cho thấy có gì sai với những gì phụ huynh nhìn thấy, nhưng nghĩa là một lỗi thật ở khu vực này có thể không bị phát hiện.
  file: `packages/@openmaic/generation/test/no-regression-prompt.test.ts:31`
  severity: high
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng chỉ có điểm-case: E9 hứa bốn mặt prompt, ảnh nền chỉ có một**
  Người dùng thấy gì: Việc đo lường tự động hiện chỉ kiểm tra một phần lời hứa 'giữ nguyên như trước'; phần còn lại (nội dung slide, quiz, lời giảng) có thể thay đổi mà không phép đo tự động nào bắt được.
  file: `_acceptance/hieu-be-dang-hoc-gi/evals.yaml:142`
  severity: high
  Đề xuất: known-limits

- **Assert chuỗi có mặt trong khi lời hứa là QUAN HỆ: «xoá bộ nhớ đệm» đo bằng substring tên hằng**
  Người dùng thấy gì: Đây là vấn đề của bài kiểm nội bộ; nó không chứng minh nút Xoá bộ nhớ đệm hiện đang bỏ sót dữ liệu nào, chỉ là nếu sau này có bỏ sót thì bài kiểm này sẽ không bắt được.
  file: `tests/persistence/learner-profile-store.test.ts:46`
  severity: medium
  Đề xuất: known-limits

- **Đo CHỈ DẪN thay vì ĐẦU RA: quét «chuỗi kỹ thuật lọt lên thẻ» trên khoá i18n, không trên chữ phụ huynh đọc**
  Người dùng thấy gì: Không có bằng chứng phụ huynh hiện đang thấy chữ khó hiểu trên thẻ; vấn đề là bài kiểm nội bộ hiện không có khả năng phát hiện nếu điều đó xảy ra.
  file: `tests/settings/learner-profile-settings.test.ts:240`
  severity: medium
  Đề xuất: known-limits

- **Fixture VIẾT TAY đúng khuôn bên đọc: phép gấp NFC không có lượt round-trip nào**
  Người dùng thấy gì: Không có bằng chứng việc gõ dấu tiếng Việt theo cách khác đang làm sai kết quả cho phụ huynh; bài kiểm nội bộ chỉ chưa từng thử tình huống đó.
  file: `tests/curriculum/curriculum-anchor.test.ts:14`
  severity: medium
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng chỉ có điểm-case: E10 khai ba đường sinh dùng chung bộ định dạng, chỉ đo hai**
  Người dùng thấy gì: Việc đo lường tự động hiện chỉ kiểm tra hai trong ba nơi hồ sơ bé được dùng; nơi thứ ba (lời giảng) có thể lệch chuẩn mà không phép đo tự động nào bắt được.
  file: `_acceptance/hieu-be-dang-hoc-gi/evals.yaml:149`
  severity: medium
  Đề xuất: known-limits

- **Đo CHỈ DẪN thay vì ĐẦU RA: dòng cảnh báo «đang đoán» đo bằng tên khoá dịch**
  Người dùng thấy gì: Không có bằng chứng phụ huynh hiện đang thấy mã kỹ thuật ở dòng cảnh báo 'đang đoán'; bài kiểm nội bộ hiện không có khả năng phát hiện nếu điều đó xảy ra.
  file: `tests/components/curriculum-anchor-line.test.ts:55`
  severity: low
  Đề xuất: known-limits

### CARRIED (từ round trước — tệp không đổi, round này không chấm lại)

- **with-dev-server.sh dựng `pnpm dev` KHÔNG qua with-pinned-node.sh — đúng thứ kho đã lập lớp để cấm (r3)**
  Người dùng thấy gì: Kết quả đo tự động của tính năng này có thể chạy trên một phiên bản máy khác với phiên bản dùng để kiểm, nên một báo cáo xanh chưa chắc phản ánh đúng sản phẩm thật.
  file: `scripts/with-dev-server.sh`
  severity: medium
  Đề xuất: known-limits

- **with-dev-server.sh dùng lại BẤT KỲ máy chủ nào đang nghe cổng, không kiểm cờ build-time — điều kiện ngầm quay lại bằng cửa khác (r3)**
  Người dùng thấy gì: Nếu máy đo tái sử dụng một máy chủ có sẵn với cấu hình khác cấu hình đúng, kết quả kiểm tính năng có thể không đáng tin dù báo cáo hiện xanh.
  file: `scripts/with-dev-server.sh`
  severity: medium
  Đề xuất: known-limits

- **with-dev-server.sh dùng lại bất kỳ thứ gì trả lời trên cổng, không kiểm cấu hình (r3)**
  Người dùng thấy gì: Nếu máy đo tái sử dụng một máy chủ có cấu hình khác, kết quả kiểm tính năng có thể không đáng tin dù báo cáo hiện xanh.
  file: `scripts/with-dev-server.sh`
  severity: low
  Đề xuất: known-limits

- **Hình dạng #5 — tuyên quét LỚP «đủ mọi kho phạm vi account» nhưng chỉ grep một định danh (r3)**
  Người dùng thấy gì: Nút 'Xoá bộ nhớ đệm' có thể trong tương lai bỏ sót việc xoá hồ sơ của bé mà không ai phát hiện ra, vì phép kiểm hiện không đủ chặt để báo động.
  file: `tests/persistence/learner-profile-store.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng #4 — assert âm-tính-một-mình, và soi nhầm tệp (r3)**
  Người dùng thấy gì: Trạng thái 'đã có gói khung hay chưa' có thể trong tương lai bị đóng băng sai mà không phép kiểm nào bắt được.
  file: `tests/persistence/learner-profile-store.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng #2 — fixture tự chứng thực cho bên đọc: assert một cờ do chính bên ghi đặt cứng (r3)**
  Người dùng thấy gì: Phép kiểm 'không đổi hành vi cũ khi chưa có hồ sơ' có thể xanh giả, khiến một thay đổi ngoài ý muốn lọt qua mà không ai biết.
  file: `packages/@openmaic/generation/test/no-regression-prompt.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng #1 — đo KHOÁ i18n thay vì chữ người dùng đọc, không có phép đo nào chắn 12 locale (r3)**
  Người dùng thấy gì: Nếu thiếu một dòng chữ dịch ở một trong 12 ngôn ngữ, phụ huynh dùng ngôn ngữ đó có thể thấy một đoạn mã kỹ thuật thay vì câu cảnh báo dễ hiểu.
  file: `tests/components/curriculum-anchor-line.test.ts`
  severity: low
  Đề xuất: known-limits

- **formatLearnerContext tells the model "no curriculum pack — say you're guessing" in the same prompt that carries the pack body (r2)**
  Người dùng thấy gì: Nếu một gói khung mới ra mắt sau khi hồ sơ bé đã được lưu, bài soạn ra có thể vừa nói với phụ huynh "chưa có gói, máy đang đoán" vừa thực ra dùng đúng nội dung sách giáo trình — lời cảnh báo không khớp với bài thật.
  file: `packages/@openmaic/generation/src/prompt-formatters.ts`
  severity: high
  Đề xuất: known-limits

- **Unused import `subjectKey` in app/page.tsx (r1)**
  Người dùng thấy gì: Một dòng import không dùng tới có thể khiến việc kiểm tra chất lượng mã tự động báo lỗi, không ảnh hưởng gì đến trải nghiệm phụ huynh.
  file: `app/page.tsx`
  severity: low
  Đề xuất: wont-fix

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

## Chưa adversarial-verify (refuter chết)

(không có mục nào round này)

⚠ Cụm ngoài vùng phủ: 10/17 lỗi rơi vào file không bộ đo nào phủ (packages/@openmaic/dsl/package.json, packages/@openmaic/generation/package.json, tests/hooks/continuation-requirements.test.ts, packages/@openmaic/generation/test/no-regression-prompt.test.ts, _acceptance/hieu-be-dang-hoc-gi/evals.yaml, tests/persistence/learner-profile-store.test.ts, tests/settings/learner-profile-settings.test.ts, tests/curriculum/curriculum-anchor.test.ts, tests/components/curriculum-anchor-line.test.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.