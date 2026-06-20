import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VariableInput } from "./variable-input";

export type AuthType = "none" | "bearer" | "basic" | "jwt" | "digest" | "oauth1" | "oauth2" | "hawk" | "aws" | "ntlm" | "apikey" | "edgegrid" | "asap";

export interface AuthorizationData {
  type: AuthType;
  token?: string;
  username?: string;
  password?: string;
  
  key?: string;
  value?: string;
  addTo?: string;

  headerPrefix?: string;

  accessKey?: string;
  secretKey?: string;
  awsRegion?: string;
  serviceName?: string;
  sessionToken?: string;

  consumerKey?: string;
  consumerSecret?: string;
  tokenSecret?: string;
  signatureMethod?: string;
  timestamp?: string;
  nonce?: string;
  version?: string;
  realm?: string;

  authId?: string;
  authKey?: string;
  algorithm?: string;
  user?: string;
  ext?: string;
  app?: string;
  dlg?: string;

  domain?: string;
  workstation?: string;

  qop?: string;
  nonceCount?: string;
  clientNonce?: string;
  opaque?: string;

  accessToken?: string;
  clientToken?: string;
  clientSecret?: string;
  baseURL?: string;

  issuer?: string;
  keyId?: string;
  privateKey?: string;
  audience?: string;
}

interface Props {
  initialData?: string;
  onSubmit: (data: string) => void;
}

const AuthorizationEditor = ({ initialData, onSubmit }: Props) => {
  const [authData, setAuthData] = useState<AuthorizationData>(() => {
    if (!initialData) return { type: "none" };
    try {
      return JSON.parse(initialData);
    } catch {
      return { type: "none" };
    }
  });

  const handleTypeChange = (value: AuthType) => {
    const next = { ...authData, type: value };
    setAuthData(next);
    onSubmit(JSON.stringify(next));
  };

  const updateField = (field: keyof AuthorizationData, value: string) => {
    const next = { ...authData, [field]: value };
    setAuthData(next);
    onSubmit(JSON.stringify(next));
  };

  const renderField = (label: string, field: keyof AuthorizationData, type: string = "text", placeholder: string = "") => (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-zinc-400">{label}</label>
      <div className="border border-zinc-700 rounded-md bg-zinc-800">
        <VariableInput
          type={type}
          value={(authData[field] as string) || ""}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={placeholder || label}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col space-y-6 w-full p-2 h-full overflow-y-auto pb-20">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-zinc-400">Auth Type</label>
        <Select value={authData.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[250px] bg-zinc-800 border-zinc-700 text-zinc-200">
            <SelectValue placeholder="Select Auth Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Auth</SelectItem>
            <SelectItem value="basic">Basic Auth</SelectItem>
            <SelectItem value="bearer">Bearer Token</SelectItem>
            <SelectItem value="jwt">JWT Bearer</SelectItem>
            <SelectItem value="digest">Digest Auth</SelectItem>
            <SelectItem value="oauth1">OAuth 1.0</SelectItem>
            <SelectItem value="oauth2">OAuth 2.0</SelectItem>
            <SelectItem value="hawk">Hawk Authentication</SelectItem>
            <SelectItem value="aws">AWS Signature</SelectItem>
            <SelectItem value="ntlm">NTLM Authentication</SelectItem>
            <SelectItem value="apikey">API Key</SelectItem>
            <SelectItem value="edgegrid">Akamai EdgeGrid</SelectItem>
            <SelectItem value="asap">ASAP (Atlassian)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col space-y-4 max-w-xl">
        {authData.type === "none" && (
          <div className="text-sm text-zinc-500">This request does not use any authorization.</div>
        )}

        {(authData.type === "bearer" || authData.type === "jwt") && (
          <div className="flex flex-col space-y-4">
            {renderField("Token", "token")}
          </div>
        )}

        {authData.type === "oauth2" && (
          <div className="flex flex-col space-y-4">
            {renderField("Access Token", "token")}
            {renderField("Header Prefix", "headerPrefix", "text", "Bearer")}
          </div>
        )}

        {authData.type === "basic" && (
          <div className="grid grid-cols-2 gap-4">
            {renderField("Username", "username")}
            {renderField("Password", "password", "password")}
          </div>
        )}

        {authData.type === "apikey" && (
          <div className="grid grid-cols-2 gap-4">
            {renderField("Key", "key")}
            {renderField("Value", "value")}
            <div className="flex flex-col space-y-2 col-span-2">
              <label className="text-sm font-medium text-zinc-400">Add To</label>
              <Select value={authData.addTo || "header"} onValueChange={(val) => updateField("addTo", val)}>
                <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="queryParams">Query Params</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {authData.type === "aws" && (
          <div className="grid grid-cols-2 gap-4">
            {renderField("Access Key", "accessKey")}
            {renderField("Secret Key", "secretKey", "password")}
            {renderField("AWS Region", "awsRegion")}
            {renderField("Service Name", "serviceName")}
            <div className="col-span-2">{renderField("Session Token", "sessionToken")}</div>
          </div>
        )}

        {authData.type === "digest" && (
          <div className="grid grid-cols-2 gap-4">
            {renderField("Username", "username")}
            {renderField("Password", "password", "password")}
            {renderField("Realm", "realm")}
            {renderField("Nonce", "nonce")}
            {renderField("Algorithm", "algorithm")}
            {renderField("qop", "qop")}
            {renderField("Nonce Count", "nonceCount")}
            {renderField("Client Nonce", "clientNonce")}
            {renderField("Opaque", "opaque")}
          </div>
        )}

        {authData.type === "oauth1" && (
          <div className="grid grid-cols-2 gap-4">
            {renderField("Consumer Key", "consumerKey")}
            {renderField("Consumer Secret", "consumerSecret", "password")}
            {renderField("Access Token", "token")}
            {renderField("Token Secret", "tokenSecret", "password")}
            {renderField("Signature Method", "signatureMethod")}
            {renderField("Timestamp", "timestamp")}
            {renderField("Nonce", "nonce")}
            {renderField("Version", "version")}
            {renderField("Realm", "realm")}
          </div>
        )}

        {authData.type === "hawk" && (
          <div className="grid grid-cols-2 gap-4">
            {renderField("Auth ID", "authId")}
            {renderField("Auth Key", "authKey", "password")}
            {renderField("Algorithm", "algorithm")}
            {renderField("User", "user")}
            {renderField("Nonce", "nonce")}
            {renderField("ext", "ext")}
            {renderField("app", "app")}
            {renderField("dlg", "dlg")}
          </div>
        )}

        {authData.type === "ntlm" && (
          <div className="grid grid-cols-2 gap-4">
            {renderField("Username", "username")}
            {renderField("Password", "password", "password")}
            {renderField("Domain", "domain")}
            {renderField("Workstation", "workstation")}
          </div>
        )}

        {authData.type === "edgegrid" && (
          <div className="grid grid-cols-2 gap-4">
            {renderField("Access Token", "accessToken")}
            {renderField("Client Token", "clientToken")}
            {renderField("Client Secret", "clientSecret", "password")}
            {renderField("Base URL", "baseURL")}
          </div>
        )}

        {authData.type === "asap" && (
          <div className="grid grid-cols-2 gap-4">
            {renderField("Issuer", "issuer")}
            {renderField("Key ID", "keyId")}
            {renderField("Private Key", "privateKey", "password")}
            {renderField("Audience", "audience")}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorizationEditor;
