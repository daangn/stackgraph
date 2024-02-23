declare global {
	namespace Lume {
		export interface Data {
			head?: string
		}
	}
}
export default (
	{ content, title, search, head }: Lume.Data,
	{}: Lume.Helpers,
) => {
	const nav = search.pages()
		.map((x) => /*html*/ `<a href="${x.url}">${x.title}</a>`).join("\n")

	return /*html*/ `
    <!DOCTYPE html>
    <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/assets/style.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.6.0/build/styles/github.min.css" />
        ${head ?? ""}
    </head>
    <body>
        <header>
            <h1>
                <a href="https://github.com/daangn/stackgraph">StackGraph</a>
            </h1>
            <nav>${nav}</nav>
        </header>
        <hr />
        ${content}
    </body>
`
}
