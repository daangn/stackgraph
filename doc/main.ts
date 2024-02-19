import { relative } from "https://deno.land/std@0.216.0/path/relative.ts"
import { dirname } from "https://deno.land/std@0.216.0/path/dirname.ts"

import { Stream } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"

import { Project } from "../deps/ts_morph.ts"
import { StackGraph } from "../graph/fluent.ts"
import { colors, hashRGB } from "../render/colors.ts"
import { denoProjectOption } from "../utils/project.ts"
import { ancestors } from "./ancestors.ts"
import { HashSet } from "https://deno.land/x/rimbu@1.2.0/hashed/mod.ts"

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
type RawNode = Pick<Node, "path" | "id" | "type">
export type Node = {
	id: string
	color: string
	textColor: string
	path: string
	dir: string
	url: string
	type: Type
}

const linkNode = <const T extends { id: string; path: string }>(node: T) => {
	const dir = dirname(node.path)

	return {
		...node,
		dir,
		url: `https://github.com/daangn/stackgraph/tree/main/${node.path}`,
	}
}

const colorNode = <const T extends { dir: string }>(node: T) => ({
	...node,
	...colors(hashRGB(node.dir)),
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

	const stackgraph = StackGraph.searchAll(files)
	const links: Link[] = stackgraph.graph.streamConnections()
		.map(([source, target]) => ({
			source,
			target,
			color: "#ff6e61",
			type: "import",
		} as const))
		.toArray()

	const nodes: RawNode[] = Array.from(stackgraph.depsMap.keys())
		.map((node) => ({
			id: node.getName()!,
			path: relative(root, node.getSourceFile().getFilePath()),
			type: "import" as const,
		}))

	const dirLinks = Stream.from(nodes)
		.stream()
		.flatMap((node) => {
			// console.log(
			// 	Stream.from(ancestors(node.path)).append(node.id).window(
			// 		2,
			// 		{ skipAmount: 1 },
			// 	).toArray(),
			// )
			const newLocal = Stream.from(ancestors(node.path)).append(node.id).window(
				2,
				{ skipAmount: 1 },
			)
				.map(([target, source]) =>
					({ source, target, color: "#dacaca", type: "path" }) as const
				)
			return newLocal
		})
		.reduce(HashSet.reducer())
		.toArray()

	const dirNodes = Stream.from(nodes)
		.flatMap((node) =>
			ancestors(node.path).map((path) => ({
				id: path,
				path,
				type: "path" as const,
				color: "#bdbbbb48",
				textColor: "#00000080",
			}))
		)
		.reduce(distinctById.reducer())
		.toArray()

	await Deno.writeTextFile(
		import.meta.dirname + "/assets/data.json",
		JSON.stringify(
			{
				links: Stream.from(links, dirLinks).toArray(),
				nodes: [
					...nodes.map(linkNode).map(colorNode),
					...dirNodes.map(linkNode),
				],
			} satisfies { links: Link[]; nodes: Node[] },
			null,
			2,
		),
	)
}
