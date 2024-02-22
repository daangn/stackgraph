import { Stream } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"
import { exampleSrc } from "../graph/_example_project.ts"

export const title = "예제: 컴포넌트 관계도"

export const src = exampleSrc

const fileViewer = Stream.fromObject(src)
	.map(([path, content]) =>
		/*html*/ `<h2>${path}</h2><pre>${content}</pre>`
	)
	.join({ start: "<section>", sep: "\n", end: "</section>" })

export default () => /*html*/ `
        <div id="graph" style="height:40vh" ></div>
        ${fileViewer}
        <script type="module" src="./assets/components.js" ></script>
    `
