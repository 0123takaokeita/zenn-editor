import { cliCommand } from ".";

export const exec: cliCommand = () => {
  console.log(`
  Command:
    zenn init         コンテンツ管理用のディレクトリを作成。初回のみ実行
    zenn preview      コンテンツをブラウザでプレビュー
    zenn new:article  新しい記事を追加
    zenn new:book     新しい本を追加

    👇詳細
    https://zenn.dev/zenn/articles/zenn-cli-guide
  `);
  process.exit(0);
};
