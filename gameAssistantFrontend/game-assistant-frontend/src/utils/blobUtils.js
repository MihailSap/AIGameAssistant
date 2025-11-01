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

export async function downloadBlob(blob, filename = "") {
  const url = createObjectUrl(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => {
    revokeObjectUrl(url);
  }, 1000);
}
