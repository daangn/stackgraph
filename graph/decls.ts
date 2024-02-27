import { Stream, StreamSource } from "../deps/rimbu.ts"
import { SourceFile } from "../deps/ts_morph.ts"
import { Declaration } from "./decl_deps.ts"

/**
 * Find initial top-level declarations to begin analyze with.
 */
export const getDecls =
	(filter: (node: Declaration) => boolean) =>
	(files: StreamSource<SourceFile>): Stream<Declaration> =>
		Stream.from(files).flatMap(getAllDecls).filter(filter)

export const getAllDecls = (file: SourceFile): Stream<Declaration> =>
	Stream.from<Declaration>(
		file.getVariableDeclarations(),
		file.getFunctions(),
		file.getClasses(),
	)
