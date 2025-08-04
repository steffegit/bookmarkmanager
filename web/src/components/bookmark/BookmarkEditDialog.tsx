import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Bookmark } from "@/data/bookmarks";
import { BACKEND_URL } from "@/hooks/useAuth";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().min(1, "URL is required").url("Please enter a valid URL"),
  description: z.string(),
});

async function updateBookmark(bookmark: Bookmark): Promise<Bookmark> {
  const response = await fetch(`${BACKEND_URL}/api/bookmarks/${bookmark.id}`, {
    method: "PUT",
    body: JSON.stringify({
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to update bookmark");
  }

  return response.json();
}

function BookmarkEditDialog({
  open,
  setOpen,
  bookmark,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  bookmark: Bookmark;
}) {
  const queryClient = useQueryClient();

  const updateBookmarkMutation = useMutation({
    mutationFn: updateBookmark,
    onSuccess: () => {
      // Invalidate and refetch bookmarks query
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      setOpen(false);
      toast.success("Bookmark updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update bookmark:", error);
      toast.error("Failed to update bookmark");
    },
  });

  const form = useForm({
    defaultValues: {
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
    },
    validators: {
      onBlur: schema,
    },
    onSubmit: async ({ value }) => {
      updateBookmarkMutation.mutate({ ...bookmark, ...value });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] border-accent-foreground/10">
        <DialogHeader>
          <DialogTitle>Edit Bookmark</DialogTitle>
          <DialogDescription>
            Make changes to your bookmark here. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid gap-4">
            <form.Field name="title">
              {(field) => (
                <div className="grid gap-3">
                  <Label htmlFor={field.name}>Title</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {!field.state.meta.isValid && (
                    <Alert variant="destructive" className="rounded-md p-2">
                      <AlertDescription>
                        {field.state.meta.errors[0]?.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="url">
              {(field) => (
                <div className="grid gap-3">
                  <Label htmlFor={field.name}>URL</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {!field.state.meta.isValid && (
                    <Alert variant="destructive" className="rounded-md p-2">
                      <AlertDescription>
                        {field.state.meta.errors[0]?.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <div className="grid gap-3">
                  <Label htmlFor={field.name}>Description</Label>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="resize-y max-h-60"
                  />
                  {!field.state.meta.isValid && (
                    <Alert variant="destructive" className="rounded-md p-2">
                      <AlertDescription>
                        {field.state.meta.errors[0]?.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </form.Field>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={
                !form.state.canSubmit || updateBookmarkMutation.isPending
              }
            >
              {updateBookmarkMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BookmarkEditDialog;
