// deno-lint-ignore-file
/// <reference types="../render/main.d.ts" />
/// <reference lib="deno.window" />
/// <reference lib="dom" />

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
	.nodeCanvasObject((node, ctx, globalScale) => {
		const label = /**@type {string}*/ (node.name)
		const fontSize = 16 / globalScale
		ctx.font = `${fontSize}px Sans-Serif`
		const textWidth = ctx.measureText(label).width

		/** @type {(n: number) => number} */
		const scaleBg = (n) => n + fontSize * 0.2

		const bgWidth = scaleBg(textWidth)
		const bgHeight = scaleBg(fontSize)
		// @ts-ignore: to re-use in nodePointerAreaPaint
		node.bgWidth = bgWidth
		// @ts-ignore: to re-use in nodePointerAreaPaint
		node.bgHeight = bgHeight

		// @ts-ignore: node do has color but force-graph lacks generics to know it
		ctx.fillStyle = node.color

		ctx.globalAlpha = 1

		ctx.fillRect(
			// @ts-ignore: node do has x and y but force-graph marks it optional
			node.x - bgWidth / 2,
			// @ts-ignore: node do has x and y but force-graph marks it optional
			node.y - bgHeight / 2,
			bgWidth,
			bgHeight,
		)

		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		// @ts-ignore: node do has textColor but force-graph lacks generics to know it
		ctx.fillStyle = node.textColor
		// @ts-ignore: node do has x and y but force-graph marks it optional
		ctx.fillText(label, node.x, node.y)
	})
	.nodePointerAreaPaint((node, color, ctx) => {
		ctx.fillStyle = color
		ctx.fillRect(
			// @ts-ignore: node do has x and y but force-graph marks it optional
			node.x - node.bgWidth / 2,
			// @ts-ignore: node do has x and y but force-graph marks it optional
			node.y - node.bgHeight / 2,
			// @ts-ignore: using bgWidth
			node.bgWidth,
			// @ts-ignore: using bgHeight
			node.bgHeight,
		)
	})

Graph.width(graphDom.clientWidth).height(graphDom.clientHeight)
globalThis.addEventListener("resize", () => {
	Graph.width(graphDom.clientWidth).height(graphDom.clientHeight)
	console.log(graphDom.clientWidth)
})
