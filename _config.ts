import lume from "lume/mod.ts"

const site = lume({ src: "render" })

site.copy("index.html", "index.html")
site.copy("assets", "assets")

export default site
