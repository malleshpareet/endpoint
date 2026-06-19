export interface ParsedCurl {
  url: string;
  method: string;
  headers: { key: string; value: string }[];
  body: string;
}

export function parseCurl(curlCommand: string): ParsedCurl | null {
  if (!curlCommand.trim().startsWith("curl ")) return null;

  const result: ParsedCurl = {
    url: "",
    method: "GET",
    headers: [],
    body: ""
  };

  // Remove line continuations and clean up
  const cleanCmd = curlCommand.replace(/\\\r?\n/g, " ").replace(/\s+/g, " ").trim();

  // A very basic tokenizer for bash-like commands
  const tokens: string[] = [];
  let currentToken = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escapeNext = false;

  for (let i = 4; i < cleanCmd.length; i++) {
    const char = cleanCmd[i];

    if (escapeNext) {
      currentToken += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (char === ' ' && !inSingleQuote && !inDoubleQuote) {
      if (currentToken) {
        tokens.push(currentToken);
        currentToken = "";
      }
      continue;
    }

    currentToken += char;
  }
  
  if (currentToken) {
    tokens.push(currentToken);
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token === "-X" || token === "--request") {
      if (i + 1 < tokens.length) {
        result.method = tokens[++i].toUpperCase();
      }
    } else if (token === "-H" || token === "--header") {
      if (i + 1 < tokens.length) {
        const headerStr = tokens[++i];
        const splitIdx = headerStr.indexOf(":");
        if (splitIdx > 0) {
          result.headers.push({
            key: headerStr.slice(0, splitIdx).trim(),
            value: headerStr.slice(splitIdx + 1).trim()
          });
        }
      }
    } else if (token === "-d" || token === "--data" || token === "--data-raw" || token === "--data-binary") {
      if (i + 1 < tokens.length) {
        result.body = tokens[++i];
        if (result.method === "GET") result.method = "POST";
      }
    } else if (token.startsWith("-") || token === "curl") {
      // Ignore other flags
    } else {
      if (!result.url) {
        // Remove quotes if any (tokenizer already handles quotes but just in case)
        result.url = token.replace(/^['"]|['"]$/g, '');
      }
    }
  }

  if (result.url) {
    return result;
  }
  
  return null;
}
