import { Stream } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"
import {
	getAllDecls,
	getGraph,
	parseVSCodeURI,
} from "https://raw.githubusercontent.com/daangn/stackgraph/main/graph/mod.ts"

import { exampleSrc } from "../graph/_example_project.ts"
import { colorNode } from "./main.ts"
import { inMemoryProject, withSrc } from "../graph/_project.ts"

const project = inMemoryProject()
const files = withSrc(project)(exampleSrc)

const decls = Stream.fromObjectValues(files).flatMap(getAllDecls).toArray()
const graph = getGraph(decls)

const nodes = graph.streamNodes().map(parseVSCodeURI).map(colorNode).toArray()

const links = graph.streamConnections()
	.map(([source, target]) => ({
		source: parseVSCodeURI(source).uri,
		target: parseVSCodeURI(target).uri,
	}))
	.toArray()

await Deno.writeTextFile(
	import.meta.dirname + "/assets/data/components.json",
	JSON.stringify({ links, nodes }, null, 2),
)
