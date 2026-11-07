import fs from "node:fs/promises";
import path from "node:path";
import { run, ROOT } from "./media";
const list = (
  await run("git", [
    "-c",
    `safe.directory=${ROOT.replaceAll("\\", "/")}`,
    "ls-files",
    "--cached",
    "--others",
    "--exclude-standard",
    "-z",
  ])
)
  .split("\0")
  .filter(Boolean);
const patterns = [
  /gh[pousr]_[A-Za-z0-9]{30,}/g,
  /sk-[A-Za-z0-9]{30,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
];
const findings: string[] = [];
for (const file of list) {
  if (!/\.(?:[cm]?[jt]sx?|json|ya?ml|md|txt|ps1|cmd)$|^LICENSE$/.test(file))
    continue;
  const text = await fs.readFile(file, "utf8");
  if (
    patterns.some((p) => {
      p.lastIndex = 0;
      return p.test(text);
    })
  )
    findings.push(file);
}
const history = await run("git", [
  "-c",
  `safe.directory=${ROOT.replaceAll("\\", "/")}`,
  "log",
  "-p",
  "--all",
]);
if (
  patterns.some((p) => {
    p.lastIndex = 0;
    return p.test(history);
  })
)
  findings.push("git-history");
await fs.mkdir("docs", { recursive: true });
await fs.writeFile(
  path.join("docs", "security-scan.json"),
  JSON.stringify(
    {
      passed: findings.length === 0,
      scanned_files: list.length,
      history: true,
      findings,
      scope:
        "Pattern-based local scan; GitHub CI adds gitleaks. Not a proof of absence of all secret formats.",
    },
    null,
    2,
  ),
);
if (findings.length)
  throw new Error("敏感内容疑似命中，请检查列出的文件，内容未打印");
console.log("Secret patterns and Git history: PASS");
