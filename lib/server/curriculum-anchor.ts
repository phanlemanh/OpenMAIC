/**
 * Câu neo — «bài này bám vào đâu» — SUY TRONG CODE từ gói và dàn ý, không hỏi
 * mô hình.
 *
 * Ba vòng nghiệm thu trước hỏi mô hình trả một khoá thứ tư `curriculumAnchor`
 * qua bốn khuôn lời nhắc viết tay, và lớp lỗi «khuôn này nói ba khoá, khuôn
 * kia nói bốn» không bao giờ đóng được — mỗi lần vá một khuôn là một khuôn
 * khác lệch. Suy trong code thì câu neo có đúng một nguồn, đo được không cần
 * mô hình, và không bao giờ mở đầu bằng một mã.
 *
 * Luật chữ (từ đặc tả UX): tên unit đứng trước, tên sách đứng sau, KHÔNG chữ
 * «Stage», không mã mục tiêu. Bằng ngôn ngữ của môn (en-US → tên tiếng Anh;
 * vi-VN → tên tiếng Việt khi gói có).
 */
import type { CurriculumPack, CurriculumUnit } from '@/lib/server/curriculum-packs';

export interface AnchorInput {
  pack: Pick<CurriculumPack, 'textbooks' | 'units' | 'language'>;
  /** Đề bài của phụ huynh. */
  requirement: string;
  /** Dàn ý đã sinh — tên và mô tả từng cảnh. */
  outlines: ReadonlyArray<{ title?: string; description?: string }>;
  /** Ngôn ngữ môn của bé; vắng thì lấy ngôn ngữ của gói. */
  language?: string;
}

const STOP = new Set(['and', 'or', 'of', 'the', 'và', 'với', 'các', 'những', 'trong']);

/**
 * Gấp về một dạng so được: chữ thường + Unicode NFC. Dấu tiếng Việt có hai
 * cách mã hoá (dựng sẵn / tổ hợp); gói viết một cách, bàn phím phụ huynh có
 * thể gõ cách kia, và «tỉ lệ» khi ấy không bằng «tỉ lệ».
 */
function fold(text: string): string {
  return text.normalize('NFC').toLowerCase();
}

/**
 * Tách tên unit thành các cụm neo. «Ratio and proportion» → ratio · proportion;
 * «Tỉ số và tỉ lệ» → tỉ số · tỉ lệ. Cụm một chữ dừng (and, và…) bị bỏ.
 */
export function unitPhrases(unit: CurriculumUnit): string[] {
  // Tách bằng khoảng trắng quanh «and» / «và», KHÔNG bằng `\b`: ranh giới từ
  // của JS chỉ biết chữ ASCII, nên «và» (có dấu) không bao giờ khớp `\bvà\b`.
  return [unit.en, unit.vi ?? '']
    .flatMap((title) => fold(title).split(/\s*[,;]\s*|\s+and\s+|\s+và\s+/))
    .map((s) => s.trim())
    .filter((s) => s.length >= 3 && !STOP.has(s));
}

/**
 * Chữ của một văn bản, tách theo ranh giới KHÔNG-PHẢI-CHỮ (dấu cách, dấu câu),
 * không dùng `\b` (chỉ biết ASCII). Cụm neo khớp khi mọi chữ của nó đứng liền
 * nhau trong dãy này — «hình» KHÔNG khớp «hình vẽ minh hoạ», vì cụm là chữ trọn
 * và ngữ cảnh đứng cạnh không phải tên unit.
 */
function tokens(text: string): string[] {
  return fold(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

function hasPhrase(haystack: readonly string[], phrase: string): boolean {
  const needle = phrase.split(/\s+/);
  outer: for (let i = 0; i + needle.length <= haystack.length; i += 1) {
    for (let j = 0; j < needle.length; j += 1) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return true;
  }
  return false;
}

/**
 * Unit khớp nhất với đề và dàn ý — đếm số cụm của unit xuất hiện TRỌN CHỮ trong
 * văn bản, cụm nhiều chữ nặng hơn cụm một chữ. Vòng nghiệm thu thứ tư bắt được
 * bản đầu: nó so chuỗi con trần, nên chữ «hình» trong «hình vẽ minh hoạ» ghi
 * điểm cho unit «Hình và đối xứng» và thắng «Xác suất» nhờ đứng trước trong
 * mục lục. Giờ: khớp theo chữ trọn; hoà điểm giữa hai unit → không chọn (câu
 * neo chỉ nêu tên sách) thay vì để thứ tự mục lục quyết định một lời khẳng
 * định với phụ huynh. Không cụm nào khớp → null.
 */
export function matchUnit(units: readonly CurriculumUnit[], text: string): CurriculumUnit | null {
  const haystack = tokens(text);
  const scored = units
    .map((unit) => ({
      unit,
      score: unitPhrases(unit)
        .filter((phrase) => hasPhrase(haystack, phrase))
        .reduce((sum, phrase) => sum + phrase.split(/\s+/).length, 0),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!scored.length) return null;
  if (scored.length > 1 && scored[0].score === scored[1].score) return null;
  return scored[0].unit;
}

function unitLabel(unit: CurriculumUnit, language: string): string {
  const vi = language.toLowerCase().startsWith('vi') && unit.vi;
  return `Unit ${unit.n} · ${vi ? unit.vi : unit.en}`;
}

/**
 * Câu neo, hoặc null khi gói không có sách để nêu tên (một gói như thế không
 * neo được gì, và im lặng đúng hơn một câu rỗng).
 */
export function deriveCurriculumAnchor(input: AnchorInput): string | null {
  const textbook = input.pack.textbooks[0];
  if (!textbook) return null;
  const language = input.language ?? input.pack.language ?? 'en-US';
  const text = [
    input.requirement,
    ...input.outlines.flatMap((o) => [o.title ?? '', o.description ?? '']),
  ].join('\n');
  const unit = input.pack.units?.length ? matchUnit(input.pack.units, text) : null;
  return unit ? `${unitLabel(unit, language)} — ${textbook}` : textbook;
}
