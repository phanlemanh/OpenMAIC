# Review Findings: hieu-be-dang-hoc-gi (round 5)

## Trong hợp đồng

### Hình dạng 5 (tuyên cả lớp nhưng chỉ có một điểm): E9 hứa byte-bằng cho dàn ý/slide/quiz/lời giảng và courseSystemPrompt, ảnh nền chỉ có dàn ý
- file: `packages/@openmaic/generation/test/no-regression-prompt.test.ts:37`
- severity: medium
- AC: AC-9
- source: measurement

E9 hứa rằng khi không có learner thì «prompt dàn ý / slide / quiz / lời giảng BẰNG TỪNG BYTE với tệp nền», và courseSystemPrompt không có khối learner. Tệp prompts-40f1cf9.json chỉ có hai khoá `outline` và `outlineLegacyProfile`, và scripts/pin-prompt-baseline.mjs cũng chỉ ghim đúng hai fixture dàn ý đó. Không có ma trận viết trước gồm bốn loại prompt, không có ảnh nền cho slide/quiz/actions, và không test nào trong repo gọi courseSystemPrompt. Các template slide-content/quiz-content đều đã bị sửa trong vòng này (có trong diff) nhưng không được đo không-hồi-quy.

Rationale (map to hợp đồng): AC-9 liệt kê rõ dàn ý, nội dung và prompt hệ thống đều phải không đổi khi hồ sơ trống; finding cho thấy chỉ dàn ý có ảnh nền so sánh, nội dung và prompt hệ thống không được đo dù mẫu đã sửa trong vòng này.

### Hình dạng 5 (tuyên cả lớp nhưng chỉ có điểm): E10 hứa ba hàm cùng nhận khối từ formatLearnerContext, test chỉ đo hai
- file: `packages/@openmaic/generation/test/learner-in-scene-prompts.test.ts:46`
- severity: medium
- AC: AC-10
- source: measurement

E10 hứa «generateSlideContent, generateQuizContent … và generateSceneActions (qua userProfile) đều nhận khối từ cùng formatLearnerContext», kèm chiều đỏ ghim '<tên hàm>' cho từng hàm. Tệp test chỉ có hai ca slide và quiz (qua generateSceneContent). Không có ca nào cho generateSceneActions, cũng không có vế đỏ 'learner context diverged from the shared formatter: generateSceneActions'. Ma trận ba phần tử chỉ có hai assert.

Rationale (map to hợp đồng): AC-10 nêu đích danh slide, quiz và lời giảng đều phải nhận khối hồ sơ từ cùng bộ định dạng; finding cho thấy chỉ slide và quiz có bài kiểm, lời giảng không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Learner profile from the request body goes into the outline and scene prompts without validation, although a validator for it already exists**
  Người dùng thấy gì: Nếu hồ sơ bị lỗi định dạng khi gửi lên, một số màn soạn bài có thể báo lỗi và không ra được bài, thay vì bỏ qua thông tin sai.
  file: `app/api/generate/scene-outlines-stream/route.ts`
  severity: medium
  Đề xuất: known-limits

- **A curriculum pack file that parses but has the wrong shape brings down every request that uses a learner profile**
  Người dùng thấy gì: Một gói khung giáo trình bị lỗi định dạng có thể làm mọi bài soạn có hồ sơ người học bị lỗi, không soạn được.
  file: `lib/server/curriculum-packs.ts`
  severity: medium
  Đề xuất: known-limits

- **Class labels are hard-coded in Vietnamese in the UI, breaking the rule that all UI text must be translated**
  Người dùng thấy gì: Người dùng ngôn ngữ khác tiếng Việt vẫn thấy chữ "lớp" bằng tiếng Việt trong ô chọn lớp.
  file: `components/settings/learner-profile-settings.tsx`
  severity: medium
  Đề xuất: known-limits

- **Additive, compatible package changes got a minor bump, which in 0.x signals a breaking change**
  Người dùng thấy gì: Số phiên bản gói phần mềm báo hiệu một thay đổi phá vỡ dù thực tế không có gì phá vỡ, có thể khiến nơi khác dùng gói này ngại nâng cấp.
  file: `packages/@openmaic/dsl/package.json`
  severity: low
  Đề xuất: known-limits

- **Unrelated one-line change in the sessions route**
  Người dùng thấy gì: Không có ảnh hưởng nào tới người dùng; chỉ là một dòng dọn dẹp không liên quan lẫn vào bản thay đổi.
  file: `app/api/agent/sessions/route.ts`
  severity: low
  Đề xuất: wont-fix

- **The prompt tells the model it has no curriculum pack, while the same prompt includes the pack**
  Người dùng thấy gì: Có lúc bài soạn ra vừa dùng đúng nội dung sách giáo trình vừa tự nói với người dùng là đang đoán vì không có sách, gây hiểu lầm về độ tin cậy của bài.
  file: `packages/@openmaic/generation/src/prompt-formatters.ts`
  severity: high
  Đề xuất: new-contract

- **The "guessing / no pack" warning appears whenever the anchor is missing, including while outlines are still streaming**
  Người dùng thấy gì: Trong lúc bài đang được soạn, phụ huynh có thể thấy cảnh báo "đang đoán, chưa có sách" dù bé có sách, rồi cảnh báo tự biến mất sau khi soạn xong.
  file: `app/generation-preview/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **The learner profile card is filled from the store only once, when it mounts, and never picks up the profile if it loads later**
  Người dùng thấy gì: Nếu hồ sơ bé tải chậm, thẻ khai hồ sơ có thể hiện trống dù đã có hồ sơ, và nếu phụ huynh lưu ngay lúc đó có thể làm mất các môn đã khai trước.
  file: `components/settings/learner-profile-settings.tsx`
  severity: medium
  Đề xuất: known-limits

- **A stored profile that fails validation is silently dropped in the Pro workbench, with no log**
  Người dùng thấy gì: Nếu hồ sơ đã lưu bị lỗi nhẹ (ví dụ khai quá nhiều môn), xưởng Pro âm thầm soạn như không có hồ sơ mà không báo cho ai biết.
  file: `lib/server/agent-runtime/learner-context.ts`
  severity: low
  Đề xuất: known-limits

- **Pack matching compares the free-text subject exactly, and the subject is not trimmed on save**
  Người dùng thấy gì: Nếu tên môn học có khoảng trắng thừa hoặc viết hoa khác đi, gói khung đúng ra khớp sẽ không được gắn, dù màn hình có báo rõ là chưa có gói.
  file: `lib/server/curriculum-packs.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình) + 1 (đo mã nguồn thay vì đầu ra): phép đo 'pack match frozen into the stored profile' không bao giờ đỏ được, vì mã gói bị đóng băng ở một tệp khác**
  Người dùng thấy gì: Bằng chứng cho rằng mã gói không bị lưu cứng vào hồ sơ đã lưu có thể không thực sự đúng, nhưng phép đo hiện tại sẽ luôn báo đạt dù sai.
  file: `tests/persistence/learner-profile-store.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc) + 3 (chuỗi có mặt thay vì quan hệ): phép đo đầu-cuối tự điền packId nên không thấy prompt tự mâu thuẫn**
  Người dùng thấy gì: Bài kiểm cho luồng soạn dàn ý có thể không phát hiện được trường hợp bài soạn vừa có sách vừa tự nói đang đoán vì không có sách.
  file: `tests/generation/outline-stream-learner.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (thông điệp ghim nằm trên một assert tự khẳng định): chiều đỏ 'pack matched without grade equivalence' không bao giờ bắn**
  Người dùng thấy gì: Bài kiểm cho việc gói phải khớp đúng lớp có thể không thực sự phát hiện khi gói bị gắn nhầm lớp.
  file: `tests/curriculum/curriculum-packs.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận thiếu một nhánh đã khai): E5b liệt kê nhánh «hồ sơ trống sau khi từng có → xoá luôn lựa chọn nhớ» nhưng không có assert**
  Người dùng thấy gì: Khi hồ sơ bé bị xoá hết, ô nhớ môn đang chọn trước đó có thể không được dọn sạch, dù phần khác của màn hình vẫn hiện đúng lời mời khai hồ sơ.
  file: `tests/store/selected-subject.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 6 (đường dẫn gốc hardcode): đầu vào của S4 ghim checkout của tác giả thay vì cây đang kiểm**
  Người dùng thấy gì: Nếu vòng nghiệm thu chạy trên một bản sao mã khác, kết quả kiểm tra có thể vô tình đọc nhầm tài liệu từ máy của người viết tính năng thay vì bản đang được kiểm, khiến kết quả sai lệch.
  file: `_acceptance/hieu-be-dang-hoc-gi/s4-args.json`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo khoá chỉ dẫn thay vì chữ hiện ra): dòng cảnh báo «đang đoán» được assert bằng tên khoá i18n**
  Người dùng thấy gì: Nội dung cảnh báo "đang đoán" thật sự hiển thị cho phụ huynh ở từng ngôn ngữ chưa được kiểm tra là dịch đúng và đọc được.
  file: `tests/components/curriculum-anchor-line.test.ts`
  severity: low
  Đề xuất: known-limits

### CARRIED (từ round trước — tệp không đổi, round này không chấm lại)

- **Client-supplied `requirements.learner` reaches the prompt with no shape validation (r4)**
  Người dùng thấy gì: Nếu dữ liệu gửi lên bị sai định dạng hoặc quá lớn, yêu cầu soạn bài có thể báo lỗi chung chung thay vì một lời nhắc rõ ràng, và không có giới hạn cho lượng dữ liệu về bé được gửi cho mô hình.
  file: `app/api/generate/scene-outlines-stream/route.ts`
  severity: medium
  Đề xuất: known-limits

- **Curriculum pack registry only guards JSON parse errors, not pack shape — a malformed pack crashes every generate request (r4)**
  Người dùng thấy gì: Nếu một file gói giáo trình trên máy chủ bị thiếu trường dữ liệu, các yêu cầu soạn bài có hồ sơ học sinh có thể bị lỗi, không chỉ môn liên quan tới file đó.
  file: `lib/server/curriculum-packs.ts`
  severity: medium
  Đề xuất: known-limits

- **Unused import `subjectKey` left in app/page.tsx (r4)**
  Người dùng thấy gì: Không ảnh hưởng gì tới trải nghiệm phụ huynh; đây chỉ là một dòng mã thừa bị công cụ kiểm tra mã nêu ra.
  file: `app/page.tsx`
  severity: low
  Đề xuất: known-limits

- **Guess-mode is decided from a frozen packId, so the prompt can declare "no curriculum pack" in the same request that injects the pack (r4)**
  Người dùng thấy gì: Có lúc nội dung gửi cho AI có thể nói 'chưa có sách giáo khoa để bám theo' trong khi màn hình lại hiện chắc chắn một đường dẫn tới chương sách cho cùng bài soạn đó, gây thông tin mâu thuẫn.
  file: `packages/@openmaic/generation/src/prompt-formatters.ts`
  severity: high
  Đề xuất: known-limits

- **Preview shows the "no curriculum pack — machine is guessing" warning for the whole outline stream, even when a pack exists (r4)**
  Người dùng thấy gì: Trong lúc bài đang được soạn, phụ huynh có thể tạm thời thấy dòng cảnh báo 'chưa có sách, máy đang đoán' dù môn đó thực ra có sách, trước khi dòng đúng hiện ra lúc soạn xong.
  file: `app/generation-preview/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **A pack whose SKILL.md is missing yields a confident anchor with no framework text in the prompt (r4)**
  Người dùng thấy gì: Trong một số cách cài đặt đặc biệt, máy có thể hiện một đường dẫn chương sách rất chắc chắn cho phụ huynh dù thực ra không có nội dung sách nào được đưa cho AI.
  file: `lib/server/curriculum-packs.ts`
  severity: low
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng chỉ có điểm-case: đếm chỗ gọi bằng cận dưới >= 2 (r4)**
  Người dùng thấy gì: Đây là vấn đề của bộ kiểm thử nội bộ, không phải điều phụ huynh gặp phải; nó có nghĩa một lỗi trong tương lai ở chỗ này có thể lọt qua mà không ai biết.
  file: `tests/hooks/continuation-requirements.test.ts`
  severity: high
  Đề xuất: known-limits

- **Assert giá trị có mặt trong khi lời hứa là QUAN HỆ: cờ tự-khai của ảnh nền không bao giờ đỏ được (r4)**
  Người dùng thấy gì: Đây là lỗ hổng trong công cụ kiểm tra nội bộ; nó không tự nó cho thấy có gì sai với những gì phụ huynh nhìn thấy, nhưng nghĩa là một lỗi thật ở khu vực này có thể không bị phát hiện.
  file: `packages/@openmaic/generation/test/no-regression-prompt.test.ts`
  severity: high
  Đề xuất: known-limits

- **Assert chuỗi có mặt trong khi lời hứa là QUAN HỆ: «xoá bộ nhớ đệm» đo bằng substring tên hằng (r4)**
  Người dùng thấy gì: Đây là vấn đề của bài kiểm nội bộ; nó không chứng minh nút Xoá bộ nhớ đệm hiện đang bỏ sót dữ liệu nào, chỉ là nếu sau này có bỏ sót thì bài kiểm này sẽ không bắt được.
  file: `tests/persistence/learner-profile-store.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Đo CHỈ DẪN thay vì ĐẦU RA: quét «chuỗi kỹ thuật lọt lên thẻ» trên khoá i18n, không trên chữ phụ huynh đọc (r4)**
  Người dùng thấy gì: Không có bằng chứng phụ huynh hiện đang thấy chữ khó hiểu trên thẻ; vấn đề là bài kiểm nội bộ hiện không có khả năng phát hiện nếu điều đó xảy ra.
  file: `tests/settings/learner-profile-settings.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Đo CHỈ DẪN thay vì ĐẦU RA: dòng cảnh báo «đang đoán» đo bằng tên khoá dịch (r4)**
  Người dùng thấy gì: Không có bằng chứng phụ huynh hiện đang thấy mã kỹ thuật ở dòng cảnh báo 'đang đoán'; bài kiểm nội bộ hiện không có khả năng phát hiện nếu điều đó xảy ra.
  file: `tests/components/curriculum-anchor-line.test.ts`
  severity: low
  Đề xuất: known-limits

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

⚠ Cụm ngoài vùng phủ: 9/18 lỗi rơi vào file không bộ đo nào phủ (packages/@openmaic/dsl/package.json, tests/persistence/learner-profile-store.test.ts, tests/generation/outline-stream-learner.test.ts, tests/curriculum/curriculum-packs.test.ts, packages/@openmaic/generation/test/no-regression-prompt.test.ts, packages/@openmaic/generation/test/learner-in-scene-prompts.test.ts, tests/store/selected-subject.test.ts, _acceptance/hieu-be-dang-hoc-gi/s4-args.json, tests/components/curriculum-anchor-line.test.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.