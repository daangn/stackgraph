import { ReferencedSymbol, ReferencedSymbolEntry } from "../deps/ts_morph.ts"
import { exampleSrc } from "./_example_project.ts"
import { inMemoryProject, withSrc } from "./_project.ts"
import {
	type Declaration,
	type DeclDeps,
	equals,
	getDeclDeps,
	getTopDecl,
} from "./decl_deps.ts"
import { Stream } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"
import { getAllDecls } from "./decls.ts"

/**
 * Find all references in other files
 *
 * TODO: use isDefinition()?
 */
const getActualReferencesArray = (
	symbol: ReferencedSymbol,
): ReferencedSymbolEntry[] =>
	symbol
		.getReferences()
		.filter((ref) => !equals(ref.getNode(), symbol.getDefinition().getNode()))
		.filter((ref) =>
			ref.getNode().getParent()?.getKindName() !== "ImportClause"
		)

const getReferencedDeclsArray = (node: Declaration): Declaration[] =>
	node.findReferences()
		.flatMap(getActualReferencesArray)
		.flatMap((x) => getTopDecl(x) ?? [])

/**
 * Recursively query **direct** variable references into key-value map.
 */
export const getDeclDepsArray = (links: Declaration[]): DeclDeps => {
	const graph: DeclDeps = new Map()

	let current = links
	while (current.length > 0) {
		current = current.flatMap((node) => {
			const references = getReferencedDeclsArray(node)
			graph.set(node, references)
			return references
		})
	}
	return graph
}

Deno.bench(`array`, (b) => {
	const project = inMemoryProject()
	const files = withSrc(project)(exampleSrc)
	const decls = Stream.fromObjectValues(files).flatMap(getAllDecls).toArray()

	b.start()
	const _declDeps = getDeclDepsArray(decls)
	b.end()
})

Deno.bench(`stream`, { baseline: true }, (b) => {
	const project = inMemoryProject()
	const files = withSrc(project)(exampleSrc)
	const decls = Stream.fromObjectValues(files).flatMap(getAllDecls).toArray()

	b.start()
	const _declDeps = getDeclDeps(decls)
	b.end()
})
