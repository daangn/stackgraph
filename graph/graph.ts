import { ArrowGraphHashed, type GraphElement, Stream } from "../deps/rimbu.ts"
import { type Declaration, type DeclDeps, getDeclDeps } from "./decl_deps.ts"
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

export const getGraph = (decls: Declaration[]): Graph =>
	declDepsToGraph(getDeclDeps(decls))
