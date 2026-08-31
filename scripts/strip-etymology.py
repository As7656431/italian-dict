"""
清理 roots.parts[].meaning 里的古语言词源引证（拉丁语/希腊语/古法语…）。

只删"引证"，保留中文语义。例：
    源自拉丁语 prae，意为"在前面、居于前位"   →  意为"在前面、居于前位"
    运气，命运；源自拉丁语 fortuna            →  运气，命运
    拉丁语前缀，表示"在……之间"               →  前缀，表示"在……之间"

不动 roots.explanation（v2 已干净）、不动 mnemonic（那里的拉丁语是当记忆抓手用的）。
清理不掉的条目原样保留 —— 宁可留着，不能删出读不通的句子。

用法:
    python scripts/strip-etymology.py --dry-run   # 只报告
    python scripts/strip-etymology.py             # 实际写入
"""
import json
import os
import re
import sys
import collections

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
DEST = os.path.join(PROJ, "public", "data", "all_words.json")

KW = ["拉丁", "希腊", "古法语", "日耳曼", "梵语", "阿拉伯语", "古英语",
      "伊特鲁里亚", "古普罗旺斯", "凯尔特", "古高地德语", "西班牙语", "波斯语"]

ANC = (r"(?:晚期|中世纪|通俗|古典|后期|现代|医学|教会|新)*"
       r"(?:拉丁语?|希腊语?|古法语|法语|日耳曼语?|梵语|阿拉伯语|古英语|"
       r"伊特鲁里亚语?|古普罗旺斯语?|凯尔特语?|古高地德语|西班牙语|波斯语)")
SEM = r"(?:原?意为|原义为?|原意是|意思是|表示|指|相当于|用于|构成)"

PATTERNS = [
    # 源自拉丁语 XXX，意为"…"  →  意为"…"
    (rf"^(?:源自|来自|出自|源于|取自|借自)\s*{ANC}[^，；,;]*[，,]\s*(?={SEM})", ""),
    # 源自拉丁语 XXX 的过去分词/词干 YYY，意为"…"  →  意为"…"
    (rf"^(?:源自|来自|出自|源于)\s*{ANC}[^，；,;]*?"
     rf"(?:过去分词|现在分词|词干|词根|中性|复数)[^，；,;]*[，,]\s*(?={SEM})", ""),
    # 词根，源自拉丁语 XXX，意为"…"  →  词根，意为"…"
    (rf"[，,]\s*(?:源自|来自|出自|源于|借自)\s*{ANC}[^，；,;]*(?=[，,]\s*{SEM})", ""),
    # 由拉丁语 ex- 演变，表示"…"  →  表示"…"
    (rf"^(?:由|从)\s*{ANC}\s*[^，；,;]*?(?:演变|发展|而来|派生)[^，；,;]*[，,]\s*(?={SEM})", ""),
    # 开头的 "拉丁语前缀，" / "拉丁语构词成分，" → "前缀，"
    (rf"^{ANC}(?=(?:前缀|后缀|词根|词干|词尾|前置词|介词))", ""),
    (rf"^{ANC}(?:构词)?成分[，,]\s*", ""),
    # ；…拉丁语…（整个分句删掉，含"另/更早/其远源/与…有关"等）
    (rf"[；;]\s*[^；;]*{ANC}[^；;]*$", ""),
    # ，源自/来自/经…拉丁语…（句尾整段删掉）
    (rf"[，,]\s*(?:另|更早|其远源|远源|均|也|可能|或)*\s*"
     rf"(?:源自|来自|出自|源于|与|经|借自|取自)[^，；,;]*{ANC}[^，；,;]*$", ""),
    # 括号内的古语言引用
    (rf"[（(][^）)]*{ANC}[^）)]*[）)]", ""),
]


def transform(text):
    s = text
    for pat, rep in PATTERNS:
        s = re.sub(pat, rep, s)
    s = re.sub(r"\s{2,}", " ", s)
    s = re.sub(r"[，,]{2,}", "，", s)
    return s.strip(" ，,；;、")


def has_ancient(text):
    return any(k in (text or "") for k in KW)


def main():
    dry = "--dry-run" in sys.argv
    with open(DEST, encoding="utf-8") as f:
        data = json.load(f)

    total_parts = 0
    hits = 0
    cleaned = 0
    kept = 0
    samples = []
    kept_samples = []

    for entry in data:
        roots = entry.get("roots") or {}
        for part in roots.get("parts") or []:
            m = part.get("meaning") or ""
            total_parts += 1
            if not has_ancient(m):
                continue
            hits += 1
            t = transform(m)
            # 守卫：清理后仍含古语言，或短得读不通 → 原样保留
            if has_ancient(t) or len(t) < 5:
                kept += 1
                if len(kept_samples) < 8:
                    kept_samples.append((entry["word"], part["part"], m))
                continue
            cleaned += 1
            if len(samples) < 10:
                samples.append((entry["word"], part["part"], m, t))
            if not dry:
                part["meaning"] = t

    print(f"parts 条目总数 {total_parts}")
    print(f"  含古语言词源 {hits}")
    print(f"  ✓ 已清理 {cleaned} ({cleaned * 100 // hits}%)")
    print(f"  · 原样保留 {kept} ({kept * 100 // hits}%) —— 删了会读不通")
    print()
    print("=== 清理样例 ===")
    for w, p, before, after in samples:
        print(f"  【{w}】{p}")
        print(f"     原: {before[:88]}")
        print(f"     后: {after[:88]}")
    print()
    print("=== 保留样例（未改动）===")
    for w, p, m in kept_samples:
        print(f"  【{w}】{p} → {m[:80]}")

    if dry:
        print("\n[--dry-run] 未写入。")
        return

    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    with open(DEST, "w", encoding="utf-8") as f:
        f.write(payload)
    size = len(payload.encode("utf-8")) / 1024 / 1024
    print(f"\n✓ 已写入 all_words.json（{size:.2f} MB）")


if __name__ == "__main__":
    main()
