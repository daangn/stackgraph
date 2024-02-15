import {
	ReferencedSymbol,
	ReferencedSymbolEntry,
	type SourceFile,
	SyntaxKind,
	VariableDeclaration,
} from "https://deno.land/x/ts_morph@21.0.1/mod.ts"

export type DepsMap = Map<VariableDeclaration, VariableDeclaration[]>
/**
 * @privateRemarks
 *
 * FIXME(#1): handle destructuring and multiple variable declarations
 */
const getTopmostVarDecl = (
	ref: ReferencedSymbolEntry,
): VariableDeclaration | undefined =>
	ref
		.getNode()
		.getAncestors()
		.findLast((x) => x.getKindName() === "VariableDeclaration")
		?.asKind(SyntaxKind.VariableDeclaration)

// TODO: use isDefinition()?
const getActualReferences =
	(file: SourceFile) => (symbol: ReferencedSymbol): ReferencedSymbolEntry[] =>
		symbol
			.getReferences()
			.filter((ref) => ref.getSourceFile().getFilePath() !== file.getFilePath())
			.filter((ref) =>
				ref.getNode().getParent()?.getKindName() !== "ImportClause"
			)

const getReferencedVarDecls = (
	node: VariableDeclaration,
): VariableDeclaration[] => {
	const file = node.getSourceFile()
	const varDecls = node.findReferences()
		.flatMap(getActualReferences(file))
		.flatMap((x) => getTopmostVarDecl(x) ?? [])

	return varDecls
}

/**
 * Generates map where
 * key: variable declaration
 * value: list of variable declarations that it references
 */
export const fromLinks = (links: VariableDeclaration[]): DepsMap => {
	const graph: DepsMap = new Map()

	let decls = links
	while (decls.length > 0) {
		decls = decls.flatMap((node) => {
			const references = getReferencedVarDecls(node)
			graph.set(node, references)
			return references
		})
	}
	return graph
}
