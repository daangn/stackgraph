import { type SourceFile } from "https://deno.land/x/ts_morph@21.0.1/mod.ts"
import { asRelationRecord, generateLinks } from "./links.ts"
import type { GetLink, LinkedVarDecl, Relations } from "./links.ts"
import { fromLinks } from "./deps_map.ts"
import { fromGraph } from "./flatten.ts"
import { fromDepsMap, LinkDepsGraph } from "./create.ts"

/**
 * StackGraph API wrapped into fluent interface.
 *
 * ```ts
 * declare const fn: (node: VariableDeclaration) => LinkedVarDecl<string[], string> | undefined
 *
 * // filter variable declaration of interest and collect their metadata
 * const metadata = new StackflowBuilder([])
 * 	.getLinks(fn)
 * 	.toRelations()
 *
 * // generate directed graph of references
 * const components = new StackflowBuilder([])
 * 	.getLinks(fn)
 * 	.toGraph()
 * 	.graph
 *
 * // flatten graph of references into top-level links
 * const pages = new StackflowBuilder([])
 * 	.getLinks(fn)
 * 	.toGraph()
 * 	.flatten()
 * ```
 */
export class StackflowBuilder {
	constructor(readonly files: SourceFile[]) {}
	getLinks<A, B>(getLink: GetLink<A, B>) {
		return new LinksBuilder<A, B>(generateLinks({ getLink })(this.files))
	}
}

export class LinksBuilder<A, B> {
	constructor(readonly links: LinkedVarDecl<A, B>[]) {}

	/** collect link metadata into record */
	toRelations(): Record<string, Relations<A, B>> {
		return asRelationRecord(this.links)
	}

	/** recursively collect all descendants referencing links into map */
	toGraph() {
		return new GraphBuilder(
			fromDepsMap(fromLinks(this.links.map((x) => x.node))),
		)
	}
}

export class GraphBuilder {
	constructor(readonly graph: LinkDepsGraph) {}

	flatten() {
		return fromGraph(this.graph)
	}
}
