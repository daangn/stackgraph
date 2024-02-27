import type {
	Project,
	SourceFile,
} from "https://deno.land/x/ts_morph@21.0.1/mod.ts"

import { Stream } from "../deps/rimbu.ts"
import {
	getAllDecls,
	getGraph,
	parseVSCodeURI,
} from "https://raw.githubusercontent.com/daangn/stackgraph/main/graph/mod.ts"

import { exampleSrc } from "../graph/_example_project.ts"
import { colorNode } from "./main.ts"
import { inMemoryProject, withSrc } from "../graph/_project.ts"

// 1. ts-morph 프로젝트 생성 (https://ts-morph.com/setup/)
const project: Project = inMemoryProject()

// 2. 프로젝트에 소스 파일 추가 (https://ts-morph.com/setup/adding-source-files)
const files: Record<string, SourceFile> = withSrc(project)(exampleSrc)

// 3. 모든 선언 가져오기
const decls = Stream.fromObjectValues(files).flatMap(getAllDecls).toArray()

// 4. 그래프 생성하기
const graph = getGraph(decls)

// 5. 그래프 노드와 링크를 JSON으로 저장하기
// (https://github.com/vasturiano/force-graph/blob/master/example/basic/index.html)
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
