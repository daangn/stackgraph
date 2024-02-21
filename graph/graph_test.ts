import { Reducer, Stream } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"
import { exampleSrc } from "./_example_project.ts"
import { inMemoryProject, withSrc } from "./_project.ts"
import { declDepsToGraph, Graph } from "./graph.ts"
import { getAllDecls } from "./decls.ts"
import { getDeclDeps } from "./decl_deps.ts"
import { assertSnapshot } from "../test_deps.ts"
import { parseVSCodeURI, prettyPrintURI } from "./vscode_uri.ts"
import { serializeNoColor } from "./_format.ts"
import { snapshotTest } from "./_snapshot.ts"

const project = inMemoryProject()
const files = withSrc(project)(exampleSrc)
const decls = Stream.fromObjectValues(files).flatMap(getAllDecls).toArray()
const declDeps = getDeclDeps(decls)
const graph = declDepsToGraph(declDeps)

/**
 * 1. groups by source file
 * 2. pretty-print connections
 */
const prettyPrintGraph = (graph: Graph) => {
	const groups = Object.groupBy(
		graph.streamNodes(),
		(node) => parseVSCodeURI(node).path,
	)

	return Stream.fromObject(groups)
		.map(([path, nodes]) => {
			const values = Stream.from(nodes).map((node) => {
				const connections = graph
					.getConnectionsFrom(node)
					.stream().map(prettyPrintURI).toArray()

				return [prettyPrintURI(node), connections] as const
			})
				.reduce(Reducer.toJSObject())
			return [path, values] as const
		})
		.reduce(Reducer.toJSObject())
}

export const graphSerializer = (graph: Graph) =>
	serializeNoColor(prettyPrintGraph(graph))

snapshotTest(
	"declDepsToGraph() converts declDeps into valid graph",
	async (t) => {
		await assertSnapshot(t, graph, { serializer: graphSerializer })
	},
)
