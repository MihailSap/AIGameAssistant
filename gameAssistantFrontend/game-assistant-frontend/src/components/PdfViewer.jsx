import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

export default function PdfViewer({ fileUrl, width, onError }) {
    const [numPages, setNumPages] = useState(null);

    return (
        <div className="fv-pdf-wrap">
            <Document
                file={fileUrl}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                onLoadError={onError}
                error=""
                loading={<div className="fv-center">Загрузка...</div>}
            >
                {Array.from(new Array(numPages), (_, index) => (
                    <Page
                        key={index}
                        pageNumber={index + 1}
                        width={width}
                        renderAnnotationLayer
                        renderTextLayer
                    />
                ))}
            </Document>
        </div>
    );
}
