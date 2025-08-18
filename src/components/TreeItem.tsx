import React, { useState, useEffect } from 'react';
import { fetchGitHubData } from '../services/fetchGithub'; // Adjust the import path as necessary
import { FileIcon, FolderIcon, ChevronIcon } from './Icons';
import { GitHubItem } from '../models/github-item';
import { TreeItemProps } from '../models/tree-item';

const TreeItem: React.FC<TreeItemProps> = ({ item, owner, repo, onFileSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<GitHubItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirectory = item.type === 'dir';

  const handleToggle = async () => {
    if (!isDirectory) {
      onFileSelect(item);
      return;
    }

    setIsOpen(!isOpen);
    if (!isOpen && children.length === 0) {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchGitHubData(owner, repo, item.path);
        data.sort((a: any, b: any) => {
          if (a.type === b.type) {
            return a.name.localeCompare(b.name);
          }
          return a.type === 'dir' ? -1 : 1;
        });
        setChildren(data);
      } catch (e) {
        setError('Failed to load directory.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const itemClass = `flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-700 transition-colors duration-150 ${!isDirectory ? 'text-gray-300' : 'text-white font-medium'}`;

  return (
    <div className="my-1">
      <div onClick={handleToggle} className={itemClass}>
        {isDirectory && <ChevronIcon isOpen={isOpen} />}
        {isDirectory ? <FolderIcon isOpen={isOpen} /> : <FileIcon />}
        <span className="truncate">{item.name}</span>
      </div>
      {isOpen && isDirectory && (
        <div className="pl-6 border-l-2 border-gray-600 ml-2">
          {isLoading && <div className="p-2 text-gray-400">Loading...</div>}
          {error && <div className="p-2 text-red-400">{error}</div>}
          {children.map(child => (
            <TreeItem key={child.sha} item={child} owner={owner} repo={repo} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeItem;