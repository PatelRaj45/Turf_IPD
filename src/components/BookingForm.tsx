import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';

const bookingSchema = z.object({
  turfId: z.string().min(1, 'Please select a turf'),
  sport: z.string().min(1, 'Please select a sport'),
  bookingDate: z.date({
    required_error: 'Please select a date',
  }),
  startTime: z.string().min(1, 'Please select start time'),
  endTime: z.string().min(1, 'Please select end time'),
  players: z.number().min(1, 'Minimum 1 player').max(20, 'Maximum 20 players'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface Turf {
  _id: string;
  name: string;
  location: string;
  sports: string[];
  price: number;
  photos: string[];
}

interface BookingFormProps {
  turf?: Turf;
  onBookingSuccess?: (booking: any) => void;
  onCancel?: () => void;
}

const timeSlots = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00', '23:30'
];

const sports = [
  'Cricket', 'Football', 'Basketball', 'Tennis', 'Badminton', 
  'Volleyball', 'Pickleball', 'Squash', 'Table Tennis'
];

export const BookingForm: React.FC<BookingFormProps> = ({ 
  turf, 
  onBookingSuccess, 
  onCancel 
}) => {
  const [availableTurfs, setAvailableTurfs] = useState<Turf[]>([]);
  const [selectedTurf, setSelectedTurf] = useState<Turf | null>(turf || null);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(0);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      players: 1,
      notes: '',
    },
  });

  const watchedDate = watch('bookingDate');
  const watchedStartTime = watch('startTime');
  const watchedEndTime = watch('endTime');

  // Fetch available turfs
  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const response = await api.get('/api/turfs');
        setAvailableTurfs(response.data.data);
      } catch (error) {
        console.error('Error fetching turfs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load available turfs',
          variant: 'destructive',
        });
      }
    };

    if (!turf) {
      fetchTurfs();
    }
  }, [turf, toast]);

  // Calculate price when turf, date, or time changes
  useEffect(() => {
    if (selectedTurf && watchedDate && watchedStartTime && watchedEndTime) {
      const [startHour] = watchedStartTime.split(':').map(Number);
      const [endHour] = watchedEndTime.split(':').map(Number);
      const duration = endHour - startHour;
      const basePrice = selectedTurf.price;
      
      // Apply time-based pricing (higher rates for peak hours)
      let timeMultiplier = 1;
      if (startHour >= 18 || startHour <= 8) {
        timeMultiplier = 1.2; // Peak hours
      }
      
      // Apply day-based pricing (weekend rates)
      const dayOfWeek = watchedDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        timeMultiplier *= 1.3; // Weekend rates
      }
      
      const calculatedPrice = Math.round(basePrice * duration * timeMultiplier);
      setPrice(calculatedPrice);
    }
  }, [selectedTurf, watchedDate, watchedStartTime, watchedEndTime]);

  const handleTurfChange = (turfId: string) => {
    const turf = availableTurfs.find(t => t._id === turfId);
    setSelectedTurf(turf || null);
    setValue('turfId', turfId);
  };

  const onSubmit = async (data: BookingFormData) => {
    setLoading(true);
    try {
      const bookingData = {
        ...data,
        turf: data.turfId,
        price,
      };

      const response = await api.post('/api/bookings', bookingData);
      
      toast({
        title: 'Booking Successful!',
        description: 'Your court has been booked successfully.',
      });

      if (onBookingSuccess) {
        onBookingSuccess(response.data.data);
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: error.response?.data?.error || 'Failed to create booking',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Book a Court</CardTitle>
        <CardDescription>
          Select your preferred turf, date, and time to make a booking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Turf Selection */}
          <div className="space-y-2">
            <Label htmlFor="turfId">Select Turf</Label>
            <Select
              value={selectedTurf?._id || ''}
              onValueChange={handleTurfChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a turf" />
              </SelectTrigger>
              <SelectContent>
                {availableTurfs.map((turf) => (
                  <SelectItem key={turf._id} value={turf._id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{turf.name}</span>
                      <Badge variant="secondary">{turf.location}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.turfId && (
              <p className="text-sm text-red-500">{errors.turfId.message}</p>
            )}
          </div>

          {/* Sport Selection */}
          <div className="space-y-2">
            <Label htmlFor="sport">Sport</Label>
            <Select
              value={watch('sport')}
              onValueChange={(value) => setValue('sport', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sport" />
              </SelectTrigger>
              <SelectContent>
                {sports.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sport && (
              <p className="text-sm text-red-500">{errors.sport.message}</p>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Booking Date</Label>
            <Calendar
              mode="single"
              selected={watch('bookingDate')}
              onSelect={(date) => setValue('bookingDate', date || new Date())}
              disabled={isDateDisabled}
              className="rounded-md border"
            />
            {errors.bookingDate && (
              <p className="text-sm text-red-500">{errors.bookingDate.message}</p>
            )}
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Select
                value={watch('startTime')}
                onValueChange={(value) => setValue('startTime', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.startTime && (
                <p className="text-sm text-red-500">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Select
                value={watch('endTime')}
                onValueChange={(value) => setValue('endTime', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.endTime && (
                <p className="text-sm text-red-500">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Number of Players */}
          <div className="space-y-2">
            <Label htmlFor="players">Number of Players</Label>
            <Input
              type="number"
              min="1"
              max="20"
              {...register('players', { valueAsNumber: true })}
            />
            {errors.players && (
              <p className="text-sm text-red-500">{errors.players.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Input
              placeholder="Any special requirements or notes..."
              {...register('notes')}
            />
          </div>

          {/* Price Display */}
          {price > 0 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Estimated Price:</span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{price}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Price includes time-based and day-based adjustments
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-sport-green-dark hover:bg-sport-green-dark/90"
            >
              {loading ? 'Creating Booking...' : 'Book Now'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 