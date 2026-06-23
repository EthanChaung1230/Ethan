function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .addHeader('Access-Control-Allow-Origin', '*')
    .addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .addHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'GAS Web App 已啟動' }))
    .setMimeType(ContentService.MimeType.JSON)
    .addHeader('Access-Control-Allow-Origin', '*');
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const spreadsheetId = '1oHaCIMFJgAFkulvVAqSAf6zH521dnxYBk9mStIO3A2M';
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
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader('Access-Control-Allow-Origin', '*');
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.message }))
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader('Access-Control-Allow-Origin', '*');
  }
}
