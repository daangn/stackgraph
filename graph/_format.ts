// 1.40.5: https://github.com/denoland/deno/issues/22496
import { stripAnsiCode } from "https://deno.land/std@0.216.0/fmt/colors.ts"
import { Reducer, Stream } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"
import { Declaration, DeclDeps } from "./decl_deps.ts"
import { encodeVSCodeURI, prettyPrintURI } from "./vscode_uri.ts"

export const serializeNoColor = (x: unknown) =>
	stripAnsiCode(
		Deno.inspect(x, {
			depth: Infinity,
			colors: false,
			sorted: true,
			trailingComma: true,
			compact: false,
			iterableLimit: Infinity,
			breakLength: Infinity,
			escapeSequences: false,
			strAbbreviateSize: Infinity,
		}),
	)

export const asRecord =
	<T extends string | number | symbol>(fn: (decl: Declaration) => T) =>
	(declDeps: DeclDeps): Record<T, Set<T>> =>
		Stream.from(declDeps.entries())
			.map(([decl, deps]) => [fn(decl), new Set(deps.map(fn))] as [T, Set<T>])
			.reduce(Reducer.toJSObject())

export const declDepsSerializer = (declDeps: DeclDeps) =>
	serializeNoColor(
		asRecord((x) => prettyPrintURI(encodeVSCodeURI(x)))(declDeps),
	)
