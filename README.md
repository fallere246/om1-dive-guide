# OM-1 水中撮影ガイド

UH-OM1 II ハウジング + FLP-09 フラットポート + UMG-01 マグニファイヤーで OM-1 を海に持っていくときの、セッティング・注意点・操作方法をまとめた個人用ページ。

## 構成

- `index.html` 本文（1ページ）
- `assets/css/style.css` / `assets/js/app.js` スタイルとスクリプト（チェックリスト保存、タイマー、画像拡大、テーマ切替）
- `assets/img/manual/` 取扱説明書・取付方法の PDF から切り出した図版
- `assets/img/product/` 製品ページの写真（WebP に変換済み）
- `sw.js` オフライン用 Service Worker。画像を追加・変更したら `ASSETS` に追記し、`VERSION` を上げる

ビルドは不要。

## GitHub Pages で公開する

1. GitHub にリポジトリを作って push する
2. Settings → Pages → Source を「Deploy from a branch」、Branch を `main` / `/ (root)` にする

## 出典

図版と写真の著作権は株式会社フィッシュアイと各権利者に帰属する。出典の一覧はページ末尾にある。

- https://www.fisheye-jp.com/products/uh-om1ii.html
- https://www.fisheye-jp.com/products/flp-09.html
- https://www.fisheye-jp.com/products/umg_01.html
- https://www.fisheye-jp.com/_userdata/10561_UH-OM1ii.pdf
- https://www.fisheye-jp.com/_userdata/21558_FLP-09_Installation.pdf
- https://www.fisheye-jp.com/_userdata/21352_aoi_UMG_webA5.pdf
