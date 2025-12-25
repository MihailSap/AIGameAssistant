import React from "react";

export default function GoogleDocsViewer({ fileUrl, onError }) {
    const src = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`;

    return (
        <iframe
            className="fv-google-frame"
            src={src}
            onError={onError}
            title="PDF viewer"
        />
    );
}
