# コーディング規約

## 1. プロジェクト概要

本プロジェクトは、React 19 + TypeScript + Viteを使用したモダンなTodoアプリケーションです。

### 主要技術スタック
- **React 19** - UIライブラリ
- **TypeScript** - 型安全性を提供
- **Vite** - ビルドツール・開発サーバー
- **TanStack Router** - ファイルベースルーティング
- **Material-UI** - UIコンポーネントライブラリ
- **Jotai** - 状態管理ライブラリ
- **React Hook Form + Zod** - フォーム処理・バリデーション
- **i18next** - 国際化対応
- **Framer Motion** - アニメーション
- **Biome** - リンター・フォーマッター
- **Vitest** - テストフレームワーク

## 2. 開発環境・ツール設定

### 2.1 Node.js環境
- **Node.js**: 20.0.0以上
- **npm**: 10.0.0以上

### 2.2 Biome設定
```json
{
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double"
    }
  }
}
```

### 2.3 TypeScript設定
- **strict**: true
- **noUnusedLocals**: true
- **noUnusedParameters**: true
- **noFallthroughCasesInSwitch**: true

## 3. ファイル・フォルダ構成

### 3.1 プロジェクト構造
```
src/
├── components/          # UIコンポーネント
│   ├── Dashboard/       # ダッシュボード関連
│   ├── Layout/          # レイアウト関連
│   └── Tasks/           # タスク関連
├── hooks/               # カスタムフック
├── locales/             # 国際化リソース
├── routes/              # ルーティング定義
├── store/               # 状態管理（Jotai atoms）
├── test/                # テスト設定
├── types/               # 型定義
└── utils/               # ユーティリティ関数
```

### 3.2 ファイル命名規則
- **コンポーネント**: PascalCase（例：`TaskCard.tsx`）
- **フック**: camelCase with "use" prefix（例：`useTasks.ts`）
- **ユーティリティ**: camelCase（例：`helpers.ts`）
- **型定義**: camelCase（例：`index.ts`）
- **テスト**: `*.test.ts` or `*.spec.ts`

## 4. 命名規則

### 4.1 変数・関数
```typescript
// ✅ 良い例
const taskList = [...];
const getCurrentUser = () => {...};
const isLoading = false;

// ❌ 悪い例
const TaskList = [...];
const get_current_user = () => {...};
const loading = false;
```

### 4.2 定数
```typescript
// ✅ 良い例
const TASKS_QUERY_KEY = ["tasks"];
const MAX_TITLE_LENGTH = 100;

// ❌ 悪い例
const tasksQueryKey = ["tasks"];
const maxTitleLength = 100;
```

### 4.3 型・インターフェース
```typescript
// ✅ 良い例
interface TaskCardProps {
  task: Task;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, task: Task) => void;
}

type TaskStatus = "pending" | "in_progress" | "completed";

// ❌ 悪い例
interface taskCardProps {
  task: Task;
  onMenuOpen: Function;
}
```

### 4.4 Jotai Atoms
```typescript
// ✅ 良い例
export const tasksAtom = atomWithStorage<Task[]>("todo-app-tasks", []);
export const taskFiltersAtom = atom<TaskFilters>({});

// ❌ 悪い例
export const tasks = atomWithStorage<Task[]>("todo-app-tasks", []);
export const filters = atom<TaskFilters>({});
```

## 5. TypeScript・型定義

### 5.1 Zodスキーマの使用
```typescript
// ✅ 良い例
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  dueDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tags: z.array(z.string()).default([]),
});

export type Task = z.infer<typeof TaskSchema>;
```

### 5.2 型推論の活用
```typescript
// ✅ 良い例
const tasks = useTasks(); // 型推論を活用
const handleSubmit = (data: CreateTask) => {...}; // 明示的な型指定

// ❌ 悪い例
const tasks: any = useTasks();
const handleSubmit = (data: any) => {...};
```

### 5.3 Genericsの使用
```typescript
// ✅ 良い例
interface ApiResponse<T> {
  data: T;
  error?: string;
}

// ❌ 悪い例
interface ApiResponse {
  data: any;
  error?: string;
}
```

## 6. コンポーネント設計

### 6.1 関数コンポーネント
```typescript
// ✅ 良い例
interface TaskCardProps {
  task: Task;
  index: number;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = React.memo(
  ({ task, index, onMenuOpen }) => {
    // コンポーネント実装
  }
);
```

### 6.2 Props定義
```typescript
// ✅ 良い例
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}

// ❌ 悪い例
interface ComponentProps {
  title: any;
  onSubmit: Function;
  isLoading: boolean | undefined;
}
```

### 6.3 デフォルトProps
```typescript
// ✅ 良い例
interface ComponentProps {
  title: string;
  size?: "small" | "medium" | "large";
}

export const Component: React.FC<ComponentProps> = ({ 
  title, 
  size = "medium" 
}) => {
  // 実装
};
```

### 6.4 イベントハンドラー
```typescript
// ✅ 良い例
const handleSubmit = useCallback((data: FormData) => {
  // 処理
}, [dependency]);

const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  // 処理
}, []);

// ❌ 悪い例
const handleSubmit = (data: any) => {
  // 処理
};

const handleClick = (event: any) => {
  // 処理
};
```

## 7. インポート順序

```typescript
// 1. React関連のインポート
import React, { useCallback, useState } from "react";

// 2. 外部ライブラリのインポート
import { Button, Typography } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";

// 3. 内部モジュールのインポート（相対パスの深い順）
import { useTasks } from "../../hooks/useTasks";
import { Task } from "../../types";
import { formatDate } from "../../utils/helpers";

// 4. 型のみのインポート（type-only imports）
import type { TaskCardProps } from "./types";
```

## 8. スタイリング

### 8.1 Material-UI sx prop
```typescript
// ✅ 良い例
<Box
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 2,
    p: 2,
    "&:hover": {
      backgroundColor: "action.hover",
    },
  }}
>
  {/* コンテンツ */}
</Box>

// ❌ 悪い例
<Box style={{ display: "flex", alignItems: "center" }}>
  {/* コンテンツ */}
</Box>
```

### 8.2 レスポンシブデザイン
```typescript
// ✅ 良い例
<Box
  sx={{
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, 1fr)",
      md: "repeat(3, 1fr)",
    },
    gap: 2,
  }}
>
  {/* コンテンツ */}
</Box>
```

## 9. 状態管理（Jotai）

### 9.1 Atom定義
```typescript
// ✅ 良い例
// プリミティブatom
export const tasksAtom = atomWithStorage<Task[]>("todo-app-tasks", []);

// 派生atom
export const filteredTasksAtom = atom((get) => {
  const tasks = get(tasksAtom);
  const filters = get(taskFiltersAtom);
  return tasks.filter(/* フィルタリング処理 */);
});

// 書き込み可能atom
export const themeAtom = atom(
  (get) => get(appSettingsAtom).theme,
  (get, set, newTheme: Theme) => {
    const settings = get(appSettingsAtom);
    set(appSettingsAtom, { ...settings, theme: newTheme });
  },
);
```

### 9.2 Atom使用
```typescript
// ✅ 良い例
const [tasks, setTasks] = useAtom(tasksAtom);
const [filteredTasks] = useAtom(filteredTasksAtom);
const [theme, setTheme] = useAtom(themeAtom);
```

## 10. 国際化（i18next）

### 10.1 翻訳キーの使用
```typescript
// ✅ 良い例
const { t } = useTranslation();

return (
  <Typography variant="h4">
    {t("navigation.dashboard")}
  </Typography>
);

// ❌ 悪い例
return (
  <Typography variant="h4">
    Dashboard
  </Typography>
);
```

### 10.2 翻訳ファイル構造
```json
{
  "navigation": {
    "dashboard": "ダッシュボード",
    "tasks": "タスク"
  },
  "task": {
    "title": "タイトル",
    "description": "説明",
    "status": "ステータス"
  }
}
```

## 11. テスト

### 11.1 テストファイル配置
```
src/
├── utils/
│   ├── __tests__/
│   │   ├── helpers.test.ts
│   │   └── storage.test.ts
│   └── helpers.ts
```

### 11.2 テスト構造
```typescript
// ✅ 良い例
describe("helpers", () => {
  describe("generateId", () => {
    it("should generate a unique string ID", () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(typeof id1).toBe("string");
      expect(typeof id2).toBe("string");
      expect(id1).not.toBe(id2);
    });
  });
});
```

### 11.3 モックとスタブ
```typescript
// ✅ 良い例
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T10:00:00Z"));
  });

  it("should handle date correctly", () => {
    const fn = vi.fn();
    // テスト実装
  });
});
```

## 12. エラーハンドリング

### 12.1 エラー境界
```typescript
// ✅ 良い例
const handleError = useCallback((error: Error) => {
  console.error("Task operation failed:", error);
  // エラー処理
}, []);

// ❌ 悪い例
const handleError = (error: any) => {
  console.log(error);
};
```

### 12.2 非同期処理
```typescript
// ✅ 良い例
const handleAsyncOperation = useCallback(async () => {
  try {
    setLoading(true);
    const result = await someAsyncFunction();
    setData(result);
  } catch (error) {
    console.error("Operation failed:", error);
    setError(error as Error);
  } finally {
    setLoading(false);
  }
}, []);
```

## 13. パフォーマンス最適化

### 13.1 メモ化
```typescript
// ✅ 良い例
export const Component = React.memo(({ prop1, prop2 }) => {
  const memoizedValue = useMemo(() => {
    return expensiveCalculation(prop1);
  }, [prop1]);

  const memoizedCallback = useCallback((value: string) => {
    onValueChange(value);
  }, [onValueChange]);

  return (
    // JSX
  );
});
```

### 13.2 レンダリング最適化
```typescript
// ✅ 良い例
const TaskList = React.memo(() => {
  const [filteredTasks] = useAtom(filteredTasksAtom);
  
  return (
    <Box>
      {filteredTasks.map((task, index) => (
        <TaskCard key={task.id} task={task} index={index} />
      ))}
    </Box>
  );
});
```

## 14. セキュリティ

### 14.1 XSS対策
```typescript
// ✅ 良い例
<Typography>
  {task.description} {/* 自動的にエスケープされる */}
</Typography>

// ❌ 悪い例
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### 14.2 入力検証
```typescript
// ✅ 良い例
const CreateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().optional(),
});
```

## 15. 開発コマンド

### 15.1 開発・ビルド
```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run preview      # プロダクションプレビュー
```

### 15.2 コード品質
```bash
npm run check        # Biome チェック実行
npm run check:fix    # Biome チェック + 自動修正
npm run type-check   # TypeScript型チェック
```

### 15.3 テスト
```bash
npm run test         # テスト実行（watch mode）
npm run test:run     # テスト実行（一回のみ）
npm run test:coverage # カバレッジレポート生成
```

### 15.4 CI/CD
```bash
npm run ci           # CI パイプライン実行
```

## 16. Git規約

### 16.1 コミットメッセージ
```
<type>: <description>

例：
feat: タスク作成機能を追加
fix: タスク詳細画面の編集ボタンが機能しない問題を修正
docs: README.mdを更新
refactor: コンポーネントの構造を改善
test: helpers関数のテストを追加
```

### 16.2 ブランチ命名
```
feature/task-creation
fix/edit-button-not-working
refactor/component-structure
```

## 17. 追記事項

- **自動インポート整理**: Biomeの`organizeImports`機能を活用
- **厳格な型チェック**: TypeScriptのstrict modeを使用
- **プラグイン活用**: TanStack Router、React Query Devtoolsを開発時に活用
- **アクセシビリティ**: Material-UIのアクセシビリティ機能を活用
- **SEO対応**: 適切なメタタグとalt属性の設定

このコーディング規約に従うことで、一貫性のある保守性の高いコードベースを維持できます。