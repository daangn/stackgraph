import type { Graph } from "./graph.ts"

import { VSCodeURI } from "./vscode_uri.ts"
import { graphDescendants } from "./graph_descendants.ts"

export type TopDeclDeps = Map<VSCodeURI, Set<VSCodeURI>>

/**
 * Flattens graph of references into top-level links.
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
export const graphToTopDeclDeps = (graph: Graph): TopDeclDeps =>
	graphDescendants(graph)
