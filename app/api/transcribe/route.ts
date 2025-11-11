import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import ffmpeg from 'fluent-ffmpeg'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

// ffmpegのパスを設定（ローカルとVercelで自動切り替え）
if (process.env.VERCEL) {
  // Vercel環境ではffmpeg-staticを使用
  const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
  ffmpeg.setFfmpegPath(ffmpegPath)
} else {
  // ローカル環境
  ffmpeg.setFfmpegPath('/opt/homebrew/bin/ffmpeg')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 1200000 // 20分のタイムアウト（長い動画の文字起こしに対応）
})

// m3u8動画の指定区間をmp3に変換してダウンロード
async function downloadAndConvertVideoSegment(
  videoUrl: string,
  startSeconds: number,
  durationSeconds: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputPath = join(tmpdir(), `utage-segment-${Date.now()}.mp3`)

    ffmpeg(videoUrl)
      .setStartTime(startSeconds)
      .setDuration(durationSeconds)
      .outputOptions([
        '-vn', // 動画なし（音声のみ）
        '-acodec libmp3lame', // MP3エンコーダー
        '-b:a 16k', // 超低ビットレート（16kbps）で25MB以下に圧縮
        '-ar 16000', // サンプルレート16kHz（Whisperの推奨値）
        '-ac 1' // モノラル音声（音声認識には十分）
      ])
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run()
  })
}

// 動画全体を分割処理して文字起こし
async function transcribeVideoInSegments(videoUrl: string): Promise<string> {
  const SEGMENT_DURATION = 10 * 60 // 10分 = 600秒
  const segmentPaths: string[] = []
  const transcriptions: string[] = []

  try {
    console.log('動画を10分セグメントで分割処理開始...')

    // 最大6セグメント（60分）まで処理
    for (let i = 0; i < 6; i++) {
      const startTime = i * SEGMENT_DURATION
      console.log(`セグメント${i + 1}/6: ${startTime / 60}分〜${(startTime + SEGMENT_DURATION) / 60}分をダウンロード中...`)

      try {
        const segmentPath = await downloadAndConvertVideoSegment(
          videoUrl,
          startTime,
          SEGMENT_DURATION
        )
        segmentPaths.push(segmentPath)

        // ファイルサイズをチェック
        const fileSizeMB = await checkFileSize(segmentPath)
        console.log(`セグメント${i + 1}のファイルサイズ: ${fileSizeMB.toFixed(2)}MB`)

        if (fileSizeMB > 25) {
          throw new Error(`セグメント${i + 1}のファイルサイズが大きすぎます（${fileSizeMB.toFixed(2)}MB）`)
        }

        // Whisper APIで文字起こし
        console.log(`セグメント${i + 1}をWhisper APIで文字起こし中...`)
        const fs = await import('fs')
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(segmentPath),
          model: 'whisper-1',
          language: 'ja'
        })

        transcriptions.push(transcription.text)
        console.log(`セグメント${i + 1}完了（${transcription.text.length}文字）`)
      } catch (segmentError: unknown) {
        // セグメントが存在しない場合（動画が短い場合）は処理終了
        if (segmentError instanceof Error && segmentError.message.includes('End of file')) {
          console.log(`セグメント${i + 1}は存在しません。処理を完了します。`)
          break
        }
        throw segmentError
      }
    }

    // すべての文字起こし結果を結合
    const fullTranscript = transcriptions.join('\n\n')
    console.log(`全セグメント完了。総文字数: ${fullTranscript.length}文字`)

    return fullTranscript
  } finally {
    // すべての一時ファイルを削除
    for (const path of segmentPaths) {
      await unlink(path).catch(console.error)
    }
  }
}

// ファイルサイズをチェック（25MB制限）
async function checkFileSize(filePath: string): Promise<number> {
  const fs = await import('fs/promises')
  const stats = await fs.stat(filePath)
  const fileSizeMB = stats.size / (1024 * 1024)
  return fileSizeMB
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json()

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: '動画URLが指定されていません' },
        { status: 400 }
      )
    }

    console.log('動画の文字起こし開始:', videoUrl)

    // 動画を10分セグメントに分割して文字起こし
    const transcriptText = await transcribeVideoInSegments(videoUrl)

    console.log('全セグメントの文字起こし完了')

    return NextResponse.json({
      success: true,
      text: transcriptText
    })

  } catch (error) {
    console.error('Error during transcription:', error)

    // OpenAI API の502エラーを特別に処理
    let errorMessage = '文字起こし中にエラーが発生しました'
    if (error instanceof Error) {
      if (error.message.includes('502')) {
        errorMessage = 'OpenAI APIが一時的に利用できません。数分待ってから再試行してください。'
      } else if (error.message.includes('timeout')) {
        errorMessage = '処理がタイムアウトしました。動画が長すぎる可能性があります。'
      } else {
        errorMessage = error.message
      }
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

// タイムアウトを延長（Vercel Pro必要）
export const maxDuration = 1200 // 20分（長い動画対応）
