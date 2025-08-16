import { GitHubItem } from "./github-item";

export interface TreeItemProps {
  item: GitHubItem;
  owner: string;
  repo: string;
  onFileSelect: (item: GitHubItem) => void;
}