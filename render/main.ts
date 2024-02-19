import ForceGraph from "https://esm.sh/force-graph@1.43.4"
import type { Data, Id, Link, Node as RawNode } from "./data.ts"

type Node = Omit<RawNode, "pathsFrom" | "pathsInto"> & {
	pathsFrom: Set<Id>
	pathsInto: Set<Id>
}

const dom = document.querySelector("div#graph")
if (!dom) {
	throw new Error("No div#graph found")
}

const data = await fetch("./assets/data.json").then((res) => res.json())
	.then(({ links, nodes }: Data) => ({
		links,
		nodes: nodes.map(({ pathsInto, pathsFrom, ...rest }) => ({
			...rest,
			pathsInto: new Set(pathsInto),
			pathsFrom: new Set(pathsFrom),
		})),
	}))

type CustomNode = Node & {
	x: number
	y: number
	w: number
	h: number
}

let highlight: Node | null = null

const _Graph = ForceGraph()(dom).graphData(data)
	.linkDirectionalArrowLength(3)
	.linkLineDash((d) => (d as Link).type === "replace" ? [1, 1] : null)
	.linkWidth((d) => {
		const base = (d as Link).type === "replace" ? 1.5 : 1

		const multiplier = (highlight?.pathsFrom.has((d.source as Node).id) ||
				highlight?.pathsInto.has((d.target as Node).id))
			? 3
			: 1

		return base * multiplier
	})
	.linkColor((d) => {
		if (!highlight) return (d.source as Node).color

		return highlight.pathsFrom.has((d.source as Node).id)
			? "#ffac4d"
			: highlight.pathsInto.has((d.target as Node).id)
			? "#45ff67d6"
			: "#6868681a"
	})
	.linkDirectionalParticles((d) => (d as Link).type === "push" ? 2 : 0)
	.linkDirectionalParticleWidth((d) => {
		if (!highlight) return 2
		const id = (d.source as Node).id

		return (highlight.pathsFrom.has(id) || highlight.pathsInto.has(id)) ? 5 : 1
	})
	.linkDirectionalParticleSpeed((d) => {
		if (!highlight) return 0.005
		const id = (d.source as Node).id

		return (highlight.pathsFrom.has(id) || highlight.pathsInto.has(id))
			? 0.02
			: 0
	})
	.nodeLabel("label")
	.linkCurvature(0.025)
	.linkCanvasObjectMode(() => "before")
	.nodeCanvasObject(
		// @ts-expect-error: for adding custom data
		(node: CustomNode, ctx, globalScale) => {
			const label = node.name
			const fontSize = 16 / globalScale
			ctx.font = `${fontSize}px Sans-Serif`
			const textWidth = ctx.measureText(label).width

			const [w, h] = [textWidth, fontSize * 1.6]
				.map((n) => n + fontSize * 0.25) as [number, number] // some padding

			ctx.globalAlpha = 1.0
			const type = highlight
				? highlight.id === node.id
					? "cursor"
					: highlight.pathsFrom.has(node.id)
					? "pathsFrom"
					: highlight.pathsInto.has(node.id)
					? "pathsInto"
					: "not_paths"
				: "default"

			switch (type) {
				case "pathsFrom":
					ctx.fillStyle = "#ffac4d"
					break
				case "pathsInto":
					ctx.fillStyle = "#45ff67d6"
					break
				case "cursor":
					ctx.fillStyle = "#ff4545d6"
					break
				case "not_paths":
					ctx.fillStyle = node.color
					ctx.globalAlpha = 0.1
					break
				case "default":
					ctx.fillStyle = node.color
					break
			}
			ctx.fillRect(node.x - w / 2, node.y - h / 2, w, h)

			ctx.globalAlpha = 1.0
			switch (type) {
				case "not_paths":
					ctx.globalAlpha = 0.1
					ctx.fillStyle = "black"
					break
				case "default":
					ctx.fillStyle = node.textColor
					break
				default:
					ctx.fillStyle = "white"
			}
			ctx.textAlign = "center"
			ctx.textBaseline = "middle"
			ctx.fillText(label, node.x, node.y)
			ctx.globalAlpha = 1.0
			// to re-use in nodePointerAreaPaint
			node.w = w
			node.h = h
		},
	)
	// @ts-expect-error: for adding custom data
	.nodePointerAreaPaint((node: CustomNode, color, ctx) => {
		ctx.fillStyle = color
		ctx.fillRect(node.x - node.w / 2, node.y - node.h / 2, node.w, node.h)
	})
	.onNodeHover((node) => {
		dom.style.cursor = node ? "pointer" : "default"
	})
	// @ts-expect-error: for adding custom data
	.onNodeClick((node: Node) => {
		if (highlight?.id === node.id) {
			highlight = null
		} else {
			highlight = node
		}
	})
	.onBackgroundClick(() => {
		highlight = null
	})
