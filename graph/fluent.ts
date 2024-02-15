import { Project, SourceFile } from "https://deno.land/x/ts_morph@21.0.1/mod.ts"
import { asMetadataRecord, generateLinks } from "./links.ts"
import type { GetLink, LinkedVarDecl, Metadata } from "./links.ts"
import { fromLinks } from "./deps_map.ts"
import { FlatDepsMap, fromGraph } from "./flatten.ts"
import { fromDepsMap, LinkDepsGraph } from "./create.ts"
import { FilteredFSHost } from "./fs.ts"
import { DepsMap } from "./deps_map.ts"

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

		return new StackGraph<A, B>(generateLinks(filterMapLinks)(files))
	}
}

/**
 * StackGraph API wrapped into fluent interface with lazy evaluation.
 */
export class StackGraph<A, B> {
	private depsMapCache: DepsMap | undefined
	private graphCache: LinkDepsGraph | undefined
	private flatGraphCache: FlatDepsMap | undefined
	private metadataCache: Record<string, Partial<Metadata<A, B>>> | undefined

	constructor(readonly links: LinkedVarDecl<A, B>[]) {}
	static searchAll(files: SourceFile[]) {
		return new StackGraph(generateLinks((node) => ({ node }))(files))
	}

	/** collect link metadata into record */
	get metadata() {
		if (!this.metadataCache) {
			this.metadataCache = asMetadataRecord(this.links)
		}
		return this.metadataCache
	}

	/** recursively collect all descendants referencing links into map */
	get depsMap() {
		if (!this.depsMapCache) {
			this.depsMapCache = fromLinks(this.links.map((x) => x.node))
		}
		return this.depsMapCache
	}

	/** directed graph of references from initial links */
	get graph() {
		if (!this.graphCache) {
			this.graphCache = fromDepsMap(this.depsMap)
		}
		return this.graphCache
	}

	/** flattened graph of references into top-level links */
	get flatGraph() {
		if (!this.flatGraphCache) {
			this.flatGraphCache = fromGraph(this.graph)
		}
		return this.flatGraphCache
	}
}
