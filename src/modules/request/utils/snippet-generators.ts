export interface RequestDetails {
    method: string;
    url: string;
    headers: { key: string; value: string }[];
    body: string;
}

const formatBody = (body: string): string => {
    if (!body) return '';
    try {
        const parsed = JSON.parse(body);
        return JSON.stringify(parsed, null, 2);
    } catch (e) {
        return body;
    }
};

export const generateCurlSnippet = ({ method, url, headers, body }: RequestDetails): string => {
    let snippet = `curl --location --request ${method} '${url}' \\\n`;
    
    headers.forEach((h) => {
        snippet += `--header '${h.key}: ${h.value}' \\\n`;
    });

    if (body) {
        snippet += `--data-raw '${formatBody(body)}'`;
    }

    if (snippet.endsWith('\\\n') && !body) {
        snippet = snippet.slice(0, -2);
    }

    return snippet;
};

export const generateHttpSnippet = ({ method, url, headers, body }: RequestDetails): string => {
    let path = '/';
    let host = '';
    try {
        const parsedUrl = new URL(url);
        path = parsedUrl.pathname + parsedUrl.search;
        host = parsedUrl.host;
    } catch (e) {
        // fallback
    }

    let snippet = `${method} ${path} HTTP/1.1\nHost: ${host}\n`;
    
    headers.forEach((h) => {
        snippet += `${h.key}: ${h.value}\n`;
    });

    if (body) {
        snippet += `\n${formatBody(body)}`;
    }

    return snippet;
};

export const generateJsFetchSnippet = ({ method, url, headers, body }: RequestDetails): string => {
    let snippet = `const myHeaders = new Headers();\n`;
    
    headers.forEach((h) => {
        snippet += `myHeaders.append("${h.key}", "${h.value}");\n`;
    });

    snippet += `\nconst requestOptions = {\n  method: "${method}",\n  headers: myHeaders,\n`;
    
    if (body) {
        snippet += `  body: JSON.stringify(${formatBody(body)}),\n`;
    }
    
    snippet += `  redirect: "follow"\n};\n\n`;
    snippet += `fetch("${url}", requestOptions)\n  .then((response) => response.text())\n  .then((result) => console.log(result))\n  .catch((error) => console.error(error));`;

    return snippet;
};

export const generateJsXhrSnippet = ({ method, url, headers, body }: RequestDetails): string => {
    let snippet = `const xhr = new XMLHttpRequest();\nxhr.withCredentials = true;\n\n`;
    
    snippet += `xhr.addEventListener("readystatechange", function() {\n  if(this.readyState === 4) {\n    console.log(this.responseText);\n  }\n});\n\n`;
    
    snippet += `xhr.open("${method}", "${url}");\n`;
    
    headers.forEach((h) => {
        snippet += `xhr.setRequestHeader("${h.key}", "${h.value}");\n`;
    });

    if (body) {
        snippet += `\nxhr.send(JSON.stringify(${formatBody(body)}));`;
    } else {
        snippet += `\nxhr.send();`;
    }

    return snippet;
};

export const generateNodeAxiosSnippet = ({ method, url, headers, body }: RequestDetails): string => {
    let snippet = `const axios = require('axios');\n`;
    
    if (body) {
        snippet += `let data = JSON.stringify(${formatBody(body)});\n\n`;
    }

    snippet += `let config = {\n  method: '${method.toLowerCase()}',\n  maxBodyLength: Infinity,\n  url: '${url}',\n`;
    
    if (headers.length > 0) {
        snippet += `  headers: { \n`;
        headers.forEach((h, i) => {
            snippet += `    '${h.key}': '${h.value}'${i < headers.length - 1 ? ',' : ''}\n`;
        });
        snippet += `  },\n`;
    }
    
    if (body) {
        snippet += `  data : data\n`;
    }
    
    snippet += `};\n\n`;
    snippet += `axios.request(config)\n.then((response) => {\n  console.log(JSON.stringify(response.data));\n})\n.catch((error) => {\n  console.log(error);\n});`;

    return snippet;
};

export const generateNodeNativeSnippet = ({ method, url, headers, body }: RequestDetails): string => {
    let protocol = 'https';
    let host = '';
    let path = '/';
    try {
        const parsedUrl = new URL(url);
        protocol = parsedUrl.protocol.replace(':', '');
        host = parsedUrl.host;
        path = parsedUrl.pathname + parsedUrl.search;
    } catch (e) {}

    let snippet = `const ${protocol} = require('${protocol}');\n\n`;
    
    snippet += `const options = {\n  'method': '${method}',\n  'hostname': '${host}',\n  'path': '${path}',\n  'headers': {\n`;
    
    headers.forEach((h, i) => {
        snippet += `    '${h.key}': '${h.value}'${i < headers.length - 1 ? ',' : ''}\n`;
    });
    
    snippet += `  },\n  'maxRedirects': 20\n};\n\n`;
    
    snippet += `const req = ${protocol}.request(options, (res) => {\n  let chunks = [];\n\n  res.on("data", (chunk) => {\n    chunks.push(chunk);\n  });\n\n  res.on("end", (chunk) => {\n    const body = Buffer.concat(chunks);\n    console.log(body.toString());\n  });\n\n  res.on("error", (error) => {\n    console.error(error);\n  });\n});\n\n`;
    
    if (body) {
        snippet += `const postData = JSON.stringify(${formatBody(body)});\nreq.write(postData);\n`;
    }
    
    snippet += `\nreq.end();`;

    return snippet;
};

export const generatePythonRequestsSnippet = ({ method, url, headers, body }: RequestDetails): string => {
    let snippet = `import requests\nimport json\n\nurl = "${url}"\n\n`;
    
    if (body) {
        snippet += `payload = json.dumps(${formatBody(body)})\n`;
    } else {
        snippet += `payload = {}\n`;
    }

    snippet += `headers = {\n`;
    headers.forEach((h, i) => {
        snippet += `  '${h.key}': '${h.value}'${i < headers.length - 1 ? ',' : ''}\n`;
    });
    snippet += `}\n\n`;
    
    snippet += `response = requests.request("${method}", url, headers=headers, data=payload)\n\nprint(response.text)`;

    return snippet;
};

export const generateJavaOkHttpSnippet = ({ method, url, headers, body }: RequestDetails): string => {
    let snippet = `OkHttpClient client = new OkHttpClient().newBuilder()\n  .build();\n`;
    
    if (body) {
        snippet += `MediaType mediaType = MediaType.parse("application/json");\n`;
        snippet += `RequestBody body = RequestBody.create(mediaType, "${formatBody(body).replace(/"/g, '\\"')}");\n`;
    }
    
    snippet += `Request request = new Request.Builder()\n  .url("${url}")\n`;
    
    if (body) {
        snippet += `  .method("${method}", body)\n`;
    } else {
        if (method !== 'GET') {
            snippet += `  .method("${method}", RequestBody.create(null, new byte[0]))\n`;
        } else {
            snippet += `  .method("${method}", null)\n`;
        }
    }
    
    headers.forEach((h) => {
        snippet += `  .addHeader("${h.key}", "${h.value}")\n`;
    });
    
    snippet += `  .build();\nResponse response = client.newCall(request).execute();`;

    return snippet;
};

export const generateCSharpHttpClientSnippet = ({ method, url, headers, body }: RequestDetails): string => {
    let snippet = `var client = new HttpClient();\nvar request = new HttpRequestMessage(HttpMethod.${method.charAt(0).toUpperCase() + method.slice(1).toLowerCase()}, "${url}");\n`;
    
    headers.forEach((h) => {
        snippet += `request.Headers.Add("${h.key}", "${h.value}");\n`;
    });
    
    if (body) {
        snippet += `var content = new StringContent("${formatBody(body).replace(/"/g, '""')}", null, "application/json");\nrequest.Content = content;\n`;
    }
    
    snippet += `var response = await client.SendAsync(request);\nresponse.EnsureSuccessStatusCode();\nConsole.WriteLine(await response.Content.ReadAsStringAsync());`;

    return snippet;
};

export const generateGoNativeSnippet = ({ method, url, headers, body }: RequestDetails): string => {
    let snippet = `package main\n\nimport (\n  "fmt"\n  "strings"\n  "net/http"\n  "io/ioutil"\n)\n\nfunc main() {\n\n`;
    
    snippet += `  url := "${url}"\n  method := "${method}"\n\n`;
    
    if (body) {
        snippet += `  payload := strings.NewReader(\`${formatBody(body)}\`)\n\n`;
        snippet += `  client := &http.Client {}\n  req, err := http.NewRequest(method, url, payload)\n`;
    } else {
        snippet += `  client := &http.Client {}\n  req, err := http.NewRequest(method, url, nil)\n`;
    }
    
    snippet += `\n  if err != nil {\n    fmt.Println(err)\n    return\n  }\n`;
    
    headers.forEach((h) => {
        snippet += `  req.Header.Add("${h.key}", "${h.value}")\n`;
    });
    
    snippet += `\n  res, err := client.Do(req)\n  if err != nil {\n    fmt.Println(err)\n    return\n  }\n  defer res.Body.Close()\n\n`;
    snippet += `  body, err := ioutil.ReadAll(res.Body)\n  if err != nil {\n    fmt.Println(err)\n    return\n  }\n  fmt.Println(string(body))\n}`;

    return snippet;
};

export const generatePhpCurlSnippet = ({ method, url, headers, body }: RequestDetails): string => {
    let snippet = `<?php\n\n$curl = curl_init();\n\ncurl_setopt_array($curl, array(\n`;
    snippet += `  CURLOPT_URL => '${url}',\n`;
    snippet += `  CURLOPT_RETURNTRANSFER => true,\n  CURLOPT_ENCODING => '',\n  CURLOPT_MAXREDIRS => 10,\n  CURLOPT_TIMEOUT => 0,\n  CURLOPT_FOLLOWLOCATION => true,\n  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\n`;
    snippet += `  CURLOPT_CUSTOMREQUEST => '${method}',\n`;
    
    if (body) {
        snippet += `  CURLOPT_POSTFIELDS =>'${formatBody(body)}',\n`;
    }
    
    if (headers.length > 0) {
        snippet += `  CURLOPT_HTTPHEADER => array(\n`;
        headers.forEach((h, i) => {
            snippet += `    '${h.key}: ${h.value}'${i < headers.length - 1 ? ',' : ''}\n`;
        });
        snippet += `  ),\n`;
    }
    
    snippet += `));\n\n$response = curl_exec($curl);\n\ncurl_close($curl);\necho $response;`;

    return snippet;
};

export const generateSwiftUrlSessionSnippet = ({ method, url, headers, body }: RequestDetails): string => {
    let snippet = `import Foundation\n\n`;
    
    if (body) {
        snippet += `let parameters = """\n${formatBody(body)}\n"""\n`;
        snippet += `let postData = parameters.data(using: .utf8)\n\n`;
    }
    
    snippet += `var request = URLRequest(url: URL(string: "${url}")!,timeoutInterval: Double.infinity)\n`;
    
    headers.forEach((h) => {
        snippet += `request.addValue("${h.value}", forHTTPHeaderField: "${h.key}")\n`;
    });
    
    snippet += `\nrequest.httpMethod = "${method}"\n`;
    
    if (body) {
        snippet += `request.httpBody = postData\n`;
    }
    
    snippet += `\nlet task = URLSession.shared.dataTask(with: request) { data, response, error in \n  guard let data = data else {\n    print(String(describing: error))\n    return\n  }\n  print(String(data: data, encoding: .utf8)!)\n}\n\ntask.resume()`;

    return snippet;
};

export const generateDartHttpSnippet = ({ method, url, headers, body }: RequestDetails): string => {
    let snippet = `var headers = {\n`;
    headers.forEach((h, i) => {
        snippet += `  '${h.key}': '${h.value}'${i < headers.length - 1 ? ',' : ''}\n`;
    });
    snippet += `};\n`;
    
    snippet += `var request = http.Request('${method}', Uri.parse('${url}'));\n`;
    
    if (body) {
        snippet += `request.body = '''${formatBody(body)}''';\n`;
    }
    
    snippet += `request.headers.addAll(headers);\n\n`;
    snippet += `http.StreamedResponse response = await request.send();\n\n`;
    snippet += `if (response.statusCode == 200) {\n  print(await response.stream.bytesToString());\n}\nelse {\n  print(response.reasonPhrase);\n}`;

    return snippet;
};
