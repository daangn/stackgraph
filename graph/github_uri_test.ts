import { assertEquals } from "../test_deps.ts"
import { mkToGithubURI } from "./github_uri.ts"

Deno.test("mkToGithubURI() converts VSCodeURI to GithubURI", () => {
	const toGithubURI = mkToGithubURI({
		owner: "owner",
		repo: "repo",
		commit: "main",
	})
	const uri =
		"vscode://file/foo/bar/baz.ts:1:12?kind=VariableDeclaration&name=baz#L1-L2"
	const expected =
		"https://github.com/owner/repo/blob/main/foo/bar/baz.ts#L1-L2"

	assertEquals(toGithubURI(uri), expected)
})
