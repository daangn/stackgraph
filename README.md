# StackGraph

**StackGraph**는 [타입스크립트 AST 정적 분석](https://github.com/dsherret/ts-morph)을 통해 변수 단위의 의존성을 분석하고 시각화하는 툴킷을 제공해요.

- 컴포넌트 사이의 의존성을 관계도로 시각화해요.
- [Stackflow](https://github.com/daangn/stackflow)의 `push`를 추적해 화면간 관계도를 시각화해요.
- 이벤트 로깅 함수를 추적해 페이지에서 발생하는 모든 이벤트를 보여줘요.

**StackGraph**는 기존 의존성 정적 분석 라이브러리와 대비해서 어떤 장점이 있을까요?

- 파일이 아닌 **선언** (변수, 클래스) 단위로 의존성을 분석해요.
- 의존성 분석과 시각화 단계가 분리되어 있어 분석 결과가 프레임워크에 종속되지 않아요.

## 시작하기

```ts
import { StackGraph } from "https://raw.githubusercontent.com/daangn/stackgraph/main/graph/fluent.ts"

const graph = new StackGraph()
```

```sh
deno run
```

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
