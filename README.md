# StackGraph

**StackGraph**는 JSX 컴포넌트 관계도와 메타데이터를 정적 분석해 시각화해요.

## 시작하기

### 데이터 준비하기

다음 형태의 JSON 파일을 준비해주세요.

```ts
export type LabelOption = {
	flows: Record<string, {
		type: "push" | "replace"
		to: string
	}[]>
	clicks: Record<string, string[]>
	shows: Record<string, string[]>
}
```

### 렌더링하기

```sh
$ git clone https://github.com/daangn/stackgraph
$ cd stackgraph

$ deno run -A render/build.ts <data.json 파일 경로>

$ deno task serve
```
