// deno-lint-ignore-file no-unused-vars
import type { getDecls } from "./decls.ts"
import type { DeclDeps, getDeclDeps } from "./decl_deps.ts"
import type { declDepsToGraph, getGraph, Graph } from "./graph.ts"
import type { getTopDeclDeps, TopDeclDeps } from "./top_decl_deps.ts"

/**
 * @module
 *
 * ## `stackgraph/graph` Workflow
 *
 * ### Terminology
 *
 * - `decl`: top-level declaration (variable, function, class)
 * - `deps`: reference to another `decl`
 * - `decl deps`: Map of `decl` and its `deps`
 * - `graph`: directed graph made with `decl deps`
 * - `top decl deps`:
 *   - inversed `graph` folded into record
 *   - with leaf `decl` as keys
 *   - and all path `decl` as values
 *
 * ### Getting `decl`s
 *
 * 1. get all declarations from source file
 * 2. filter out decl entrypoints with {@link getDecls}
 *
 * ### Getting `decl deps`
 *
 * using {@link getDeclDeps}:
 *
 * 1. search all deps from each decl
 * 2. for each deps, do step 1
 * 3. collect them into {@link DeclDeps}
 *
 * ### Getting `graph`
 *
 * generate {@link Graph} using {@link declDepsToGraph}
 * or use shortcut {@link getGraph}
 *
 * ### Getting `top decl deps`
 *
 * generate {@link TopDeclDeps} using {@link getTopDeclDeps}
 */

export * from "./decl_deps.ts"
export * from "./decls.ts"
export * from "./fs.ts"
export * from "./graph_descendants.ts"
export * from "./graph.ts"
export * from "./top_decl_deps.ts"
export * from "./vscode_uri.ts"
