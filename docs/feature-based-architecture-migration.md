# Feature-Basedアーキテクチャ移行計画書

## 📋 概要

このドキュメントは、現在のlayer-basedアーキテクチャからfeature-basedアーキテクチャへの移行計画を記載しています。機能ごとに関連するコンポーネント、フック、ストア、ユーティリティを統合し、開発効率とメンテナンス性を向上させることを目的としています。

## 🎯 移行の目標

- **機能の独立性**: 各機能が自己完結した構造にする
- **開発効率向上**: 関連ファイルを近くに配置し、開発速度を向上
- **保守性向上**: 機能追加時の影響範囲を明確にする
- **チーム開発**: 機能ごとの並行開発を容易にする
- **テスト容易性**: 機能単位でのテストを簡単にする

## 🏗️ 現在のアーキテクチャ分析

### 現在の構造
```
src/
├── components/
│   ├── Dashboard/
│   │   └── Dashboard.tsx
│   ├── Layout/
│   │   └── AppLayout.tsx
│   └── Tasks/
│       ├── TaskCard.tsx
│       ├── TaskDetail.tsx
│       ├── TaskFilters.tsx
│       ├── TaskForm.tsx
│       └── TaskList.tsx
├── hooks/
│   └── useTasks.ts
├── store/
│   └── atoms.ts
├── utils/
│   ├── helpers.ts
│   ├── storage.ts
│   └── theme.ts
├── types/
│   └── index.ts
└── routes/
```

### 特定された機能領域

1. **Task Management (タスク管理)**
   - 5つのコンポーネント
   - 1つのカスタムフック
   - 複数のストアアトム
   - 関連ユーティリティ関数

2. **Dashboard (ダッシュボード)**
   - 1つのコンポーネント
   - タスクデータの表示・分析

3. **Layout (レイアウト)**
   - 1つのコンポーネント
   - アプリケーション全体のレイアウト

4. **Settings (設定)**
   - テーマ管理
   - 言語設定
   - アプリケーション設定

## 🎯 新しいアーキテクチャ構造

```
src/
├── features/
│   ├── tasks/
│   │   ├── components/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskDetail.tsx
│   │   │   ├── TaskFilters.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── TaskList.tsx
│   │   ├── hooks/
│   │   │   └── useTasks.ts
│   │   ├── store/
│   │   │   └── atoms.ts
│   │   ├── utils/
│   │   │   └── taskHelpers.ts
│   │   └── types/
│   │       └── task.types.ts
│   ├── dashboard/
│   │   └── components/
│   │       └── Dashboard.tsx
│   ├── layout/
│   │   └── components/
│   │       └── AppLayout.tsx
│   └── settings/
│       ├── store/
│       │   └── atoms.ts
│       └── utils/
│           └── theme.ts
├── shared/
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── storage.ts
│   └── types/
│       └── shared.types.ts
├── routes/ (変更なし)
├── locales/ (変更なし)
└── test/ (変更なし)
```

## 🔄 段階的実行計画

### フェーズ1: 新しいフォルダ構造の作成

```bash
# 新しいディレクトリ構造を作成
mkdir -p src/features/tasks/{components,hooks,store,utils,types}
mkdir -p src/features/dashboard/components
mkdir -p src/features/layout/components
mkdir -p src/features/settings/{store,utils}
mkdir -p src/shared/{utils,types}
```

### フェーズ2: ファイル移動

#### Tasksフィーチャ
```bash
# Task関連コンポーネントの移動
mv src/components/Tasks/* src/features/tasks/components/

# Task関連フックの移動
mv src/hooks/useTasks.ts src/features/tasks/hooks/
```

#### Dashboardフィーチャ
```bash
# Dashboard関連コンポーネントの移動
mv src/components/Dashboard/* src/features/dashboard/components/
```

#### Layoutフィーチャ
```bash
# Layout関連コンポーネントの移動
mv src/components/Layout/* src/features/layout/components/
```

#### Sharedユーティリティ
```bash
# 共通ユーティリティの移動
mv src/utils/helpers.ts src/shared/utils/
mv src/utils/storage.ts src/shared/utils/
```

#### Settingsフィーチャ
```bash
# 設定関連ユーティリティの移動
mv src/utils/theme.ts src/features/settings/utils/
```

### フェーズ3: ストア/状態管理の分割

#### Tasks関連ストア (`src/features/tasks/store/atoms.ts`)
```typescript
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Task, TaskFilters, TaskSort } from "../types/task.types";

export const tasksAtom = atomWithStorage<Task[]>("todo-app-tasks", []);

export const taskFiltersAtom = atom<TaskFilters>({});

export const taskSortAtom = atom<TaskSort>({
  field: "createdAt",
  order: "desc",
});

export const selectedTaskIdAtom = atom<string | null>(null);

export const filteredTasksAtom = atom((get) => {
  const tasks = get(tasksAtom);
  const filters = get(taskFiltersAtom);
  const sort = get(taskSortAtom);

  // 既存のフィルタリングロジック
  const filtered = tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !task.title.toLowerCase().includes(searchLower) &&
        !task.description?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some((tag) => task.tags.includes(tag))) return false;
    }
    if (filters.dueDateRange) {
      if (
        filters.dueDateRange.start &&
        task.dueDate &&
        task.dueDate < filters.dueDateRange.start
      ) {
        return false;
      }
      if (
        filters.dueDateRange.end &&
        task.dueDate &&
        task.dueDate > filters.dueDateRange.end
      ) {
        return false;
      }
    }
    return true;
  });

  // 既存のソートロジック
  return filtered.sort((a, b) => {
    const aValue = a[sort.field];
    const bValue = b[sort.field];

    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;

    let comparison = 0;
    if (aValue < bValue) comparison = -1;
    else if (aValue > bValue) comparison = 1;

    return sort.order === "asc" ? comparison : -comparison;
  });
});

export const isLoadingAtom = atom(false);
```

#### Settings関連ストア (`src/features/settings/store/atoms.ts`)
```typescript
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { AppSettings, Theme, Language } from "../../../shared/types/shared.types";

export const appSettingsAtom = atomWithStorage<AppSettings>(
  "todo-app-settings",
  {
    theme: "light",
    language: "ja",
  },
);

export const themeAtom = atom(
  (get) => get(appSettingsAtom).theme,
  (get, set, newTheme: Theme) => {
    const settings = get(appSettingsAtom);
    set(appSettingsAtom, { ...settings, theme: newTheme });
  },
);

export const languageAtom = atom(
  (get) => get(appSettingsAtom).language,
  (get, set, newLanguage: Language) => {
    const settings = get(appSettingsAtom);
    set(appSettingsAtom, { ...settings, language: newLanguage });
  },
);
```

### フェーズ4: 型定義の分割

#### 共通型 (`src/shared/types/shared.types.ts`)
```typescript
export type Theme = "light" | "dark";

export type Language = "ja" | "en";

export type AppSettings = {
  theme: Theme;
  language: Language;
};
```

#### Task関連型 (`src/features/tasks/types/task.types.ts`)
```typescript
export type TaskStatus = "todo" | "in-progress" | "completed";

export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTask = Omit<Task, "id" | "createdAt" | "updatedAt">;

export type UpdateTask = Partial<CreateTask>;

export type TaskFilters = {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  tags?: string[];
  dueDateRange?: {
    start?: Date;
    end?: Date;
  };
};

export type TaskSort = {
  field: keyof Task;
  order: "asc" | "desc";
};

export const CreateTaskSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.date().optional(),
  tags: z.array(z.string()).default([]),
});
```

### フェーズ5: ユーティリティ関数の分割

#### Task関連ユーティリティ (`src/features/tasks/utils/taskHelpers.ts`)
```typescript
import { TaskPriority, TaskStatus } from "../types/task.types";

export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case "high":
      return "#f44336";
    case "medium":
      return "#ff9800";
    case "low":
      return "#4caf50";
    default:
      return "#757575";
  }
};

export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case "completed":
      return "#4caf50";
    case "in-progress":
      return "#2196f3";
    case "todo":
      return "#757575";
    default:
      return "#757575";
  }
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
```

#### 共通ユーティリティ (`src/shared/utils/helpers.ts`)
```typescript
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
```

### フェーズ6: インポート文の更新

#### Route Files (4 files)

**`src/routes/dashboard.tsx`**
```typescript
// Before
import { Dashboard } from "../components/Dashboard/Dashboard";

// After
import { Dashboard } from "../features/dashboard/components/Dashboard";
```

**`src/routes/__root.tsx`**
```typescript
// Before
import { AppLayout } from "../components/Layout/AppLayout";
import { languageAtom, themeAtom } from "../store/atoms";
import { createAppTheme } from "../utils/theme";

// After
import { AppLayout } from "../features/layout/components/AppLayout";
import { languageAtom, themeAtom } from "../features/settings/store/atoms";
import { createAppTheme } from "../features/settings/utils/theme";
```

**`src/routes/tasks/$taskId.tsx`**
```typescript
// Before
import { TaskDetail } from "../../components/Tasks/TaskDetail";

// After
import { TaskDetail } from "../../features/tasks/components/TaskDetail";
```

**`src/routes/tasks/index.tsx`**
```typescript
// Before
import { TaskList } from "../../components/Tasks/TaskList";

// After
import { TaskList } from "../../features/tasks/components/TaskList";
```

#### Component Files (7 files)

**Tasks関連コンポーネント**
```typescript
// Before
import { useTasks } from "../../hooks/useTasks";
import { Task } from "../../types";
import { formatDate, getPriorityColor } from "../../utils/helpers";
import { taskFiltersAtom } from "../../store/atoms";

// After
import { useTasks } from "../hooks/useTasks";
import { Task } from "../types/task.types";
import { formatDate, getPriorityColor } from "../utils/taskHelpers";
import { taskFiltersAtom } from "../store/atoms";
```

**Layout関連コンポーネント**
```typescript
// Before
import { languageAtom, themeAtom } from "../../store/atoms";

// After
import { languageAtom, themeAtom } from "../../features/settings/store/atoms";
```

#### Hook Files (1 file)

**`src/features/tasks/hooks/useTasks.ts`**
```typescript
// Before
import { isLoadingAtom, tasksAtom } from "../store/atoms";
import type { CreateTask, Task, UpdateTask } from "../types";
import { generateId } from "../utils/helpers";

// After
import { isLoadingAtom, tasksAtom } from "../store/atoms";
import type { CreateTask, Task, UpdateTask } from "../types/task.types";
import { generateId } from "../../../shared/utils/helpers";
```

### フェーズ7: テストと検証

各フェーズ完了後、以下のコマンドでテストを実行：

```bash
# ビルドテスト
npm run build

# 型チェック
npm run type-check

# リンティング
npm run check

# テスト実行
npm run test:run

# 開発サーバー起動
npm run dev
```

### フェーズ8: 旧ファイルの削除

すべてのテストが正常に動作することを確認後、旧ディレクトリを削除：

```bash
# 旧ディレクトリの削除
rm -rf src/components/
rm -rf src/hooks/
rm -rf src/store/
rm -rf src/utils/
rm -rf src/types/
```

## 📊 作業量の見積もり

### 高優先度 (即座に実行が必要)
- **フォルダ構造作成**: 5分
- **ファイル移動**: 10分
- **ストア分割**: 15分
- **型定義分割**: 10分

### 中優先度 (慎重に実行)
- **インポート文更新**: 30分
- **ユーティリティ分割**: 10分

### 低優先度 (最終確認)
- **テストと検証**: 15分
- **旧ファイル削除**: 5分

**総作業時間見積もり: 約1.5時間**

## 📋 影響を受けるファイル一覧

### インポート文更新が必要なファイル (16 files)

#### Route Files (4 files)
- `src/routes/dashboard.tsx`
- `src/routes/__root.tsx`
- `src/routes/tasks/$taskId.tsx`
- `src/routes/tasks/index.tsx`

#### Component Files (7 files)
- `src/components/Dashboard/Dashboard.tsx`
- `src/components/Layout/AppLayout.tsx`
- `src/components/Tasks/TaskCard.tsx`
- `src/components/Tasks/TaskDetail.tsx`
- `src/components/Tasks/TaskFilters.tsx`
- `src/components/Tasks/TaskForm.tsx`
- `src/components/Tasks/TaskList.tsx`

#### Hook Files (1 file)
- `src/hooks/useTasks.ts`

#### Store Files (1 file)
- `src/store/atoms.ts`

#### Util Files (2 files)
- `src/utils/theme.ts`
- `src/utils/storage.ts`

#### Locales Files (1 file)
- `src/locales/index.ts` (必要に応じて)

## ⚠️ 注意事項とリスク

### 実行時の注意事項
1. **段階的実行**: 一度にすべてを変更せず、フェーズごとに実行
2. **テスト頻度**: 各フェーズ後にビルドテストを実行
3. **バックアップ**: 作業開始前にGitコミットを作成
4. **import文の精度**: 相対パスの変更に注意
5. **circular依存の回避**: 新しい構造でcircular importが発生しないよう注意

### 潜在的リスク
1. **型チェックエラー**: インポートパスの変更によるTypeScriptエラー
2. **ビルドエラー**: 存在しないパスへの参照
3. **テストエラー**: テストファイルでのインポートパスエラー
4. **開発サーバーエラー**: 開発時のホットリロード問題

### リスク軽減策
1. **段階的実行**: 小さな変更を積み重ねる
2. **頻繁なテスト**: 各変更後にテストを実行
3. **バージョン管理**: 各フェーズ後にコミットを作成
4. **ペアプログラミング**: 複数人でのレビュー

## 🎯 完了後の利点

### 開発効率向上
- **機能ごとの独立性**: 各機能が自己完結
- **関連ファイルの近接**: 関連するファイルが近くに配置
- **機能追加時の明確性**: 新機能追加時にどこに配置するかが明確

### 保守性向上
- **影響範囲の明確化**: 機能変更時の影響範囲が明確
- **テスト容易性**: 機能単位でのテストが簡単
- **コードレビュー**: 機能ごとのレビューが容易

### チーム開発
- **並行開発**: 機能ごとの並行開発が容易
- **責任分界**: 機能ごとの責任分界が明確
- **オンボーディング**: 新メンバーの理解が容易

### 技術的利点
- **バンドルサイズ最適化**: 必要な機能のみのインポートが容易
- **Tree Shaking**: 未使用コードの除去が効率的
- **Lazy Loading**: 機能ごとの動的インポートが可能

## 📚 参考資料

### Feature-Based Architecture
- [Feature-Driven Architecture](https://feature-driven-architecture.com/)
- [React Folder Structure](https://www.robinwieruch.de/react-folder-structure/)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)

### 状態管理パターン
- [Jotai Patterns](https://jotai.org/docs/guides/patterns)
- [Atomic Design](https://atomicdesign.bradfrost.com/)

### TypeScript Best Practices
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

**作成日**: 2025-06-21  
**更新日**: 2025-06-21  
**バージョン**: 1.0.0  
**作成者**: Claude Code Analysis System