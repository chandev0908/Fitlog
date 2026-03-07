"use client";

import { useActionState, useState, useTransition } from "react";
import { upsertLog, type LogFormState } from "@/lib/actions/log.actions";
import { LogTypeSelector } from "./LogTypeSelector";
import { PREntry } from "./PREntry";
import { ImageUploader } from "./ImageUploader";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { Eye, EyeOff, Save } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { AICoach } from "@/components/ai/AICoach";

type LogType = "train" | "rest" | "active_recovery";

interface LogFormProps {
  userId: string;
  logDate: string;
  existingLog?: {
    id: string;
    type: LogType;
    comment: string | null;
    is_public: boolean;
  } | null;
  existingPRs: {
    id: string;
    exercise: string;
    value: number;
    unit: string;
    notes: string | null;
  }[];
  existingImages: {
    id: string;
    storage_path: string;
    caption: string | null;
    publicUrl: string;
  }[];
}

export function LogForm({
  userId,
  logDate,
  existingLog,
  existingPRs,
  existingImages,
}: LogFormProps) {
  const router = useRouter();

  const [comment, setComment] = useState(existingLog?.comment ?? "");
  const [logType, setLogType] = useState<LogType>(existingLog?.type ?? "train");
  const [isPublic, setIsPublic] = useState(existingLog?.is_public ?? false);
  const [images, setImages] = useState(existingImages);
  const [, startTransition] = useTransition();

  const [state, action, pending] = useActionState<LogFormState, FormData>(
    upsertLog,
    {},
  );

  const handleImagesRefresh = () => {
    startTransition(() => router.refresh());
  };

  const displayDate = format(
    new Date(logDate + "T12:00:00"),
    "EEEE, MMMM d, yyyy",
  );

  return (
    <div className="space-y-8">
      {/* Date header */}
      <div>
        <p className="font-display text-xs uppercase tracking-[0.2em] text-muted mb-1">
          Daily Log
        </p>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          {displayDate}
        </h1>
      </div>

      <form action={action} className="space-y-8">
        {/* Hidden fields */}
        <input type="hidden" name="log_date" value={logDate} />
        <input type="hidden" name="type" value={logType} />
        <input type="hidden" name="is_public" value={String(isPublic)} />

        {/* Day type */}
        <section className="space-y-3">
          <label className="font-display text-xs font-semibold uppercase tracking-widest text-muted">
            Day Type
          </label>
          <LogTypeSelector value={logType} onChange={setLogType} />
        </section>

        {/* Comment */}
        <section className="space-y-1.5">
          <label
            htmlFor="comment"
            className="font-display text-xs font-semibold uppercase tracking-widest text-muted"
          >
            Notes
          </label>
          <section className="space-y-2">
            <label
              htmlFor="comment"
              className="font-display text-xs font-semibold uppercase tracking-widest text-muted"
            >
              Notes
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                logType === "train"
                  ? "How did the session go? What did you work on?"
                  : logType === "rest"
                    ? "How are you feeling? Any soreness?"
                    : "What did you do for active recovery?"
              }
              className={cn(
                "w-full bg-surface border border-base px-3 py-2.5 resize-none",
                "text-sm placeholder:text-muted",
                "focus:outline-none focus:border-[hsl(var(--brand-glow))]",
                "transition-colors duration-150",
              )}
            />

            {/* AI Coach — sits right below the textarea */}
            <AICoach
              logType={logType}
              prs={existingPRs}
              currentComment={comment}
              onAccept={(suggestion) => setComment(suggestion)}
            />

            {state?.fieldErrors?.comment && (
              <p className="text-xs text-red-500">
                {state.fieldErrors.comment}
              </p>
            )}
          </section>
          {state?.fieldErrors?.comment && (
            <p className="text-xs text-red-500">{state.fieldErrors.comment}</p>
          )}
        </section>

        {/* Visibility toggle */}
        <section>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className="flex items-center gap-3 group"
          >
            <div
              className={cn(
                "w-9 h-5 rounded-full border transition-all duration-200 relative",
                isPublic
                  ? "bg-[hsl(var(--brand))] border-[hsl(var(--brand))]"
                  : "bg-surface border-base",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
                  isPublic ? "left-4" : "left-0.5",
                )}
              />
            </div>
            <div className="text-left">
              <p className="font-display text-sm font-semibold flex items-center gap-1.5">
                {isPublic ? (
                  <>
                    <Eye size={13} className="text-brand" /> Public log
                  </>
                ) : (
                  <>
                    <EyeOff size={13} className="text-muted" /> Private log
                  </>
                )}
              </p>
              <p className="text-xs text-muted">
                {isPublic
                  ? "Visible on your public profile"
                  : "Only visible to you"}
              </p>
            </div>
          </button>
        </section>

        {/* Save button */}
        {state?.error && <p className="text-xs text-red-500">{state.error}</p>}

        <Button
          type="submit"
          loading={pending}
          size="lg"
          className="w-full sm:w-auto"
        >
          <Save size={14} />
          {existingLog ? "Update log" : "Save log"}
        </Button>
      </form>

      {/* PRs — shown after log is saved (needs logId) */}
      {existingLog && (
        <>
          <div className="border-t border-base pt-8">
            <PREntry
              logId={existingLog.id}
              logDate={logDate}
              existingPRs={existingPRs}
            />
          </div>

          <div className="border-t border-base pt-8">
            <ImageUploader
              logId={existingLog.id}
              userId={userId}
              logDate={logDate}
              existingImages={images}
              onUploadComplete={handleImagesRefresh}
            />
          </div>
        </>
      )}

      {!existingLog && (
        <div className="border border-dashed border-base p-4">
          <p className="text-xs text-muted text-center font-display">
            Save this log first to add photos and PRs
          </p>
        </div>
      )}
    </div>
  );
}
