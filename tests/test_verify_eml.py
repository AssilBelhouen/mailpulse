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
