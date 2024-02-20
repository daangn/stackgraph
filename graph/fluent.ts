import { Project, SourceFile } from "../deps/ts_morph.ts"
import { asMetadataRecord, getDecls } from "./decls.ts"
import { getDeclDeps } from "./decl_deps.ts"
import { graphToTopDeclDeps, TopDeclDeps } from "./top_decl_deps.ts"
import { declDepsToGraph, Graph } from "./graph.ts"
import { FilteredFSHost } from "./fs.ts"
import { DeclDeps } from "./decl_deps.ts"

type StackGraphBuilderPreset<A, B> = {
	ignoreImports: (path: string) => boolean

	/** Narrow down files to analyze using this predicate */
	filesToAnalyze: (path: string) => boolean

	/** Select variable declarations to analyze and query their metadata. */
	filterMapLinks: GetLink<A, B>
}

/** Helper preset to setup StackGraph quickly. */
export const stackGraphBuilderPreset = <A, B>(
	preset: StackGraphBuilderPreset<A, B>,
) => preset

/**
 * StackGraph API wrapped into fluent interface.
 *
 * For complex use-cases,
 * use {@linkcode StackGraph} or underlying StackGraph API directly.
 */
export class StackGraphBuilder<A, B> {
	constructor(readonly preset: StackGraphBuilderPreset<A, B>) {}

	build(tsConfigFilePath: string) {
		const {
			ignoreImports,
			filesToAnalyze,
			filterMapLinks,
		} = this.preset

		const fileSystem = new FilteredFSHost(ignoreImports)
		const files = new Project({
			tsConfigFilePath,
			fileSystem,
			skipLoadingLibFiles: true,
		})
			.getSourceFiles()
			.filter((x) => filesToAnalyze(x.getFilePath()))

		return new StackGraph<A, B>(getDecls(filterMapLinks)(files))
	}
}

/**
 * StackGraph API wrapped into fluent interface with lazy evaluation.
 */
export class StackGraph<A, B> {
	private depsMapCache: DeclDeps | undefined
	private graphCache: Graph | undefined
	private flatGraphCache: TopDeclDeps | undefined
	private metadataCache: Record<string, Metadata<A, B>> | undefined

	constructor(readonly links: LinkedDecl<A, B>[]) {}

	static searchAll(files: SourceFile[]) {
		return new StackGraph(
			getDecls((node) => ({
				node,
				links: undefined,
				metas: undefined,
			}))(files),
		)
	}

	/** collect link metadata into record */
	get metadata() {
		if (!this.metadataCache) {
			this.metadataCache = asMetadataRecord(this.links)
		}
		return this.metadataCache!
	}

	/** recursively collect all descendants referencing links into map */
	get depsMap() {
		if (!this.depsMapCache) {
			this.depsMapCache = getDeclDeps(this.links.map((x) => x.node))
		}
		return this.depsMapCache
	}

	/** directed graph of references from initial links */
	get graph() {
		if (!this.graphCache) {
			this.graphCache = declDepsToGraph(this.depsMap)
		}
		return this.graphCache
	}

	/** flattened graph of references into top-level links */
	get flatGraph() {
		if (!this.flatGraphCache) {
			this.flatGraphCache = graphToTopDeclDeps(this.graph)
		}
		return this.flatGraphCache
	}
}
