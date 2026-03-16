"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Copy, Check } from "lucide-react";

interface ApiKeyData {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: Date | null;
  createdAt: Date;
}

export function ApiKeyManager({ initialKeys }: { initialKeys: ApiKeyData[] }) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const [keys, setKeys] = useState(initialKeys);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!newKeyName.trim()) return;
    setLoading(true);

    const res = await fetch("/api/web/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName.trim() }),
    });
    const json = await res.json();

    if (json.success) {
      setCreatedKey(json.data.key);
      setKeys((prev) => [
        {
          id: json.data.id,
          name: json.data.name,
          keyPrefix: json.data.keyPrefix,
          lastUsedAt: null,
          createdAt: new Date(json.data.createdAt),
        },
        ...prev,
      ]);
      setNewKeyName("");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/web/api-keys/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      setKeys((prev) => prev.filter((k) => k.id !== id));
    }
  }

  function handleCopy() {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleDialogClose(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setCreatedKey(null);
      setNewKeyName("");
    }
  }

  return (
    <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogTrigger>
          <Button>
            <Plus className="mr-2 size-4" />
            {t("createApiKey")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("createApiKey")}</DialogTitle>
          </DialogHeader>
          {createdKey ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("copyKeyWarning")}
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-muted px-3 py-2 text-sm break-all">
                  {createdKey}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
              <Button className="w-full" onClick={() => handleDialogClose(false)}>
                {t("done")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">{t("keyName")}</Label>
                <Input
                  id="key-name"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. My Laptop"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              <Button className="w-full" onClick={handleCreate} disabled={loading}>
                {loading ? t("creating") : t("create")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {keys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">{t("noApiKeys")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {keys.map((key) => (
            <Card key={key.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-foreground">{key.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {key.keyPrefix}... &middot;{" "}
                    {new Date(key.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(key.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
