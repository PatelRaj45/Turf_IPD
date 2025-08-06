import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingForm } from '@/components/BookingForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';

interface Turf {
  _id: string;
  name: string;
  location: string;
  sports: string[];
  price: number;
  photos: string[];
  description: string;
  amenities: string[];
  rating: number;
  totalReviews: number;
}

const Booking = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [turf, setTurf] = useState<Turf | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTurf = async () => {
      if (turfId) {
        try {
          const response = await api.get(`/api/turfs/${turfId}`);
          setTurf(response.data.data);
        } catch (error) {
          console.error('Error fetching turf:', error);
          toast({
            title: 'Error',
            description: 'Failed to load turf details',
            variant: 'destructive',
          });
          navigate('/');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchTurf();
  }, [turfId, navigate, toast]);

  const handleBookingSuccess = (booking: any) => {
    toast({
      title: 'Booking Successful!',
      description: `Your booking for ${turf?.name} has been confirmed.`,
    });
    navigate('/profile');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sport-green-dark mx-auto"></div>
          <p className="mt-4 text-lg">Loading turf details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              ← Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Book a Court</h1>
            <p className="text-gray-600 mt-2">
              Select your preferred date and time to book your court
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <BookingForm
                turf={turf || undefined}
                onBookingSuccess={handleBookingSuccess}
                onCancel={handleCancel}
              />
            </div>

            {/* Turf Details Sidebar */}
            {turf && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">{turf.name}</CardTitle>
                    <CardDescription>{turf.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(turf.rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {turf.rating} ({turf.totalReviews} reviews)
                      </span>
                    </div>

                    {/* Sports */}
                    <div>
                      <h4 className="font-medium mb-2">Available Sports</h4>
                      <div className="flex flex-wrap gap-2">
                        {turf.sports.map((sport) => (
                          <Badge key={sport} variant="secondary">
                            {sport}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    {turf.amenities && turf.amenities.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                          {turf.amenities.map((amenity) => (
                            <Badge key={amenity} variant="outline">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {turf.description && (
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm text-gray-600">{turf.description}</p>
                      </div>
                    )}

                    {/* Photos */}
                    {turf.photos && turf.photos.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Photos</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {turf.photos.slice(0, 4).map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`${turf.name} photo ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pricing Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pricing Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Base Rate (per hour)</span>
                        <span className="font-medium">₹{turf.price}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>• Peak hours (6 PM - 8 AM): +20%</p>
                        <p>• Weekend rates: +30%</p>
                        <p>• Minimum booking: 1 hour</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking; 