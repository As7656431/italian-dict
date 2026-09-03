"""
把 v2 词源重写成果同步到前端 public/data/。

源只用 all_words_enriched_final.json —— 四个分级文件是累积式的，2108 词里
1537 个跨级别重复，其中 1516 个 explanation 各级内容不一致，拼接必然要挑版本。

写入前做守卫校验：与现有文件逐字段比对，只允许 roots.explanation 和
roots.cognates 变化。任何其它字段（examples / conjugation / usage_notes …）
或词序发生变化就中止，不写任何文件。

用法:
    python scripts/sync-data.py --dry-run   # 只校验并报告，不写
    python scripts/sync-data.py             # 校验通过后写入
"""
import json
import os
import sys
import collections

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
SRC = os.path.join(PROJ, "..", "数据工程", "03-深度增强", "v4-谐音重写", "output",
                   "all_words_enriched_final.json")
DATA_DIR = os.path.join(PROJ, "public", "data")
DEST = os.path.join(DATA_DIR, "all_words.json")
INDEX = os.path.join(DATA_DIR, "words_index.json")

EXPECTED_COUNT = 2108
# V4 只允许 mnemonic 顶层字段变化
ALLOWED_TOP_CHANGES = {"mnemonic"}
ALLOWED_ROOTS_CHANGES = set()


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def fail(msg):
    print(f"\n✗ 中止: {msg}")
    print("  未写入任何文件。")
    sys.exit(1)


def validate_source(src):
    """源文件自身的完整性"""
    print("── 校验源文件 ──")
    if len(src) != EXPECTED_COUNT:
        fail(f"条目数 {len(src)}，期望 {EXPECTED_COUNT}")
    words = [e["word"] for e in src]
    if len(set(words)) != len(words):
        dup = [w for w, n in collections.Counter(words).items() if n > 1]
        fail(f"存在重复词: {dup[:10]}")

    no_exp = [e["word"] for e in src if not (e.get("roots") or {}).get("explanation")]
    no_cog = [e["word"] for e in src if "cognates" not in (e.get("roots") or {})]
    if no_exp:
        fail(f"{len(no_exp)} 词缺 explanation: {no_exp[:10]}")
    if no_cog:
        fail(f"{len(no_cog)} 词缺 cognates 字段: {no_cog[:10]}")

    empty_cog = sum(1 for e in src if (e["roots"].get("cognates")) == [])
    lv = collections.Counter(e.get("level") for e in src)
    print(f"  条目 {len(src)}，唯一词 {len(set(words))}")
    print(f"  explanation 齐全，cognates 字段齐全（{empty_cog} 个为空数组，属正常）")
    print(f"  级别分布 {dict(sorted(lv.items()))}")


def reorder_to_match(old, new):
    """
    按现有文件的词序重排 v2 数据。

    现有线上文件是字母序（级别交错），v2 output 是级别分组序（A1→A2→B1→B2）。
    词集完全相同，只是排列不同。不重排会改变首页列表顺序，并让"今日一词"换词
    （dictionary.js 用 seed % length 取下标）——那是本次不该捎带的行为改动。
    """
    old_words = [e["word"] for e in old]
    new_map = {e["word"]: e for e in new}
    if set(old_words) != set(new_map):
        only_old = sorted(set(old_words) - set(new_map))
        only_new = sorted(set(new_map) - set(old_words))
        fail(f"词表不一致 —— 仅现有: {only_old[:8]} / 仅 v2: {only_new[:8]}")
    if len(new_map) != len(new):
        fail("v2 数据存在重复词，无法按词重排")
    print(f"  已按现有文件词序重排（现有为字母序，v2 源为级别分组序）")
    return [new_map[w] for w in old_words]


def validate_diff(old, new):
    """守卫：与现有文件比对，只允许两个 roots 子字段变化"""
    print("── 与现有 public/data/all_words.json 比对 ──")
    if len(old) != len(new):
        fail(f"条目数变化 {len(old)} → {len(new)}")

    old_words = [e["word"] for e in old]
    new_words = [e["word"] for e in new]
    if old_words != new_words:
        fail("词序未对齐（应先经 reorder_to_match 重排）")

    top_changed = collections.Counter()
    roots_changed = collections.Counter()
    changed_words = []
    for a, b in zip(old, new):
        ks = [k for k in set(a) | set(b) if a.get(k) != b.get(k)]
        if ks:
            changed_words.append(b["word"])
            top_changed.update(ks)
        ra, rb = a.get("roots") or {}, b.get("roots") or {}
        for k in set(ra) | set(rb):
            if ra.get(k) != rb.get(k):
                roots_changed[k] += 1

    illegal_top = set(top_changed) - ALLOWED_TOP_CHANGES
    if illegal_top:
        fail(f"以下顶层字段发生变化，不在允许范围内: {sorted(illegal_top)}")
    illegal_roots = set(roots_changed) - ALLOWED_ROOTS_CHANGES
    if illegal_roots:
        fail(f"以下 roots 子字段发生变化，不在允许范围内: {sorted(illegal_roots)}")

    print(f"  变动词条 {len(changed_words)} / {len(new)}")
    print(f"  变动顶层字段 {dict(top_changed)}")
    print(f"  变动 roots 子字段 {dict(roots_changed)}")
    print("  ✓ 其余字段（examples / conjugation / usage_notes …）与词序均未变")


def build_index(src):
    """索引只含 w/t/l/p，v2 未触碰这四项"""
    return [{"w": e["word"], "t": e.get("translation", ""),
             "l": e.get("level", ""), "p": (e.get("pos") or "").rstrip(".")}
            for e in src]


def main():
    dry = "--dry-run" in sys.argv
    src = load(SRC)
    validate_source(src)

    old = load(DEST) if os.path.exists(DEST) else None
    if old is not None:
        print("── 与现有 public/data/all_words.json 对齐词序 ──")
        src = reorder_to_match(old, src)
        validate_diff(old, src)
    else:
        print("── 现有 all_words.json 不存在，跳过比对 ──")

    payload = json.dumps(src, ensure_ascii=False, separators=(",", ":"))
    size_mb = len(payload.encode("utf-8")) / 1024 / 1024
    old_mb = os.path.getsize(DEST) / 1024 / 1024 if old is not None else 0
    print("── 写入 ──")
    print(f"  all_words.json  {old_mb:.2f} MB → {size_mb:.2f} MB（压缩写入，无缩进）")

    if dry:
        print("\n[--dry-run] 校验全部通过，未写入。")
        return

    with open(DEST, "w", encoding="utf-8") as f:
        f.write(payload)

    # 索引：v2 没动 word/translation/level/pos，重建后应与原文件一致
    idx_new = build_index(src)
    idx_old = load(INDEX) if os.path.exists(INDEX) else None
    if idx_old == idx_new:
        print(f"  words_index.json 内容不变（{len(idx_new)} 条），未重写")
    else:
        with open(INDEX, "w", encoding="utf-8") as f:
            json.dump(idx_new, f, ensure_ascii=False, separators=(",", ":"))
        print(f"  words_index.json 已更新（{len(idx_new)} 条）")

    print("\n✓ 同步完成")


if __name__ == "__main__":
    main()
