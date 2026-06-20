import { REST_METHOD } from "@prisma/client";

export interface ParsedRequest {
  name: string;
  method: REST_METHOD;
  url: string;
  headers: string;
  parameters: string;
  authorization: string;
  body: string | null;
}

export interface ParsedCollection {
  name: string;
  requests: ParsedRequest[];
}

export function parsePostmanCollection(jsonString: string): ParsedCollection {
  let data: any;
  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    throw new Error("Invalid JSON file");
  }

  if (!data.info || !data.info.name || !Array.isArray(data.item)) {
    throw new Error("Invalid Postman Collection format");
  }

  const collectionName = data.info.name;
  const parsedRequests: ParsedRequest[] = [];

  function processItem(item: any, currentPath: string) {
    // If it's a folder, recursively process items
    if (item.item && Array.isArray(item.item)) {
      const folderName = item.name || "Untitled Folder";
      const nextPath = currentPath ? `${currentPath} / ${folderName}` : folderName;
      item.item.forEach((childItem: any) => processItem(childItem, nextPath));
      return;
    }

    // If it's a request
    if (item.request) {
      const requestName = item.name || "Untitled Request";
      const finalName = currentPath ? `${currentPath} / ${requestName}` : requestName;
      
      const req = item.request;
      let urlStr = "";
      let queryParams: any[] = [];
      
      // Handle URL
      if (typeof req.url === "string") {
        urlStr = req.url;
      } else if (req.url && typeof req.url === "object") {
        urlStr = req.url.raw || "";
        if (Array.isArray(req.url.query)) {
          queryParams = req.url.query.map((q: any) => ({
            key: q.key || "",
            value: q.value || "",
            enabled: q.disabled !== true
          }));
        }
      }

      // Handle Headers
      let headers: any[] = [];
      if (Array.isArray(req.header)) {
        headers = req.header.map((h: any) => ({
          key: h.key || "",
          value: h.value || "",
          enabled: h.disabled !== true
        }));
      }

      // Handle Body
      let bodyStr: string | null = null;
      if (req.body) {
        if (req.body.mode === "raw") {
          bodyStr = req.body.raw || "";
        } else if (req.body.mode === "formdata") {
          // Simplistic fallback for form data representing as raw text for now
          // A full implementation would map to Httply's formdata structure if supported
          bodyStr = JSON.stringify(req.body.formdata);
        } else if (req.body.mode === "urlencoded") {
          bodyStr = JSON.stringify(req.body.urlencoded);
        }
      }

      // Handle Authorization
      let authObj: any = null;
      if (req.auth) {
        const type = req.auth.type;
        const authConfig = req.auth[type];
        if (type === "bearer" && Array.isArray(authConfig)) {
          const token = authConfig.find((x: any) => x.key === "token")?.value;
          authObj = { type: "bearer", token: token || "" };
        } else if (type === "basic" && Array.isArray(authConfig)) {
          const username = authConfig.find((x: any) => x.key === "username")?.value;
          const password = authConfig.find((x: any) => x.key === "password")?.value;
          authObj = { type: "basic", username: username || "", password: password || "" };
        } else if (type === "apikey" && Array.isArray(authConfig)) {
          const key = authConfig.find((x: any) => x.key === "key")?.value;
          const value = authConfig.find((x: any) => x.key === "value")?.value;
          const inParam = authConfig.find((x: any) => x.key === "in")?.value;
          authObj = { type: "apikey", key: key || "", value: value || "", addTo: inParam === "query" ? "queryParams" : "headers" };
        }
      }

      let method = (req.method || "GET").toUpperCase();
      // Ensure method is valid REST_METHOD
      if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        method = "GET";
      }

      parsedRequests.push({
        name: finalName,
        method: method as REST_METHOD,
        url: urlStr,
        headers: JSON.stringify(headers),
        parameters: JSON.stringify(queryParams),
        authorization: authObj ? JSON.stringify(authObj) : "",
        body: bodyStr
      });
    }
  }

  data.item.forEach((item: any) => processItem(item, ""));

  return {
    name: collectionName,
    requests: parsedRequests
  };
}

export function exportToPostmanCollection(collectionName: string, requests: any[]) {
  const postmanCollection: any = {
    info: {
      name: collectionName,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    item: [],
  };

  requests.forEach((req) => {
    // parse headers
    let headerList: any[] = [];
    try {
      if (req.headers && typeof req.headers === "string") {
        const parsed = JSON.parse(req.headers);
        headerList = parsed.map((h: any) => ({
          key: h.key,
          value: h.value,
          type: "text",
          disabled: !h.enabled,
        }));
      } else if (Array.isArray(req.headers)) {
        headerList = req.headers.map((h: any) => ({
          key: h.key,
          value: h.value,
          type: "text",
          disabled: !h.enabled,
        }));
      }
    } catch (e) {}

    // parse query parameters
    let queryList: any[] = [];
    try {
      if (req.parameters && typeof req.parameters === "string") {
        const parsed = JSON.parse(req.parameters);
        queryList = parsed.map((q: any) => ({
          key: q.key,
          value: q.value,
          disabled: !q.enabled,
        }));
      } else if (Array.isArray(req.parameters)) {
        queryList = req.parameters.map((q: any) => ({
          key: q.key,
          value: q.value,
          disabled: !q.enabled,
        }));
      }
    } catch (e) {}

    // Handle URL host and raw
    let urlObj: any = {
      raw: req.url || "",
      query: queryList,
    };
    try {
      const parsedUrl = new URL(req.url);
      urlObj.host = parsedUrl.host.split(".");
      urlObj.path = parsedUrl.pathname.split("/").filter(Boolean);
      urlObj.protocol = parsedUrl.protocol.replace(":", "");
    } catch (e) {
      // Fallback for template strings like {{url}}
      urlObj.host = [(req.url || "").split("/")[0]]; 
    }

    // handle body
    let bodyObj: any = null;
    if (req.body) {
      bodyObj = {
        mode: "raw",
        raw: req.body,
      };
    }

    // handle authorization
    let authObj: any = null;
    try {
      let authData = req.authorization;
      if (typeof authData === "string") {
        authData = JSON.parse(authData);
      }
      if (authData && authData.type && authData.type !== "none") {
        const typeMap: Record<string, string> = {
          bearer: "bearer",
          jwt: "bearer",
          basic: "basic",
          apikey: "apikey",
        };
        const pmType = typeMap[authData.type];
        
        if (pmType === "bearer") {
          authObj = {
            type: "bearer",
            bearer: [
              { key: "token", value: authData.token || "", type: "string" }
            ]
          };
        } else if (pmType === "basic") {
          authObj = {
            type: "basic",
            basic: [
              { key: "username", value: authData.username || "", type: "string" },
              { key: "password", value: authData.password || "", type: "string" }
            ]
          };
        } else if (pmType === "apikey") {
          authObj = {
            type: "apikey",
            apikey: [
              { key: "key", value: authData.key || "", type: "string" },
              { key: "value", value: authData.value || "", type: "string" },
              { key: "in", value: authData.addTo === "queryParams" ? "query" : "header", type: "string" }
            ]
          };
        }
      }
    } catch (e) {}

    const postmanItem = {
      name: req.name,
      request: {
        method: req.method,
        header: headerList,
        url: urlObj,
        body: bodyObj,
      } as any,
    };
    
    if (authObj) {
      postmanItem.request.auth = authObj;
    }

    postmanCollection.item.push(postmanItem);
  });

  return postmanCollection;
}
