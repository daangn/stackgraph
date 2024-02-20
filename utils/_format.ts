import { type DeclDeps } from "../graph/decl_deps.ts"

/**
 * prints TS AST node names
 */
export const printNodes = (...data: unknown[]) => {
	const xs = data.map((x) => {
		if (!x || typeof x !== "object") return x
		if (Array.isArray(x)) return x.map((x) => x?.getText?.() ?? x)
		// deno-lint-ignore no-explicit-any
		return (x as any).getText?.() ?? x
	})
	console.log(...xs)
}

export const prettyPrintDeclDeps = (declDeps: DeclDeps) =>
	declDeps.forEach((deps, decl) => {
		printNodes(decl, "->", deps)
	})
