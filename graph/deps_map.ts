import {
	ClassDeclaration,
	ReferencedSymbol,
	ReferencedSymbolEntry,
	type SourceFile,
	SyntaxKind,
	VariableDeclaration,
} from "../deps/ts_morph.ts"

export type Declaration = VariableDeclaration | ClassDeclaration

export type DepsMap = Map<Declaration, Declaration[]>
/**
 * @privateRemarks
 *
 * FIXME(#1): handle destructuring and multiple variable declarations
 * RFC: only track top-level declarations or inside if statements?
 * FIXME: also track `function` statements, are there other types of declarations?
 */
const getTopmostVarDecl = (
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
		x.isKind(SyntaxKind.ClassDeclaration)
	)
}
// TODO: use isDefinition()?
const getActualReferences =
	(file: SourceFile) => (symbol: ReferencedSymbol): ReferencedSymbolEntry[] =>
		symbol
			.getReferences()
			.filter((ref) => ref.getSourceFile().getFilePath() !== file.getFilePath())
			.filter((ref) =>
				ref.getNode().getParent()?.getKindName() !== "ImportClause"
			)

const getReferencedVarDecls = (node: Declaration): Declaration[] => {
	const file = node.getSourceFile()
	const varDecls = node.findReferences()
		.flatMap(getActualReferences(file))
		.flatMap((x) => getTopmostVarDecl(x) ?? [])

	return varDecls
}

/** Recursively query variable references into key-value map */
export const fromLinks = (links: Declaration[]): DepsMap => {
	const graph: DepsMap = new Map()

	let current = links
	while (current.length > 0) {
		current = current.flatMap((node) => {
			const references = getReferencedVarDecls(node)
			graph.set(node, references)
			return references
		})
	}
	return graph
}
