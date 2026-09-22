/**
 * Tên kho hồ sơ người học — MỘT hằng, hai bên đọc.
 *
 * Trình duyệt ghi hồ sơ qua zustand `persist` dưới tên này vào ngăn tài khoản;
 * máy chủ (bộ chạy xưởng Pro) đọc CHÍNH khoá ấy từ ngăn của chủ sở hữu. Không
 * có bản sao thứ hai, không có khoá thứ hai: một khoá mồ côi là thứ «Xoá bộ
 * nhớ đệm» không với tới, và vòng nghiệm thu thứ ba bắt được đúng lỗi đó.
 *
 * Tệp này cố ý KHÔNG import gì: kho phía trình duyệt kéo theo zustand và ngăn
 * lưu; máy chủ chỉ cần cái tên.
 */
export const LEARNER_PROFILE_STORE_NAME = 'learner-profile-storage';
