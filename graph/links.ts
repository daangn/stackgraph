import {
	SourceFile,
	VariableDeclaration,
} from "https://deno.land/x/ts_morph@21.0.1/mod.ts"

export type Relations<A, B> = {
	links: A
	metas: B
}
export type LinkedVarDecl<A, B> = Relations<A, B> & {
	node: VariableDeclaration
}

/**
 * Filter and map links, metadatas, and variable declaration
 */
export type GetLink<A, B> = (
	node: VariableDeclaration,
) => LinkedVarDecl<A, B> | undefined
type Option<A, B> = {
	getLink: GetLink<A, B>
}

export const generateLinks =
	<A, B>({ getLink }: Option<A, B>) =>
	(files: SourceFile[]): LinkedVarDecl<A, B>[] =>
		files.flatMap((file) =>
			file.getVariableDeclarations().flatMap((node) => getLink(node) ?? [])
		)

export const asRelationRecord = <A, B>(links: LinkedVarDecl<A, B>[]) =>
	Object.fromEntries(
		links.map(({ node, ...relations }) => [node.getName(), relations]),
	)
