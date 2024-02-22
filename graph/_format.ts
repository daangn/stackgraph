import { Reducer, Stream } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"
import { encodeVSCodeURI, prettyPrintURI } from "./vscode_uri.ts"

import type { Declaration, DeclDeps } from "./decl_deps.ts"
import type { TopDeclDeps } from "./top_decl_deps.ts"

export const serializeNoColor = (x: unknown) =>
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
	})

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

export const topDeclDepsSerializer = (topDeclDeps: TopDeclDeps): string =>
	serializeNoColor(Object.fromEntries(
		Array.from(topDeclDeps.entries())
			.map(([decl, deps]) =>
				[
					prettyPrintURI(decl),
					Array.from(deps).map(prettyPrintURI),
				] as const
			),
	))
