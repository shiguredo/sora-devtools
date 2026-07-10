import { DebugPane } from "@/components/DebugPane";
import { DevtoolsPane } from "@/components/DevtoolsPane";

function Devtools() {
  return (
    <main>
      <div className="container">
        <div className="row">
          <DevtoolsPane />
          <DebugPane />
        </div>
      </div>
    </main>
  );
}

export default Devtools;
