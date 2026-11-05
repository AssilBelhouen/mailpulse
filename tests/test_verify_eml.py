"""Behavioral tests using only generated synthetic messages."""
import importlib.util
from email.message import EmailMessage
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = "https://probe.example/api/pixel/" + "A" * 43
SPEC = importlib.util.spec_from_file_location("verify_eml", ROOT / "scripts/verify-eml.py")
verifier = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(verifier)


def message(html, cte="quoted-printable"):
    result = EmailMessage()
    result["From"] = "sender@example.invalid"
    result["To"] = "receiver@example.invalid"
    result.set_content("Synthetic test; no external image in plain text.")
    result.add_alternative(html, subtype="html", cte=cte)
    return result.as_bytes()


class VerifyEmlTests(unittest.TestCase):
    def test_related_resources_and_unnamed_inline_html_are_not_the_body(self):
        related = EmailMessage()
        related.make_related()
        body = EmailMessage()
        body.set_content("<p>No pixel in the body</p>", subtype="html")
        related.attach(body)
        resource = EmailMessage()
        resource.set_content(f'<img src="{EXPECTED}">', subtype="html")
        resource["Content-ID"] = "<unused-resource>"
        related.attach(resource)
        self.assertEqual(verifier.count_external_images(related.as_bytes(), EXPECTED), 0)

        mixed = EmailMessage()
        mixed.set_content("No pixel in the body")
        mixed.make_mixed()
        resource["Content-Disposition"] = "inline"
        mixed.attach(resource)
        self.assertEqual(verifier.count_external_images(mixed.as_bytes(), EXPECTED), 0)

    def test_named_html_without_attachment_disposition_is_excluded(self):
        mixed = EmailMessage()
        mixed.set_content("No pixel in the body")
        mixed.make_mixed()
        resource = EmailMessage()
        resource.set_content(f'<img src="{EXPECTED}">', subtype="html")
        resource.set_param("name", "attachment.html")
        mixed.attach(resource)
        self.assertEqual(verifier.count_external_images(mixed.as_bytes(), EXPECTED), 0)

    def test_related_start_selects_the_actual_root_and_alternative_selects_last_body(self):
        related = EmailMessage()
        related.make_related()
        related.set_param("start", "<actual-root>")
        resource = EmailMessage()
        resource.set_content("<p>Unused first part</p>", subtype="html")
        resource["Content-ID"] = "<unused>"
        related.attach(resource)
        body = EmailMessage()
        body.set_content(f'<img src="{EXPECTED}">', subtype="html")
        body["Content-ID"] = "<actual-root>"
        related.attach(body)
        self.assertEqual(verifier.count_external_images(related.as_bytes(), EXPECTED), 1)

        alternative = EmailMessage()
        alternative.make_alternative()
        alternative.attach(body)
        later = EmailMessage()
        later.set_content("<p>The displayed alternative has no image</p>", subtype="html")
        alternative.attach(later)
        self.assertEqual(verifier.count_external_images(alternative.as_bytes(), EXPECTED), 0)

    def test_duplicate_image_sources_and_inert_html_cannot_pass(self):
        for html in [
            f'<img src="cid:actual" src="{EXPECTED}">',
            f'<template><img src="{EXPECTED}"></template>',
            f'<textarea><img src="{EXPECTED}"></textarea>',
        ]:
            with self.subTest(html=html):
                self.assertEqual(verifier.count_external_images(message(html), EXPECTED), 0)

    def test_preserved_img_src_in_transfer_encoded_html(self):
        for cte in ["quoted-printable", "base64", "7bit"]:
            with self.subTest(cte=cte):
                self.assertEqual(verifier.count_external_images(message(f'<img src="{EXPECTED}" width="1" height="1">', cte), EXPECTED), 1)

    def test_rehosting_inline_data_and_plain_links_do_not_pass(self):
        for html in [
            '<img src="cid:attachment">',
            '<img src="data:image/gif;base64,R0lGODlh">',
            f'<img src="https://ci3.googleusercontent.com/proxy#{EXPECTED}">',
            f'<a href="{EXPECTED}">link</a>',
            f'<p>{EXPECTED}</p>',
            f'<img data-src="{EXPECTED}">',
            f'<script>const x = \'<img src="{EXPECTED}">\';</script>',
        ]:
            with self.subTest(html=html):
                self.assertEqual(verifier.count_external_images(message(html), EXPECTED), 0)

    def test_html_attachments_and_forwarded_messages_do_not_count(self):
        outer = EmailMessage()
        outer.set_content("No pixel in this message body")
        outer.add_attachment(f'<img src="{EXPECTED}">'.encode(), maintype="text", subtype="html", filename="attachment.html")
        self.assertEqual(verifier.count_external_images(outer.as_bytes(), EXPECTED), 0)
        nested = EmailMessage()
        nested.set_content("No pixel in this outer body")
        nested.add_attachment(EmailMessage())
        nested.get_payload()[-1].set_payload([verifier.BytesParser(policy=verifier.policy.default).parsebytes(message(f'<img src="{EXPECTED}">'))])
        self.assertEqual(verifier.count_external_images(nested.as_bytes(), EXPECTED), 0)

    def test_cli_outputs_only_summary_and_nonzero_for_no_match(self):
        for html, expected_code in [(f'<img src="{EXPECTED}">', 0), ('<img src="cid:local">', 1)]:
            with tempfile.TemporaryDirectory() as folder:
                path = Path(folder) / "private.eml"
                path.write_bytes(message(html))
                result = subprocess.run(["python3", str(ROOT / "scripts/verify-eml.py"), str(path), EXPECTED], capture_output=True, text=True)
                self.assertEqual(result.returncode, expected_code)
                for value in [EXPECTED, "sender@example.invalid", "receiver@example.invalid", str(path), "cid:local"]:
                    self.assertNotIn(value, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
