import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Users, DollarSign, ChevronLeft } from "lucide-react";
import { Room } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface MapSidebarProps {
    rooms: Room[];
    selectedRoomId: string | null;
    onRoomSelect: (room: Room) => void;
    onClose?: () => void;
    isCollapsed?: boolean;
}

export const MapSidebar = ({
    rooms,
    selectedRoomId,
    onRoomSelect,
    onClose,
    isCollapsed = false
}: MapSidebarProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "available" | "occupied" | "maintenance">("all");

    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "available" && room.available) ||
            (statusFilter === "occupied" && !room.available) ||
            (statusFilter === "maintenance" && false); // Add maintenance status to Room type if needed

        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: rooms.length,
        available: rooms.filter(r => r.available).length,
        occupied: rooms.filter(r => !r.available).length,
        maintenance: 0 // Calculate from data if maintenance status is added
    };

    if (isCollapsed) {
        return null;
    }

    return (
        <div className="w-80 h-full bg-card border-r border-border flex flex-col shadow-soft">
            {/* Header */}
            <div className="p-6 bg-gradient-to-br from-primary to-secondary text-white">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold">Room Map</h2>
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-white hover:bg-white/20"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    )}
                </div>
                <p className="text-sm opacity-90">Interactive Floor Plan Viewer</p>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search rooms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-background"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-border">
                <Label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">
                    Status Filter
                </Label>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={statusFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("all")}
                        className="text-xs"
                    >
                        All ({stats.total})
                    </Button>
                    <Button
                        variant={statusFilter === "available" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("available")}
                        className="text-xs"
                    >
                        Available ({stats.available})
                    </Button>
                    <Button
                        variant={statusFilter === "occupied" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("occupied")}
                        className="text-xs"
                    >
                        Occupied ({stats.occupied})
                    </Button>
                </div>
            </div>

            {/* Room List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredRooms.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No rooms found</p>
                    </div>
                ) : (
                    filteredRooms.map((room) => (
                        <Card
                            key={room.id}
                            className={cn(
                                "cursor-pointer transition-all hover:shadow-hover hover:-translate-y-1",
                                selectedRoomId === room.id && "ring-4 ring-[#52c41a] bg-[#52c41a]/10 shadow-[0_0_15px_rgba(82,196,26,0.3)]"
                            )}
                            onClick={() => onRoomSelect(room)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2 flex-1">
                                        {selectedRoomId === room.id && (
                                            <span className="text-[#52c41a] text-xl animate-pulse">✓</span>
                                        )}
                                        <h3 className={cn(
                                            "font-semibold",
                                            selectedRoomId === room.id ? "text-[#52c41a] font-bold" : "text-foreground"
                                        )}>
                                            {room.name}
                                        </h3>
                                    </div>
                                    <Badge
                                        variant={room.available ? "default" : "destructive"}
                                        className="text-xs"
                                    >
                                        {room.available ? "Available" : "Occupied"}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>{room.capacity}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4" />
                                        <span>${room.price}/hr</span>
                                    </div>
                                </div>

                                {room.amenities && room.amenities.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {room.amenities.slice(0, 3).map((amenity, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {amenity}
                                            </Badge>
                                        ))}
                                        {room.amenities.length > 3 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{room.amenities.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
