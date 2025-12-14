import { GOOGLE_SHEETS_WEBHOOK_URL } from '../constants';
import { StudentInfo } from '../types';

/**
 * --- INSTRUCTIONS FOR GOOGLE SHEET CONNECTION ---
 * 
 * To make this work, you must add the following script to your Google Sheet:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Paste the code below into the editor (replace existing code)
 * 4. Save and Click "Deploy" > "New deployment"
 * 5. Select type: "Web app"
 * 6. Execute as: "Me"
 * 7. Who has access: "Anyone" (Important!)
 * 8. Deploy and ensure the URL matches 'GOOGLE_SHEETS_WEBHOOK_URL' in constants.ts
 *
 * --- COPY THIS CODE INTO APPS SCRIPT ---
 *
 * function doPost(e) {
 *   var lock = LockService.getScriptLock();
 *   lock.tryLock(10000);
 *   
 *   try {
 *     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *     
 *     // Parse the incoming JSON data
 *     var data = JSON.parse(e.postData.contents);
 *     var name = data.name;
 *     var email = data.email;
 *     var score = data.score;
 *     var examTitle = data.examTitle;
 *     var timestamp = new Date();
 *     
 *     // --- SETUP HEADERS (If empty) ---
 *     if (sheet.getLastRow() === 0) {
 *       // Col 1=Name, Col 2=Gmail. Dynamic Cols start from 3.
 *       sheet.getRange(1, 1, 1, 2).setValues([["Name", "Gmail"]]);
 *     }
 *
 *     // --- LOCATE USER ROW ---
 *     // We search Column B (Gmail) for the user.
 *     var lastRow = sheet.getLastRow();
 *     var userRowIndex = -1;
 *     
 *     // If we have data, search for the email
 *     if (lastRow > 1) {
 *       var emails = sheet.getRange(2, 2, lastRow - 1, 1).getValues(); // Get all emails in Col B
 *       for (var i = 0; i < emails.length; i++) {
 *         if (emails[i][0].toString().toLowerCase() === email.toString().toLowerCase()) {
 *           userRowIndex = i + 2; // +2 because 0-index + 1 header row + 1 (array index to row number mapping)
 *           break;
 *         }
 *       }
 *     }
 *
 *     // If user not found, create new row
 *     if (userRowIndex === -1) {
 *       userRowIndex = lastRow + 1;
 *       sheet.getRange(userRowIndex, 1).setValue(name);
 *       sheet.getRange(userRowIndex, 2).setValue(email);
 *     } else {
 *       // Update name if changed (optional)
 *       sheet.getRange(userRowIndex, 1).setValue(name);
 *     }
 *
 *     // --- LOCATE EXAM COLUMN ---
 *     // Search Row 1 for the Exam Title
 *     var lastCol = sheet.getLastColumn();
 *     var examColIndex = -1;
 *     
 *     if (lastCol > 2) {
 *       var headers = sheet.getRange(1, 3, 1, lastCol - 2).getValues()[0];
 *       for (var j = 0; j < headers.length; j++) {
 *         if (headers[j] === examTitle) {
 *           examColIndex = j + 3; // +3 because 0-index + 2 fixed columns + 1 (array index to col number)
 *           break;
 *         }
 *       }
 *     }
 *
 *     // If exam column not found, create it
 *     if (examColIndex === -1) {
 *       examColIndex = lastCol + 1;
 *       // If table was empty (lastCol < 2), start at 3
 *       if (examColIndex < 3) examColIndex = 3; 
 *       sheet.getRange(1, examColIndex).setValue(examTitle);
 *     }
 *
 *     // --- WRITE SCORE ---
 *     // Write the score to the intersection of User Row and Exam Column
 *     sheet.getRange(userRowIndex, examColIndex).setValue(score);
 *     
 *     return ContentService.createTextOutput(JSON.stringify({
 *       "result": "success",
 *       "row": userRowIndex,
 *       "col": examColIndex
 *     })).setMimeType(ContentService.MimeType.JSON);
 *     
 *   } catch (error) {
 *     return ContentService.createTextOutput(JSON.stringify({
 *       "result": "error", 
 *       "message": error.toString()
 *     })).setMimeType(ContentService.MimeType.JSON);
 *   } finally {
 *     lock.releaseLock();
 *   }
 * }
 * 
 * --- END OF APPS SCRIPT CODE ---
 */

export const submitToGoogleSheet = async (student: StudentInfo, score: number, examTitle: string): Promise<boolean> => {
  try {
    const payload = {
      name: student.name,
      email: student.email,
      score: score,
      examTitle: examTitle,
      timestamp: new Date().toISOString()
    };

    // 'no-cors' mode is used because Google Apps Script Web Apps do not support CORS preflight requests 
    // for standard JSON posts in a way that browsers accept easily without complex workarounds.
    await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', 
      },
      body: JSON.stringify(payload),
    });

    return true;
  } catch (error) {
    console.error("Failed to submit to Google Sheet:", error);
    return false;
  }
};