import {
	SourceFile,
	VariableDeclaration,
} from "https://deno.land/x/ts_morph@21.0.1/mod.ts"

export type Metadata<A, B> = {
	/**
	 * Dependency not originated from module imports.
	 * For example, `Redirect` in `<Redirect to="ComponentName" />`.
	 */
	links: A

	/** All other data to query from given link */
	metas: B
}

export type LinkedVarDecl<A, B> = Partial<Metadata<A, B>> & {
	node: VariableDeclaration
}

/**
 * Filter and map links, metadatas, and variable declaration
 */
export type GetLink<A, B> = (
	node: VariableDeclaration,
) => LinkedVarDecl<A, B> | undefined

export const generateLinks =
	<A, B>(getLink: GetLink<A, B>) =>
	(files: SourceFile[]): LinkedVarDecl<A, B>[] =>
		files.flatMap((file) =>
			file.getVariableDeclarations().flatMap((node) => getLink(node) ?? [])
		)

export const asMetadataRecord = <A, B>(links: LinkedVarDecl<A, B>[]) =>
	Object.fromEntries(
		links.map(({ node, ...metadata }) => [node.getName(), metadata]),
	)
