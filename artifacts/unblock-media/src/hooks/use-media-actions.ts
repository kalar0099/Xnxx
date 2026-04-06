import { useQueryClient } from "@tanstack/react-query";
import { useUploadMedia, useDeleteMedia, getListMediaQueryKey } from "@workspace/api-client-react";
import { toast } from "@/hooks/use-toast";

export function useMediaActions() {
  const queryClient = useQueryClient();

  const uploadMutation = useUploadMedia({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMediaQueryKey() });
        toast({
          title: "Upload successful",
          description: "Your media has been uploaded to the gallery.",
        });
      },
      onError: (error) => {
        toast({
          title: "Upload failed",
          description: error.message || "Something went wrong during upload.",
          variant: "destructive"
        });
      }
    }
  });

  const deleteMutation = useDeleteMedia({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMediaQueryKey() });
        toast({
          title: "Media deleted",
          description: "The item has been removed from the gallery.",
        });
      },
      onError: (error) => {
        toast({
          title: "Delete failed",
          description: error.message || "Could not delete the media item.",
          variant: "destructive"
        });
      }
    }
  });

  return {
    uploadMedia: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    deleteMedia: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending
  };
}
