import type { GraphElement } from "https://deno.land/x/rimbu@1.1.0/graph/custom/common/link.ts"
import type { GraphData } from "https://esm.sh/force-graph@1.43.4"
import type { Opaque } from "https://raw.githubusercontent.com/sindresorhus/type-fest/main/source/opaque.d.ts"

import { ArrowGraphHashed } from "https://deno.land/x/rimbu@1.1.0/graph/mod.ts"
import { Stream } from "https://deno.land/x/rimbu@1.1.0/stream/mod.ts"
import { HashSet } from "https://deno.land/x/rimbu@1.1.0/hashed/mod.ts"

import { colors, hashRGB } from "./colors.ts"
import { type LabelOption, mkToLabel } from "./label.ts"

export type Flows = Record<string, { type: "push" | "replace"; to: string }[]>

export type Id = Opaque<string, Node>

export type Node = {
	id: Id
	name: string
	textColor: "white" | "black"
	color: string
	label: string
	pathsInto: Id[]
	pathsFrom: Id[]
}
export type Link = {
	type: "push" | "replace"
	source: Id
	target: Id
}

export type Data = {
	links: Link[]
	nodes: Node[]
}

export const mkAllPathFrom =
	<T>(graph: ArrowGraphHashed<T>) => (id: T): HashSet<T> => {
		const visited = HashSet.builder<T>()
		const rec = (id: T) => {
			const paths = graph.getConnectionStreamFrom(id)
				.map(([, to]) => to)
				.filter((to) => !visited.has(to))
				.toArray()

			visited.addAll(paths)
			paths.forEach(rec)
		}
		rec(id)
		return visited.build()
	}

export const mkAllPathInto =
	<T>(graph: ArrowGraphHashed<T>) => (id: T): HashSet<T> => {
		const visited = HashSet.builder<T>()
		const rec = (id: T) => {
			const paths = graph.getConnectionStreamTo(id)
				.map(([from]) => from)
				.filter((from) => !visited.has(from))
				.toArray()

			visited.addAll(paths)
			paths.forEach(rec)
		}
		rec(id)
		return visited.build()
	}

if (import.meta.main) {
	const [datapath] = Deno.args
	const data = JSON.parse(await Deno.readTextFile(datapath)) as LabelOption
	const flows = data.flows
	const toLabel = mkToLabel(data)

	const links: Link[] = Object.entries(flows)
		.flatMap(([source, targets]) =>
			targets.map(({ type, to: target }) => ({
				source: source as Id,
				target: target as Id,
				type,
			}))
		)

	const graph = Stream.fromObject(flows)
		.flatMap(([source, targets]) =>
			Stream.from(targets).map(({ to }) => [source, to] as GraphElement<Id>)
		)
		.reduce(ArrowGraphHashed.reducer())

	const allPathFrom = mkAllPathFrom(graph)
	const allPathInto = mkAllPathInto(graph)

	const nodes: Node[] = Object.keys(flows)
		.map((name) => {
			const id = name as Id
			const pathsInto = allPathInto(id).toArray()
			const pathsFrom = allPathFrom(id).toArray()
			const label = toLabel(name)
			const color = colors(hashRGB(name))

			return { id, name, ...color, pathsInto, pathsFrom, label }
		})

	await Deno.writeTextFile(
		import.meta.dirname + "/assets/data.json",
		JSON.stringify(
			{ links, nodes } satisfies GraphData satisfies {
				links: Link[]
				nodes: Node[]
			},
			null,
			2,
		),
	)
}
