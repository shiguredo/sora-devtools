import Sora from "sora-js-sdk";

import { version } from "@/app/signals";
import { Navbar } from "@/components/ui";

import { DebugButton } from "./DebugButton.tsx";

interface GitHubLinkProps {
  repo: string;
  version: string;
}

function GitHubLink({ repo, version }: GitHubLinkProps) {
  return (
    <a
      href={`https://github.com/${repo}`}
      className={`
        inline-block text-xs font-normal leading-tight text-center no-underline align-middle
        cursor-pointer select-none border border-bs-light rounded
        px-1.5 py-0.5 mx-1
        text-bs-light bg-transparent
        hover:text-bs-dark hover:bg-bs-light
        transition-colors duration-150
      `}
    >
      {repo}: {version}
    </a>
  );
}

export function Footer() {
  // フッターは通常フローで配置する（#root の縦フレックスの末尾に置かれ、
  // コンテンツ領域 (main) が flex: 1 で残りの高さを占有する）
  //
  // フッターの GitHub リンクはどの幅でも常時表示する。NavbarCollapse は
  // ヘッダー用の折りたたみ境界 (lg = 1024px) を持ち、トグル無しのフッターに
  // 適用すると 1024px 未満でリンクが非表示になり開く手段もないため使用しない
  // （ヘッダー側のレスポンシブ対応は別スコープのため触らない）
  return (
    <footer>
      <Navbar variant="dark" bg="sora" className="py-2 px-3">
        <div className="mr-auto" />
        <div className="flex items-center">
          <GitHubLink repo="shiguredo/sora-devtools" version={version.value} />
          <GitHubLink repo="shiguredo/sora-js-sdk" version={Sora.version()} />
        </div>
      </Navbar>
      <DebugButton />
    </footer>
  );
}
