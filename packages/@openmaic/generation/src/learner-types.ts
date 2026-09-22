/**
 * Bối cảnh người học — kiểu sống ở `@openmaic/dsl` (trên `Stage`), đây chỉ là
 * lối vào cũ để mọi chỗ đã nhập từ gói này khỏi đổi.
 *
 * Vì sao kiểu nằm ở DSL: hồ sơ đi theo KHOÁ HỌC, không theo yêu cầu. Nó được
 * đóng lên `Stage` lúc tạo, nên trang đầu, trang thứ N sinh trong lớp học, và
 * mọi lượt sinh lại đều nhìn cùng một đứa trẻ. Đặt kiểu ở gói sinh nội dung
 * thì `Stage` không thể mang nó (DSL không được phụ thuộc ngược lên đây).
 */
export type { LearnerContext, LearnerSubject } from '@openmaic/dsl';
