export function parseExports(content: string): any {
  const exports: any = {};
  const exportDefaultRegex = /export\s+default\s+(\w+)\s*=?/g;
  const exportNamedRegex = /export\s+const\s+(\w+)\s*=/g;

  let match;
  while ((match = exportDefaultRegex.exec(content)) !== null) {
    exports[match[1]] = "default";
  }

  while ((match = exportNamedRegex.exec(content)) !== null) {
    exports[match[1]] = "named";
  }

  return exports;
}

export function parseImports(content: string): string[] {
  const imports = [];
  const importDefaultRegex = /import\s+(\w+)\s+from/g;
  const importNamedRegex = /import\s+{\s*([^}]+)\s*}\s+from/g;

  let match;
  while ((match = importDefaultRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  while ((match = importNamedRegex.exec(content)) !== null) {
    const namedImports = match[1].split(",").map((s) => s.trim());
    imports.push(...namedImports);
  }

  return imports;
}
