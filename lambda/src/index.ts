import Koa from "koa";
import logger from "koa-logger";
import { post } from "koa-route";
import bodyParser from "koa-bodyparser";
import { handler as pushNetworkSpeed } from "./pushNetworkSpeed";

const app = new Koa();

app.use(bodyParser());
app.use(logger());

const lambda = (path: string, fn: Function): Koa.Middleware => {
  return post(path, async (ctx) => {
    const res = await fn(ctx.request.body, {}, () => {});
    ctx.response.body = res;
  });
};

app.use(lambda("/pushNetworkSpeed", pushNetworkSpeed));

app.listen(3000, () => console.log(`Listening on :3000`));
