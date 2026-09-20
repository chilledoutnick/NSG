class AllowIframeAndYouTubeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        csp = response.headers.get("Content-Security-Policy", "")

        def add(directive, values):
            nonlocal csp

            # Ensure CSP ends cleanly
            if csp and not csp.strip().endswith(";"):
                csp += ";"

            if directive in csp:
                # Extract existing directive block
                start = csp.find(directive)
                end = csp.find(";", start)
                if end == -1:  # Handle case where directive is at the very end of the string without a trailing semicolon
                    end = len(csp)
                block = csp[start:end]

                for v in values:
                    if v not in block:
                        block += f" {v}"

                csp = csp[:start] + block + csp[end:]
            else:
                csp += f" {directive} 'self' {' '.join(values)};"

        add("frame-src", [
            "https://js.stripe.com",
            "https://hooks.stripe.com",
            "https://www.youtube.com",
            "https://www.youtube-nocookie.com",
            "https://player.vimeo.com",
        ])

        add("media-src", [
            "blob:",
            "data:",
            "https://www.youtube.com",
            "https://player.vimeo.com",
            "https://s3.amazonaws.com",
            "https://storage.googleapis.com",  # <-- Added GCS here
        ])

        response.headers["Content-Security-Policy"] = csp.strip()
        return response