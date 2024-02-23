export const category = "index"
export const title = "StackGraph란"

const readme = () =>
	Deno.readTextFile(import.meta.dirname + "/../README.md")
		.then((text) => text.split("\n").slice(3).join("\n"))

export default async (_: Lume.Data, { md }: Lume.Helpers) => /*html*/ `
    <div id="graph" style="height:60vh" ></div>
    <p>(StackGraph 저장소의 모든 변수 관계도, 유색 선은 의존 관계, 무색 선은 디렉터리/파일 트리)</p>

    ${md(await readme())}
    <script type="module" src="./assets/index.js"></script>
`
