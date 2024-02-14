import {
	ReferencedSymbol,
	ReferencedSymbolEntry,
	SyntaxKind,
	VariableDeclaration,
} from "https://deno.land/x/ts_morph@21.0.1/mod.ts"

type Optional<T> = [T] | []
const toOptional = <T>(x: T | undefined): Optional<T> => (x ? [x] : [])

export type Graph = Map<VariableDeclaration, VariableDeclaration[]>

const getTopmostVarDecl = (
	ref: ReferencedSymbolEntry,
): Optional<VariableDeclaration> => {
	const node = ref
		.getNode()
		.getAncestors()
		.findLast((x) => x.getKindName() === "VariableDeclaration")
		?.asKind(SyntaxKind.VariableDeclaration)

	return toOptional(node)
}

export const getGraph = (vardecl: VariableDeclaration): Graph => {
	const graph: Graph = new Map()

	const getReferencedVarDecls = (
		node: VariableDeclaration,
	): VariableDeclaration[] => {
		const file = node.getSourceFile()

		// TODO: use isDefinition()?
		const getActualReferences = (
			symbol: ReferencedSymbol,
		): ReferencedSymbolEntry[] =>
			symbol
				.getReferences()
				.filter((ref) =>
					ref.getSourceFile().getFilePath() !== file.getFilePath()
				)
				.filter((ref) =>
					ref.getNode().getParent()?.getKindName() !== "ImportClause"
				)

		const varDecls = node.findReferences()
			.flatMap(getActualReferences)
			.flatMap(getTopmostVarDecl)

		graph.set(node, varDecls)
		return varDecls
	}

	let decls = [vardecl]
	while (decls.length > 0) {
		decls = decls.flatMap(getReferencedVarDecls)
	}
	return graph
}
