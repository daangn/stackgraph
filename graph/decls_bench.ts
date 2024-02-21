import { SourceFile } from "../deps/ts_morph.ts"
import type { Declaration } from "./decl_deps.ts"
import { getDecls as getDeclsStream } from "./decls.ts"
import { getDeclExampleFile } from "./_example_project.ts"

/**
 * @module
 *
 * benchmark to show that Rimbu Streams aren't slower than
 * array-based counterparts. (1.01x faster/slower than array)
 *
 * using Rimbu Streams everywhere removes conversion overhead
 */

const getDeclsArray =
	(filter: (node: Declaration) => boolean) =>
	(files: SourceFile[]): Declaration[] =>
		files.flatMap((file) =>
			[
				...file.getVariableDeclarations(),
				...file.getFunctions(),
				...file.getClasses(),
			].filter(filter)
		)

const filter = (node: Declaration) =>
	!node.getName()?.toLowerCase().endsWith("ignore")

for (const n of [1, 10, 100]) {
	const group = `(x${n})`
	Deno.bench(`array ${group}`, { group, baseline: true }, (b) => {
		const files = getDeclExampleFile(n)

		b.start()
		const _decls = getDeclsArray(filter)([files])
		b.end()
	})

	Deno.bench(`stream ${group}`, { group }, (b) => {
		const files = getDeclExampleFile(n)

		b.start()
		const _decls = getDeclsStream(filter)([files]).toArray()
		b.end()
	})
}
