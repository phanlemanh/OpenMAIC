/**
 * Phép đo ĐẦU-CUỐI cho bối cảnh người học ở cửa bấm-một-phát.
 *
 * Vì sao nó phải tồn tại: mọi phép đo khác của vòng này gọi thẳng bộ dựng
 * prompt và TỰ TAY truyền thân gói vào. Nếu trang chủ không gửi hồ sơ, hoặc
 * route nhận rồi bỏ qua, hoặc mã gói không được đổi thành thân gói, thì từng
 * phép đo kia vẫn xanh trong khi bài soạn ra vẫn là «toán lớp 7» chung chung —
 * đúng chiều CHẾT đã khai ở Cổng Đáng. Bài này là chỗ duy nhất bắt trọn nhịp
 * yêu cầu → route → tra gói → prompt, nên nó KHÔNG được thay bằng một phép đo
 * chụp màn hình.
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';

const streamLLMMock = vi.hoisted(() => vi.fn());
const resolveModelFromRequestMock = vi.hoisted(() => vi.fn());
const findPackMock = vi.hoisted(() => vi.fn());
const readPackBodyMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/ai/llm', () => ({ streamLLM: streamLLMMock }));
vi.mock('@/lib/server/resolve-model', () => ({
  resolveModelFromRequest: resolveModelFromRequestMock,
}));
vi.mock('@/lib/server/curriculum-packs', () => ({
  findPack: findPackMock,
  readPackBody: readPackBodyMock,
}));

const PACK_BODY = '## Mạch và unit\n\n- Unit 12 — Tỉ số và tỉ lệ';
const BOOK = "Cambridge Lower Secondary Mathematics Learner's Book 8";
const PACK = {
  id: 'cambridge-lower-secondary-maths-8',
  stage: 8,
  language: 'en-US',
  textbooks: [BOOK],
  units: [{ n: 12, en: 'Ratio and proportion', vi: 'Tỉ số và tỉ lệ' }],
};
const LEARNER = {
  nickname: 'Bi',
  gradeLabel: 'lớp 7',
  school: 'Emasi',
  subjects: [
    {
      subject: 'Toán',
      curriculum: 'cambridge-lower-secondary',
      language: 'en-US',
      textbook: "Learner's Book 8",
      packId: 'cambridge-lower-secondary-maths-8',
    },
  ],
};

describe('hồ sơ người học đi từ thân yêu cầu tới prompt dàn ý', () => {
  beforeEach(() => {
    vi.resetModules();
    streamLLMMock.mockReset();
    resolveModelFromRequestMock.mockReset();
    findPackMock.mockReset();
    readPackBodyMock.mockReset();
    resolveModelFromRequestMock.mockResolvedValue({
      model: { provider: 'test.chat', modelId: 'test-model' },
      modelInfo: { outputWindow: 4096, capabilities: { vision: false } },
      modelString: 'test:test-model',
      thinkingConfig: undefined,
    });
  });

  test('route TỰ tra gói và đặt thân gói vào prompt; câu neo SUY trong code về theo luồng', async () => {
    findPackMock.mockReturnValue(PACK);
    readPackBodyMock.mockReturnValue(PACK_BODY);
    // Mô hình KHÔNG trả câu neo nào — nó không còn được hỏi. Câu neo phải về
    // dù vậy, vì máy chủ suy nó từ gói + đề + dàn ý.
    streamLLMMock.mockReturnValue({
      textStream: (async function* () {
        yield JSON.stringify({
          languageDirective: 'Teach in Vietnamese.',
          courseTitle: 'Tỉ lệ và tỉ số',
          outlines: [
            {
              id: 'scene_1',
              type: 'slide',
              title: 'Mở đầu',
              description: 'x',
              keyPoints: ['a'],
              order: 1,
            },
          ],
        });
      })(),
    });

    const { POST } = await import('@/app/api/generate/scene-outlines-stream/route');
    const body = await readStreamBody(
      await POST(mockRequest({ requirement: 'tỉ lệ và tỉ số', learner: LEARNER })),
    );

    // (a) Route tra gói bằng CHÍNH ba giá trị của hồ sơ — client không gửi mã gói.
    expect(findPackMock).toHaveBeenCalledWith('Toán', 'cambridge-lower-secondary', 'lớp 7');

    const prompt = promptTextOf(streamLLMMock);
    // (b) Thân gói có mặt trong prompt: nhịp tra-gói → đọc-thân → đổ-vào-ô đã nối.
    expect(prompt, 'curriculum pack body missing from outline prompt').toContain(
      'Unit 12 — Tỉ số và tỉ lệ',
    );
    // (c) Khối hồ sơ có mặt: nhịp yêu-cầu → route → prompt đã nối.
    expect(prompt, 'learner dropped between request and outline prompt').toContain('Bi');
    expect(prompt).toContain('lớp 7');
    // (d) Prompt KHÔNG còn xin mô hình câu neo — bốn khuôn đã gỡ hẳn.
    expect(prompt, 'template still asks the model for curriculumAnchor').not.toContain(
      'curriculumAnchor',
    );
    // (e) Câu neo về tới client qua cùng luồng với tên khoá học, SUY từ gói:
    //     tên unit đứng trước, tên sách sau — đúng luật chữ của đặc tả UX.
    expect(body, 'curriculumAnchor event missing from outline stream').toContain(
      '"type":"curriculumAnchor"',
    );
    const anchorEvent = body
      .split('\n')
      .find((line) => line.startsWith('data: ') && line.includes('"curriculumAnchor"'));
    const anchor = JSON.parse(anchorEvent!.slice(6)).data as string;
    expect(anchor).toBe(`Unit 12 · Ratio and proportion — ${BOOK}`);
  });

  test('mô hình tự bịa một câu neo → route BỎ QUA, câu neo vẫn là bản suy trong code', async () => {
    findPackMock.mockReturnValue(PACK);
    readPackBodyMock.mockReturnValue(PACK_BODY);
    streamLLMMock.mockReturnValue({
      textStream: (async function* () {
        yield JSON.stringify({
          languageDirective: 'Teach in Vietnamese.',
          courseTitle: 'Tỉ lệ và tỉ số',
          outlines: [
            {
              id: 's1',
              type: 'slide',
              title: 'Mở đầu',
              description: 'x',
              keyPoints: ['a'],
              order: 1,
            },
          ],
          curriculumAnchor: 'Stage 8 objective 8Nf.01 — invented by the model',
        });
      })(),
    });

    const { POST } = await import('@/app/api/generate/scene-outlines-stream/route');
    const body = await readStreamBody(
      await POST(mockRequest({ requirement: 'tỉ lệ và tỉ số', learner: LEARNER })),
    );
    const anchorEvent = body
      .split('\n')
      .find((line) => line.startsWith('data: ') && line.includes('"curriculumAnchor"'));
    const anchor = JSON.parse(anchorEvent!.slice(6)).data as string;
    expect(anchor, 'anchor taken from the model instead of derived').not.toContain('8Nf.01');
    expect(anchor).not.toContain('Stage 8');
    expect(anchor).toBe(`Unit 12 · Ratio and proportion — ${BOOK}`);
  });

  test('không hồ sơ: không tra gói, không thân gói, không câu neo', async () => {
    streamLLMMock.mockReturnValue({
      textStream: (async function* () {
        yield JSON.stringify({
          languageDirective: 'Teach in English.',
          outlines: [
            { id: 's1', type: 'slide', title: 'A', description: 'x', keyPoints: ['a'], order: 1 },
          ],
        });
      })(),
    });

    const { POST } = await import('@/app/api/generate/scene-outlines-stream/route');
    const body = await readStreamBody(await POST(mockRequest({ requirement: 'teach recursion' })));

    expect(findPackMock).not.toHaveBeenCalled();
    expect(promptTextOf(streamLLMMock)).not.toContain('Unit 12');
    expect(body).not.toContain('curriculumAnchor');
  });

  test('có hồ sơ nhưng CHƯA có gói: vẫn soạn, và khối hồ sơ khai đang đoán', async () => {
    findPackMock.mockReturnValue(null);
    streamLLMMock.mockReturnValue({
      textStream: (async function* () {
        yield JSON.stringify({
          languageDirective: 'Teach in Vietnamese.',
          outlines: [
            { id: 's1', type: 'slide', title: 'A', description: 'x', keyPoints: ['a'], order: 1 },
          ],
        });
      })(),
    });

    const moet = {
      ...LEARNER,
      subjects: [{ subject: 'Toán', curriculum: 'moet', language: 'vi-VN' }],
    };
    const { POST } = await import('@/app/api/generate/scene-outlines-stream/route');
    await readStreamBody(await POST(mockRequest({ requirement: 'tỉ lệ', learner: moet })));

    expect(readPackBodyMock).not.toHaveBeenCalled();
    const prompt = promptTextOf(streamLLMMock);
    expect(prompt, 'guess mode not declared for subject without pack').toContain(
      'chưa có gói khung',
    );
    expect(prompt).toContain('neo chưa kiểm chứng');
  });
});

function promptTextOf(mock: typeof streamLLMMock): string {
  const params = mock.mock.calls[0][0] as {
    system: string;
    prompt?: string;
    messages?: Array<{ role: string; content: Array<{ type: string; text?: string }> }>;
  };
  if (params.messages) {
    const textPart = params.messages[0].content.find((p) => p.type === 'text');
    return `${params.system}\n${textPart?.text ?? ''}`;
  }
  return `${params.system}\n${params.prompt ?? ''}`;
}

function readStreamBody(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let text = '';
  const pump = (): Promise<void> =>
    reader!.read().then(({ done, value }) => {
      if (done) return;
      if (value) text += decoder.decode(value, { stream: true });
      return pump();
    });
  return pump().then(() => text);
}

function mockRequest(requirements: Record<string, unknown>) {
  return {
    json: async () => ({ requirements, researchContext: '' }),
    headers: { get: () => null },
  } as unknown as Parameters<
    typeof import('@/app/api/generate/scene-outlines-stream/route').POST
  >[0];
}
