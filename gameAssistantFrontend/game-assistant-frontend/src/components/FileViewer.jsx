import React, { useEffect, useRef, useState } from "react";
import "../css/FileViewer.css";
import { Document, Page, pdfjs } from "react-pdf";
import { fileApi } from "../api/file";
import useBlobUrl from "../hooks/useBlobUrl";
import { downloadBlob } from "../utils/blobUtils";

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = (() => {
    try {
        return new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();
    } catch {
        return `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
    }
})();

export default function FileViewer({ fileType, fileTitle, isPrintTitle = true }) {
    const [numPages, setNumPages] = useState(null);
    const containerRef = useRef(null);
    const [renderWidth, setRenderWidth] = useState(800);

    const { url: fileUrl, loading, error } = useBlobUrl(fileType === "pdf" ? fileApi.getRulesBlob : fileApi.getImageBlob, fileTitle, [fileTitle]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            const w = containerRef.current ? containerRef.current.clientWidth : window.innerWidth - 120;
            setRenderWidth(Math.min(900, Math.max(320, w - 40)));
        });
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        const onWin = () => {
            const w = containerRef.current ? containerRef.current.clientWidth : window.innerWidth - 120;
            setRenderWidth(Math.min(900, Math.max(320, w - 40)));
        };
        window.addEventListener("resize", onWin);
        onWin();
        return () => {
            window.removeEventListener("resize", onWin);
            // eslint-disable-next-line react-hooks/exhaustive-deps
            if (containerRef.current) resizeObserver.unobserve(containerRef.current);
        };
    }, []);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handleDownload = async () => await downloadBlob(fileUrl, true, fileTitle);

    return (
        <div className="file-viewer-root" ref={containerRef}>
            <div className="file-viewer-header">
                {isPrintTitle &&
                    <div className="file-viewer-title">{fileTitle?.slice(14) || "Правила игры"}</div>
                }
                <button className="btn" onClick={handleDownload} disabled={!fileUrl || loading}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M160-120v-80h640v80H160Zm320-160L280-480l56-56 104 104v-408h80v408l104-104 56 56-200 200Z"/></svg></button>
            </div>

            <div className="file-viewer-body">
                {loading && <div className="fv-center">Загрузка...</div>}
                {error && <div className="fv-error">{error}</div>}

                {!loading && !error && fileType === "image" && fileUrl && (
                    <div className="fv-image-wrap">
                        <img className="fv-image" src={fileUrl} alt={fileTitle} />
                    </div>
                )}

                {!loading && !error && fileType !== "image" && fileUrl && (
                    <div className="fv-pdf-wrap">
                        <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<div className="fv-center">Загрузка...</div>} error={<div className="fv-error">Не удалось отобразить правила</div>}>
                            {Array.from(new Array(numPages), (_, index) => (
                                <Page
                                    key={`page_${index + 1}`}
                                    pageNumber={index + 1}
                                    width={renderWidth}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                />
                            ))}
                        </Document>
                    </div>
                )}
            </div>
        </div>
    );
}
