import { useState } from "react";
import type { Agent } from "../../types/agent";
import { Button } from "../ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (agent: Agent) => Promise<void>;
}

export function DeleteConfirmModal({
  agent,
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !agent) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm(agent);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#180d34] border border-red-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-white p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Delete Agent</h3>
            <p className="text-xs text-white/70 mt-1 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-white font-semibold">"{agent.name}"</strong>? This
              action is permanent and cannot be undone.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="text-white/70 hover:text-white hover:bg-white/10 text-xs sm:text-sm cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Delete Permanently</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;

