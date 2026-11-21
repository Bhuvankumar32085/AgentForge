import { useState } from "react";
import { Check, Pencil, Ban, Loader2, ShieldAlert, Send } from "lucide-react";
import { Button } from "../ui/button";

export interface ActionPlan {
  type?: string;
  requiresApproval?: boolean;
  integration: string;
  action: string;
  params: Record<string, any>;
  acknowledgement?: string;
}

interface ActionApprovalCardProps {
  executionId: string;
  actionPlan: ActionPlan;
  status?: string;
  onApprove: (executionId: string, editedParams?: Record<string, any>) => Promise<void>;
  onSaveDraft: (executionId: string, editedParams: Record<string, any>) => Promise<void>;
  onCancel: (executionId: string) => Promise<void>;
}

const MULTILINE_KEYS = new Set(["body", "caption", "message", "description"]);

function formatLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ActionApprovalCard({
  executionId,
  actionPlan,
  status,
  onApprove,
  onSaveDraft,
  onCancel,
}: ActionApprovalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState<"approve" | "save" | "cancel" | null>(null);
  const [draftParams, setDraftParams] = useState<Record<string, any>>(actionPlan.params || {});

  const isAwaiting = status === "awaiting_approval";
  const isCancelled = status === "cancelled";
  const displayParams = isEditing && isAwaiting ? draftParams : actionPlan.params || {};
  const entries = Object.entries(displayParams);

  const handleFieldChange = (key: string, value: string) => {
    setDraftParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleStartEdit = () => {
    setDraftParams(actionPlan.params || {});
    setIsEditing(true);
  };

  const handleApproveClick = async () => {
    setSubmitting("approve");
    try {
      await onApprove(executionId, isEditing ? draftParams : undefined);
      setIsEditing(false);
    } finally {
      setSubmitting(null);
    }
  };

  const handleSaveClick = async () => {
    setSubmitting("save");
    try {
      await onSaveDraft(executionId, draftParams);
      setIsEditing(false);
    } finally {
      setSubmitting(null);
    }
  };

  const handleCancelClick = async () => {
    setSubmitting("cancel");
    try {
      await onCancel(executionId);
      setIsEditing(false);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div
      className={`mt-3 rounded-xl border p-3.5 space-y-3 text-xs ${
        isCancelled
          ? "bg-rose-950/20 border-rose-500/25 opacity-80"
          : isAwaiting
          ? "bg-black/35 border-amber-400/35"
          : "bg-black/25 border-white/10"
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-purple-200">
          <ShieldAlert
            className={`w-3.5 h-3.5 ${
              isCancelled ? "text-rose-400" : isAwaiting ? "text-amber-400" : "text-emerald-400"
            }`}
          />
          <span>
            {actionPlan.integration} • {formatLabel(actionPlan.action)}
          </span>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
            isCancelled
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              : isAwaiting
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          }`}
        >
          {isCancelled ? "Ended / Cancelled" : isAwaiting ? "Awaiting Approval" : "Approved"}
        </span>
      </div>

      {/* Draft Fields Preview / Inline Editor */}
      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map(([key, val]) => {
            const strVal = val === null || val === undefined ? "" : String(val);
            const isMultiline = MULTILINE_KEYS.has(key.toLowerCase()) || strVal.length > 70;

            return (
              <div key={key} className="space-y-1">
                <label className="block text-[10px] uppercase tracking-wider text-purple-300/70 font-medium">
                  {formatLabel(key)}
                </label>

                {isEditing && isAwaiting ? (
                  isMultiline ? (
                    <textarea
                      rows={3}
                      value={strVal}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      className="w-full rounded-lg bg-black/50 border border-purple-400/40 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  ) : (
                    <input
                      type="text"
                      value={strVal}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      className="w-full rounded-lg bg-black/50 border border-purple-400/40 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  )
                ) : (
                  <div className="rounded-lg bg-white/5 border border-white/5 px-2.5 py-1.5 text-white/85 whitespace-pre-wrap break-words">
                    {strVal || <span className="italic text-white/30">Empty</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Action Buttons (Only visible while awaiting approval) */}
      {isAwaiting && (
        <div className="pt-1 flex flex-wrap items-center gap-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                size="sm"
                disabled={submitting !== null}
                onClick={handleApproveClick}
                className="h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] gap-1.5 cursor-pointer"
              >
                {submitting === "approve" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
                Save & Approve
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={submitting !== null}
                onClick={handleSaveClick}
                className="h-7 px-3 rounded-lg bg-white/5 hover:bg-white/10 border-white/15 text-white text-[11px] cursor-pointer"
              >
                {submitting === "save" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save Draft"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={submitting !== null}
                onClick={() => {
                  setDraftParams(actionPlan.params || {});
                  setIsEditing(false);
                }}
                className="h-7 px-2.5 text-white/60 hover:text-white text-[11px] cursor-pointer"
              >
                Cancel Edit
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                disabled={submitting !== null}
                onClick={handleApproveClick}
                className="h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] gap-1.5 cursor-pointer shadow-sm"
              >
                {submitting === "approve" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                Approve & Send
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={submitting !== null}
                onClick={handleStartEdit}
                className="h-7 px-3 rounded-lg bg-white/5 hover:bg-white/10 border-white/15 text-white text-[11px] gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3 h-3 text-purple-300" />
                Edit
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={submitting !== null}
                onClick={handleCancelClick}
                className="h-7 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300 text-[11px] gap-1.5 cursor-pointer"
              >
                {submitting === "cancel" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Ban className="w-3 h-3" />
                )}
                End Task
              </Button>
            </>
          )}
        </div>
      )}

      {isCancelled && (
        <div className="flex items-center gap-1.5 text-[11px] text-rose-300/90 pt-1">
          <Ban className="w-3.5 h-3.5 shrink-0" />
          <span>Task ended permanently. This action will never be processed.</span>
        </div>
      )}
    </div>
  );
}
