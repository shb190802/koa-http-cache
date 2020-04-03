const Koa = require("koa");
const KoaRouter = require("koa-router");
const KoaStatic = require("koa-static");

const app = new Koa();
const router = new KoaRouter();

router.get("/index.html", async (ctx, next) => {
  // ctx.response.set("Expires", new Date(Date.now() + 1 * 60 * 1000).toString());
  // ctx.response.set("Cache-Control", "max-age=60;public");
  await next();
});

router.get("/images/cache.png", async (ctx, next) => {
  // 设置pragma 强缓存失效 Expires好像没用
  //   ctx.response.set("pragma", "no-cache");
  // // 均设置2分钟失效   两分钟内会缓存
  ctx.response.set("Expires", new Date(Date.now() + 2 * 60 * 1000).toString());
  ctx.response.set("Cache-Control", "max-age=120;public");

  // Expires 立刻失效；Cache-Control2分钟 两分钟内缓存
  //   ctx.response.set("Expires", new Date().toString());
  //   ctx.response.set("Cache-Control", "max-age=120;public");

  // Expires 立刻失效；Cache-Control2分钟 不缓存
  //   ctx.response.set("Expires", new Date(Date.now() + 2 * 60 * 1000).toString());
  //   ctx.response.set("Cache-Control", "max-age=0");

  let Etag = "123456";
  ctx.response.set("Etag", Etag);

  let ifModifiedSince = ctx.request.headers["if-modified-since"];
  let ifNoneMatch = ctx.request.headers["if-none-match"];

  if (ifNoneMatch === Etag) {
    ctx.response.status = 304;
  } else if (ifModifiedSince === "Sun, 15 Mar 2020 13:05:35 GMT") {
    ctx.response.status = 304;
  }
  await next();
});

app
  .use(async (ctx, next) => {
    console.log(ctx.url);
    await next();
  })
  .use(router.routes())
  .use(router.allowedMethods())
  .use(KoaStatic("./static"));

app.listen(3000, err => {
  console.log(err ? err.message : "koa run in port 3000");
});
