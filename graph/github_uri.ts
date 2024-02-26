import { parseVSCodeURI, VSCodeURI } from "./vscode_uri.ts"

export type GithubURI =
	`https://github.com/${string}/${string}/blob/${string}/${string}#L${string}-L${string}`

type GithubURIOption = {
	owner: string
	repo: string
	commit: string
}

export const mkToGithubURI =
	({ owner, repo, commit }: GithubURIOption) => (uri: VSCodeURI): GithubURI => {
		const { url, path } = parseVSCodeURI(uri)
		const hash = url.hash as `#L${string}-L${string}`

		return `https://github.com/${owner}/${repo}/blob/${commit}${path as `/${string}`}${hash}`
	}
