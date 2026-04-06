export enum Language {
  Autodetect = 'autodetect',
  Plaintext = 'plaintext',
  Cpp = 'cpp',
  Css = 'css',
  Go = 'go',
  Html = 'html',
  Java = 'java',
  Javascript = 'javascript',
  Json = 'json',
  Shell = 'shell',
  Typescript = 'typescript',
  Markdown = 'markdown',
  Php = 'php',
  Python = 'python',
  Rust = 'rust',
  Sql = 'sql',
  Yaml = 'yaml',
}

type LanguageOption = { value: Language, label: string }

export const languageOptions: Array<LanguageOption> = [
  { value: Language.Autodetect, label: 'Auto-Detect' },
  { value: Language.Plaintext, label: 'Plain Text' },
  { value: Language.Cpp, label: 'C++' },
  { value: Language.Css, label: 'CSS' },
  { value: Language.Go, label: 'Go' },
  { value: Language.Html, label: 'HTML' },
  { value: Language.Java, label: 'Java' },
  { value: Language.Javascript, label: 'JavaScript' },
  { value: Language.Json, label: 'JSON' },
  { value: Language.Shell, label: 'Shell' },
  { value: Language.Typescript, label: 'TypeScript' },
  { value: Language.Markdown, label: 'Markdown' },
  { value: Language.Php, label: 'PHP' },
  { value: Language.Python, label: 'Python' },
  { value: Language.Rust, label: 'Rust' },
  { value: Language.Sql, label: 'SQL' },
  { value: Language.Yaml, label: 'YAML' },
]

const languageLabelMap = new Map(languageOptions.map(lang => [lang.value, lang.label]))

export function isLanguage(value: string): value is Language {
  return languageLabelMap.has(value as Language)
}

export function normalizeLanguage(value: string | null | undefined): Language {
  const normalized = value ?? Language.Plaintext
  return isLanguage(normalized) ? normalized : Language.Plaintext
}

export function getLanguageLabel(value: string | Language, content = '') {
  const normalized = normalizeLanguage(value)

  if (normalized === Language.Autodetect) {
    const detected = detectLanguage(content)
    const detectedLabel = languageLabelMap.get(detected) || 'Plain Text'
    return `Auto-Detect (${detectedLabel})`
  }

  return languageLabelMap.get(normalized) || 'Plain Text'
}

function getDetectionSample(content: string) {
  return content.split('\n').slice(0, 30).join('\n')
}

function scoreMatches(content: string, patterns: Array<RegExp>) {
  return patterns.reduce((score, pattern) => score + (pattern.test(content) ? 1 : 0), 0)
}

type LanguageScore = [Language, number]

function pickBestLanguage(scores: Array<LanguageScore>) {
  return scores.reduce((best, current) => {
    if (current[1] > best[1]) {
      return current
    }

    return best
  })
}

export function detectLanguage(content: string): Language {
  const sample = getDetectionSample(content)
  const scores: Array<LanguageScore> = [
    [Language.Typescript, scoreMatches(sample, [
      /\binterface\s+\w+/, 
      /\btype\s+\w+\s*=/,
      /\benum\s+\w+/, 
      /\bimplements\b/, 
      /\breadonly\b/, 
      /\b(?:private|protected|public)\s+\w+/, 
      /:\s*(?:string|number|boolean|any|unknown|never|void|object)\b/, 
      /:\s*(?:Record|Array|Promise)<[^>]+>/,
      /\bimport\s+type\b/,
      /\bas\s+const\b/,
    ])],
    [Language.Javascript, scoreMatches(sample, [
      /\b(const|let|var)\s+\w+/,
      /=>/,
      /\bfunction\s+\w+\(/,
      /\bimport\s+.+\s+from\s+['"]/,
      /\bexport\s+default\b/,
      /\bmodule\.exports\b/,
      /\brequire\s*\(/,
      /\bconsole\.log\(/,
      /\bapp\.(?:use|get|post|put|delete|patch|route)\s*\(/,
    ])],
    [Language.Json, scoreMatches(sample, [
      new RegExp('^\\s*\\{\\s*$', 'm'),
      new RegExp('^\\s*\\[\\s*$', 'm'),
      /^\s*"(?:[^"\\]|\\.)+"\s*:\s*/m,
      /^\s*"(?:[^"\\]|\\.)+"\s*:\s*"(?:[^"\\]|\\.)*"\s*$/m,
      new RegExp('^\\s*\\{[\\s\\S]*}\\s*$', 'm'),
    ])],
    [Language.Css, scoreMatches(sample, [
      /@(?:media|supports|keyframes|import)\b/i,
      /^\s*(?:\.[\w-]+|#[\w-]+|:root|body|html)[^{]*\{/m,
      /^\s*[a-z-]+\s*:\s*[^;{}]+;?$/m,
      /}/,
    ])],
    [Language.Yaml, scoreMatches(sample, [
      /^---\s*$/m,
      /^\s*[-*]\s+\S+/m,
      /^\s*[A-Za-z_][\w-]*:\s*[^\s].*$/m,
      /^\s*\w[\w-]*:\s*$/m,
    ])],
    [Language.Shell, scoreMatches(sample, [
      /^#!\s*\/?(?:usr\/bin\/env\s+)?(?:ba|z|)sh\b/m,
      /^\s*(?:export\s+[A-Za-z_][\w]*=|readonly\s+[A-Za-z_][\w]*=|local\s+[A-Za-z_][\w]*=)/m,
      /^\s*(?:if\s+\[|\[\[|case\s+.+\s+in|for\s+.+\s+in|while\s+|until\s+)/m,
      /^\s*(?:then|fi|do|done|esac|elif|else)\b/m,
      /\$\([^)]+\)|`[^`]+`/,
      /^\s*echo\s+.+$/m,
    ])],
    [Language.Html, scoreMatches(sample, [/<\/?[a-z][\w:-]*(\s[^>]*)?>/i, /<!doctype html>/i, /<html[^>]*>/i, /<body[^>]*>/i])],
    [Language.Sql, scoreMatches(sample, [/^\s*(select|insert|update|delete|create|alter|drop|truncate|with)\b/im, /\bselect\b[\s\S]{0,120}\bfrom\b/i, /\binsert\s+into\b/i, /\bupdate\s+\w+\s+set\b/i, /\bdelete\s+from\b/i, /\bcreate\s+table\b/i])],
    [Language.Python, scoreMatches(sample, [
      /^\s*def\s+\w+\s*\(/m,
      /^\s*class\s+\w+\s*:/m,
      /^\s*from\s+[A-Za-z_][\w.]*\s+import\s+[A-Za-z_][\w,\s]*$/m,
      /^\s*import\s+[A-Za-z_][\w\s,]*(?:\s+as\s+[A-Za-z_][\w]*)?$/m,
      /if __name__ == ['"]__main__['"]/,
    ])],
    [Language.Java, scoreMatches(sample, [/\bpublic\s+class\s+\w+/, /\bSystem\.out\.println\(/, new RegExp('\\bString\\[\\x5d\\s+args\\b'), /\bpackage\s+[\w.]+/, /\bimport\s+java\./])],
    [Language.Go, scoreMatches(sample, [/\bpackage\s+main\b/, /\bfunc\s+main\s*\(/, /\bfmt\.Print(?:ln|f)?\(/, /\bimport\s*\(/, /\bdefer\s+/])],
    [Language.Cpp, scoreMatches(sample, [/#include\s+<[^>]+>/, /\bstd::\w+/, /\bint\s+main\s*\(/, /<<\s*[^\n]+;?/, /\busing\s+namespace\s+std\b/])],
    [Language.Rust, scoreMatches(sample, [/\bfn\s+main\s*\(/, /\blet\s+mut\s+\w+/, /\bprintln!\(/, /\buse\s+std::/, /\bimpl\s+/])],
    [Language.Php, scoreMatches(sample, [/^\s*<\?php/m, /\$\w+/, /\becho\b/, /->\w+/, /\bnamespace\s+[\w\\]+/])],
    [Language.Markdown, scoreMatches(sample, [/^#{1,6}\s+/m, /^\s*[-*+]\s+/m, /```/, new RegExp('\\[[^\\x5d]+\\x5d\\([^)]+\\)'), /^\|.+\|$/m])],
  ]

  const winner = pickBestLanguage(scores)
  return winner[1] > 0 ? winner[0] : Language.Plaintext
}

export function resolveLanguage(language: Language | string, content = ''): Language {
  const normalized = normalizeLanguage(language)
  return normalized === Language.Autodetect ? detectLanguage(content) : normalized
}

export async function getLanguageExtension(language: Language | string, content = '') {
  switch (resolveLanguage(language, content)) {
    case Language.Css: {
      const mod = await import('@codemirror/lang-css')
      return mod.css()
    }
    case Language.Cpp: {
      const mod = await import('@codemirror/lang-cpp')
      return mod.cpp()
    }
    case Language.Go: {
      const mod = await import('@codemirror/lang-go')
      return mod.go()
    }
    case Language.Html: {
      const mod = await import('@codemirror/lang-html')
      return mod.html()
    }
    case Language.Java: {
      const mod = await import('@codemirror/lang-java')
      return mod.java()
    }
    case Language.Javascript: {
      const mod = await import('@codemirror/lang-javascript')
      return mod.javascript()
    }
    case Language.Json: {
      const mod = await import('@codemirror/lang-json')
      return mod.json()
    }
    case Language.Shell: {
      const { StreamLanguage } = await import('@codemirror/language')
      const { shell } = await import('@codemirror/legacy-modes/mode/shell')
      return StreamLanguage.define(shell)
    }
    case Language.Typescript: {
      const mod = await import('@codemirror/lang-javascript')
      return mod.javascript({ typescript: true })
    }
    case Language.Markdown: {
      const mod = await import('@codemirror/lang-markdown')
      return mod.markdown()
    }
    case Language.Php: {
      const mod = await import('@codemirror/lang-php')
      return mod.php()
    }
    case Language.Python: {
      const mod = await import('@codemirror/lang-python')
      return mod.python()
    }
    case Language.Rust: {
      const mod = await import('@codemirror/lang-rust')
      return mod.rust()
    }
    case Language.Sql: {
      const mod = await import('@codemirror/lang-sql')
      return mod.sql()
    }
    case Language.Yaml: {
      const mod = await import('@codemirror/lang-yaml')
      return mod.yaml()
    }
    default:
      return []
  }
}