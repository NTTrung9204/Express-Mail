import gzip
import base64


class GzipString:
    """
    Service for gzip compression and decompression.
    """

    @staticmethod
    def encode(text):
        """
        Compress a string using gzip and encode to base64.
        """

        data = text.encode("utf-8")
        compressed = gzip.compress(data)
        return base64.b64encode(compressed).decode("utf-8")

    @staticmethod
    def decode(compressed_text):
        """
        Decode from base64 and decompress gzip to get original string.
        """

        compressed_bytes = base64.b64decode(compressed_text.encode("utf-8"))
        data = gzip.decompress(compressed_bytes)
        return data.decode("utf-8")
