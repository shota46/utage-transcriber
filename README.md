# UTAGE Transcriber

UTAGEオンラインコースの動画を自動で文字起こし＋要約するツール

## 機能

- 📹 **動画URL自動検出**: UTAGEページURLから動画URL（m3u8）を自動抽出
- 🎤 **自動文字起こし**: OpenAI Whisper APIで高精度な文字起こし
- 📝 **AI要約生成**: GPT-4で重要なポイントを3-5行で要約
- 📋 **ワンクリックコピー**: 文字起こし結果と要約を簡単にコピー

## 技術スタック

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **API**: OpenAI Whisper API + GPT-4o-mini
- **動画処理**: ffmpeg
- **Hosting**: Vercel

## セットアップ手順

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd utage-transcriber
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. 環境変数を設定

`.env.local.example`をコピーして`.env.local`を作成：

```bash
cp .env.local.example .env.local
```

`.env.local`を編集してOpenAI API Keyを設定：

```
OPENAI_API_KEY=sk-your-api-key-here
```

OpenAI API Keyは[こちら](https://platform.openai.com/api-keys)から取得できます。

### 4. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 使い方

1. UTAGEページのURLを入力
2. 「動画を検出」ボタンをクリック
3. 動画URLが検出されたら「文字起こし開始」をクリック
4. 2-3分待つ（動画の長さによる）
5. 文字起こし結果と要約が表示される
6. 「コピー」ボタンで結果をクリップボードにコピー

## Vercelへのデプロイ

### 1. Vercelアカウントを作成

[Vercel](https://vercel.com)でアカウントを作成

### 2. プロジェクトをインポート

1. Vercelダッシュボードで「New Project」をクリック
2. GitHubリポジトリを選択
3. 環境変数を設定：
   - `OPENAI_API_KEY`: OpenAI API Key

### 3. デプロイ

「Deploy」ボタンをクリックするだけ！

## 制限事項

### Vercel Hobby Planの制限

- **タイムアウト**: 10秒（長い動画は処理できない可能性）
  - 解決策: Vercel Pro Plan（$20/月）にアップグレード
- **ファイルサイズ**: /tmpディレクトリは512MB

### OpenAI APIの制限

- **Whisper API**: 最大25MBまでの音声ファイル
- **コスト**:
  - Whisper: $0.006/分
  - GPT-4o-mini: $0.15/1Mトークン
  - 10分動画1本あたり約$0.07〜$0.10

## トラブルシューティング

### 動画URLが検出されない

- UTAGEページが正しく読み込まれているか確認
- ページに動画が埋め込まれているか確認
- 別のUTAGEページで試す

### 文字起こしが失敗する

- 動画ファイルが大きすぎる（25MB超）可能性
- OpenAI API Keyが正しく設定されているか確認
- ネットワーク接続を確認

### タイムアウトエラー

- Vercel Hobby Planは10秒制限
- 短い動画で試すか、Pro Planにアップグレード

## ライセンス

MIT

## 作成者

Created with Launch Planner + Claude Code 🚀
