const Koa = require("koa");
const Router = require("koa-router");
const fs = require("fs");
const path = require("path");
const cors = require("@koa/cors");
const { koaBody } = require("koa-body");
const staticServe = require("koa-static");

const app = new Koa();
const router = new Router();
const port = 5000;
const rootPath = process.cwd();

router.post("/upload", (ctx) => {
  let file = ctx.request.files.file;
  let folderPath = path.join(rootPath, "uploads");
  let outputPath = path.join(folderPath, file.originalFilename);

  // 文件夹不存在，创建文件夹
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log("文件夹已创建");
  }

  // 文件存在，自动删除
  if (fs.existsSync(file.originalFilename)) {
    fs.unlinkSync(outputPath);
  }

  // /**
  //  * !模拟上传错误
  //  */
  // if (file.originalFilename === "bgi3.jpg") {
  //   ctx.response.status = 500;
  //   ctx.response.body = { error: "Failed to upload file" };
  //   return;
  // }

  // 保存上传的文件
  try {
    const reader = fs.createReadStream(file.filepath);
    const writer = fs.createWriteStream(outputPath);
    reader.pipe(writer);

    ctx.response.status = 200;
    ctx.response.body = JSON.stringify({
      code: 200,
      data: `http://127.0.0.1:${port}/${file.originalFilename}`,
    });
  } catch (err) {
    console.error(err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to upload file" };
  }
});

app.use(cors());
app.use(
  koaBody({
    multipart: true,
  })
);
app.use(router.routes());
app.use(staticServe("uploads"));

app.listen(port, () => {
  console.log(`http://127.0.0.1:${port}`);
});
