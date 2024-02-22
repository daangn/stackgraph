// deno-lint-ignore-file
/// <reference types="../render/main.d.ts" />
/// <reference lib="deno.window" />
/// <reference lib="dom" />

import ForceGraph from "https://esm.sh/force-graph@1.43.4"

// import ForceGraph2D from "https://esm.sh/react-force-graph-2d@1.25.4"
// import ReactDom from "https://esm.sh/react-dom@17"
//   <script src="//unpkg.com/react/umd/react.production.min.js"></script>
//   <script src="//unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
//   <script src="//unpkg.com/@babel/standalone"></script>

//   <script src="//unpkg.com/react-force-graph-3d"></script>

const graphDom = document.querySelector("div#graph")
if (!graphDom) throw new Error("graph dom not found")

const data = await fetch("./assets/data.json").then((res) => res.json())
const imports = Object.fromEntries(
	Object.entries(Object.groupBy(data.imports, (x) => x.source))
		.map((
			[k, v],
		) => [k, v.map((x) => data.nodes.find((node) => node.id === x.target))]),
)

/** @type {import("https://esm.sh/force-graph@1.43.4").NodeObject | undefined} */
let hoveredNode

// console.log(imports)
// ReactDOM.render()
const ARROW_WH_RATIO = 1.6
const ARROW_VLEN_RATIO = 0.2

const graph = ForceGraph()(graphDom)
	.width(graphDom.clientWidth)
	.height(graphDom.clientHeight)
	.backgroundColor("#f7fafc")
	.graphData(data)
	.nodeAutoColorBy("path")
	.linkAutoColorBy("color")
	.nodeLabel("url")
	.linkDirectionalArrowLength(3)
	.linkWidth(0.5)
	.nodeCanvasObject((node, ctx, globalScale) => {
		const state = hoveredNode
			? (hoveredNode === node || imports[hoveredNode.id]?.includes(node))
				? "highlighted"
				: "hidden"
			: "normal"

		const label = /**@type {string}*/ (node.name)
		const fontSize = (node.type === "import" ? 20 : 16) / globalScale
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
		if (state === "hidden") {
			ctx.globalAlpha = 0.2
			ctx.beginPath()
			ctx.arc(
				// @ts-ignore: node do has x and y but force-graph marks it optional
				node.x,
				// @ts-ignore: node do has x and y but force-graph marks it optional
				node.y,
				5 / globalScale,
				0,
				2 * Math.PI,
			)
			ctx.fill()
			ctx.closePath()
			return
		}

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

		// if (hoveredNode === node) {
		{
			if (state === "hidden") return
			ctx.save()
			ctx.globalAlpha = (hoveredNode === node) ? 1 : 0.5
			ctx.lineWidth = ((hoveredNode === node) ? 3 : 1) / globalScale
			const arrowLength = ((hoveredNode === node) ? 24 : 6) / globalScale
			const arrowRelPos = 0.5
			const arrowColor = node.color // "rgba(241, 21, 21, 0.521)"
			const arrowHalfWidth = arrowLength / ARROW_WH_RATIO / 2

			imports[node.id]?.forEach((target) => {
				// draws line
				ctx.beginPath()
				ctx.moveTo(
					// @ts-ignore: node do has x and y but force-graph marks it optional
					node.x,
					// @ts-ignore: node do has x and y but force-graph marks it optional
					node.y,
				)
				ctx.lineTo(
					// @ts-ignore: node do has x and y but force-graph marks it optional
					target.x,
					// @ts-ignore: node do has x and y but force-graph marks it optional
					target.y,
				)
				ctx.strokeStyle = arrowColor
				ctx.stroke()

				// draws arrow

				const start = node
				const end = target

				if (
					!start || !end || !start.hasOwnProperty("x") ||
					!end.hasOwnProperty("x")
				) return // skip invalid link

				// Construct bezier for curved lines
				// const bzLine = link.__controlPoints &&
				// 	new Bezier(start.x, start.y, ...link.__controlPoints, end.x, end.y)

				const getCoordsAlongLine =
					// bzLine
					// 	? (t) => bzLine.get(t) // get position along bezier line
					// 	:
					(t) => ({ // straight line: interpolate linearly
						x: start.x + (end.x - start.x) * t || 0,
						y: start.y + (end.y - start.y) * t || 0,
					})

				const lineLen =
					// bzLine
					// 	? bzLine.length()
					// 	:
					Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))

				const posAlongLine = 1 + arrowLength +
					(lineLen - 1 - 1 - arrowLength) * arrowRelPos

				const arrowHead = getCoordsAlongLine(posAlongLine / lineLen)
				const arrowTail = getCoordsAlongLine(
					(posAlongLine - arrowLength) / lineLen,
				)
				const arrowTailVertex = getCoordsAlongLine(
					(posAlongLine - arrowLength * (1 - ARROW_VLEN_RATIO)) / lineLen,
				)

				const arrowTailAngle =
					Math.atan2(arrowHead.y - arrowTail.y, arrowHead.x - arrowTail.x) -
					Math.PI / 2

				ctx.beginPath()

				ctx.moveTo(arrowHead.x, arrowHead.y)
				ctx.lineTo(
					arrowTail.x + arrowHalfWidth * Math.cos(arrowTailAngle),
					arrowTail.y + arrowHalfWidth * Math.sin(arrowTailAngle),
				)
				ctx.lineTo(arrowTailVertex.x, arrowTailVertex.y)
				ctx.lineTo(
					arrowTail.x - arrowHalfWidth * Math.cos(arrowTailAngle),
					arrowTail.y - arrowHalfWidth * Math.sin(arrowTailAngle),
				)

				ctx.fillStyle = arrowColor
				ctx.fill()
			})
			ctx.restore()
		}
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
	.onNodeHover((node) => {
		hoveredNode = node
	})
	.autoPauseRedraw(false)

globalThis.addEventListener("resize", () => {
	graph.width(graphDom.clientWidth).height(graphDom.clientHeight)
	console.log(graphDom.clientWidth)
})

// graph.d3Force("link")?.strength(link => {
//     console.log(link)
//     return link.type === "import" ? 1 : 0
// })
// const clusters = Object.groupBy(data.nodes, (n) => n.dir)
// console.log(clusters)
// graph.d3Force('center', )
// graph.d3Force(
// 	"cluster",
// 	forceCluster().centers((d) => clusters[d.dir][0]).strength(0.5),
// )
