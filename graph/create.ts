import type { GraphElement } from "https://deno.land/x/rimbu@1.1.0/graph/custom/common/link.ts"
import { ArrowGraphHashed } from "https://deno.land/x/rimbu@1.1.0/graph/mod.ts"
import { Stream } from "https://deno.land/x/rimbu@1.1.0/stream/mod.ts"
import { DepsMap } from "./deps_map.ts"

/** directed graph of references, using `string` as unique key */
export type LinkDepsGraph = ArrowGraphHashed<string>

/**
 * ## Warning
 *
 * uses `Node.getName` as unique key which is prone to collisions
 * if there are multiple variables with the same name
 */
export const fromDepsMap = (depsMap: DepsMap): LinkDepsGraph =>
	Stream.from(depsMap)
		.flatMap(([source, targets]) =>
			Stream.from(targets)
				.map((to): GraphElement<string> => [source.getName()!, to.getName()!])
		)
		.reduce(ArrowGraphHashed.reducer())

export const fromJSON = (
	depsMap: Record<string, string[]>,
): LinkDepsGraph =>
	Stream.fromObject(depsMap)
		.flatMap(([source, targets]) =>
			Stream.from(targets)
				.map((to): GraphElement<string> => [source, to])
		)
		.reduce(ArrowGraphHashed.reducer())
