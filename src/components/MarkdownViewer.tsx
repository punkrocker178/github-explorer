import React, { useState, useEffect } from 'react';
import { marked } from 'marked';

const MarkdownViewer = ({ content }: any) => {
    const [htmlContent, setHtmlContent] = useState('');

    useEffect(() => {
        const renderMarkdown = async () => {
            const html = await marked(content);
            setHtmlContent(html);
        };
        renderMarkdown();
    }, [content]);


    return (
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    );
};

export default MarkdownViewer;