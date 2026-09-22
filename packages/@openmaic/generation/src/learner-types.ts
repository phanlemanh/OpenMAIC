/** Một môn bé đang học, kèm giáo trình và ngôn ngữ học môn đó. */
export interface LearnerSubject {
  subject: string;
  /** Mã giáo trình, vd 'cambridge-lower-secondary' | 'moet'. */
  curriculum: string;
  /** BCP-47 của ngôn ngữ học môn này, vd 'vi-VN' | 'en-US'. */
  language: string;
  textbook?: string;
  /** Gói khung đã khớp. Vắng = chưa có gói → chế độ đoán. */
  packId?: string;
}

/**
 * Bối cảnh người học. Một bé, nhiều môn — trường tích hợp dạy song song hai
 * giáo trình trên cùng một đứa (MOET tiếng Việt + Cambridge tiếng Anh).
 * CỐ Ý không có họ tên đầy đủ và ngày sinh: dữ liệu trẻ em, giữ tối thiểu.
 */
export interface LearnerContext {
  nickname: string;
  /** Nhãn lớp theo hệ người dùng khai, vd 'lớp 7'. Quy đổi sang stage là việc của gói. */
  gradeLabel: string;
  school?: string;
  subjects: LearnerSubject[];
}
