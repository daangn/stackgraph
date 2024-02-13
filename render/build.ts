import { transpile } from "https://deno.land/x/emit@0.35.0/mod.ts"
import { toFileUrl } from "https://deno.land/std@0.215.0/path/to_file_url.ts"

if (import.meta.main) {
	const path = toFileUrl(import.meta.dirname + "/main.ts")

	const code = await transpile(path).then((res) => res.get(path.href)!)
	console.log(code.length)
	await Deno.writeTextFile(import.meta.dirname + "/assets/main.js", code)
}
