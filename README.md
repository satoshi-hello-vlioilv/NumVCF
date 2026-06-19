# NumVCF

業務向け VCF 連絡先管理アプリ。認知心理学・情報アーキテクチャに基づいた高密度 UI と、拡張可能な VCF フォーマットマスターシステムを備えます。

## 技術スタック

- React 18 + TypeScript + Vite
- Tailwind CSS v3（ジェンダーニュートラル・パステルカラーシステム）
- FontAwesome（アイコン全般）
- Zustand + Immer（状態管理）
- Dexie.js / IndexedDB（永続化）
- React Hook Form + Zod（フォームバリデーション）
- React Router v6

## 主な機能

- 2ペインレイアウト（リスト + 詳細パネル）
- あ行〜わ行 / A-Z アルファベット索引バー
- 情報密度切替（コンパクト / 標準 / ゆったり）
- VCF インポート（ドラッグ&ドロップ、フォーマット自動検出）
- VCF エクスポート（フォーマット・対象範囲選択）
- 10種類の組み込みフォーマットプロファイル（vCard 2.1/3.0/4.0、Docomo、au、SoftBank、Google、Apple、Outlook、Android）
- Quoted-Printable / Shift_JIS などのキャリア固有 Quirk 対応
- 全文検索（名前・読み・会社・電話・メール）
- 一括選択・削除・エクスポート
- ダークモード

## 対応 VCF フォーマット

| ID | 名前 | バージョン | 文字コード |
|---|---|---|---|
| vcf-standard-30 | 標準 vCard 3.0 | 3.0 | UTF-8 |
| vcf-standard-40 | 標準 vCard 4.0 | 4.0 | UTF-8 |
| vcf-standard-21 | 標準 vCard 2.1 | 2.1 | UTF-8 |
| vcf-docomo-21 | NTT Docomo | 2.1 | Shift_JIS |
| vcf-softbank-21 | SoftBank | 2.1 | UTF-8 |
| vcf-au-21 | au (KDDI) | 2.1 | Shift_JIS |
| vcf-google-30 | Google Contacts | 3.0 | UTF-8 |
| vcf-apple-30 | Apple Contacts | 3.0 | UTF-8 |
| vcf-outlook-30 | Microsoft Outlook | 3.0 | UTF-8 |
| vcf-android-30 | Android 連絡帳 | 3.0 | UTF-8 |

## 起動

```bash
npm install
npm run dev      # 開発サーバー
npm run build    # プロダクションビルド
npm run preview  # ビルド結果プレビュー
```

## キーボードショートカット

| キー | 操作 |
|---|---|
| Ctrl+N | 新規連絡先追加 |
| Ctrl+I | VCF インポート |
| Ctrl+Shift+E | VCF エクスポート |
| Esc | パネルを閉じる / 選択解除 |
