import { DebugPane } from "@/components/DebugPane";
import { DevtoolsPane } from "@/components/DevtoolsPane";

function Devtools() {
  // main は #root の縦フレックス内で flex: 1 によりコンテンツ領域いっぱいに広がる
  // ペインは .row の高さにストレッチされ、内部スクロールでコンテンツを表示する
  // （ビューポート固定の高さ計算は行わず、フッターの高さを余白計算に持ち込まない）
  return (
    <main className="flex flex-col flex-1 min-h-0">
      <div className="container flex flex-col flex-1 min-h-0">
        {/* ペインは col-6 + col-6 または col-12 で常に 1 行に収まる
            （50% + 50% でちょうど 100%。App.css の .row の flex-wrap: wrap のままでよい） */}
        <div className="row flex-1 min-h-0">
          <DevtoolsPane />
          <DebugPane />
        </div>
      </div>
    </main>
  );
}

export default Devtools;
