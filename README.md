# StackGraph

![image](https://github.com/daangn/stackgraph/assets/54838975/7b588ccd-e2ad-48bd-ae88-498630cba986)

**StackGraph**는 [타입스크립트 AST 정적 분석](https://github.com/dsherret/ts-morph)을 통해 변수 단위의 의존성을 분석하고 시각화하는 툴킷을 제공해요.

- 컴포넌트 사이의 의존성을 관계도로 시각화해요.
- [Stackflow](https://github.com/daangn/stackflow)의 `push`를 추적해 화면간 관계도를 시각화해요.
- 이벤트 로깅 함수를 추적해 페이지에서 발생하는 모든 이벤트를 보여줘요.

**StackGraph**는 기존 의존성 정적 분석 솔루션과 대비해서 어떤 장점이 있을까요?

- 기존 솔루션은 파일 단위로만 의존성 분석을 했어요.
  - 파일 하나에 여러 `export`가 있다면 어떤 `export`가 어디에서 사용되는지 알 수 없어요.
- **StackGraph**는 타입스크립트 LSP를 사용해 변수 단위로 의존성을 분석해요.
  - `export` 수에 관계없이 개별 `export`가 어디에서 사용되는지 알 수 있어요.
- 의존성 분석과 시각화 단계가 분리되어 있어 분석 결과가 프레임워크에 종속되지 않아요.

> **StackGraph**는 아직 알파 버전으로, 모든 릴리즈에서 breaking change가 발생할 수 있어요.

## 시작하기

**StackGraph**는 Deno로 작성되었어요. 다음 명령어로 Deno를 설치해요.

```sh
$ brew install deno
```

프로젝트에 TypeScript 파일을 하나 생성하고, `StackGraph` 인스턴스를 초기화해요.

```ts
import { StackGraph } from "https://raw.githubusercontent.com/daangn/stackgraph/main/graph/fluent.ts"

const graph = new StackGraph()
```

<detail>
<summary>VSCode에서 Deno Extension 사용하기</summary>

<!-- deno-fmt-ignore -->
> VSCode에서 타입스크립트 LSP와 [Deno Extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)이 충돌하는 것을 막기 위해 `.vscode/settings.json`에 다음과 같이 설정을 추가해주세요.
>
> ```json
> {
>	  "deno.enable": false,
>	  "deno.enablePaths": ["./deno_scripts", "./some_deno_file.ts"] // 파일 또는 디렉터리 경로
> }
> ```
>
> 더 자세한 내용은 Deno 공식 문서의 [설치법](https://docs.deno.com/runtime/manual/)과 [VSCode에서 사용법](https://docs.deno.com/runtime/manual/references/vscode_deno/)을 참고해주세요.

</detail>

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
$ deno run -A https://raw.githubusercontent.com/daangn/stackgraph/main/render/build.ts <data.json 파일 경로>

$ deno task serve
```
