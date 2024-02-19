import { SourceFile } from "../deps/ts_morph.ts"
import { Declaration } from "./deps_map.ts"

export type FilterEntryPoint = (node: Declaration) => boolean
export const filterEntryPoints =
	(filter: FilterEntryPoint) => (files: SourceFile[]): Declaration[] =>
		files.flatMap((file) =>
			[
				...file.getVariableDeclarations(),
				...file.getClasses(),
			].filter(filter)
		)

export const asMetadataRecord = <A, B>(links: LinkedDecl<A, B>[]) =>
	Object.fromEntries(
		links.map(({ node, ...metadata }) => [node.getName()!, metadata]),
	)
