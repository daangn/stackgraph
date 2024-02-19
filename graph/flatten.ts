import { HashMap, HashSet } from "https://deno.land/x/rimbu@1.2.0/hashed/mod.ts"
import { LinkDepsGraph } from "./create.ts"

export type FlatDepsMap = HashMap<string, HashSet<string>>

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
export const fromGraph = (graph: LinkDepsGraph): FlatDepsMap => {
	const topLevelNodes = graph.streamNodes()
		.filter((node) => graph.getConnectionsFrom(node).size === 0)

	return topLevelNodes
		.map((page) =>
			[
				page,
				graph
					.getConnectionStreamFrom(page)
					// .map(([, to]) => to)
					.flatMap(([, to]) => to ?? [])
					.reduce(HashSet.reducer()),
			] as const
		)
		.reduce(HashMap.reducer())
}
