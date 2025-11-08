import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { FloorPlanWithObjects } from "@/components/FloorPlanWithObjects";
import { ArrowLeft, Info, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const View2DMap = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const navigate = useNavigate();

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container mx-auto py-6 px-4">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(-1)}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Interactive Floor Plan
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Image overlay with React components from SVG data
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleFullscreen}
                            className="gap-2"
                        >
                            <Maximize2 className="h-4 w-4" />
                            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        </Button>
                        <Badge variant="secondary" className="gap-2">
                            <Info className="h-4 w-4" />
                            React Components Overlay
                        </Badge>
                    </div>
                </div>

                {/* Info Card */}
                <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <span className="text-2xl">�️</span>
                            Floor Plan with Object Overlay
                        </CardTitle>
                        <CardDescription className="text-base">
                            Imagine de fundal cu componente React interactive poziționate conform SVG
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                    1
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">Background Image</p>
                                    <p className="text-muted-foreground text-xs mt-1">
                                        Afișează imaginea plan_IMAGE.jpeg ca fundal
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                                <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                    2
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">SVG Data Parsing</p>
                                    <p className="text-muted-foreground text-xs mt-1">
                                        Extrage obiectele și coordonatele din OBJECTS.svg
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                    3
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">Interactive Overlay</p>
                                    <p className="text-muted-foreground text-xs mt-1">
                                        React components cu hover effects și tooltips
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                            <p className="text-sm font-medium text-cyan-800">
                                💡 <strong>Hover over objects:</strong> Treci cu mouse-ul peste obiectele colorate pentru a vedea proprietățile lor.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Floor Plan Container */}
                <Card className={`overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
                    <div className={isFullscreen ? 'h-screen' : 'h-[calc(100vh-400px)] min-h-[600px]'}>
                        <FloorPlanWithObjects
                            imageSrc="/plan_IMAGE.png"
                            svgObjectsSrc="/OBJECTS.svg"
                            className="w-full h-full bg-slate-100"
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default View2DMap;
