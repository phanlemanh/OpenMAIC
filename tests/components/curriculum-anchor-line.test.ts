// @vitest-environment jsdom

/**
 * Dòng neo — ba biến thể, và hai luật chữ mà một bài «render được là xong» sẽ
 * bỏ lọt: chưa có gói thì PHẢI có cảnh báo, và câu neo không được mở đầu bằng
 * một mã khung (phụ huynh đọc tên unit, không đọc mã).
 */
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/hooks/use-i18n', () => ({
  useI18n: () => ({
    t: (k: string, v?: Record<string, unknown>) => (v ? `${k}:${JSON.stringify(v)}` : k),
    locale: 'vi-VN',
    setLocale: () => {},
  }),
}));

let container: HTMLDivElement;
let root: Root;

async function mount(props: Record<string, unknown>) {
  const { CurriculumAnchorLine } = await import('@/components/generation/curriculum-anchor-line');
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(createElement(CurriculumAnchorLine, props));
  });
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
});

const state = (id: string) => container.querySelector(`[data-state="${id}"]`);

describe('dòng neo', () => {
  it('ST-neo-co-goi: hiện nguyên câu neo, tên unit đứng trước', async () => {
    await mount({ anchor: "Bài này theo Unit 3 — Tỉ lệ và tỉ số · Learner's Book 8" });
    expect(state('ST-neo-co-goi'), 'ST-neo-co-goi').not.toBeNull();
    const text = container.textContent ?? '';
    expect(text).toContain('Unit 3 — Tỉ lệ và tỉ số');
    expect(
      /^\s*[A-Z]?\d[A-Za-z]{1,3}\.\d/.test(text.trim()),
      'dòng neo mở đầu bằng một mã khung',
    ).toBe(false);
  });

  it('ST-neo-dang-doan: chưa có gói thì nói thẳng đang đoán, nêu tên giáo trình', async () => {
    await mount({ guessingFor: 'MOET' });
    expect(state('ST-neo-dang-doan'), 'ST-neo-dang-doan').not.toBeNull();
    expect(container.textContent).toContain('guessing');
    expect(container.textContent).toContain('MOET');
  });

  it('ST-neo-khong: hồ sơ trống thì không dòng nào — y như trước vòng này', async () => {
    await mount({});
    expect(container.textContent, 'ST-neo-khong phải là KHÔNG có gì').toBe('');
  });

  it('CHIỀU ĐỎ: có gói thì tuyệt đối không được hiện cảnh báo đang đoán', async () => {
    await mount({ anchor: 'Bài này theo Unit 3', guessingFor: 'MOET' });
    expect(state('ST-neo-dang-doan'), 'a pack-backed anchor was rendered as a guess').toBeNull();
    expect(state('ST-neo-co-goi')).not.toBeNull();
  });
});
