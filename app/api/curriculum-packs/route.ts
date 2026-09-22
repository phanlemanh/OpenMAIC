import { NextResponse } from 'next/server';
import { listPacks } from '@/lib/server/curriculum-packs';

export function GET() {
  // Thẻ 5 câu chỉ cần biết gói nào tồn tại để hiện «có gói / chưa có gói».
  return NextResponse.json({ packs: listPacks() });
}
