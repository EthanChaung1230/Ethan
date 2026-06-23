# 番茄鐘時間管理 App 安裝與部署指南

## 1. 前端檔案
本案包含三專個前端檔案：
- `index.html`
- `style.css`
- `script.js`

請直接開啟 `index.html`，或使用本機伺服器（例如 `python -m http.server`）來避免瀏覽器本地檔案限制。

## 2. GAS 後端設定
1. 建立 Google 試算表。
2. 新增工作表名稱為 `Tasks`。
3. 開啟 Google Apps Script 編輯器。
4. 將以下程式碼貼到 `Code.gs`：
   - `doGet(e)`：回傳測試結果
   - `doPost(e)`：接收前端 POST 資料並寫入試算表
5. 修改 `spreadsheetId` 為你的試算表 ID。
6. 部署為 Web App：
   - 選擇「部署」→「新增部署」
   - 類型選擇「網路應用程式」
   - 執行應用程式的帳戶：選擇你自己
   - 允許存取對象：選擇「任何人，包括匿名使用者」或符合你的組織需求
   - 部署後複製 Web App URL
     - Web App URL 就是你部署後 Google Apps Script 提供的網址，前端會用它發送 `fetch()` POST 資料到 GAS

## 3. 前端連結 GAS
1. 打開 `script.js`。
2. 將 `GAS_WEB_APP_URL` 改成你剛剛複製的 Web App URL。

```js
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/你的部署ID/exec';
```

## 4. 使用方式
- `專注卡片`：顯示目前任務名稱、番茄鐘倒數計時、任務細節。
- `管理頁面`：填寫任務欄位，按「自動填入」即可快速生成建議。
- 點擊「儲存任務」後：
  - 會先保存到本機瀏覽器 `localStorage`
  - 再將任務資料 `POST` 到 GAS 後端，寫入試算表

## 5. 欄位說明
- 任務名稱：必填
- 詳細備忘：任務內容與提醒
- 預估花費時間：建議填寫番茄鐘數，例如 `2 顆番茄鐘`
- 番茄鐘歷史專注次數：可初始化為 `0`
- 今日執行心得筆記：建議執行方式與回顧

## 6. 注意事項
- 範例程式碼已遵守「純前端」「原生 JavaScript」「無框架」要求。
- `autoFillBtn` 的自動填入為本機範例示意，不需要 API Key。
- 若要使用真實的大語言模型 API，可在 `autoFillTask()` 中改為呼叫外部服務。

## 7. 範例 GAS `doPost(e)` 流程
1. 讀取 `e.postData.contents`。
2. 解析 JSON。
3. 打開指定試算表並取得 `Tasks` 工作表。
4. 若工作表為空，先寫入標題列。
5. 將任務資料追加到新列。
6. 回傳 JSON 結果。
