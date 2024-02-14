import { distinct } from "https://deno.land/std@0.215.0/collections/distinct.ts"
import {
	SourceFile,
	VariableDeclaration,
} from "https://deno.land/x/ts_morph@21.0.1/mod.ts"
import { getGraph } from "./graph.ts"
import type { Graph } from "./graph.ts"

export type Relations<A, B> = {
	links: A
	metas: B
}
export type LinkedVarDecl<A, B> = Relations<A, B> & {
	node: VariableDeclaration
}

export type Dependencies = Record<string, string[]>

/**
 * creates a reference graph
 */
export const serialize = (graph: Graph) =>
	Array.from(graph.entries()).map(([node, refs]) =>
		[node.getName(), distinct(refs.map((x) => x.getName()))] as const
	)

type Option<A, B> = {
	/**
	 * Filter and map links, metadatas, and variable declaration
	 */
	getLink: (node: VariableDeclaration) => LinkedVarDecl<A, B> | undefined
}

export const generateLinks =
	<A, B>({ getLink }: Option<A, B>) =>
	(files: SourceFile[]): LinkedVarDecl<A, B>[] =>
		files.flatMap((file) =>
			file.getVariableDeclarations().flatMap((node) => getLink(node) ?? [])
		)

export const generateGraph = <A, B>(links: LinkedVarDecl<A, B>[]) => {
	const relations: Record<string, Relations<A, B>> = Object.fromEntries(
		links.map(({ node, ...relations }) => [node.getName(), relations]),
	)
	const dependencies: Dependencies = Object.fromEntries(
		links.flatMap(({ node }) => serialize(getGraph(node))),
	)

	return { dependencies, relations }
}
