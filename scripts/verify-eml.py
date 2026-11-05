"""Inspect a local message without printing headers, body, path, or image URLs."""
from email import policy
from email.parser import BytesParser
from html.parser import HTMLParser
import json
from pathlib import Path
import sys
from urllib.parse import urlsplit


class ImageSources(HTMLParser):
    INERT = {"template", "textarea", "title", "script", "style", "xmp", "iframe", "noembed", "noscript"}

    def __init__(self, expected_url):
        super().__init__(convert_charrefs=True)
        self.expected_url = expected_url
        self.count = 0
        self.inert_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in self.INERT:
            self.inert_depth += 1
        sources = [value for name, value in attrs if name == "src"]
        if not self.inert_depth and tag == "img" and sources == [self.expected_url]:
            self.count += 1

    def handle_endtag(self, tag):
        if tag in self.INERT and self.inert_depth:
            self.inert_depth -= 1


def body_html_parts(part):
    html = selected_body(part)
    if html:
        yield html


def selected_body(part):
    # Return None for a resource, "" for a supported plain-text body, and the
    # decoded HTML otherwise. Selecting a plain body must not scan later files.
    if part.get_content_disposition() == "attachment" or part.get_filename() or part.get_content_maintype() == "message":
        return None
    kind = part.get_content_type()
    if kind == "text/plain":
        return ""
    if kind == "text/html":
        return part.get_content()
    if not part.is_multipart():
        return None
    parts = list(part.iter_parts())
    if kind == "multipart/related":
        start = part.get_param("start")
        root = next((child for child in parts if child.get("Content-ID") == start), None) if start else next(iter(parts), None)
        return selected_body(root) if root is not None else None
    if kind == "multipart/alternative":
        # The final supported alternative is the body, not a union of versions.
        parts.reverse()
    elif kind != "multipart/mixed":
        return None
    for child in parts:
        body = selected_body(child)
        if body is not None:
            return body
    return None


def count_external_images(raw_message, expected_url):
    message = BytesParser(policy=policy.default).parsebytes(raw_message)
    count = 0
    for html in body_html_parts(message):
        parser = ImageSources(expected_url)
        parser.feed(html)
        parser.close()
        count += parser.count
    return count


def main():
    if len(sys.argv) != 3:
        print("Usage: python3 scripts/verify-eml.py LOCAL_MESSAGE.eml EXPECTED_HTTPS_PIXEL_URL", file=sys.stderr)
        return 2
    try:
        target = urlsplit(sys.argv[2])
        if target.scheme != "https" or not target.netloc or target.username or target.password or target.fragment:
            raise ValueError("Invalid expected URL")
        count = count_external_images(Path(sys.argv[1]).read_bytes(), sys.argv[2])
    except (OSError, ValueError, LookupError, UnicodeError):
        print("Unable to inspect message; check the local file and HTTPS pixel URL.", file=sys.stderr)
        return 2
    print(json.dumps({"external_image_preserved": count > 0, "matched_image_count": count}))
    return 0 if count else 1


if __name__ == "__main__":
    sys.exit(main())
