import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { pageUrl } = await request.json()

    if (!pageUrl) {
      return NextResponse.json(
        { success: false, error: 'URLが指定されていません' },
        { status: 400 }
      )
    }

    // UTAGEページのHTMLを取得
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'ページの取得に失敗しました' },
        { status: 500 }
      )
    }

    const html = await response.text()

    // m3u8形式の動画URLを正規表現で抽出
    const m3u8Regex = /https?:\/\/[^\s"'<>]+\.m3u8/gi
    const matches = html.match(m3u8Regex)

    if (!matches || matches.length === 0) {
      return NextResponse.json(
        { success: false, error: '動画URLが見つかりませんでした' },
        { status: 404 }
      )
    }

    // 最初に見つかった動画URLを返す
    const videoUrl = matches[0]

    return NextResponse.json({
      success: true,
      videoUrl
    })
  } catch (error) {
    console.error('Error extracting video URL:', error)
    return NextResponse.json(
      { success: false, error: '動画URLの抽出中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
