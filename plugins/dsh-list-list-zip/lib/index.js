/**
 * 列表工具：list zip — 列表工具
 */

export const name = "dsh-list-list-zip";
export const inject = ["tools"];

const NL = String.fromCharCode(10);
const SITE = "https://deepseekbase.com/zh/tools/";
const TEXT_OUTPUT = {
  schema: { type: "object", additionalProperties: false, properties: { text: { type: "string" } }, required: ["text"] },
  render: (_args, value) => [{ type: "text", text: (value && value.text) || "" }],
};

function arr(t) { return String(t || "").split(/[\n,;，；]+/).map((x) => x.trim()).filter((x) => x.length); }
function arrA(a) { return String(a || "").split(/[\n,;，；]+/).map((x) => x.trim()).filter((x) => x.length); }
function out(xs) { return xs.join(NL); }
function ints(t) { return arr(t).map(Number).filter((x) => Number.isFinite(x)); }

const OPS = {
  list_dedupe: (t) => out([...new Set(arr(t))]),
  list_sort: (t) => { const xs = arr(t); const allNum = xs.every((x) => Number.isFinite(Number(x))); return out(xs.slice().sort(allNum ? (a, b) => Number(a) - Number(b) : (a, b) => a.localeCompare(b, "zh"))); },
  list_sort_desc: (t) => OPS.list_sort(t).split(NL).reverse().join(NL),
  list_reverse: (t) => arr(t).reverse().join(NL),
  list_unique_count: (t) => { const xs = arr(t); return "总项: " + xs.length + NL + "去重后: " + new Set(xs).size; },
  list_intersect: (t, a) => { const B = new Set(arrA(a)); return out(arr(t).filter((x) => B.has(x))); },
  list_union: (t, a) => out([...new Set(arr(t).concat(arrA(a)))]),
  list_diff: (t, a) => { const B = new Set(arrA(a)); return out(arr(t).filter((x) => !B.has(x))); },
  list_chunk: (t, a) => { const n = Math.max(1, Number(a) || 3); const xs = arr(t); const o = []; for (let i = 0; i < xs.length; i += n) o.push(xs.slice(i, i + n).join(" | ")); return out(o); },
  list_flatten: (t) => arr(t).join(" "),
  list_zip: (t, a) => { const A = arr(t), B = arrA(a); const n = Math.max(A.length, B.length); const o = []; for (let i = 0; i < n; i++) o.push((A[i] || "") + " | " + (B[i] || "")); return out(o); },
  list_range: (t, a) => { const s = Number(t); const e = Number(a); if (!Number.isFinite(s) || !Number.isFinite(e)) throw new Error("text=开始 a=结束"); const step = e >= s ? 1 : -1; const o = []; for (let i = s; step > 0 ? i <= e : i >= e; i += step) o.push(String(i)); return out(o); },
  list_sample: (t, a) => { const xs = arr(t); const k = Math.min(xs.length, Math.max(1, Number(a) || 5)); const copy = xs.slice(); for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const tmp = copy[i]; copy[i] = copy[j]; copy[j] = tmp; } return out(copy.slice(0, k)); },
  list_shuffle: (t) => OPS.list_sample(t, String(arr(t).length)),
  list_repeat: (t, a) => { const n = Math.max(1, Number(a) || 2); const o = []; for (let i = 0; i < n; i++) o.push(...arr(t)); return out(o); },
  list_remove: (t, a) => out(arr(t).filter((x) => x !== String(a))),
  list_join: (t, a) => arr(t).join(String(a || ", ")),
  list_split: (t, a) => out(String(t).split(String(a || ",")).map((x) => x.trim()).filter(Boolean)),
  list_summary: (t) => { const xs = arr(t); return "项数: " + xs.length + NL + "首项: " + (xs[0] || "") + NL + "末项: " + (xs[xs.length - 1] || "") + NL + "去重: " + new Set(xs).size; },
  list_top_n: (t, a) => { const xs = ints(t); const n = Math.max(1, Number(a) || 5); return out(xs.slice().sort((x, y) => y - x).slice(0, n).map(String)); },
};

export function apply(ctx, config) {
  void config;
  ctx.tools.register({
    name: "list_zip",
    description: "list zip",
    parameters: {
      text: { "type": "string", required: true, "description": "列表" },
      a: { "type": "string", "description": "参数 a" },
    },
    output: TEXT_OUTPUT,
    async execute(args) {
      const t = args && args.text != null ? String(args.text) : "";
      const a = args && args.a != null ? String(args.a) : "";
      try {
        const fn = OPS["list_zip"];
        if (!fn) throw new Error("未知操作");
        return { text: ["列表工具：list zip", "=".repeat(52), String(fn(t, a)), "", "更多工具：" + SITE].join(NL) };
      } catch (e) {
        return { text: "处理失败: " + String((e && e.message) || e) };
      }
    },
  });
}
