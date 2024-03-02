import { Stream } from "../deps/rimbu.ts"
import {
	type ClassDeclaration,
	type FunctionDeclaration,
	type Node,
	ReferencedSymbol,
	ReferencedSymbolEntry,
	SyntaxKind,
	type VariableDeclaration,
} from "../deps/ts_morph.ts"
import { encodeVSCodeURI } from "./vscode_uri.ts"

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
export const getTopDecl = (
	ref: ReferencedSymbolEntry,
): Declaration | undefined => {
	const target = ref.getNode().getAncestors()

	// 	.at(-2) // HACK: last is SourceFile, second to last is the variable/class declaration

	// return (target?.isKind(SyntaxKind.VariableDeclaration) ||
	// 		target?.isKind(SyntaxKind.ClassDeclaration))
	// 	? target
	// 	: undefined

	return target.findLast((x): x is Declaration =>
		x.isKind(SyntaxKind.VariableDeclaration) ||
		x.isKind(SyntaxKind.ClassDeclaration) ||
		x.isKind(SyntaxKind.FunctionDeclaration)
	)
}

export const equals = (a: Node, b: Node) =>
	encodeVSCodeURI(a) === encodeVSCodeURI(b)

export const getActualReferences = (
	symbol: ReferencedSymbol,
): Stream<ReferencedSymbolEntry> =>
	Stream.from(symbol
		.getReferences())
		.filter((ref) => !equals(ref.getNode(), symbol.getDefinition().getNode()))
		.filter((ref) =>
			ref.getNode().getParent()?.getKindName() !== "ImportClause"
		)

export const getReferencedDecls = (
	node: Declaration,
): Stream<Declaration> =>
	Stream.from(node.findReferences())
		.flatMap(getActualReferences)
		.map((x) => getTopDecl(x))
		.filter((x): x is Declaration => x !== undefined)

export const getDeclDeps = (links: Declaration[]): DeclDeps => {
	const graph: DeclDeps = new Map()

	let current = links
	while (current.length > 0) {
		current = current.flatMap((node) => {
			const references = getReferencedDecls(node).toArray()
			graph.set(node, references)
			return references
		})
	}
	return graph
}
