import React, { useState, useEffect, useCallback } from 'react';
import { fetchGitHubData } from './services/fetchGithub'; // Assuming fetchGitHubData is moved to a utils file
import TreeItem from './components/TreeItem';
import { GitHubIcon } from './components/Icons';
import { GitHubItem } from './models/github-item';
import FileDetails from './components/FileDetails';
import './styles/index.css';

const App = () => {
    const [owner, setOwner] = useState('punkrocker178');
    const [repo, setRepo] = useState('notes-vault');
    const [tree, setTree] = useState<GitHubItem[]>([]);
    const [selectedFile, setSelectedFile] = useState<GitHubItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inputOwner, setInputOwner] = useState('punkrocker178');
    const [inputRepo, setInputRepo] = useState('notes-vault');

    const loadRepo = useCallback(async (currentOwner: string, currentRepo: string) => {
        if (!currentOwner || !currentRepo) {
            setError("Owner and repository name are required.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSelectedFile(null);
        setTree([]);
        try {
            const data = await fetchGitHubData(currentOwner, currentRepo);
            data.sort((a: any, b: any) => {
                if (a.type === b.type) {
                    return a.name.localeCompare(b.name);
                }
                return a.type === 'dir' ? -1 : 1;
            });
            setTree(data);
        } catch (e) {
            setError('Failed to load repository. Please check the owner and repo name.');
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    useEffect(() => {
        loadRepo(owner, repo);
    }, [loadRepo]);

    const handleLoadRepo = (e: any) => {
        e.preventDefault();
        setOwner(inputOwner);
        setRepo(inputRepo);
        loadRepo(inputOwner, inputRepo);
    };

    return (
        <div className="bg-gray-800 text-white min-h-screen font-sans flex flex-col">
            <header className="bg-gray-900 p-4 shadow-lg flex justify-between items-center z-10">
                <div className="flex items-center">
                    <GitHubIcon />
                    <h1 className="text-xl font-bold ml-3">GitHub Repository Explorer</h1>
                </div>
                <form onSubmit={handleLoadRepo} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={inputOwner}
                        onChange={(e) => setInputOwner(e.target.value)}
                        placeholder="Owner (e.g., facebook)"
                        className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-40"
                    />
                    <span className="text-gray-500">/</span>
                    <input
                        type="text"
                        value={inputRepo}
                        onChange={(e) => setInputRepo(e.target.value)}
                        placeholder="Repo (e.g., react)"
                        className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-40"
                    />
                    <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold px-4 py-1.5 rounded-md text-sm transition-colors">
                        {isLoading ? 'Loading...' : 'Load'}
                    </button>
                </form>
            </header>

            <div className="flex flex-grow overflow-hidden">
                <aside className="w-1/3 max-w-xs lg:w-1/4 lg:max-w-sm bg-gray-800 p-4 overflow-y-auto border-r border-gray-700">
                    <h2 className="text-lg font-semibold mb-2 truncate">{owner} / {repo}</h2>
                    {isLoading && <div className="text-gray-400">Loading repository tree...</div>}
                    {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}
                    {!isLoading && !error && tree.map(item => (
                        <TreeItem key={item.sha} item={item} owner={owner} repo={repo} onFileSelect={(item) => setSelectedFile(item)} />
                    ))}
                </aside>

                <main className="flex-grow bg-gray-900 overflow-hidden">
                    <FileDetails file={selectedFile} owner={owner} repo={repo} />
                </main>
            </div>
        </div>
    );
};

export default App;