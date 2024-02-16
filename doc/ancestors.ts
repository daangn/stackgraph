import { runningReduce } from "https://deno.land/std@0.216.0/collections/running_reduce.ts"
import { SEPARATOR as sep } from "https://deno.land/std@0.216.0/path/constants.ts"
import { dirname } from "https://deno.land/std@0.216.0/path/dirname.ts"
import { join } from "https://deno.land/std@0.216.0/path/join.ts"
import { extname } from "https://deno.land/std@0.216.0/path/extname.ts"

// deno-fmt-ignore
export const ancestors = (path: string) =>
	dirname(path) !== "."
		? [".", ...runningReduce(path.split(sep), (acc, cur) => join(acc, cur), "")]
		: ["."]
