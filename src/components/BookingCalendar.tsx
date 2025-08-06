
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const timeSlots = [
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'
];

const generateWeekDates = (startDate: Date) => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push({
      date: date,
      dayOfMonth: date.getDate(),
      dayOfWeek: daysOfWeek[date.getDay()],
      isToday: i === 0
    });
  }
  return dates;
};

const generateAvailabilityData = () => {
  const availability: Record<string, Record<string, boolean>> = {};
  const dates = generateWeekDates(new Date());
  
  dates.forEach(day => {
    const dateKey = day.date.toISOString().split('T')[0];
    availability[dateKey] = {};
    
    timeSlots.forEach(timeSlot => {
      const hour = parseInt(timeSlot.split(':')[0]);
      const isPeakHour = (hour >= 6 && hour <= 9) || (hour >= 16 && hour <= 20);
      availability[dateKey][timeSlot] = Math.random() > (isPeakHour ? 0.2 : 0.4);
    });
  });
  
  return availability;
};

// Sample data for locations with supported sports
const locations = [
  { id: 'bandra', name: 'Bandra Basketball Court', sports: ['Basketball', 'Volleyball'] },
  { id: 'juhu', name: 'Juhu Soccer Ground', sports: ['Football', 'Cricket'] },
  { id: 'matunga', name: 'Matunga Tennis Club', sports: ['Tennis', 'Badminton', 'Pickleball'] },
  { id: 'chowpatty', name: 'Chowpatty Beach Volleyball', sports: ['Volleyball', 'Badminton'] },
  { id: 'powai', name: 'Powai Sports Complex', sports: ['Cricket', 'Basketball', 'Tennis', 'Badminton'] },
  { id: 'dadar', name: 'Dadar Cricket Ground', sports: ['Cricket'] }
];

const BookingCalendar: React.FC = () => {
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('bandra');
  const [selectedSport, setSelectedSport] = useState('Basketball');
  const [sportValidationError, setSportValidationError] = useState<string | null>(null);
  
  const weekDates = generateWeekDates(startDate);
  const availabilityData = generateAvailabilityData();
  
  // Get available sports for the selected location
  const availableSports = locations.find(loc => loc.id === selectedLocation)?.sports || [];
  
  // Check if selected sport is available at the selected location
  useEffect(() => {
    if (selectedLocation && selectedSport) {
      const locationData = locations.find(loc => loc.id === selectedLocation);
      if (locationData && !locationData.sports.includes(selectedSport)) {
        setSportValidationError(`${selectedSport} is not available at ${locationData.name}`);
        // Auto-select the first available sport at this location
        if (locationData.sports.length > 0) {
          setSelectedSport(locationData.sports[0]);
        }
      } else {
        setSportValidationError(null);
      }
    }
  }, [selectedLocation, selectedSport]);
  
  const handlePreviousWeek = () => {
    const prevWeek = new Date(startDate);
    prevWeek.setDate(startDate.getDate() - 7);
    setStartDate(prevWeek);
  };
  
  const handleNextWeek = () => {
    const nextWeek = new Date(startDate);
    nextWeek.setDate(startDate.getDate() + 7);
    setStartDate(nextWeek);
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    setSelectedTimeSlot(null);
  };
  
  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-sport-green-dark">
            <CalendarIcon className="mr-3" />
            Book a Court
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousWeek}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextWeek}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((day, index) => {
            const dateKey = day.date.toISOString().split('T')[0];
            const isSelected = selectedDate === dateKey;
            
            return (
              <Button
                key={index}
                variant={isSelected ? "default" : "outline"}
                className={`flex flex-col items-center py-3 px-2 h-20 ${
                  isSelected 
                    ? 'bg-sport-green-dark hover:bg-sport-green text-white' 
                    : 'hover:bg-gray-100'
                } ${day.isToday ? 'border-sport-green border-2' : ''}`}
                onClick={() => handleDateSelect(day.date)}
              >
                <span className="text-xs font-medium">{day.dayOfWeek}</span>
                <span className="text-lg font-bold">{day.dayOfMonth}</span>
              </Button>
            );
          })}
        </div>
        
        <div className="mb-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium">
              <MapPin className="h-5 w-5 text-sport-green-dark" />
              <h3>Select Location</h3>
            </div>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full p-3 h-12">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium">
              <CalendarIcon className="h-5 w-5 text-sport-green-dark" />
              <h3>Select Sport</h3>
            </div>
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="w-full p-3 h-12">
                <SelectValue placeholder="Select sport" />
              </SelectTrigger>
              <SelectContent>
                {availableSports.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {sportValidationError && (
              <Alert variant="destructive" className="mt-2 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {sportValidationError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Clock className="mr-2 h-5 w-5 text-sport-green-dark" />
            <h3 className="text-sm font-medium">Available Time Slots</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-2 bg-gray-50 rounded-md">
            {timeSlots.map((timeSlot, index) => {
              const isAvailable = availabilityData[selectedDate]?.[timeSlot];
              const isSelected = selectedTimeSlot === timeSlot;
              
              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  className={`${
                    isSelected ? 'bg-sport-green-dark hover:bg-sport-green' : ''
                  } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                  text-sm py-2 h-auto`}
                  disabled={!isAvailable}
                  onClick={() => handleTimeSlotSelect(timeSlot)}
                >
                  {timeSlot}
                </Button>
              );
            })}
          </div>
        </div>
        
        {selectedTimeSlot && (
          <div className="mt-6">
            <Button 
              className="w-full bg-sport-green-dark hover:bg-sport-green text-white font-medium py-3"
            >
              Book {selectedSport} Court for {selectedTimeSlot}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingCalendar;
