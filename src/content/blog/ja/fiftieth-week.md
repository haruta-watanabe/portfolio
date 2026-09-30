---
title: "Bot検出と排除の実装とアプリケーション開発での不具合解消"
description: "学習50週目の振り返りと51週目の目標です"
publishDate: "2026-09-30"
tags: ["研究", "開発", "不具合解消", "振り返り", "目標"]
img: "../../../assets/images/blog/post-image-study.jpg"
img_alt: "机の上の本"
---

# Bot検出と排除の実装とアプリケーション開発での不具合解消

いつもお世話になっております。渡邉朝太（Haruta Watanabe）です。

普段はモバイルアプリやWebサイトなどの開発を行っていますが、ソフトウェアエンジニア、そしてデータサイエンティストとしてのキャリアを視野に入れ、学習の50週目が終わりました。今週は、サークルに向けて提供しているシステムを開発している中で面白い不具合（SDK起因）に遭遇したので解消方法とともに学んだことを紹介します。

## 50週目の振り返り

今週は、先週に引き続き以下の2つの軸で学習を進めました。

- **Bot検出、排除**
  フェーズ2の実装に向け、論文を読み、実装方針について検討しました。
- **エンジニアリング**
  サークルに向けて提供しているサービスの開発にて、WebPush通知の実装に伴うSDK起因の不具合に遭遇しました。これを避けるような実装にすることで、正常な通知を送れるようになりました。

### WebPush通知機能実装時に遭遇した不具合と回避方法のまとめ - Firebase FCMで `installation-id-not-registered` が発生した原因と解決方法

Firebase Cloud Messaging（FCM）を利用してWeb/PWAのPush通知を実装した際、端末登録自体は正常に完了しているにもかかわらず、Push送信時に次のエラーが発生しました。

```text
messaging/installation-id-not-registered
```

## 発生していた問題

Push通知にはFirebase MessagingのFID（Firebase Installation ID）方式を採用し、次のような流れで端末を登録していました。

```text
register()
↓
onRegistered() でFIDを取得
↓
Cloud FunctionsへFIDを登録
↓
FCMでPush送信
↓
messaging/installation-id-not-registered
```

Firebaseへの端末登録やFirestoreへのFID保存は正常に完了していたため、当初はFCM側やService Worker、VAPID Keyなどを疑いました。

しかし、原因は別の場所にありました。

## 原因

原因は、**FID方式のFirebase MessagingとFirebase Functionsの`httpsCallable()`を併用していたこと**でした。

2026年9月時点のFirebase JS SDKでは、FID方式でPush登録した後に`httpsCallable()`を実行すると、Functions SDK内部でLegacy Messaging Tokenを取得する処理が走り、登録済みのFIDがPush送信先として無効になる問題が報告されています。

Firebase JS SDKのIssueでは `firebase/firebase-js-sdk #10135` として報告されています。

つまり、

```text
FIDを正常に登録
↓
httpsCallable()を実行
↓
Legacy Messaging Token取得処理が動く
↓
FIDがPush targetとして無効化
↓
FCM送信
↓
installation-id-not-registered
```

という流れでした。

## 解決方法

ブラウザ側からCloud Functionsを呼び出す際に、`httpsCallable()`を直接使用するのをやめました。

代わりに独自の`callFirebaseCallable()`を用意し、通常の`fetch()`でCallable Functionを呼び出しています。

```text
Firebase AuthからID Tokenを取得
↓
Authorization: Bearer <ID Token>
↓
fetch()でCloud Functionsを呼び出す
↓
{ data: ... }形式でデータを送信
```

サーバー側は従来どおりCloud Functionsの`onCall`を利用しています。

つまり、変更したのは**ブラウザ側のCallable Functionの呼び出し方法だけ**です。

## 結果

`httpsCallable()`を回避したことでFIDが無効化されなくなり、

```text
FID登録
↓
バックエンドへFID保存
↓
FCM Push送信
↓
正常に通知受信
```

という流れでPush通知を送信できるようになりました。

## 学び

今回厄介だったのは、端末登録APIやFirestoreへの保存自体は成功していたことです。

そのため、

> 「登録APIが200 OKだからPush通知も正常に登録されている」

とは限りません。

FCMのように複数のSDKや内部状態が関係する機能では、エラーが発生した場所だけでなく、**その直前に実行したFirebase SDKの処理まで含めて調査することが重要**だと分かりました。

## 51週目の目標

51週目は、引き続き研究の要となる基礎知識の定着に改めて注力します。

- **公開と計測**
    フェーズ1を公開し、本番環境での計測を行います。これにより、実装したBot検出と排除の精度を確認し、改善点を洗い出すことができます。
- **フェーズ2の実装**
    研究の第2フェーズを実装し、私の環境内で計測します。

## 今後について

引き続き、毎週月曜日に「前週の振り返り」と「その週の目標」をまとめて発信していきます。

今後ともよろしくお願いいたします。
