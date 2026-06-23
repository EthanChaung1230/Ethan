function doOptions(e) {
  // 注意：Apps Script 的 TextOutput 不支援自訂回應標頭（addHeader），
  // 所以這裡只回傳空的 200 回應以處理 OPTIONS 請求。
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'GAS Web App 已啟動' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    // 支援兩種傳入格式：JSON (application/json) 或表單資料 (x-www-form-urlencoded / multipart)
    let payload = {};
    if (e.postData && e.postData.type === 'application/json') {
      payload = JSON.parse(e.postData.contents || '{}');
    } else {
      // 透過表單送出時，Apps Script 會在 e.parameter 中提供欄位
      payload = {
        name: e.parameter && e.parameter.name ? e.parameter.name : '',
        memo: e.parameter && e.parameter.memo ? e.parameter.memo : '',
        estimate: e.parameter && e.parameter.estimate ? e.parameter.estimate : '',
        history: e.parameter && e.parameter.history ? e.parameter.history : 0,
        note: e.parameter && e.parameter.note ? e.parameter.note : ''
      };
    }
    const spreadsheetId = '1_OtM0NOvxJApt9yUMYk0Bt1AchBGiW-kuux9jJ1cho0';
    const sheetName = 'Tasks';
    const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);

    if (!sheet) {
      throw new Error('找不到名稱為 ' + sheetName + ' 的工作表。');
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', '任務名稱', '詳細備忘', '預估番茄鐘', '歷史專注次數', '今日心得筆記']);
    }

    sheet.appendRow([
      new Date(),
      payload.name || '',
      payload.memo || '',
      payload.estimate || '',
      Number(payload.history) || 0,
      payload.note || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: '已寫入試算表' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
