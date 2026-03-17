import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ code: 400, message: '请选择文件' }, { status: 400 });
    }
    
    const fileName = file.name.toLowerCase();
    const isDocx = fileName.endsWith('.docx');
    const isTxt = fileName.endsWith('.txt');
    
    if (!isDocx && !isTxt) {
      return NextResponse.json({ code: 400, message: '仅支持 .docx 和 .txt 文件' }, { status: 400 });
    }
    
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ code: 400, message: '文件大小不能超过10MB' }, { status: 400 });
    }
    
    let text = '';
    
    if (isTxt) {
      text = await file.text();
    } else if (isDocx) {
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      text = result.value;
    }
    
    text = text.trim();
    
    if (!text || text.length === 0) {
      return NextResponse.json({ code: 400, message: '文件中没有有效内容' }, { status: 400 });
    }
    
    const wordCountZh = text.replace(/\s/g, '').length;
    const wordCountEn = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    return NextResponse.json({
      code: 200,
      message: '文件解析成功',
      data: { text, wordCount: Math.max(wordCountZh, wordCountEn), fileName: file.name },
    });
  } catch (error: any) {
    console.error('文件解析失败:', error);
    return NextResponse.json({ code: 500, message: error.message || '文件解析失败' }, { status: 500 });
  }
}
