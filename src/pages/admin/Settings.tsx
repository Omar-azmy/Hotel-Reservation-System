import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { Hotel, Mail, Phone, MapPin, Globe, Bell, Shield, CreditCard } from "lucide-react";

const AdminSettings = () => {
  const [hotelSettings, setHotelSettings] = useState({
    hotelName: "City Business Hotel",
    email: "info@citybusinesshotel.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business District, Downtown City, ST 12345",
    website: "www.citybusinesshotel.com",
    description: "A premium business hotel offering comfort and convenience for modern travelers.",
  });

  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailCancellations: true,
    emailReviews: true,
    dailySummary: false,
  });

  const [policies, setPolicies] = useState({
    checkInTime: "15:00",
    checkOutTime: "11:00",
    cancellationHours: "24",
    lateCancellationFee: "50",
    noShowFee: "100",
    minAdvanceBooking: "1",
    maxAdvanceBooking: "365",
  });

  const handleSaveHotel = () => {
    // In a real app, this would save to the database
    toast.success("Hotel settings saved successfully");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences updated");
  };

  const handleSavePolicies = () => {
    toast.success("Booking policies updated");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage hotel configuration and preferences</p>
        </div>

        {/* Hotel Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Hotel className="h-5 w-5 text-primary" />
              <CardTitle>Hotel Information</CardTitle>
            </div>
            <CardDescription>Basic details about your hotel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hotelName">Hotel Name</Label>
                <Input
                  id="hotelName"
                  value={hotelSettings.hotelName}
                  onChange={(e) => setHotelSettings({ ...hotelSettings, hotelName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    className="pl-10"
                    value={hotelSettings.website}
                    onChange={(e) => setHotelSettings({ ...hotelSettings, website: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={hotelSettings.email}
                    onChange={(e) => setHotelSettings({ ...hotelSettings, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    className="pl-10"
                    value={hotelSettings.phone}
                    onChange={(e) => setHotelSettings({ ...hotelSettings, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  className="pl-10"
                  value={hotelSettings.address}
                  onChange={(e) => setHotelSettings({ ...hotelSettings, address: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={hotelSettings.description}
                onChange={(e) => setHotelSettings({ ...hotelSettings, description: e.target.value })}
              />
            </div>
            <Button onClick={handleSaveHotel}>Save Hotel Information</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure email notifications for hotel events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Booking Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email when a new booking is made</p>
              </div>
              <Switch
                checked={notifications.emailBookings}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailBookings: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cancellation Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email when a booking is cancelled</p>
              </div>
              <Switch
                checked={notifications.emailCancellations}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailCancellations: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Review Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email when a new review is submitted</p>
              </div>
              <Switch
                checked={notifications.emailReviews}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailReviews: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Daily Summary</Label>
                <p className="text-sm text-muted-foreground">Receive a daily summary of hotel activity</p>
              </div>
              <Switch
                checked={notifications.dailySummary}
                onCheckedChange={(checked) => setNotifications({ ...notifications, dailySummary: checked })}
              />
            </div>
            <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
          </CardContent>
        </Card>

        {/* Booking Policies */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Booking Policies</CardTitle>
            </div>
            <CardDescription>Set rules and policies for reservations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">Check-in Time</Label>
                <Input
                  id="checkIn"
                  type="time"
                  value={policies.checkInTime}
                  onChange={(e) => setPolicies({ ...policies, checkInTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOut">Check-out Time</Label>
                <Input
                  id="checkOut"
                  type="time"
                  value={policies.checkOutTime}
                  onChange={(e) => setPolicies({ ...policies, checkOutTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancellationHours">Free Cancellation (hours before check-in)</Label>
                <Input
                  id="cancellationHours"
                  type="number"
                  value={policies.cancellationHours}
                  onChange={(e) => setPolicies({ ...policies, cancellationHours: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lateFee">Late Cancellation Fee (%)</Label>
                <Input
                  id="lateFee"
                  type="number"
                  value={policies.lateCancellationFee}
                  onChange={(e) => setPolicies({ ...policies, lateCancellationFee: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="noShowFee">No-Show Fee (%)</Label>
                <Input
                  id="noShowFee"
                  type="number"
                  value={policies.noShowFee}
                  onChange={(e) => setPolicies({ ...policies, noShowFee: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minAdvance">Minimum Advance Booking (days)</Label>
                <Input
                  id="minAdvance"
                  type="number"
                  value={policies.minAdvanceBooking}
                  onChange={(e) => setPolicies({ ...policies, minAdvanceBooking: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAdvance">Maximum Advance Booking (days)</Label>
                <Input
                  id="maxAdvance"
                  type="number"
                  value={policies.maxAdvanceBooking}
                  onChange={(e) => setPolicies({ ...policies, maxAdvanceBooking: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSavePolicies}>Save Booking Policies</Button>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>Payment Configuration</CardTitle>
            </div>
            <CardDescription>Payment gateway and processing settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Stripe Integration</p>
                  <p className="text-sm text-muted-foreground">Connected and active</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Payment processing is handled securely through Stripe. To update payment settings or view transaction details, please access your Stripe dashboard.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;