import { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const MarkdownViewer = ({ content }: any) => {
    const [htmlContent, setHtmlContent] = useState('');

    useEffect(() => {
        const renderMarkdown = async () => {
            const html = DOMPurify.sanitize(await marked.parse(content));
            setHtmlContent(html);
        };
        renderMarkdown();
    }, [content]);


    return (
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    );
};

export default MarkdownViewer;