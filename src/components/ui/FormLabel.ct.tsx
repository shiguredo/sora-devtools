import { assert, test } from "vite-plus/test";
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
  assert.isTrue(label.element().classList.contains("me-2"));
});

test("FormLabel: カスタム className をマージする", async () => {
  const screen = render(<FormLabel className="custom-class">ラベル</FormLabel>);
  const label = screen.getByText("ラベル");
  const { classList } = label.element();
  assert.isTrue(classList.contains("me-2"));
  assert.isTrue(classList.contains("custom-class"));
});
