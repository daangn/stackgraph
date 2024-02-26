import type { ArrowGraph } from "https://deno.land/x/rimbu@1.2.0/graph/mod.ts"
import { HashMap, HashSet } from "https://deno.land/x/rimbu@1.2.0/hashed/mod.ts"
import { Reducer } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"

export const getConnectionsTo = <T>(graph: ArrowGraph<T>, node: T) =>
	graph.getConnectionStreamTo(node).map(([src]) => src)
		.filter((x) => x !== undefined)
		.reduce(HashSet.reducer())

export const allPathTo = <T>(graph: ArrowGraph<T>, node: T) => {
	let paths = HashSet.empty<T>()
	let next: HashSet<T> = getConnectionsTo(graph, node)

	while (!next.isEmpty) {
		next = next.difference(paths) // remove circular references
		paths = paths.addAll(next) // add new paths
		next = next.stream() // get all nodes connected to the current nodes
			.flatMap((x) => getConnectionsTo(graph, x))
			.reduce(HashSet.reducer())
	}

	return paths
}

export const graphDescendantsRaw = <T>(
	graph: ArrowGraph<T>,
): HashMap<T, HashSet<T>> =>
	graph.streamNodes()
		.filter((node) => graph.isSink(node))
		.map((node) => [node, allPathTo(graph, node)] as const)
		.reduce(HashMap.reducer())

/**
 * Get all descendants of a directed graph.
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
// deno-lint-ignore no-explicit-any
export const graphDescendants = <T extends keyof any>(
	graph: ArrowGraph<T>,
): Record<T, T[]> =>
	graphDescendantsRaw(graph).stream()
		.map(([k, v]) => [k, [...v.stream().reduce(Reducer.toJSSet())]] as [T, T[]])
		.reduce(Reducer.toJSObject())
