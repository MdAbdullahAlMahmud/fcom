// Google Drive Service: Uploads PDF and returns public link
import { google } from 'googleapis';
import fs from 'fs';

export async function uploadToDrive(auth, filePath, fileName, folderId) {
  const drive = google.drive({ version: 'v3', auth });
  const fileMetadata = {
    name: fileName,
    parents: folderId ? [folderId] : undefined,
  };
  const media = {
    mimeType: 'application/pdf',
    body: fs.createReadStream(filePath),
  };
  const file = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id',
  });
  // Set permission to anyone with the link
  await drive.permissions.create({
    fileId: file.data.id,
    requestBody: { role: 'reader', type: 'anyone' },
  });
  // Get shareable link
  const result = await drive.files.get({
    fileId: file.data.id,
    fields: 'webViewLink',
  });
  return result.data.webViewLink;
}
