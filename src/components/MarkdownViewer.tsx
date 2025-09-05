import { useState, useEffect } from 'react';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import docker from 'highlight.js/lib/languages/dockerfile';
import csharp from 'highlight.js/lib/languages/csharp';
import plaintext from 'highlight.js/lib/languages/plaintext';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('dockerfile', docker);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('plaintext', plaintext);

marked.use(
    markedHighlight({
        highlight(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        langPrefix: 'hljs language-'
    })
);

marked.setOptions({
    gfm: true,
    breaks: true,
});

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