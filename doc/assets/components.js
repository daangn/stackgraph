// deno-lint-ignore-file

import ForceGraph from "https://esm.sh/force-graph@1.43.4"

const graphDom = document.querySelector("#graph")
if (!graphDom) throw new Error("Root dom not found")

const data = await fetch("./assets/data/components.json")
	.then((res) => res.json())

const Graph = ForceGraph()(graphDom)
	.graphData(data)
	.nodeId("uri")
	.nodeLabel("fullPath")
	.linkDirectionalArrowLength(4)
	// 컴포넌트명을 노드에 표시
	.nodeCanvasObject((node, ctx, globalScale) => {
		const label = node.name
		const fontSize = 16 / globalScale
		ctx.font = `${fontSize}px Sans-Serif`

		const bgWidth = ctx.measureText(label).width + fontSize * 0.2
		const bgHeight = fontSize * 1.2

		ctx.fillStyle = node.color
		ctx.fillRect(node.x - bgWidth / 2, node.y - bgHeight / 2, bgWidth, bgHeight)

		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.fillStyle = node.textColor
		ctx.fillText(label, node.x, node.y)

		node.bgWidth = bgWidth
		node.bgHeight = bgHeight
	})
	.nodePointerAreaPaint((node, color, ctx) => {
		ctx.fillStyle = color
		ctx.fillRect(
			node.x - node.bgWidth / 2,
			node.y - node.bgHeight / 2,
			node.bgWidth,
			node.bgHeight,
		)
	})

// 화면 크기에 맞춰 그래프 크기 조정
Graph.width(graphDom.clientWidth).height(graphDom.clientHeight)
globalThis.addEventListener("resize", () => {
	Graph.width(graphDom.clientWidth).height(graphDom.clientHeight)
	console.log(graphDom.clientWidth)
})
