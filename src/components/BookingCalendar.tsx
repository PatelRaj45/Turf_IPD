
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';

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

const BookingCalendar: React.FC = () => {
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  
  const weekDates = generateWeekDates(startDate);
  const availabilityData = generateAvailabilityData();
  
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
            Court Availability
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
      
      <CardContent className="space-y-6 p-6">
        <div className="booking-grid gap-4 mb-8 pb-6 border-b">
          {weekDates.map((day, index) => {
            const dateKey = day.date.toISOString().split('T')[0];
            const isSelected = selectedDate === dateKey;
            
            return (
              <Button
                key={index}
                variant={isSelected ? "default" : "outline"}
                className={`flex flex-col items-center py-3 px-2 space-y-1 ${
                  isSelected ? 'bg-sport-green-dark hover:bg-sport-green' : ''
                } ${day.isToday ? 'border-sport-green' : ''}`}
                onClick={() => handleDateSelect(day.date)}
              >
                <span className="text-xs font-medium">{day.dayOfWeek}</span>
                <span className="text-lg font-bold">{day.dayOfMonth}</span>
              </Button>
            );
          })}
        </div>
        
        <div className="mb-6 space-y-2">
          <div className="flex items-center space-x-2 text-sm font-medium">
            <MapPin className="h-5 w-5 text-sport-green-dark" />
            <h3>Select Location</h3>
          </div>
          <select
            className="w-full p-3 border rounded-md bg-white text-sm focus:ring-2 focus:ring-sport-green-dark"
            defaultValue="bandra"
          >
            <option value="bandra">Bandra Reclamation Ground</option>
            <option value="andheri">Andheri Sports Complex</option>
            <option value="powai">Powai Sports Club</option>
            <option value="worli">Worli Sports Center</option>
            <option value="thane">Thane Sports Arena</option>
          </select>
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
              Book Court for {selectedTimeSlot}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingCalendar;
