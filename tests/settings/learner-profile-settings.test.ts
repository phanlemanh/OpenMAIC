// @vitest-environment jsdom

/**
 * Thẻ 5 câu — mục Cài đặt › Người học.
 *
 * Người dùng ở đây là phụ huynh không chuyên sư phạm, không kỹ thuật. Hai điều
 * bài này canh mà một bài «render được là xong» sẽ bỏ lọt:
 *
 *  1. SÁU trạng thái của bảng trạng thái đều dựng được và mang id `ST-the-*` —
 *     phép đo chụp sống của Cổng Bằng chứng bám vào chính các id này, nên một
 *     trạng thái không dựng được ở đây là một khung không chụp được ở đó.
 *  2. Lưu hỏng thì KHÔNG báo đã lưu và KHÔNG mất thứ vừa gõ. Đây là ca mất-im-
 *     lặng: kho vẫn đổi trong bộ nhớ, màn vẫn xanh, và mọi thứ bay khi tải lại.
 *  3. Không một chuỗi kỹ thuật nào lọt lên thẻ — không «Stage», không mã khung.
 */
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  packs: [] as Array<Record<string, unknown>>,
  unavailable: false,
  /**
   * Lượt ghi TRƯỢT mà cờ sức khoẻ CHƯA kịp bật — ca thật của finding t9. Việc
   * ghi là bất đồng bộ, nên hỏi cờ ngay sau khi gọi là hỏi quá sớm.
   */
  silentWriteFailure: false,
  saved: null as unknown,
  /** «Bộ nhớ» và «ổ đĩa» của kho giả — dọn giữa các bài, nếu không một hồ sơ
   *  trùng nội dung từ bài trước còn nằm trên đĩa và làm phép so trùng oan. */
  memory: { learner: null as unknown },
  disk: { learner: null as unknown },
}));

vi.mock('@/lib/hooks/use-i18n', () => ({
  useI18n: () => ({ t: (k: string) => k, locale: 'vi-VN', setLocale: () => {} }),
}));

vi.mock('@/lib/store/persist-health', () => ({
  isPersistUnavailable: () => mocks.unavailable,
}));

/**
 * Kho giả mô phỏng đúng đường THẬT: `setLearner` đổi giá trị trong bộ nhớ NGAY
 * và xếp một lượt ghi; `rehydrate` đọc lại từ ngăn lưu rồi ghi đè bộ nhớ. Khi
 * ngăn lưu từ chối, lượt ghi không xuống đĩa nên lượt đọc lại trả về giá trị
 * CŨ — đó chính là tín hiệu mà thẻ dùng để biết nó có được phép nói «đã lưu».
 *
 * Bản giả lập trước cho cờ sức khoẻ trả về ĐỒNG BỘ, nên nó che mất rằng việc
 * ghi là bất đồng bộ: bài kiểm xanh trong khi sản phẩm báo «đã lưu» cho một
 * lượt ghi vừa trượt (finding t9 của lượt nghiệm thu thứ nhất).
 */
vi.mock('@/lib/store/learner-profile', async () => {
  const actual = await vi.importActual<typeof import('@/lib/store/learner-profile')>(
    '@/lib/store/learner-profile',
  );
  const setLearner = (l: unknown) => {
    mocks.memory.learner = l;
    mocks.saved = l;
    if (!mocks.unavailable && !mocks.silentWriteFailure) mocks.disk.learner = l;
  };
  const snapshot = () => ({ learner: mocks.memory.learner, setLearner });
  const store = Object.assign((sel: (s: Record<string, unknown>) => unknown) => sel(snapshot()), {
    getState: snapshot,
    persist: {
      /**
       * Ngăn lưu THẬT của kho. Giả lập đúng hành vi đã làm hai bản sửa trước
       * thất bại: khi chưa ghi được, `getItem` trả về `null` — KHÔNG phải trả
       * về giá trị đang nằm trong bộ nhớ. Bản giả lập trước mô phỏng đường
       * nạp-lại và vì thế lặp lại đúng chỗ mù của zustand (finding t3 vòng 2).
       */
      getOptions: () => ({
        name: 'learner-profile-storage',
        storage: {
          getItem: async (_name: string) =>
            mocks.disk.learner === null ? null : { state: { learner: mocks.disk.learner } },
        },
      }),
      rehydrate: async () => {
        // Y HỆT zustand: ngăn lưu rỗng thì trạng thái trong bộ nhớ GIỮ NGUYÊN.
        if (mocks.disk.learner !== null) mocks.memory.learner = mocks.disk.learner;
      },
    },
  });
  return { ...actual, useLearnerProfileStore: store };
});

let container: HTMLDivElement;
let root: Root;

async function mount() {
  const { LearnerProfileSettings } = await import('@/components/settings/learner-profile-settings');
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(createElement(LearnerProfileSettings));
  });
}

const state = (id: string) => container.querySelector(`[data-state="${id}"]`);
const byText = (needle: string) => container.textContent?.includes(needle) ?? false;

beforeEach(() => {
  mocks.packs = [
    {
      id: 'cambridge-lower-secondary-maths-8',
      subject: 'Toán',
      curriculum: 'cambridge-lower-secondary',
      stage: 8,
      gradesVn: ['lớp 7'],
      language: 'en-US',
      textbooks: ["Cambridge Lower Secondary Mathematics Learner's Book 8"],
    },
  ];
  mocks.unavailable = false;
  mocks.silentWriteFailure = false;
  mocks.saved = null;
  mocks.memory.learner = null;
  mocks.disk.learner = null;
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify({ packs: mocks.packs }), { status: 200 })),
  );
});

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('thẻ 5 câu', () => {
  it('ST-the-trong: năm câu trống, nút Lưu chưa bật', async () => {
    await mount();
    expect(state('ST-the-trong'), 'ST-the-trong').not.toBeNull();
    const save = container.querySelector('button[data-role="luu"]') as HTMLButtonElement;
    expect(save?.disabled, 'nút Lưu phải mờ khi hồ sơ chưa đủ').toBe(true);
  });

  it('ST-the-dang-dien + ST-the-mon-co-goi: điền đủ thì dòng môn nói CÓ gói kèm tên sách', async () => {
    await mount();
    await fillMinimum('cambridge-lower-secondary');
    expect(state('ST-the-dang-dien'), 'ST-the-dang-dien').not.toBeNull();
    expect(state('ST-the-mon-co-goi'), 'ST-the-mon-co-goi').not.toBeNull();
    expect(byText("Learner's Book 8"), 'tên sách phải hiện để phụ huynh nhận ra').toBe(true);
    const save = container.querySelector('button[data-role="luu"]') as HTMLButtonElement;
    expect(save.disabled).toBe(false);
  });

  it('ST-the-mon-chua-goi: giáo trình chưa có gói thì nói thẳng là sẽ đoán', async () => {
    await mount();
    await fillMinimum('moet');
    expect(state('ST-the-mon-chua-goi'), 'ST-the-mon-chua-goi').not.toBeNull();
  });

  it('ST-the-da-luu: bấm Lưu thì hồ sơ xuống kho và màn báo đã lưu', async () => {
    await mount();
    await fillMinimum('cambridge-lower-secondary');
    await clickAndSettle('button[data-role="luu"]');
    expect(state('ST-the-da-luu'), 'ST-the-da-luu').not.toBeNull();
    expect(mocks.saved, 'hồ sơ phải xuống kho').toMatchObject({
      nickname: 'Bi',
      gradeLabel: 'lớp 7',
    });
  });

  it('ST-the-loi-luu: lưu hỏng thì KHÔNG báo đã lưu và giữ nguyên thứ vừa gõ', async () => {
    mocks.unavailable = true;
    await mount();
    await fillMinimum('cambridge-lower-secondary');
    await clickAndSettle('button[data-role="luu"]');
    expect(state('ST-the-loi-luu'), 'ST-the-loi-luu').not.toBeNull();
    expect(state('ST-the-da-luu'), 'save reported success while the write failed').toBeNull();
    const name = container.querySelector('input[data-role="ten-be"]') as HTMLInputElement;
    expect(name.value, 'thứ vừa gõ phải còn trên màn').toBe('Bi');
  });

  it('CHIỀU ĐỎ THẬT: ghi trượt mà cờ chưa kịp bật — vẫn KHÔNG được báo đã lưu', async () => {
    // Đây là ca phân biệt được hai cách làm. Hỏi cờ sức khoẻ ngay sau khi gọi
    // thì ở đây cờ còn TẮT, nên bản cũ báo «đã lưu» cho một lượt ghi vừa trượt.
    // Đọc lại từ ngăn lưu thì thấy giá trị cũ, nên bản mới nói đúng sự thật.
    mocks.silentWriteFailure = true;
    await mount();
    await fillMinimum('cambridge-lower-secondary');
    await clickAndSettle('button[data-role="luu"]');
    expect(state('ST-the-da-luu'), 'save reported success while the write failed').toBeNull();
    expect(state('ST-the-loi-luu'), 'ST-the-loi-luu').not.toBeNull();
    const name = container.querySelector('input[data-role="ten-be"]') as HTMLInputElement;
    expect(name.value, 'thứ vừa gõ phải còn trên màn').toBe('Bi');
  });

  it('không một chuỗi kỹ thuật nào lên thẻ', async () => {
    await mount();
    await fillMinimum('cambridge-lower-secondary');
    for (const banned of ['Stage', 'stage', 'packId', 'curriculum-pack']) {
      expect(byText(banned), `chuỗi kỹ thuật lọt lên thẻ: ${banned}`).toBe(false);
    }
  });
  it('CHIỀU ĐỎ: nhãn lớp không được đi qua bộ dịch — gói khớp theo chính chuỗi ấy', async () => {
    // Bộ chữ giả trả về KHOÁ thay vì bản dịch, tức mô phỏng đúng một ngôn ngữ
    // giao diện khác. Nếu nhãn lớp đi qua bộ dịch thì ở đây nó thành khoá, và
    // không gói nào khớp nữa — hồ sơ vẫn đó, gói im lặng biến mất.
    await mount();
    const lop = container.querySelector('select[data-role="lop"]') as HTMLSelectElement;
    const values = Array.from(lop.options)
      .map((o) => o.value)
      .filter(Boolean);
    expect(values, 'grade labels went through i18n and stopped matching packs').toContain('lớp 7');
    expect(values.some((v) => v.includes('settings.'))).toBe(false);
  });
});

async function setValue(selector: string, value: string) {
  const el = container.querySelector(selector) as HTMLInputElement | HTMLSelectElement;
  expect(el, `không thấy ${selector}`).not.toBeNull();
  const proto =
    el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')!.set!;
  await act(async () => {
    setter.call(el, value);
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

/** Bấm rồi CHỜ lượt đọc-lại lắng — xác nhận lưu là bất đồng bộ. */
async function clickAndSettle(selector: string) {
  await click(selector);
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function click(selector: string) {
  const el = container.querySelector(selector) as HTMLElement;
  expect(el, `không thấy ${selector}`).not.toBeNull();
  await act(async () => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

async function fillMinimum(curriculum: string) {
  await setValue('input[data-role="ten-be"]', 'Bi');
  await setValue('select[data-role="lop"]', 'lớp 7');
  await setValue('input[data-role="mon"]', 'Toán');
  await setValue('select[data-role="giao-trinh"]', curriculum);
  await setValue('select[data-role="ngon-ngu"]', curriculum === 'moet' ? 'vi-VN' : 'en-US');
}
