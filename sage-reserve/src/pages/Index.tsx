import { Navbar } from "@/components/Navbar";
import { StatsCard } from "@/components/StatsCard";
import { RoomCard } from "@/components/RoomCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Building2, Clock, TrendingUp } from "lucide-react";
import { mockRooms, mockBookings } from "@/data/mockData";
import { Link } from "react-router-dom";

const Index = () => {
  const availableRooms = mockRooms.filter(room => room.available).length;
  const upcomingBookings = mockBookings.filter(b => b.status === 'upcoming').length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/20 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-foreground mb-6 animate-fade-in">
              Book Your Perfect Space
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Discover and reserve meeting rooms, offices, and collaboration spaces with ease. Professional spaces for every occasion.
            </p>
            <div className="flex gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Link to="/rooms">
                <Button size="lg" className="shadow-lg">
                  Browse Rooms
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                View 2D Map
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Available Rooms"
            value={availableRooms}
            icon={Building2}
            trend="+2 this week"
          />
          <StatsCard
            title="Your Bookings"
            value={upcomingBookings}
            icon={Calendar}
            trend="2 upcoming"
          />
          <StatsCard
            title="Hours Booked"
            value="24h"
            icon={Clock}
            trend="This month"
          />
          <StatsCard
            title="Total Savings"
            value="$450"
            icon={TrendingUp}
            trend="+12% vs last month"
          />
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Featured Rooms</h2>
            <p className="text-muted-foreground">Popular spaces available for booking</p>
          </div>
          <Link to="/rooms">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockRooms.slice(0, 3).map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>

      {/* Upcoming Bookings */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-foreground mb-8">Your Upcoming Bookings</h2>
        <div className="grid gap-4">
          {mockBookings.filter(b => b.status === 'upcoming').map((booking) => (
            <Card key={booking.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{booking.roomName}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {booking.date}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{booking.startTime} - {booking.endTime}</span>
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline">Cancel</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
