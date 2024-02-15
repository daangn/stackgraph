import {
	Project,
	type SourceFile,
} from "https://deno.land/x/ts_morph@21.0.1/mod.ts"
import {
	asRelationRecord,
	generateLinks,
	type GetLink,
	type LinkedVarDecl,
} from "./links.ts"
import { DepsMap, fromLinks } from "./deps_map.ts"
import { FlatDepsMap, fromGraph } from "./flatten.ts"
import { fromDepsMap, LinkDepsGraph } from "./create.ts"

/**
 * StackGraph API wrapped into fluent interface.
 *
 * @module
 */

export { builderProject as builder }

const builderProject = (project: Project) => {
	const files = project.getSourceFiles()
	return {
		files: (filter?: (file: SourceFile) => boolean) =>
			builderFiles(filter ? files.filter(filter) : files),
	}
}

const builderFiles = (files: SourceFile[]) => {
	return {
		files,
		getLinks: <A, B>(getLink: GetLink<A, B>) =>
			builderLinks<A, B>(generateLinks({ getLink })(files)),
	}
}

const foo = builderProject(new Project())
	.files(() => true)
	.getLinks(() => undefined)

const builderLinks = <A, B>(links: LinkedVarDecl<A, B>[]) => {
	return {
		toRelations: () => asRelationRecord(links),
		toDepsMap: () => new BuilderDeps(fromLinks(links.map((x) => x.node))),
	}
}

class BuilderDeps {
	constructor(readonly deps: DepsMap) {}
	toGraph() {
		return new BuilderGraph(fromDepsMap(this.deps))
	}
}

class BuilderGraph {
	constructor(readonly graph: LinkDepsGraph) {}
	toFlatDepsMap() {
		return new BuilderFlatDepsMap(fromGraph(this.graph))
	}
}
class BuilderFlatDepsMap {
	constructor(readonly pages: FlatDepsMap) {}
}

/**
 * fluent interface helpers, or "Porcelain" API for StackGraph
 *
 * @module
 */

const components = new BuilderFiles([])
	.getLinks(() => undefined)
	.toDepsMap()
	.toGraph()
	.graph

const pages = new BuilderFiles([])
	.getLinks(() => undefined)
	.toDepsMap()
	.toGraph()
	.toFlatDepsMap()
	.pages
