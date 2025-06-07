import { createHighlighter, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki'

let highlighter: Highlighter | null = null

const supportedLanguages: BundledLanguage[] = [
  'javascript',
  'typescript',
  'python',
  'java',
  'c',
  'cpp',
  'csharp',
  'php',
  'ruby',
  'go',
  'rust',
  'swift',
  'kotlin',
  'scala',
  'html',
  'css',
  'scss',
  'json',
  'xml',
  'yaml',
  'toml',
  'markdown',
  'sql',
  'bash',
  'powershell',
  'dockerfile',
  'tsx',
  'jsx',
  'vue',
  'svelte',
  'r',
  'matlab',
  'lua',
  'perl',
  'haskell',
  'clojure',
  'elixir',
  'erlang',
  'dart',
  'solidity',
  'graphql',
  'diff',
]

export const languageOptions = [
  { value: 'text', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'tsx', label: 'TypeScript React' },
  { value: 'jsx', label: 'JavaScript React' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'scala', label: 'Scala' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'toml', label: 'TOML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'r', label: 'R' },
  { value: 'matlab', label: 'MATLAB' },
  { value: 'lua', label: 'Lua' },
  { value: 'perl', label: 'Perl' },
  { value: 'haskell', label: 'Haskell' },
  { value: 'clojure', label: 'Clojure' },
  { value: 'elixir', label: 'Elixir' },
  { value: 'erlang', label: 'Erlang' },
  { value: 'dart', label: 'Dart' },
  { value: 'solidity', label: 'Solidity' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'diff', label: 'Diff' },
]

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: supportedLanguages,
    })
  }
  return highlighter
}

export async function highlightCode(
  code: string,
  language: string,
  theme: BundledTheme = 'github-dark'
): Promise<string> {
  if (language === 'text' || !supportedLanguages.includes(language as BundledLanguage)) {
    // Return plain text wrapped in a pre tag
    return `<pre class="shiki" style="background-color: ${theme === 'github-dark' ? '#0d1117' : '#ffffff'}; color: ${theme === 'github-dark' ? '#e6edf3' : '#24292f'}"><code>${escapeHtml(code)}</code></pre>`
  }
  
  try {
    const highlighter = await getHighlighter()
    return highlighter.codeToHtml(code, {
      lang: language as BundledLanguage,
      theme,
    })
  } catch (error) {
    console.error('Error highlighting code:', error)
    // Fallback to plain text
    return `<pre class="shiki" style="background-color: ${theme === 'github-dark' ? '#0d1117' : '#ffffff'}; color: ${theme === 'github-dark' ? '#e6edf3' : '#24292f'}"><code>${escapeHtml(code)}</code></pre>`
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  
  const extensionMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    py: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cc: 'cpp',
    cxx: 'cpp',
    cs: 'csharp',
    php: 'php',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'scss',
    json: 'json',
    xml: 'xml',
    yml: 'yaml',
    yaml: 'yaml',
    toml: 'toml',
    md: 'markdown',
    sql: 'sql',
    sh: 'bash',
    bash: 'bash',
    ps1: 'powershell',
    dockerfile: 'dockerfile',
    vue: 'vue',
    svelte: 'svelte',
    r: 'r',
    m: 'matlab',
    lua: 'lua',
    pl: 'perl',
    hs: 'haskell',
    clj: 'clojure',
    ex: 'elixir',
    exs: 'elixir',
    erl: 'erlang',
    dart: 'dart',
    sol: 'solidity',
    graphql: 'graphql',
    gql: 'graphql',
    diff: 'diff',
    patch: 'diff',
  }
  
  return extensionMap[ext || ''] || 'text'
}
