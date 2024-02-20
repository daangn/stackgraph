import { HashMap, HashSet } from "https://deno.land/x/rimbu@1.2.0/hashed/mod.ts"
import type { Graph } from "./graph.ts"
import { VSCodeURI } from "./vscode_uri.ts"

export type TopDeclDeps = HashMap<VSCodeURI, HashSet<VSCodeURI>>

/**
 * Flattens graph of references into top-level links
 *
 * ## Example
 *
 * ```
 * a -> A -> TOP1
 * b -> A
 * a -> B -> TOP2
 * c -> B
 * ```
 * will be flattened into
 * ```
 * TOP1 <- A, a, b
 * TOP2 <- B, a, c
 * ```
 */
export const graphToTopDeclDeps = (graph: Graph): TopDeclDeps => {
	const topLevelNodes = graph.streamNodes()
		.filter((node) => graph.getConnectionsFrom(node).size === 0)

	return topLevelNodes
		.map((page) =>
			[
				page,
				graph
					.getConnectionStreamFrom(page)
					.map(([, to]) => to)
					.filter((to) => to !== undefined)
					.reduce(HashSet.reducer()),
			] as const
		)
		.reduce(HashMap.reducer())
}
