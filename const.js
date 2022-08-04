import * as url from "url";
import path from "path";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export const musicPath = path.resolve(__dirname, "music");
