---
schema_version: 1
feature: Bài học bám đúng thứ bé đang học ở trường — không phải kể lại bối cảnh mỗi lần
slug: hieu-be-dang-hoc-gi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: signed-off
design_doc: _acceptance/hieu-be-dang-hoc-gi/design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-22T10:50:34Z
---

# Acceptance Contract: hieu-be-dang-hoc-gi

## Context

Phụ huynh không chuyên sư phạm, không kỹ thuật, soạn bài cho con bằng OpenMAIC. Hôm nay mỗi
lần soạn phải kể lại lớp, trường, sách, chương trình, và bài ra vẫn chung chung. Vòng này
thêm **hồ sơ người học** đi theo tài khoản (một bé, nhiều môn, mỗi môn một chương trình và
ngôn ngữ), **gói khung giáo trình có sẵn** (gói đầu: Cambridge Lower Secondary Toán Stage 8,
neo bằng tên unit — không chép khung), và đưa cả hai vào **hai cửa soạn** — bấm-một-phát và
xưởng Pro — qua một bộ định dạng duy nhất. Máy nói ra nó neo vào unit nào bằng tiếng phụ
huynh; chưa có gói thì nói thẳng là đang đoán.

Source input: `_acceptance/hieu-be-dang-hoc-gi/opportunity.md` (Cổng Đáng ký 2026-09-22, decision: build)

## Criteria

- AC-1: Given chưa có hồ sơ người học, When phụ huynh mở thẻ 5 câu và khai tên gọi, lớp, ít nhất một dòng môn (môn · chương trình · ngôn ngữ) rồi Lưu, Then hồ sơ được lưu ở phạm vi tài khoản và mỗi dòng môn hiện đúng một trong hai trạng thái: «có gói khung» kèm tên sách, hoặc «chưa có gói — máy sẽ đoán».
- AC-2: Given hồ sơ có dòng môn Toán · Cambridge Lower Secondary · lớp 7, When bộ đăng ký gói đối chiếu, Then gói «Cambridge Lower Secondary Toán Stage 8» tự gắn vào dòng đó — phụ huynh không chọn và không thấy chữ «Stage» trên thẻ; đổi lớp sang 8 thì gói gỡ ra (chưa có gói Stage 9) — và việc gắn lại xảy ra cả trên hồ sơ ĐÃ LƯU, không chỉ lúc mới thêm dòng.
- AC-3: Given hồ sơ đã lưu trên máy A, When máy B của cùng chủ sở hữu nhận lựa chọn bằng mã nhận, Then hồ sơ người học có mặt trên máy B — kho hồ sơ nằm trong tập kho phạm vi tài khoản được rút từ khai báo, không chép tay. (cross-layer)
- AC-4: Given có hồ sơ người học, When phụ huynh dùng «Xoá bộ nhớ đệm» trong Cài đặt chung, Then «Xoá bộ nhớ đệm» xoá hồ sơ bé cùng mọi kho phạm vi tài khoản khác, và danh sách kho được xoá rút từ chính bản khai chung — một kho đứng ngoài danh sách là một lỗi kêu to; và trên máy chủ KHÔNG tồn tại bản sao thứ hai của hồ sơ ngoài kho ấy (máy chủ đọc chính kho, không ghi khoá riêng).
- AC-5: Given trang chủ, When hồ sơ trống Then hiện một dòng mời khai và KHÔNG có ô chọn môn; When hồ sơ có ít nhất một môn Then hiện ô «Soạn cho: <môn — chương trình (ngôn ngữ)>» nhớ lựa chọn gần nhất; và khi môn đang được nhớ bị xoá khỏi hồ sơ, ô rơi về một môn còn lại thay vì giữ một lựa chọn mồ côi.
- AC-6: Given ô «Soạn cho» đang chọn một môn có gói, When soạn dàn ý ở cửa bấm-một-phát, Then prompt dàn ý chứa khối hồ sơ người học sinh từ MỘT bộ định dạng dùng chung và thân gói ở ô `{{curriculumContext}}`; ba chỗ định dạng chép tay của ĐƯỜNG SOẠN (bộ sinh dàn ý, route dàn ý, trang xem trước) không còn — hai chỗ của lớp học đang chạy nằm ngoài phạm vi, xem Out of scope; không ô `{{…}}` nào sót lại trong prompt sau khi đổ biến. (cross-layer)
- AC-7: Given dàn ý sinh xong từ một môn có gói, When màn xem trước hiện, Then có dòng neo bằng ngôn ngữ của người học nêu tên sách và — khi một unit của gói khớp đề hoặc dàn ý — tên unit đứng trước (mã, nếu có, đứng sau và in nhỏ; không chữ «Stage»); câu neo do máy chủ SUY từ gói và dàn ý, không hỏi mô hình, và đến từ sự kiện `curriculumAnchor` đi cùng luồng với `courseTitle`. (cross-layer)
- AC-8: Given dòng môn có chương trình nhưng chưa có gói (vd Toán · MOET · lớp 7), When soạn ở bất kỳ cửa nào, Then khối hồ sơ ghi rõ «chưa có gói khung; neo bằng hiểu biết chung và nói rõ neo chưa kiểm chứng», và dòng neo (hoặc câu neo trong chat) mang cảnh báo đang đoán — không im.
- AC-9: Given hồ sơ người học trống, When soạn như trước vòng này ở cả hai cửa, Then prompt dàn ý, nội dung và prompt hệ thống của agent KHÔNG khác trước vòng — mọi ô mới có mặc định rỗng và không xuất hiện khối người học.
- AC-10: Given nội dung slide, quiz và lời giảng của cửa bấm-một-phát, When sinh cho một môn có hồ sơ — trang đầu ở màn xem trước LẪN mọi trang sau sinh trong lớp học và mọi lượt sinh lại — Then mỗi prompt nhận bối cảnh người học qua ô `{{learnerContext}}` (hoặc ô `{{userProfile}}` sẵn có của lời giảng) từ cùng bộ định dạng; hồ sơ đi theo KHOÁ HỌC (`stage.learner`, đóng lúc tạo), không theo yêu cầu.
- AC-11: Given hồ sơ đã lưu ở ngăn tài khoản của chủ sở hữu, When bộ chạy xưởng Pro mở một lượt, Then bộ chạy đọc hồ sơ từ CHÍNH kho hồ sơ ấy (khoá `learner-profile-storage`, ngăn `account`), bóc đúng phong bì lưu bền, và không có khoá bản sao nào khác; route mở phiên không nhận trường `learner`; đồng bộ tài khoản tắt hoặc kho trống → không khối, phiên vẫn chạy, và thẻ 5 câu nói thẳng «xưởng chưa thấy hồ sơ» khi xưởng bật mà đồng bộ tắt; bảng phiên giữ nguyên lược đồ. (cross-layer)
- AC-12: Given kho hồ sơ của chủ sở hữu có hồ sơ, When runner dựng prompt hệ thống và công cụ sinh trang, Then có khối người học nêu bé, các môn, và tên skill gói phải đọc trước khi soạn môn đó, VÀ mỗi trang công cụ sinh ra mang cùng hồ sơ vào lời nhắc nội dung (hồ sơ đã đóng trên khoá học thắng hồ sơ hiện tại của chủ sở hữu); hồ sơ vắng thì không có khối. (cross-layer)
- AC-13: Given hai dàn ý cùng đề «tỉ lệ và tỉ số», một sinh với gói một sinh không, không đánh dấu, When hội đồng đọc cạnh mục lục Learner's Book 8, Then phân biệt được bài có gói qua tên unit, từ vựng và ký hiệu — và nói được vì sao. (judgment)
- AC-14: Given phụ huynh không chuyên sư phạm, không kỹ thuật, When đọc thẻ 5 câu và dòng neo, Then hiểu được phải điền gì và bài neo vào đâu mà không gặp từ kỹ thuật hay mã khung. (judgment)
- AC-15: Given các màn mới (thẻ 5 câu, ô chọn môn, dòng neo), When chấm bằng sàn thẩm mỹ của kho, Then đạt sàn P0: tương phản, tiêu điểm, bàn phím, trạng thái trống/đang tải/lỗi.
- AC-16: Given ngăn lưu trả lỗi khi ghi hồ sơ, When phụ huynh bấm Lưu, Then sản phẩm báo «chưa lưu được», giữ giá trị vừa gõ trên màn và giữ giá trị cũ trong kho — lời báo đã-lưu chỉ được phát khi ngăn lưu xác nhận đã ghi. (cross-layer)

## Coverage

Quét bằng `morphological-scan`, preset entity-feature (`coverage-scan.md`). Ba trục, 72 ô, quét theo lát Trục C; 9 ô Core → AC-1…AC-12; hai AC phán xét và một AC sàn thẩm mỹ bọc ngoài.

- Trục A — vòng đời hồ sơ: khai lần đầu | sửa (lên lớp, thêm/bớt môn) | đi theo máy khác | xoá [thước CE: hành trình phụ huynh; ngành: Khanmigo có chế độ phụ huynh]
- Trục B — nơi hồ sơ tác dụng: ô chọn môn | dàn ý (neo) | nội dung slide/quiz | lời giảng | prompt hệ thống xưởng Pro | câu neo trong chat [thước CE: ba đường vào soạn của repo — `app/api/generate/scene-outlines-stream/route.ts`, `lib/server/agent-runtime/runner.ts`, `packages/@openmaic/generation/src/scene-generator.ts`]
- Trục C — hiểu biết về giáo trình: có gói khớp | có chương trình, chưa gói (đoán) | không khai (như hôm nay) [thước CE: MagicSchool.ai — nhận «subject, grade level, standards, and instructional goals»; có/không standards cho bài khác nhau]

Chân ngành đối chiếu: [NGÀNH: MagicSchool.ai] · [NGÀNH: Khanmigo] · [NGÀNH: Common Standards Project — chuẩn dạng dữ liệu, chỉ Mỹ] · [NGÀNH: Cambridge Lower Secondary — khung gated].

Điểm cần anh gạch tại cổng:
- [GIẢ ĐỊNH] «lớp 7» hệ Việt Nam tương đương Stage 8 Cambridge — tuỳ trường; gói khai tương đương, phụ huynh đổi lớp là đổi gói. Bé nhà anh đúng cặp này không?
- [GIẢ ĐỊNH] Phụ huynh nhận ra neo đúng qua TÊN unit trong mục lục sách, không cần mã — AC-13 và AC-14 đứng trên giả định này.
- [GIẢ ĐỊNH] Khung pháp lý dữ liệu trẻ em: Luật Bảo vệ dữ liệu cá nhân 2025 (hiệu lực 01/2026 theo preset, chưa tra lại). Hệ quả đã áp: chỉ giữ tên gọi, lớp, trường, môn; xoá được (AC-4); không rời deployment ngoài prompt mô hình.
- [GIẢ ĐỊNH] Thị trường là một ca (chủ kho); «nhiều người dùng repo cũng vậy» chưa có số — Cổng Giá trị đo trên một phụ huynh.

## Đường đo

- Thước: số lần phải khai lại bối cảnh (lớp / trường / sách / unit) trong một tuần soạn bài · số từ: đếm trong phiên nghiệm thu · bảo đảm bởi: AC-1, AC-5, AC-6
- Thước: tỉ lệ bài có khung được phụ huynh nhận ra đúng trong phép thử mù · số từ: phiên nghiệm thu, phụ huynh chọn trên cặp dàn ý · bảo đảm bởi: AC-13
- Thước: số lần máy đoán neo sai trên số tuần · số từ: người quan sát phiên nghiệm thu ghi một vạch mỗi lần phụ huynh NÓI neo sai (unit khác thứ bé đang học) trước khi sửa dàn ý; gật = 0 · bảo đảm bởi: AC-7
- Thước: số bài soạn ra dùng được cho bé mà không sửa đề · số từ: đếm trong phiên nghiệm thu · bảo đảm bởi: AC-6, AC-10
- Thước: bản chưa cài gói nào vẫn soạn được và nói rõ đang đoán · số từ: quan sát · bảo đảm bởi: AC-8, AC-9

## Out of scope

- Tầng 3 — mô hình người học từ kết quả thật của bé: dữ liệu học tập trẻ em cần câu trả lời về ai giữ / giữ ở đâu / xoá thế nào trước; vòng sau.
- Ship sẵn mọi khung (Cambridge, MOET, IB…): bản quyền + bảo trì mãi mãi; vòng này một gói mẫu, cơ chế nhận N gói.
- Gói MOET Toán lớp 7 — nội dung, không phải cơ chế; môn MOET của bé chạy chế độ đoán.
- Giao diện tự tạo gói khung cho phụ huynh — persona không viết gói; gói vào bằng PR.
- Ghim tài liệu theo người (thư viện tài liệu chủ sở hữu → mọi phiên mới): chạm `lib/persistence/**` (T3) và câu hỏi quota byte-copy mỗi phiên; vòng sau.
- Con trỏ tuần lưu sẵn — suy từ chủ đề phụ huynh gõ; nếu Cổng Giá trị thấy neo sai nhiều thì mở lại.
- Nhiều bé trong một tài khoản — bọc thêm một lớp danh sách; vòng sau.
- Giáo viên soạn cho ba mươi học sinh — mô hình dữ liệu khác hẳn.
- Bộ chấm bám khung sau khi soạn — cần gói ổn định trước.
- Hồ sơ người học cho LỚP HỌC ĐANG CHẠY (lời nhắc của nhân vật dạy và của đạo diễn, `lib/orchestration/prompt-builder.ts` và `director-prompt.ts`): hai chỗ này cũng dựng khối hồ sơ học sinh riêng, nhưng người dùng ở đó là BÉ đang học chứ không phải phụ huynh đang soạn, và ngưỡng ở Cổng Đáng đo bài soạn ra. Vòng này không hợp nhất chúng; hợp nhất cả năm chỗ là vòng riêng.
- Ràng buộc máy-kiểm cho gói (`outline-constraints.json`) — khi nội dung gói ổn định.
- Lưu neo vào stage đã sinh để phiên sau đọc lại — vòng sau.

## Notes

- Hạng T2: không file nào trong `t3_paths`; `getServerPersistenceProvider` và `PgKVStore` chỉ được gọi, không sửa; bảng phiên trong `packages/@openmaic/storage` không đổi.
- Hồ sơ đi theo NGƯỜI và theo KHOÁ HỌC (lối A, 22/09, thay cho «đi theo yêu cầu» của bản đầu): kho `learner-profile-storage` ở ngăn tài khoản là bản duy nhất — trình duyệt ghi, máy chủ đọc thẳng (`PgKVStore.get(owner, khoá, 'account')`, chỉ gọi), không khoá bản chụp riêng; màn xem trước đóng hồ sơ lên `stage.learner` để mọi trang sau và mọi lượt mở lại cùng thấy một bé. Câu neo suy trong code từ gói + dàn ý, không hỏi mô hình. Đổi hồ sơ giữa chừng → lượt chạy kế của xưởng nhận bản mới; khoá học đã tạo giữ hồ sơ lúc tạo.
- Mọi chuỗi mới có mục trong cả 12 tệp ngôn ngữ (`lib/i18n/locales/`, CI kiểm khoá).
- Gói khung: KHÔNG chép câu mục tiêu hay mã từ khung Cambridge (gated, bản quyền); nội dung là tên unit/chủ đề (trang công khai + mục lục sách), cấu trúc mạch, hướng dẫn diễn giải, từ vựng/ký hiệu, và luật nói neo. Kiểm 22/09: trang hỗ trợ Lower Secondary chuyển sang đăng nhập School Support Hub; điều khoản sử dụng không tìm thấy trong 30 phút.
- Kho chưa khai `feature_loop.ui_standards_skill` — artifact UI không có đối trọng chuẩn nội.
- Thước «đoán neo sai» đếm BẰNG LỜI trong phiên nghiệm thu (người quan sát ghi vạch), không bằng một bộ đếm trong sản phẩm — dòng neo là dòng trạng thái, không có chỗ sửa riêng. Phiên nghiệm thu dùng đúng cách đếm này.
- Luật phủ khung: MỖI dòng `ST-*` của bảng trạng thái phải có ÍT NHẤT một khung chụp sống; thiếu một dòng là đỏ nêu đích danh tên dòng. Chụp thêm khung cho hành vi (đổi lớp, bớt môn) là được — luật là phủ, không phải bằng. Mười một dòng chia cho bốn phép đo: E1 phủ sáu dòng `ST-the-*`, E5 phủ `ST-chon-moi-khai` `ST-chon-san-sang` `ST-neo-khong`, E7 phủ `ST-neo-co-goi`, E8b phủ `ST-neo-dang-doan`.
- Khoá cấu hình S3 phải thêm trước khi chạy nghiệm thu máy: `executors.script.dan_y_mu` trỏ `scripts/gen-dan-y-mu.mjs` (bộ sinh cặp dàn ý mù cho E13gen). Thiếu khoá thì bước chuẩn-bị-args của S4 dừng có tên, không đoán.
- Dữ liệu trẻ em: hồ sơ chỉ giữ tên gọi, lớp, trường, môn, sách; không họ tên đầy đủ, không ngày sinh.

### Known limits (Cổng 2, Manh Phan 2026-09-23)

- Known limit (Ngoài-1): Nếu hồ sơ bị lỗi định dạng khi gửi lên, một số màn soạn bài có thể báo lỗi và không ra được bài, thay vì bỏ qua thông tin sai.
- Known limit (Ngoài-2): Một gói khung giáo trình bị lỗi định dạng có thể làm mọi bài soạn có hồ sơ người học bị lỗi, không soạn được.
- Known limit (Ngoài-3): Người dùng ngôn ngữ khác tiếng Việt vẫn thấy chữ "lớp" bằng tiếng Việt trong ô chọn lớp.
- Known limit (Ngoài-4): Số phiên bản gói phần mềm báo hiệu một thay đổi phá vỡ dù thực tế không có gì phá vỡ, có thể khiến nơi khác dùng gói này ngại nâng cấp.
- Known limit (Ngoài-7): Trong lúc bài đang được soạn, phụ huynh có thể thấy cảnh báo "đang đoán, chưa có sách" dù bé có sách, rồi cảnh báo tự biến mất sau khi soạn xong.
- Known limit (Ngoài-8): Nếu hồ sơ bé tải chậm, thẻ khai hồ sơ có thể hiện trống dù đã có hồ sơ, và nếu phụ huynh lưu ngay lúc đó có thể làm mất các môn đã khai trước.
- Known limit (Ngoài-9): Nếu hồ sơ đã lưu bị lỗi nhẹ (ví dụ khai quá nhiều môn), xưởng Pro âm thầm soạn như không có hồ sơ mà không báo cho ai biết.
- Known limit (Ngoài-10): Nếu tên môn học có khoảng trắng thừa hoặc viết hoa khác đi, gói khung đúng ra khớp sẽ không được gắn, dù màn hình có báo rõ là chưa có gói.
- Known limit (Ngoài-11): Bằng chứng cho rằng mã gói không bị lưu cứng vào hồ sơ đã lưu có thể không thực sự đúng, nhưng phép đo hiện tại sẽ luôn báo đạt dù sai.
- Known limit (Ngoài-12): Bài kiểm cho luồng soạn dàn ý có thể không phát hiện được trường hợp bài soạn vừa có sách vừa tự nói đang đoán vì không có sách.
- Known limit (Ngoài-13): Bài kiểm cho việc gói phải khớp đúng lớp có thể không thực sự phát hiện khi gói bị gắn nhầm lớp.
- Known limit (Ngoài-14): Khi hồ sơ bé bị xoá hết, ô nhớ môn đang chọn trước đó có thể không được dọn sạch, dù phần khác của màn hình vẫn hiện đúng lời mời khai hồ sơ.
- Known limit (Ngoài-15): Nếu vòng nghiệm thu chạy trên một bản sao mã khác, kết quả kiểm tra có thể vô tình đọc nhầm tài liệu từ máy của người viết tính năng thay vì bản đang được kiểm, khiến kết quả sai lệch.
- Known limit (Ngoài-16): Nội dung cảnh báo "đang đoán" thật sự hiển thị cho phụ huynh ở từng ngôn ngữ chưa được kiểm tra là dịch đúng và đọc được.
- Known limit (Ngoài-17): Nếu dữ liệu gửi lên bị sai định dạng hoặc quá lớn, yêu cầu soạn bài có thể báo lỗi chung chung thay vì một lời nhắc rõ ràng, và không có giới hạn cho lượng dữ liệu về bé được gửi cho mô hình.
- Known limit (Ngoài-18): Nếu một file gói giáo trình trên máy chủ bị thiếu trường dữ liệu, các yêu cầu soạn bài có hồ sơ học sinh có thể bị lỗi, không chỉ môn liên quan tới file đó.
- Known limit (Ngoài-19): Không ảnh hưởng gì tới trải nghiệm phụ huynh; đây chỉ là một dòng mã thừa bị công cụ kiểm tra mã nêu ra.
- Known limit (Ngoài-20): Có lúc nội dung gửi cho AI có thể nói 'chưa có sách giáo khoa để bám theo' trong khi màn hình lại hiện chắc chắn một đường dẫn tới chương sách cho cùng bài soạn đó, gây thông tin mâu thuẫn.
- Known limit (Ngoài-21): Trong lúc bài đang được soạn, phụ huynh có thể tạm thời thấy dòng cảnh báo 'chưa có sách, máy đang đoán' dù môn đó thực ra có sách, trước khi dòng đúng hiện ra lúc soạn xong.
- Known limit (Ngoài-22): Trong một số cách cài đặt đặc biệt, máy có thể hiện một đường dẫn chương sách rất chắc chắn cho phụ huynh dù thực ra không có nội dung sách nào được đưa cho AI.
- Known limit (Ngoài-23): Đây là vấn đề của bộ kiểm thử nội bộ, không phải điều phụ huynh gặp phải; nó có nghĩa một lỗi trong tương lai ở chỗ này có thể lọt qua mà không ai biết.
- Known limit (Ngoài-24): Đây là lỗ hổng trong công cụ kiểm tra nội bộ; nó không tự nó cho thấy có gì sai với những gì phụ huynh nhìn thấy, nhưng nghĩa là một lỗi thật ở khu vực này có thể không bị phát hiện.
- Known limit (Ngoài-25): Đây là vấn đề của bài kiểm nội bộ; nó không chứng minh nút Xoá bộ nhớ đệm hiện đang bỏ sót dữ liệu nào, chỉ là nếu sau này có bỏ sót thì bài kiểm này sẽ không bắt được.
- Known limit (Ngoài-26): Không có bằng chứng phụ huynh hiện đang thấy chữ khó hiểu trên thẻ; vấn đề là bài kiểm nội bộ hiện không có khả năng phát hiện nếu điều đó xảy ra.
- Known limit (Ngoài-27): Không có bằng chứng phụ huynh hiện đang thấy mã kỹ thuật ở dòng cảnh báo 'đang đoán'; bài kiểm nội bộ hiện không có khả năng phát hiện nếu điều đó xảy ra.
- Known limit (Ngoài-28): Kết quả đo tự động của tính năng này có thể chạy trên một phiên bản máy khác với phiên bản dùng để kiểm, nên một báo cáo xanh chưa chắc phản ánh đúng sản phẩm thật.
- Known limit (Ngoài-29): Nếu máy đo tái sử dụng một máy chủ có sẵn với cấu hình khác cấu hình đúng, kết quả kiểm tính năng có thể không đáng tin dù báo cáo hiện xanh.
- Known limit (Ngoài-30): Nếu máy đo tái sử dụng một máy chủ có cấu hình khác, kết quả kiểm tính năng có thể không đáng tin dù báo cáo hiện xanh.
- Known limit (Ngoài-31): Nút 'Xoá bộ nhớ đệm' có thể trong tương lai bỏ sót việc xoá hồ sơ của bé mà không ai phát hiện ra, vì phép kiểm hiện không đủ chặt để báo động.
- Known limit (Ngoài-32): Trạng thái 'đã có gói khung hay chưa' có thể trong tương lai bị đóng băng sai mà không phép kiểm nào bắt được.
- Known limit (Ngoài-33): Phép kiểm 'không đổi hành vi cũ khi chưa có hồ sơ' có thể xanh giả, khiến một thay đổi ngoài ý muốn lọt qua mà không ai biết.
- Known limit (Ngoài-34): Nếu thiếu một dòng chữ dịch ở một trong 12 ngôn ngữ, phụ huynh dùng ngôn ngữ đó có thể thấy một đoạn mã kỹ thuật thay vì câu cảnh báo dễ hiểu.
- Known limit (Ngoài-35): Nếu một gói khung mới ra mắt sau khi hồ sơ bé đã được lưu, bài soạn ra có thể vừa nói với phụ huynh "chưa có gói, máy đang đoán" vừa thực ra dùng đúng nội dung sách giáo trình — lời cảnh báo không khớp với bài thật.
- Known limit (Ngoài-39): Một trong các nơi bài soạn dùng hồ sơ người học không được kiểm tra là có dùng đúng bối cảnh hồ sơ hay không — nếu chỗ này lệch chuẩn, sẽ không có cảnh báo nào.
- Known limit (Ngoài-40): Một cờ dùng để cảnh báo «ảnh chụp prompt đã cũ» luôn được ghi cứng là an toàn bất kể thực tế, nên cảnh báo này sẽ không bao giờ tự bật lên dù ảnh chụp đã lỗi thời.
