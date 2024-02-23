import { Stream } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"
import { escapeHtml } from "https://deno.land/x/escape@1.4.2/mod.ts"
import { exampleSrc } from "../graph/_example_project.ts"

export const title = "예제: 컴포넌트 관계도"

export const codeBlock = (content: string) => /*html*/ `
    <pre><code class="language-ts hljs">${escapeHtml(content)}</code></pre>
`

const fileViewer = Stream.fromObject(exampleSrc)
	.map(([path, content]) => /*html*/ `
            <section>
                <h2>${path}</h2>
                ${codeBlock(content)}
            </section>
        `)
	.join({ start: "<article>", sep: "\n", end: "</article>" })

export const head = /*html*/ `
    <style>
        article {
            gap: 1rem;
            display: grid;
            align-items: center;
            grid-template-columns: repeat(auto-fill, minmax(25rem, 1fr));
        }
        section {
            height: 100%;
        }
    </style>
`

const code = await Deno.readTextFile(import.meta.dirname + "/components.ts")

export default () => /*html*/ `
        <div id="graph" style="height:40vh" ></div>
        ${fileViewer}
        <hr>
        <section>
            <h2>main.ts</h2>
            ${codeBlock(code)}
        </section>
        <script type="module" src="./assets/components.js" ></script>
    `
