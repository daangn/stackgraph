import type { GraphElement } from "https://deno.land/x/rimbu@1.2.0/graph/custom/common/link.ts"
import { ArrowGraphHashed } from "https://deno.land/x/rimbu@1.2.0/graph/mod.ts"
import { Stream } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"
import { DeclDeps } from "./decl_deps.ts"

export type Id = string

/** directed graph of references, using `string` as unique key */
export type Graph = ArrowGraphHashed<Id>

/**
 * ## Warning
 *
 * uses `Node.getName` as unique key which is prone to collisions
 * if there are multiple variables with the same name
 *
 * FIXME: assumes class declaration has names (hence `!`)
 */
export const declDepsToGraph = (declDeps: DeclDeps): Graph =>
	Stream.from(declDeps).flatMap(([source, targets]) =>
		Stream.from(targets)
			.map((to): GraphElement<Id> => [source.getName()!, to.getName()!])
	)
		.reduce(ArrowGraphHashed.reducer())
