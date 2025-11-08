import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { RoomCard } from "@/components/RoomCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, SlidersHorizontal, Map } from "lucide-react";
import { mockRooms } from "@/data/mockData";

const Rooms = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [capacityFilter, setCapacityFilter] = useState<number>(50);
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 200]);

  const filteredRooms = mockRooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCapacity = room.capacity <= capacityFilter;
    const matchesAvailability = availabilityFilter === "all" ||
      (availabilityFilter === "available" && room.available) ||
      (availabilityFilter === "unavailable" && !room.available);
    const matchesPrice = room.price >= priceRange[0] && room.price <= priceRange[1];

    return matchesSearch && matchesCapacity && matchesAvailability && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Browse Rooms</h1>
          <p className="text-muted-foreground">Find the perfect space for your needs</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <Card className="lg:col-span-1 h-fit sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Availability</Label>
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rooms</SelectItem>
                    <SelectItem value="available">Available Only</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Capacity: {capacityFilter} people</Label>
                <Slider
                  value={[capacityFilter]}
                  onValueChange={(value) => setCapacityFilter(value[0])}
                  max={50}
                  min={4}
                  step={2}
                  className="mt-2"
                />
              </div>

              <div className="space-y-2">
                <Label>Price Range: ${priceRange[0]} - ${priceRange[1]}/hour</Label>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  max={200}
                  min={0}
                  step={10}
                  className="mt-2"
                />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setCapacityFilter(50);
                  setAvailabilityFilter("all");
                  setPriceRange([0, 200]);
                }}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>

          {/* Rooms Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-muted-foreground">
                {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'} found
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/map')}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Map className="mr-2 h-4 w-4" />
                View 2D Map
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>

            {filteredRooms.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No rooms match your filters. Try adjusting your search criteria.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
