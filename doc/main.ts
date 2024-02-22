import { relative } from "https://deno.land/std@0.216.0/path/relative.ts"
import { dirname } from "https://deno.land/std@0.216.0/path/dirname.ts"
import { Stream } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"
import { HashSet } from "https://deno.land/x/rimbu@1.2.0/hashed/mod.ts"

import { Project } from "../deps/ts_morph.ts"

import { colors, hashRGB } from "../render/colors.ts"
import { denoProjectOption } from "../utils/project.ts"
import { ancestors } from "./ancestors.ts"
import { declDepsToGraph, getAllDecls, getDeclDeps } from "../graph/mod.ts"
import { encodeVSCodeURI } from "../graph/vscode_uri.ts"

/**
 * Generate dependency map of **StackGraph** itself
 *
 * @module
 */
export type Type = "import" | "path"
export type Link = {
	source: string
	target: string
	color: string
	type: Type
}
type RawNode = Pick<Node, "line" | "name" | "path" | "id" | "type">
export type Node = {
	id: string
	name: string
	color: string
	textColor: string
	path: string
	dir: string
	url: string
	line: string
	type: Type
}

const linkNode = <const T extends { id: string; path: string; line: string }>(
	node: T,
) => {
	const dir = dirname(node.path)

	return {
		...node,
		dir,
		url:
			`https://github.com/daangn/stackgraph/tree/main/${node.path}${node.line}`,
	}
}

const colorNode = <const T extends { path: string }>(node: T) => ({
	...node,
	...colors(hashRGB(node.path)),
})

const distinctById = HashSet.createContext<RawNode>({
	eq: (a, b) => a.id === b.id,
})

if (import.meta.main) {
	const project = new Project(denoProjectOption)

	const root = import.meta.dirname + "/../"
	const files = project.addSourceFilesAtPaths(
		import.meta.dirname + "/../**/*.ts",
	)

	const decls = Stream.fromObjectValues(files).flatMap(getAllDecls).toArray()
	const declDeps = getDeclDeps(decls)
	const graph = declDepsToGraph(declDeps)

	const links = graph.streamConnections()
		.map(([source, target]) => ({ source, target } as const))
		.toArray()

	const nodes: RawNode[] = Array.from(declDeps.keys())
		.map((node) => {
			const srcfile = node.getSourceFile()
			const begin = node.getStartLineNumber()
			const end = node.getEndLineNumber()

			return {
				id: encodeVSCodeURI(node),
				name: node.getName()!,
				path: relative(root, srcfile.getFilePath()),
				line: `#L${begin}-L${end}`,
				type: "import" as const,
			}
		})

	const dirLinks = Stream.from(nodes)
		.stream()
		.flatMap((node) => {
			const links = Stream.from(ancestors(node.path)).append(node.id)
				.window(2, { skipAmount: 1 })
				.map(([target, source]) =>
					({ source, target, color: "#dacaca", type: "path" }) as const
				)

			return links
		})
		.reduce(HashSet.reducer())
		.toArray()

	const dirNodes = Stream.from(nodes)
		.flatMap((node) =>
			ancestors(node.path).map((path) => ({
				id: path,
				name: path,
				path,
				line: "",
				type: "path" as const,
				color: "#bdbbbb48",
				textColor: "#00000080",
			}))
		)
		.reduce(distinctById.reducer())
		.toArray()

	await Deno.writeTextFile(
		import.meta.dirname + "/assets/data/index.json",
		JSON.stringify(
			{
				links: dirLinks,
				imports: links,
				// links: Stream.from(links, dirLinks).toArray(),
				nodes: [
					...nodes.map(linkNode).map(colorNode),
					...dirNodes.map(linkNode),
				],
			},
			// satisfies { links: Link[]; nodes: Node[] },
			null,
			2,
		),
	)
}
