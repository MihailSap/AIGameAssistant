export function createObjectUrl(blob) {
  return URL.createObjectURL(blob);
}

export function revokeObjectUrl(url) {
  try {
    if (url && typeof url === "string" && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  } catch (e) {}
}

export async function downloadBlob(data, isBlobUrl = false, filename = "") {
  let blobUrl = data;
  if (!isBlobUrl) {
    blobUrl = createObjectUrl(data);
  }
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => {
    revokeObjectUrl(blobUrl);
  }, 1000);
}
