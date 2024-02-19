import { assertEquals } from "https://deno.land/std@0.216.0/assert/assert_equals.ts"
import { ancestors } from "./ancestors.ts"

Deno.test("ancestors", () => {
	assertEquals(ancestors("a/b/c.ts"), [".", "a", "a/b", "a/b/c.ts"])
	assertEquals(ancestors("a/b/c/d.ts"), [
		".",
		"a",
		"a/b",
		"a/b/c",
		"a/b/c/d.ts",
	])
	assertEquals(ancestors("a"), ["."])
	assertEquals(ancestors("a.ts"), ["."])
})
