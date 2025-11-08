import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MapControlsProps {
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
    onFitToScreen?: () => void;
}

export const MapControls = ({
    zoom,
    onZoomIn,
    onZoomOut,
    onReset,
    onFitToScreen
}: MapControlsProps) => {
    return (
        <TooltipProvider>
            <div className="fixed top-24 right-6 z-50 flex flex-col gap-3">
                <Card className="p-2 shadow-soft bg-card/95 backdrop-blur-sm">
                    <div className="flex flex-col gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onZoomIn}
                                    className="hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                    <ZoomIn className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <p>Zoom In</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onZoomOut}
                                    className="hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                    <ZoomOut className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <p>Zoom Out</p>
                            </TooltipContent>
                        </Tooltip>

                        <div className="border-t border-border my-1" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onReset}
                                    className="hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                    <RotateCcw className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <p>Reset View</p>
                            </TooltipContent>
                        </Tooltip>

                        {onFitToScreen && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onFitToScreen}
                                        className="hover:bg-primary/10 hover:text-primary transition-colors"
                                    >
                                        <Maximize2 className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p>Fit to Screen</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </Card>

                <Card className="p-3 shadow-soft bg-card/95 backdrop-blur-sm">
                    <div className="text-center">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Zoom</p>
                        <p className="text-lg font-bold text-foreground">{Math.round(zoom * 100)}%</p>
                    </div>
                </Card>
            </div>
        </TooltipProvider>
    );
};
