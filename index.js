import "dotenv/config";
import { Markup, Telegraf } from "telegraf";
import path from "path";
import fs from "fs";

import { musicPath } from "./const.js";
import { addToDownload, clearDownload, writeFiles } from "./get-file.js";

function checkFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
}

checkFolder(musicPath);

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply("Hello", Markup.keyboard(["/download", "/clear"]));
});

bot.on("audio", async (ctx) => {
  const fileId = ctx.update.message.audio.file_id;
  const fileName = ctx.update.message.audio.file_name;
  const fileNamePath = path.resolve(musicPath, fileName);

  const url = await bot.telegram.getFileLink(fileId);
  addToDownload(url.href, fileNamePath, fileName);
});

bot.command("download", (ctx) => {
  writeFiles((fileName, isError, errorMessage) => {
    if (isError && errorMessage) {
      ctx.reply(errorMessage);
      return;
    }

    const text = isError
      ? `Файл ${fileName} не удалось загрузить`
      : `Файл ${fileName} был загружен`;
    ctx.reply(text);
  });
});

bot.command("clear", (ctx) => {
  clearDownload();
  ctx.reply("Список загрузки был очищен");
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
