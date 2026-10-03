import { assert, test } from "vite-plus/test";
import { render } from "vitest-browser-preact";

import styles from "./FormLabel.module.css";
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

test("FormLabel: デフォルトでラベル用のクラスを適用する", async () => {
  const screen = render(<FormLabel>ラベル</FormLabel>);
  const label = screen.getByText("ラベル");
  assert.isTrue(label.element().classList.contains(styles.label));
});

test("FormLabel: カスタム className をマージする", async () => {
  const screen = render(<FormLabel className="custom-class">ラベル</FormLabel>);
  const label = screen.getByText("ラベル");
  const { classList } = label.element();
  assert.isTrue(classList.contains(styles.label));
  assert.isTrue(classList.contains("custom-class"));
});
