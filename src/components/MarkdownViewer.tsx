import React, { useState, useEffect } from 'react';
import { marked } from 'marked';

const MarkdownViewer = ({ file, owner, repo }: any) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMarkdown, setIsMarkdown] = useState(false);

    useEffect(() => {
        if (!file) {
            setContent('');
            return;
        }

        const loadFileContent = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch file content');
                }
                const fileData = await response.json();
                const decodedContent = decodeURIComponent(
                    atob(fileData.content)
                        .split('')
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                ); 
                setContent(decodedContent);
                const markdownExtensions = ['.md', '.markdown', '.mdown', '.mkdn'];
                setIsMarkdown(markdownExtensions.some(ext => file.name.toLowerCase().endsWith(ext)));
            } catch (e) {
                setError('Failed to load file content.');
                setContent('');
            } finally {
                setIsLoading(false);
            }
        };

        loadFileContent();
    }, [file, owner, repo]);

    const [htmlContent, setHtmlContent] = useState('');

    useEffect(() => {
        if (isMarkdown && content) {
            let cancelled = false;
            const renderMarkdown = async () => {
                const html = await marked(content);
                if (!cancelled) setHtmlContent(html);
            };
            renderMarkdown();
            return () => { cancelled = true; };
        } else {
            setHtmlContent('');
        }
    }, [isMarkdown, content]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-full text-gray-400">Loading file...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-full text-red-400">{error}</div>;
    }
    
    if (!file) {
        return <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <h3 className="text-lg font-semibold">Select a file to view its content</h3>
            <p>Click on a file in the tree on the left.</p>
        </div>;
    }

    return (
        <div className="prose prose-invert max-w-full w-full h-full overflow-y-auto p-6 bg-gray-900 rounded-lg">
            {isMarkdown ? (
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            ) : (
                <pre className="whitespace-pre-wrap break-words text-gray-300">{content}</pre>
            )}
        </div>
    );
};

export default MarkdownViewer;