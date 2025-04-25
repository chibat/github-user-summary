// import { assertEquals } from "@std/assert";
import { sum } from "./mod.ts";

Deno.test(async function addTest() {
  const result = await sum("chibat", {maxPage: 1});
  console.log(result);
});
