---
layout: post
title: Forwarding HTTP Chunked Responses Without Reframing in Go
---

In a recent project at [Weave](http://weave.works), I needed to proxy
a Chunked HTTP response body to the client. Normally this would just
be a case of copying the response body reader to client's writer.
However, we needed to correctly parse the HTTP trailers, which come
after the chunked body. Therefore, the naive solution would not work:

```Go
io.Copy(clientWriter, responseBody)
```

This will continue forwarding the HTTP trailers, instead of allowing
us to parse them separately.

The next obvious solution is to use `httputil.ChunkedReader`, to
forward the response body. The `ChunkedReader` will stop reading when
the body ends, allowing us to parse the trailers afterwards.

```Go
io.Copy(
  clientWriter,
  httputil.NewChunkedReader(responseBody),
)
parseTrailers(responseBody)
```

Normally this would be enough. But, unfortunately, the client we are
forwarding to depends on message alignment with the HTTP chunks.
Because the `ChunkedReader` will discard the alignment of the chunks,
the client will miss messages and fail when parsing incomplete
messages.

To solve this, we need to both parse the response body, and to forward
the bytes verbatim.

```Go
io.Copy(
  ioutil.Discard,
  httputil.NewChunkedReader(
    io.TeeReader(
      responseBody,
      clientWriter,
    ),
  ),
)
parseTrailers(responseBody)
```

Let's dissect this solution. First, we use the `io.TeeReader` to
forward bytes from the `responseBody` directly to the client. On one
output of the `io.TeeReader`, we attach the `httputil.ChunkedReader`.
To "pump" the data through these readers we use `io.Copy`. However,
because the raw bytes are being forwarded to the client early on, we
can discard the output of the `httputil.ChunkedReader`.

When the chunked HTTP body is finished, the `ChunkedReader` will
return `io.EOF`. This will terminate the `io.Copy`, and stop copying
data into the `clientWriter`. At that point we can extract and parse
the HTTP trailers from the `responseBody`.
