import unittest
from contextlib import redirect_stdout
from io import StringIO
from unittest.mock import patch

from app.cli import main as cli


class TestCliInput(unittest.TestCase):
	def test_choice_one_shows_system_status(self):
		with patch.object(cli, "show_status") as show_status:
			cli.choose_choice("1")

		show_status.assert_called_once_with()

	def test_choice_two_shows_about(self):
		with patch.object(cli, "show_about") as show_about:
			cli.choose_choice("2")

		show_about.assert_called_once_with()

	def test_blank_input_shows_invalid_choice(self):
		output = StringIO()
		with patch("builtins.input", side_effect=["", "0"]):
			with redirect_stdout(output):
				cli.main()

		self.assertIn("Invalid choice", output.getvalue())
		self.assertIn("Goodbye, friend", output.getvalue())

	def test_end_of_input_exits_cleanly(self):
		output = StringIO()
		with patch("builtins.input", side_effect=EOFError):
			with redirect_stdout(output):
				cli.main()

		self.assertIn("Goodbye, friend", output.getvalue())


if __name__ == "__main__":
	unittest.main()
