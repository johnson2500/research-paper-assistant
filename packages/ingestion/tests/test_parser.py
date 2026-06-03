import pytest
from src.parser import parse_text


def test_parse_text():
    result = parse_text("Hello, world!")
    assert result == "Hello, world!"


def test_parse_text_size_limit():
    huge = "x" * (251 * 1024 * 1024)
    with pytest.raises(ValueError, match="250 MB"):
        parse_text(huge)
