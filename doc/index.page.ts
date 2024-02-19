const readme = () =>
	Deno.readTextFile(import.meta.dirname + "/../README.md")
		.then((text) => text.split("\n").slice(3).join("\n"))

const header = /*md*/ `
# [StackGraph](https://github.com/daangn/stackgraph)

<div id="graph"></div>

(StackGraph 저장소의 모든 변수 관계도, 붉은 선은 의존 관계, 회색 선은 디렉터리/파일 트리)

`

export default async (_: Lume.Data, { md }: Lume.Helpers) => /*html*/ `
    <!DOCTYPE html>

    <head>
        <meta charset="UTF-8">
        <title>StackGraph</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.6.0/build/styles/github.min.css" />
        <style>
            body {
                margin-inline: 20vw;
            }
            blockquote {
                background-color: #f2e8da;
                padding: 0.5em 1em;
            }
            pre {
                border: 1px solid #e1e4e8;
            }
            code {
                background-color: #dff4e6;
            }
            #graph {
                height: 60vh;
	            background-color: #f7fafc;
            }

            h2,
            h3,
            ul {
                margin: 0.2em 0
            }
        </style>
    </head>

    <body>
        ${md(header + await readme())}
        <script type="module" src="./assets/demo.js"></script>
    </body>
`
