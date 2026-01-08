import { assert, test } from "vitest";
import { render } from "vitest-browser-preact";
import { FormLabel } from "./FormLabel";

test("FormLabel: children をレンダリングする", async () => {
  const screen = render(<FormLabel>テストラベル</FormLabel>);
  const label = screen.getByText("テストラベル");
  assert.isNotNull(label.element());
});

test("FormLabel: htmlFor 属性を設定する", async () => {
  const screen = render(<FormLabel htmlFor="test-input">ラベル</FormLabel>);
  const label = screen.getByText("ラベル");
  assert.equal(label.element().getAttribute("for"), "test-input");
});

test("FormLabel: デフォルト className に me-2 を含む", async () => {
  const screen = render(<FormLabel>ラベル</FormLabel>);
  const label = screen.getByText("ラベル");
  assert.include(label.element().className, "me-2");
});

test("FormLabel: カスタム className をマージする", async () => {
  const screen = render(<FormLabel className="custom-class">ラベル</FormLabel>);
  const label = screen.getByText("ラベル");
  const className = label.element().className;
  assert.include(className, "me-2");
  assert.include(className, "custom-class");
});
