export default (data: Lume.Data, { md }: Lume.Helpers) => /*html*/ `
    <!DOCTYPE html>

    <head>
        <meta charset="UTF-8">
        <title>StackGraph</title>
        <style>
            body {
                margin-inline: 20vw;
            }
            #graph {
                max-height: 60vh;
            }

            h2,
            h3,
            ul {
                margin: 0.2em 0
            }
        </style>
    </head>

    <body>
        <h1>
            <a href="https://github.com/daangn/stackgraph">StackGraph</a>
        </h1>
        <div id="graph"></div>
        <script type="module" src="./assets/demo.js"></script>
    </body>
`
