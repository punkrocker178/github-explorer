import { useEffect, useState } from "react";
import { decodeBase64Unicode } from "../utils/helper";
import MarkdownViewer from "./MarkdownViewer";
import { fetchGitHubData } from '../services/fetchGithub';

const FileDetails = ({ file, owner, repo }: any) => {
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
                const fileData = await fetchGitHubData(owner, repo, file.path);
                const decodedContent = decodeBase64Unicode(fileData.content);
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
            {isMarkdown ? (<MarkdownViewer content={content} />) : (
                <pre className="whitespace-pre-wrap break-words text-gray-300">{content}</pre>
            )
            }
        </div>
    );
}

export default FileDetails;