const readme = () =>
	Deno.readTextFile(import.meta.dirname + "/../README.md")
		.then((text) => text.split("\n").slice(3).join("\n"))

const header = /*md*/ `
# [StackGraph](https://github.com/daangn/stackgraph)

<div id="graph"></div>

(StackGraph 저장소의 모든 변수 관계도, 유색 선은 의존 관계, 무색 선은 디렉터리/파일 트리)

`

export default async (_: Lume.Data, { md }: Lume.Helpers) => /*html*/ `
    ${md(header + await readme())}
    <script type="module" src="./assets/demo.js"></script>
`
