"""Refresh data/episodes.json from the public HCD Barcelona YouTube playlist.

Run by .github/workflows/episodes.yml every day. Standard library only.
"""
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

PLAYLIST_ID = "PLIeaB-Dff3uE"
FEED = "https://www.youtube.com/feeds/videos.xml?playlist_id=" + PLAYLIST_ID
OUT = Path(__file__).resolve().parent.parent / "data" / "episodes.json"

NS = {
    "a": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
    "media": "http://search.yahoo.com/mrss/",
}


def summary(text, limit=220):
    first = re.split(r"\n\s*\n", (text or "").strip())[0]
    first = re.sub(r"https?://\S+", "", first).strip()
    first = " ".join(first.split())
    if len(first) <= limit:
        return first
    return first[:limit].rsplit(" ", 1)[0] + "…"


def main():
    req = urllib.request.Request(FEED, headers={"User-Agent": "hcdbarcelona-site"})
    with urllib.request.urlopen(req, timeout=30) as r:
        root = ET.fromstring(r.read())

    episodes = []
    for e in root.findall("a:entry", NS):
        vid = e.findtext("yt:videoId", namespaces=NS)
        if not vid:
            continue
        episodes.append({
            "id": vid,
            "title": e.findtext("a:title", namespaces=NS),
            "date": e.findtext("a:published", namespaces=NS)[:10],
            "summary": summary(e.findtext("media:group/media:description", namespaces=NS)),
            "url": "https://www.youtube.com/watch?v=" + vid,
            "thumbnail": "https://i.ytimg.com/vi/%s/hqdefault.jpg" % vid,
        })

    if not episodes:
        sys.exit("No episodes found; leaving episodes.json untouched.")

    episodes.sort(key=lambda x: x["date"], reverse=True)
    OUT.write_text(json.dumps(episodes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Wrote %d episodes; latest: %s" % (len(episodes), episodes[0]["title"]))


if __name__ == "__main__":
    main()
