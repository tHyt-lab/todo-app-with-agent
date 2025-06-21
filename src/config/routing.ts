// ルーティング設定の中央管理
// GitHub Pagesデプロイ時のベースパス管理

/**
 * アプリケーションのベースパスを取得
 * 開発環境では '/'、本番環境（GitHub Pages）では '/todo-app-with-agent/' を使用
 */
export const getBasePath = (): string => {
  // 本番ビルド時はGitHub Pagesのベースパスを使用
  if (import.meta.env.PROD) {
    return '/todo-app-with-agent/';
  }
  
  // 開発環境ではルートパスを使用
  return '/';
};

/**
 * GitHub Pages用のベースパス
 * 設定の一元管理のため定数として定義
 */
export const GITHUB_PAGES_BASE_PATH = '/todo-app-with-agent/';

/**
 * ベースパスを考慮したパスを生成
 * @param path 相対パス
 * @returns ベースパスが適用された絶対パス
 */
export const createFullPath = (path: string): string => {
  const basePath = getBasePath();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const fullPath = `${basePath}${cleanPath}`;
  
  // 重複するスラッシュを除去
  return fullPath.replace(/\/+/g, '/');
};

/**
 * GitHub Pagesでの初期化時のリダイレクト処理
 * sessionStorageに保存された元のパスを復元
 */
export const handleGitHubPagesRedirect = (): void => {
  if (typeof window === 'undefined') return;
  
  const redirect = sessionStorage.getItem('redirect');
  if (redirect) {
    sessionStorage.removeItem('redirect');
    // TanStack Routerがベースパスを自動で処理するため、
    // 相対パスをそのまま使用
    history.replaceState(null, '', redirect);
  }
};