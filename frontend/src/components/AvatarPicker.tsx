import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api, { Avatar, AvatarListResponse } from "@/lib/api";

interface AvatarPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (avatarUrl: string) => void;
  currentAvatar?: string | null;
}

const AvatarPicker = ({ open, onOpenChange, onSelect, currentAvatar }: AvatarPickerProps) => {
  const { toast } = useToast();
  const [styles, setStyles] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>("avataaars");
  const [avatarData, setAvatarData] = useState<AvatarListResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar || null);

  // Load avatar styles on mount
  useEffect(() => {
    const loadStyles = async () => {
      try {
        const stylesList = await api.avatars.getStyles();
        setStyles(stylesList);
      } catch (error) {
        console.error("Failed to load avatar styles:", error);
      }
    };
    loadStyles();
  }, []);

  // Load avatars when style or page changes
  useEffect(() => {
    if (open) {
      loadAvatars(selectedStyle, currentPage);
    }
  }, [selectedStyle, currentPage, open]);

  const loadAvatars = async (style: string, page: number) => {
    setIsLoading(true);
    try {
      const data = await api.avatars.getAvatars(style, page, 20);
      setAvatarData(data);
    } catch (error: any) {
      console.error("Failed to load avatars:", error);
      toast({
        title: "Error",
        description: "Failed to load avatars. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStyleChange = (style: string) => {
    setSelectedStyle(style);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (avatarData?.pagination) {
      const { total_pages } = avatarData.pagination;
      if (newPage >= 1 && newPage <= total_pages) {
        setCurrentPage(newPage);
      }
    }
  };

  const handleSelectAvatar = (avatar: Avatar) => {
    setSelectedAvatar(avatar.url);
  };

  const handleConfirm = () => {
    if (selectedAvatar) {
      onSelect(selectedAvatar);
      onOpenChange(false);
    } else {
      toast({
        title: "No Avatar Selected",
        description: "Please select an avatar before confirming.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl text-amber-400 flex items-center gap-2">
            <User className="h-6 w-6" />
            Choose Your Avatar
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Select an avatar style and pick one you like. All avatars are animated and unique!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Style Selector */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-300 min-w-[80px]">
              Avatar Style:
            </label>
            <Select value={selectedStyle} onValueChange={handleStyleChange}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600 max-h-[300px]">
                {styles.map((style) => (
                  <SelectItem key={style} value={style} className="text-white hover:bg-slate-700">
                    {style.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Selection Preview */}
          {selectedAvatar && (
            <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <img
                src={selectedAvatar}
                alt="Selected avatar"
                className="w-12 h-12 rounded-full border-2 border-amber-400"
              />
              <span className="text-sm text-amber-400 font-medium">Selected Avatar</span>
            </div>
          )}

          {/* Avatar Grid */}
          <div className="relative min-h-[400px] bg-slate-800/50 rounded-lg p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-5 gap-4 mb-4">
                  {avatarData?.avatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => handleSelectAvatar(avatar)}
                      className={`relative aspect-square rounded-lg overflow-hidden transition-all hover:scale-105 ${
                        selectedAvatar === avatar.url
                          ? "ring-4 ring-amber-400 shadow-lg shadow-amber-400/50"
                          : "ring-2 ring-slate-600 hover:ring-slate-500"
                      }`}
                    >
                      <img
                        src={avatar.url}
                        alt={avatar.id}
                        className="w-full h-full object-cover bg-slate-700"
                      />
                      {selectedAvatar === avatar.url && (
                        <div className="absolute inset-0 bg-amber-400/20 flex items-center justify-center">
                          <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-slate-900"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Pagination */}
                {avatarData?.pagination && (
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="text-sm text-slate-400">
                      Page {avatarData.pagination.current_page} of {avatarData.pagination.total_pages}
                      {" "}({avatarData.pagination.total_items} avatars)
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!avatarData.pagination.has_prev}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-slate-300 min-w-[100px] text-center">
                        {avatarData.pagination.current_page} / {avatarData.pagination.total_pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!avatarData.pagination.has_next}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedAvatar}
            className="bg-amber-500 text-slate-900 hover:bg-amber-400"
          >
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarPicker;
