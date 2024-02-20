import type { GraphElement } from "https://deno.land/x/rimbu@1.2.0/graph/custom/common/link.ts"
import { ArrowGraphHashed } from "https://deno.land/x/rimbu@1.2.0/graph/mod.ts"
import { Stream } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"
import { DeclDeps } from "./decl_deps.ts"
import { encodeVSCodeURI, type VSCodeURI } from "./vscode_uri.ts"

/** directed graph of references */
export type Graph = ArrowGraphHashed<VSCodeURI>

export const declDepsToGraph = (declDeps: DeclDeps): Graph =>
	Stream.from(declDeps).flatMap(([source, targets]) =>
		Stream.from(targets).map((to): GraphElement<VSCodeURI> => [
			encodeVSCodeURI(source),
			encodeVSCodeURI(to),
		])
	)
		.reduce(ArrowGraphHashed.reducer())
