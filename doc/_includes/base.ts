export default ({ content, title, search }: Lume.Data, {}: Lume.Helpers) => {
	// console.log("pages:", search.pages())

	return /*html*/ `
    <!DOCTYPE html>
    <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <link rel="stylesheet" href="/assets/style.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.6.0/build/styles/github.min.css" />
    </head>
    <body>
        <header>
            <h1>
                <a href="https://github.com/daangn/stackgraph">StackGraph</a>
            </h1>
            <nav>
                <a href="/">Home</a>
            </nav>
        </header>
        <hr />
        ${content}
    </body>
`
}
