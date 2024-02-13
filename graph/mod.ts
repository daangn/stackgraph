import { distinct } from "https://deno.land/std@0.215.0/collections/distinct.ts"
import {
	SourceFile,
	VariableDeclaration,
} from "https://deno.land/x/ts_morph@21.0.1/mod.ts"
import { getGraph } from "./graph.ts"
import type { Graph } from "./graph.ts"

export type Relations<A, B> = Record<string, Omit<LinkedVarDecl<A, B>, "decl">>
export type LinkedVarDecl<A, B> = {
	decl: VariableDeclaration
	links: A
	metas: B
}

export type Metadata = {
	logShowEvents: string[]
	logClickEvents: string[]
}

export type Dependencies = Record<string, string[]>

export type Rels = Record<string, Rel>
export type Rel = {
	links: Record<"push" | "replace", string[]>
	meta: Metadata
}

/**
 * creates a reference graph
 */
export const serialize = (graph: Graph) =>
	Array.from(graph.entries()).map(([decl, refs]) =>
		[decl.getName(), distinct(refs.map((x) => x.getName()))] as const
	)

type Option<A, B> = {
	/**
	 * Filter and map links, metadatas, and variable declaration
	 */
	getLink: (node: VariableDeclaration) => LinkedVarDecl<A, B> | undefined
}

export const generateGraph = <A, B>({ getLink }: Option<A, B>) =>
(
	files: SourceFile[],
): { dependencies: Dependencies; relations: Relations<A, B> } => {
	const links = files.flatMap((file) =>
		file.getVariableDeclarations().flatMap((decl) => getLink(decl) ?? [])
	)

	const relations = Object.fromEntries(
		links.map(({ decl, ...relations }) => [decl.getName(), relations]),
	)
	const dependencies = Object.fromEntries(
		links.flatMap(({ decl }) => serialize(getGraph(decl))),
	)

	return { dependencies, relations }
}
