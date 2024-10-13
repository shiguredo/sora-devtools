import argparse
import re
import subprocess
from typing import Optional


# ファイルを読み込み、バージョンを更新
def update_version(file_path: str, dry_run: bool) -> Optional[str]:
    with open(file_path, "r", encoding="utf-8") as f:
        content: str = f.read()

    # 現在のバージョンを取得
    current_version_match = re.search(r'"version"\s*:\s*"([\d\.\w-]+)"', content)
    if not current_version_match:
        raise ValueError("Version not found or incorrect format in package.json")

    current_version: str = current_version_match.group(1)

    # バージョンが -canary.X を持っている場合の更新
    if "-canary." in current_version:
        new_content, count = re.subn(
            r'("version"\s*:\s*")(\d+\.\d+\.\d+-canary\.)(\d+)',
            lambda m: f"{m.group(1)}{m.group(2)}{int(m.group(3)) + 1}",
            content,
        )
    else:
        # -canary.X がない場合、次のマイナーバージョンにして -canary.0 を追加
        new_content, count = re.subn(
            r'("version"\s*:\s*")(\d+)\.(\d+)\.(\d+)',
            lambda m: f"{m.group(1)}{m.group(2)}.{int(m.group(3)) + 1}.0-canary.0",
            content,
        )

    if count == 0:
        raise ValueError("Version not found or incorrect format in package.json")

    # 新しいバージョンを確認
    new_version_match = re.search(r'"version"\s*:\s*"([\d\.\w-]+)"', new_content)
    if not new_version_match:
        raise ValueError("Failed to extract the new version after the update.")

    new_version: str = new_version_match.group(1)

    print(f"Current version: {current_version}")
    print(f"New version: {new_version}")
    confirmation: str = (
        input("Do you want to update the version? (Y/n): ").strip().lower()
    )

    if confirmation != "y":
        print("Version update canceled.")
        return None

    # Dry-run 時の動作
    if dry_run:
        print("Dry-run: Version would be updated to:")
        print(new_content)
    else:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Version updated in package.json to {new_version}")

    return new_version


# pnpm install を実行し、pnpm-lock.yaml を git に追加
def run_pnpm_install(dry_run: bool) -> None:
    if dry_run:
        print("Dry-run: Would run 'pnpm install' and add 'pnpm-lock.yaml' to git")
    else:
        # pnpm install の実行
        result = subprocess.run(
            ["pnpm", "install"], check=True, capture_output=True, text=True
        )
        print(result.stdout)

        # pnpm-lock.yaml ファイルを git に追加
        subprocess.run(["git", "add", "pnpm-lock.yaml"], check=True)
        print("Added 'pnpm-lock.yaml' to git")


# git コミット、タグ、プッシュを実行
def git_operations(new_version: str, dry_run: bool) -> None:
    if dry_run:
        print("Dry-run: Would run 'git add package.json' and 'git add pnpm-lock.yaml'")
        print(f"Dry-run: Would run 'git commit -m Bump version to {new_version}'")
        print(f"Dry-run: Would run 'git tag {new_version}'")
        print("Dry-run: Would run 'git push'")
        print("Dry-run: Would run 'git push --tags'")
    else:
        subprocess.run(["git", "add", "package.json"], check=True)
        subprocess.run(
            ["git", "commit", "-m", f"Bump version to {new_version}"], check=True
        )
        subprocess.run(["git", "tag", new_version], check=True)
        subprocess.run(["git", "push"], check=True)
        subprocess.run(["git", "push", "--tags"], check=True)


# メイン処理
def main() -> None:
    parser = argparse.ArgumentParser(
        description="Update package.json version, run npm install, and commit changes."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run in dry-run mode without making actual changes",
    )
    args = parser.parse_args()

    package_json_path: str = "package.json"

    # バージョン更新
    new_version: Optional[str] = update_version(package_json_path, args.dry_run)

    if not new_version:
        return  # ユーザーが確認をキャンセルした場合、処理を中断

    # pnpm install 実行
    run_pnpm_install(args.dry_run)

    # git 操作
    git_operations(new_version, args.dry_run)


if __name__ == "__main__":
    main()
