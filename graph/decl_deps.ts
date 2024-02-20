import { Reducer, Stream } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"
import {
	type ClassDeclaration,
	type FunctionDeclaration,
	ReferencedSymbol,
	ReferencedSymbolEntry,
	type SourceFile,
	SyntaxKind,
	type VariableDeclaration,
} from "../deps/ts_morph.ts"

export type Declaration =
	| VariableDeclaration
	| ClassDeclaration
	| FunctionDeclaration

export type DeclDeps = Map<Declaration, Declaration[]>

/**
 * Get the topmost declaration
 *
 * @privateRemarks
 *
 * FIXME(#1): handle destructuring and multiple variable declarations
 * RFC: only track top-level declarations or inside if statements?
 * FIXME: also track `function` statements, are there other types of declarations?
 */
const getTopDecl = (ref: ReferencedSymbolEntry): Declaration | undefined => {
	const target = ref.getNode().getAncestors()

	// 	.at(-2) // HACK: last is SourceFile, second to last is the variable/class declaration

	// return (target?.isKind(SyntaxKind.VariableDeclaration) ||
	// 		target?.isKind(SyntaxKind.ClassDeclaration))
	// 	? target
	// 	: undefined

	return target.findLast((x): x is Declaration =>
		x.isKind(SyntaxKind.VariableDeclaration) ||
		x.isKind(SyntaxKind.ClassDeclaration)
	)
}

/**
 * Find all references in other files
 *
 * TODO: also check for same file? (not neccesary for default exports)
 * TODO: use isDefinition()?
 */
const getActualReferences =
	(file: SourceFile) => (symbol: ReferencedSymbol): ReferencedSymbolEntry[] =>
		symbol
			.getReferences()
			// .filter(ref => ref.getNode() !== symbol.getDefinition().getNode())
			.filter((ref) => ref.getSourceFile().getFilePath() !== file.getFilePath())
			.filter((ref) =>
				ref.getNode().getParent()?.getKindName() !== "ImportClause"
			)

const getReferencedDecls = (node: Declaration): Declaration[] => {
	const file = node.getSourceFile()
	const varDecls = node.findReferences()
		.flatMap(getActualReferences(file))
		.flatMap((x) => getTopDecl(x) ?? [])

	return varDecls
}

/** Recursively query variable references into key-value map */
export const getDeclDeps = (links: Declaration[]): DeclDeps => {
	const graph: DeclDeps = new Map()

	let current = links
	while (current.length > 0) {
		current = current.flatMap((node) => {
			const references = getReferencedDecls(node)
			graph.set(node, references)
			return references
		})
	}
	return graph
}

export const asNameRecord = (declDeps: DeclDeps): Record<string, Set<string>> =>
	Stream.from(declDeps.entries())
		.map(([decl, deps]) =>
			[decl.getName()!, new Set(deps.map((dep) => dep.getName()!))] as const
		)
		.reduce(Reducer.toJSObject())
