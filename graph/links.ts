import { SourceFile } from "../deps/ts_morph.ts"
import { Declaration } from "./deps_map.ts"

export type Metadata<A, B> = {
	/**
	 * Dependency not originated from module imports.
	 * For example, `Redirect` in `<Redirect to="ComponentName" />`.
	 */
	links: A

	/** All other data to query from given link */
	metas: B
}

export type LinkedDecl<A, B> = Metadata<A, B> & { node: Declaration }

/**
 * Filter and map links, metadatas, and  declaration
 */
export type GetLink<A, B> = (node: Declaration) => LinkedDecl<A, B> | undefined

export const generateLinks =
	<A, B>(getLink: GetLink<A, B>) => (files: SourceFile[]): LinkedDecl<A, B>[] =>
		files.flatMap((file) =>
			[
				...file.getVariableDeclarations(),
				...file.getClasses(),
			].flatMap((node) => getLink(node) ?? [])
		)

export const asMetadataRecord = <A, B>(links: LinkedDecl<A, B>[]) =>
	Object.fromEntries(
		links.map(({ node, ...metadata }) => [node.getName()!, metadata]),
	)
