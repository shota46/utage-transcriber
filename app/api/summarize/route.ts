import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 300000 // 5分
})

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'テキストが指定されていません' },
        { status: 400 }
      )
    }

    console.log('GPT-4で要約生成中...')

    // GPT-4で要約を生成
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'あなたは優秀な要約アシスタントです。オンラインコースの文字起こしテキストを簡潔に要約し、重要なポイントを箇条書きで抽出してください。'
        },
        {
          role: 'user',
          content: `以下はUTAGEオンラインコースの動画の文字起こしテキストです。このテキストを3-5行で要約し、重要なポイントを箇条書きで抽出してください。\n\n${text}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    })

    const summary = completion.choices[0].message.content || '要約を生成できませんでした'

    console.log('要約生成完了')

    return NextResponse.json({
      success: true,
      summary
    })

  } catch (error) {
    console.error('Error during summarization:', error)

    let errorMessage = '要約中にエラーが発生しました'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: 500 }
    )
  }
}

export const maxDuration = 300 // 5分
