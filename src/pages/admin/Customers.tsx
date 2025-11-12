import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      toast.error("Failed to load customers");
      console.error(profilesError);
      setLoading(false);
      return;
    }

    const customersWithBookings = await Promise.all(
      (profilesData || []).map(async (profile) => {
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("*")
          .eq("customer_id", profile.id);

        return {
          ...profile,
          bookings: bookingsData || [],
          totalBookings: bookingsData?.length || 0,
          totalSpent: bookingsData?.reduce((sum, b) => sum + Number(b.total_price), 0) || 0,
        };
      })
    );

    setCustomers(customersWithBookings);
    setLoading(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">Customers</h1>
          <p className="text-muted-foreground mt-2">View customer information and booking history</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Customers ({customers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Total Bookings</TableHead>
                  <TableHead>Total Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.full_name || "N/A"}
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone || "N/A"}</TableCell>
                    <TableCell>
                      {format(new Date(customer.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>{customer.totalBookings}</TableCell>
                    <TableCell className="font-semibold">
                      ${customer.totalSpent.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;
