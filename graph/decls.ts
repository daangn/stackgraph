import {
	Stream,
	StreamSource,
} from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"
import { SourceFile } from "../deps/ts_morph.ts"
import { Declaration } from "./decl_deps.ts"

/**
 * Find initial declarations to begin analyze with.
 */
export const getDecls =
	(filter: (node: Declaration) => boolean) =>
	(files: StreamSource<SourceFile>): Stream<Declaration> =>
		Stream.from(files).flatMap((file) =>
			Stream.from<Declaration>(
				file.getVariableDeclarations(),
				file.getFunctions(),
				file.getClasses(),
			).filter(filter)
		)

export const asMetadataRecord = <A, B>(links: LinkedDecl<A, B>[]) =>
	Object.fromEntries(
		links.map(({ node, ...metadata }) => [node.getName()!, metadata]),
	)
