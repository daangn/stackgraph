// deno-lint-ignore-file
/// <reference types="../render/main.d.ts" />
/// <reference lib="deno.window" />
/// <reference lib="dom" />

import ForceGraph from "https://esm.sh/force-graph@1.43.4"
import { forceCluster } from "https://esm.sh/d3-force-cluster"

// import ForceGraph2D from "https://esm.sh/react-force-graph-2d@1.25.4"
// import ReactDom from "https://esm.sh/react-dom@17"
//   <script src="//unpkg.com/react/umd/react.production.min.js"></script>
//   <script src="//unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
//   <script src="//unpkg.com/@babel/standalone"></script>

//   <script src="//unpkg.com/react-force-graph-3d"></script>

const graphDom = document.querySelector("div#graph")
if (!graphDom) throw new Error("graph dom not found")

const data = await fetch("./assets/data.json").then((res) => res.json())

// ReactDOM.render()

const graph = ForceGraph()(graphDom)
	.width(graphDom.clientWidth)
	.height(graphDom.clientHeight)
	.backgroundColor("#f7fafc")
	.graphData(data)
	.nodeAutoColorBy("path")
	.linkAutoColorBy("color")
	.nodeLabel("url")
	.linkDirectionalArrowLength(6)
	.linkWidth((link) => link.type === "import" ? 3 : 0.5)
	.nodeCanvasObject((node, ctx, globalScale) => {
		const label = /**@type{string}*/ (node.id)
		const fontSize = (node.type === "import" ? 20 : 16) / globalScale
		ctx.font = `${fontSize}px Sans-Serif`
		const textWidth = ctx.measureText(label).width

		/** @type {(n: number) => number} */
		const scaleBg = (n) => n + fontSize * 0.2

		const bgWidth = scaleBg(textWidth)
		const bgHeight = scaleBg(fontSize)

		// @ts-ignore: node do has color but force-graph lacks generics to know it
		ctx.fillStyle = node.color

		if (node.type === "import") {
			ctx.fillRect(
				// @ts-ignore: node do has x and y but force-graph marks it optional
				node.x - bgWidth / 2,
				// @ts-ignore: node do has x and y but force-graph marks it optional
				node.y - bgHeight / 2,
				bgWidth,
				bgHeight,
			)
		} else {
			ctx.roundRect(
				// @ts-ignore: node do has x and y but force-graph marks it optional
				node.x - bgWidth / 2,
				// @ts-ignore: node do has x and y but force-graph marks it optional
				node.y - bgHeight / 2,
				bgWidth,
				bgHeight,
				10,
			)
			ctx.fill()
			ctx.beginPath()
		}

		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		// @ts-ignore: node do has textColor but force-graph lacks generics to know it
		ctx.fillStyle = node.textColor
		// @ts-ignore: node do has x and y but force-graph marks it optional
		ctx.fillText(label, node.x, node.y)

		// @ts-ignore: to re-use in nodePointerAreaPaint
		node.bgWidth = bgWidth
		// @ts-ignore: to re-use in nodePointerAreaPaint
		node.bgHeight = bgHeight
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
	// @ts-ignore: node has url but force-graph lacks generics to know it
	.onNodeClick((node) => globalThis.open(node.url))

// graph.d3Force("link")?.distance(60)
// const clusters = Object.groupBy(data.nodes, (n) => n.dir)
// console.log(clusters)
// graph.d3Force('center', )
// graph.d3Force(
// 	"cluster",
// 	forceCluster().centers((d) => clusters[d.dir][0]).strength(0.5),
// )
