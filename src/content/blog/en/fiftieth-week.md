---
title: "Implementation of Bot Detection and Rejection, and Fixing a Bug in Application Development"
description: "A look back at week 50 of my studies and goals for week 51."
publishDate: "2026-09-30"
tags: ["Research", "Development", "Bug Fix", "Reflection", "Goals"]
img: "../../../assets/images/blog/post-image-study.jpg"
img_alt: "Books on a desk"
---

# Implementation of Bot Detection and Rejection, and Fixing a Bug in Application Development

Hello, this is Haruta Watanabe.

While I usually develop mobile apps and websites, I have now completed the 50th week of my studies with a view towards a career as a software engineer and data scientist. This week, while developing a system provided for my student club, I encountered an interesting bug (caused by an SDK). I'd like to introduce what I learned along with how I resolved it.

## Week 50 Reflection

This week, continuing from last week, I proceeded with my studies along the following two axes:

- **Bot Detection and Rejection**
  In preparation for the Phase 2 implementation, I read academic papers and considered the implementation policy.
- **Engineering**
  During the development of a service for my student club, I encountered a bug caused by the SDK when implementing WebPush notifications. By adopting an implementation that avoided this, I was able to send notifications successfully.

### Summary of the Bug Encountered and Workaround When Implementing WebPush Notifications - Causes and Solutions for `installation-id-not-registered` in Firebase FCM

When I implemented Push notifications for Web/PWA using Firebase Cloud Messaging (FCM), the following error occurred when sending a Push, even though the device registration itself had completed successfully.

```text
messaging/installation-id-not-registered

```

## The Problem

For push notifications, I adopted the Firebase Messaging FID (Firebase Installation ID) method, registering devices in the following flow:

```text
register()
↓
Obtain FID in onRegistered()
↓
Register FID to Cloud Functions
↓
Send Push via FCM
↓
messaging/installation-id-not-registered

```

Because device registration to Firebase and saving the FID to Firestore were completed successfully, I initially suspected the FCM side, the Service Worker, or the VAPID Key.

However, the cause lay elsewhere.

## The Cause

The cause was **using both Firebase Messaging via the FID method and `httpsCallable()` in Firebase Functions together.**

In the Firebase JS SDK as of September 2026, there is a reported issue where, if you execute `httpsCallable()` after registering for Push via the FID method, an internal process in the Functions SDK runs to fetch a Legacy Messaging Token, invalidating the registered FID as a Push target.

This has been reported as an issue in the Firebase JS SDK: `firebase/firebase-js-sdk #10135`.

In other words, the flow was:

```text
Successfully register FID
↓
Execute httpsCallable()
↓
Process to fetch Legacy Messaging Token runs
↓
FID is invalidated as a Push target
↓
FCM sending
↓
installation-id-not-registered

```

## The Solution

I stopped using `httpsCallable()` directly when calling Cloud Functions from the browser side.

Instead, I prepared my own `callFirebaseCallable()` and am calling the Callable Function using a standard `fetch()`.

```text
Obtain ID Token from Firebase Auth
↓
Authorization: Bearer <ID Token>
↓
Call Cloud Functions using fetch()
↓
Send data in { data: ... } format

```

The server side still uses `onCall` for Cloud Functions as before.

In short, the only thing changed was **how the Callable Function is called from the browser side**.

## The Result

By avoiding `httpsCallable()`, the FID is no longer invalidated, and I am now able to send Push notifications in the following flow:

```text
Register FID
↓
Save FID to the backend
↓
Send FCM Push
↓
Successfully receive notification

```

## What I Learned

What was tricky this time was that the device registration API and the saving to Firestore itself were succeeding.

Therefore, it is not necessarily true that:

> "Because the registration API returns 200 OK, the Push notification is also registered normally."

For features like FCM where multiple SDKs and internal states are involved, I learned that it is important to investigate not just where the error occurred, but **also the processes of the Firebase SDK executed immediately prior**.

## Week 51 Goals

In week 51, I will continue to focus on solidifying the foundational knowledge that is crucial for my research.

* **Publication and Measurement**
I will publish Phase 1 and conduct measurements in the production environment. Through this, I can confirm the accuracy of the implemented bot detection and rejection, and identify areas for improvement.
* **Phase 2 Implementation**
I will implement the second phase of my research and measure it within my environment.

## Going Forward

I will continue to post a summary of my previous week's reflection and my goals for the current week every Monday.

Thank you for your continued support.
