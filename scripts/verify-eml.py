"""Inspect a local message without printing headers, body, path, or image URLs."""
from email import policy
from email.parser import BytesParser
from html.parser import HTMLParser
import json
from pathlib import Path
import sys
from urllib.parse import urlsplit


class ImageSources(HTMLParser):
    def __init__(self, expected_url):
        super().__init__(convert_charrefs=True)
        self.expected_url = expected_url
        self.count = 0

    def handle_starttag(self, tag, attrs):
        if tag == "img" and dict(attrs).get("src") == self.expected_url:
            self.count += 1


def body_html_parts(part):
    # Do not treat forwarded emails or HTML file attachments as the outer body.
    if part.get_content_disposition() == "attachment" or part.get_content_maintype() == "message":
        return
    if part.is_multipart():
        for child in part.iter_parts():
            yield from body_html_parts(child)
    elif part.get_content_type() == "text/html":
        yield part.get_content()


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
