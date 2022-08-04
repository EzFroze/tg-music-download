import fetch from "node-fetch";
import fs from "fs";
import { Buffer } from "buffer";

const downloadFiles = [];

export async function addToDownload(url, filePath, fileName) {
  downloadFiles.push(downloadFile(url, filePath, fileName));
}

export function clearDownload() {
  downloadFiles.length = 0;
}

function downloadFile(url, filePath, fileName) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => blob.arrayBuffer())
      .then((buffer) => Buffer.from(buffer))
      .then((buffer) => resolve({ buffer, filePath, fileName }))
      .catch((e) => reject(e));
  });
}

export function writeFiles(cb) {
  let errorMessage = "";
  if (!downloadFiles.length) {
    errorMessage = "Список загрузки пуст";
    return cb("", true, errorMessage);
  }
  Promise.allSettled(downloadFiles).then((files) => {
    for (let { status, value } of files) {
      const { filePath, buffer, fileName } = value;
      let isError = false;
      if (status === "fulfilled") {
        fs.createWriteStream(filePath).write(buffer);
      }

      if (status === "rejected") {
        isError = true;
      }

      cb(fileName, isError, errorMessage);
    }
  });
}
