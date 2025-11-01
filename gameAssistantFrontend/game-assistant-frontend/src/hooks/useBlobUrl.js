import { useCallback, useEffect, useRef, useState } from "react";
import { createObjectUrl, revokeObjectUrl } from "../utils/blobUtils";

export default function useBlobUrl(fetcher, fileTitle, deps = []) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(Boolean(fileTitle));
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const blobRef = useRef(null);

  const fetchBlob = useCallback(async () => {
    if (!fileTitle) {
      setUrl(null);
      setLoading(false);
      setError(null);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const blob = await fetcher(fileTitle);
      if (!mountedRef.current) {
        if (blob) {
          const tmp = createObjectUrl(blob);
          revokeObjectUrl(tmp);
        }
        return null;
      }
      const newUrl = createObjectUrl(blob);
      if (blobRef.current) revokeObjectUrl(blobRef.current);
      blobRef.current = newUrl;
      setUrl(newUrl);
      setLoading(false);
      return newUrl;
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        setUrl(null);
        setLoading(false);
      }
      return null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher, fileTitle, ...deps]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (blobRef.current) {
        revokeObjectUrl(blobRef.current);
        blobRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (blobRef.current) {
      revokeObjectUrl(blobRef.current);
      blobRef.current = null;
    }
    setUrl(null);
    setError(null);
    if (!fileTitle) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await fetchBlob();
    })();
    return () => {
      cancelled = true;
    };
  }, [fileTitle, fetchBlob]);

  const revoke = useCallback(() => {
    if (blobRef.current) {
      revokeObjectUrl(blobRef.current);
      blobRef.current = null;
      setUrl(null);
    }
  }, []);

  return { url, loading, error, revoke, refresh: fetchBlob };
}
