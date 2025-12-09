import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TestingDocumentation = () => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Testing_Documentation_Sprint_Report",
  });

  const testCases = [
    { id: "TC-001", module: "Room Listing", description: "Verify all available rooms display correctly", preconditions: "Rooms exist in database", steps: "1. Navigate to /rooms\n2. Check room cards load", expected: "All rooms with images, prices, amenities shown", status: "Pass" },
    { id: "TC-002", module: "Quick Book", description: "Test quick booking modal opens correctly", preconditions: "User logged in, room available", steps: "1. Click 'Quick Book' on room card\n2. Verify modal appears", expected: "Modal opens with room details and date picker", status: "Pass" },
    { id: "TC-003", module: "Date Validation", description: "Verify check-out must be after check-in", preconditions: "Quick book modal open", steps: "1. Select check-in date\n2. Try to select earlier check-out", expected: "Earlier dates disabled in calendar", status: "Pass" },
    { id: "TC-004", module: "Demo Checkout", description: "Test demo payment flow completion", preconditions: "Booking created, on checkout page", steps: "1. Fill demo card details\n2. Click 'Pay Now'", expected: "Booking confirmed, redirect to success", status: "Pass" },
    { id: "TC-005", module: "Booking Lookup", description: "Guest can find booking by reference + email", preconditions: "Valid booking exists", steps: "1. Go to /manage-booking\n2. Enter reference and email\n3. Click Search", expected: "Booking details displayed", status: "Pass" },
    { id: "TC-006", module: "Booking Cancel", description: "User can cancel their confirmed booking", preconditions: "Confirmed booking exists", steps: "1. Find booking\n2. Click Cancel\n3. Confirm cancellation", expected: "Status changes to 'cancelled'", status: "Pass" },
    { id: "TC-007", module: "Authentication", description: "New user can sign up successfully", preconditions: "Valid email not registered", steps: "1. Go to /auth\n2. Fill signup form\n3. Submit", expected: "Account created, user logged in", status: "Pass" },
    { id: "TC-008", module: "Admin Access", description: "Non-admin cannot access admin pages", preconditions: "Logged in as customer role", steps: "1. Try to navigate to /admin", expected: "Access denied or redirect", status: "Pass" },
    { id: "TC-009", module: "Review Submit", description: "User can submit review for completed booking", preconditions: "Completed booking, checked out", steps: "1. Go to dashboard\n2. Click 'Leave Review'\n3. Submit rating + text", expected: "Review saved and displayed", status: "Pass" },
    { id: "TC-010", module: "Room Availability", description: "Booked dates blocked for same room", preconditions: "Room has confirmed booking", steps: "1. Try to book same room\n2. Select overlapping dates", expected: "Booking rejected with error", status: "Pass" },
    { id: "TC-011", module: "Price Calculation", description: "Total price calculated correctly", preconditions: "Room price known", steps: "1. Select check-in/out dates\n2. View total in modal", expected: "Total = nights × price_per_night", status: "Pass" },
    { id: "TC-012", module: "Guest Count", description: "Cannot exceed room capacity", preconditions: "Room capacity = 2", steps: "1. Try to set guests = 5", expected: "Validation error shown", status: "Pass" },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Button onClick={() => handlePrint()} className="gap-2">
            <FileDown className="h-4 w-4" />
            Export as PDF
          </Button>
        </div>

        <div ref={printRef} className="space-y-8 print:p-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-2">Testing Documentation</h1>
            <p className="text-muted-foreground">Hotel Booking System - Sprint Deliverables</p>
            <p className="text-sm text-muted-foreground mt-2">Generated: {new Date().toLocaleDateString()}</p>
          </div>

          {/* Test Cases Table */}
          <Card className="print:shadow-none print:border">
            <CardHeader>
              <CardTitle>Test Cases Sheet (12 Records)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">ID</TableHead>
                      <TableHead className="w-28">Module</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Expected Result</TableHead>
                      <TableHead className="w-16">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testCases.map((tc) => (
                      <TableRow key={tc.id}>
                        <TableCell className="font-mono text-xs">{tc.id}</TableCell>
                        <TableCell className="text-sm">{tc.module}</TableCell>
                        <TableCell className="text-sm">{tc.description}</TableCell>
                        <TableCell className="text-sm">{tc.expected}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {tc.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Bug Report Example */}
          <Card className="print:shadow-none print:border print:break-before-page">
            <CardHeader>
              <CardTitle>Example Bug Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Bug ID:</strong> BUG-2024-001</div>
                <div><strong>Severity:</strong> <span className="text-red-600 font-medium">High</span></div>
                <div><strong>Status:</strong> <span className="text-green-600 font-medium">Resolved</span></div>
                <div><strong>Reported:</strong> 2024-12-05</div>
              </div>
              <div>
                <strong>Title:</strong> 404 Error After Demo Checkout Payment
              </div>
              <div>
                <strong>Description:</strong> After completing demo payment, users are redirected to a URL that returns a 404 error instead of the booking success page.
              </div>
              <div>
                <strong>Steps to Reproduce:</strong>
                <ol className="list-decimal ml-6 mt-1 text-sm">
                  <li>Select a room and complete booking form</li>
                  <li>Proceed to demo checkout</li>
                  <li>Fill demo card details and click "Pay Now"</li>
                  <li>Observe redirect URL after payment</li>
                </ol>
              </div>
              <div>
                <strong>Root Cause:</strong> Double URL encoding of booking reference parameter caused malformed redirect URL.
              </div>
              <div>
                <strong>Resolution:</strong> Fixed URL construction using proper URLSearchParams instead of manual string concatenation.
              </div>
            </CardContent>
          </Card>

          {/* Testing Types */}
          <Card className="print:shadow-none print:border">
            <CardHeader>
              <CardTitle>Testing Types & Techniques Used</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Testing Type</TableHead>
                    <TableHead>Technique</TableHead>
                    <TableHead>Application</TableHead>
                    <TableHead>Rationale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Functional Testing</TableCell>
                    <TableCell>Manual Exploratory</TableCell>
                    <TableCell>Booking flow, authentication</TableCell>
                    <TableCell>Verify core business requirements</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Integration Testing</TableCell>
                    <TableCell>API Testing</TableCell>
                    <TableCell>Supabase RPC functions</TableCell>
                    <TableCell>Ensure frontend-backend communication</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Regression Testing</TableCell>
                    <TableCell>Smoke Testing</TableCell>
                    <TableCell>After each sprint</TableCell>
                    <TableCell>Verify existing functionality intact</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Usability Testing</TableCell>
                    <TableCell>Cognitive Walkthrough</TableCell>
                    <TableCell>Guest booking experience</TableCell>
                    <TableCell>Optimize user experience</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Security Testing</TableCell>
                    <TableCell>RLS Policy Validation</TableCell>
                    <TableCell>Database access control</TableCell>
                    <TableCell>Prevent unauthorized data access</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Root Cause Analysis */}
          <Card className="print:shadow-none print:border print:break-before-page">
            <CardHeader>
              <CardTitle>Root Cause Analysis: 5 Whys Technique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <strong>Problem:</strong> "Manage Booking" search returns "No booking found" for valid bookings made by guests (non-logged-in users).
              </div>
              
              <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                <div className="flex gap-3">
                  <span className="font-bold text-primary">Why 1:</span>
                  <span>The search query returns empty results → RLS policy blocks the SELECT</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-primary">Why 2:</span>
                  <span>RLS blocks the query → User is anonymous (not authenticated)</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-primary">Why 3:</span>
                  <span>User is anonymous → Guest booking doesn't require login</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-primary">Why 4:</span>
                  <span>No policy for guests → Original design assumed all users logged in</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-primary">Why 5:</span>
                  <span>Design assumption invalid → Guest booking added later without RLS update</span>
                </div>
              </div>

              <div>
                <strong>Root Cause:</strong> Guest booking feature was added without updating Row-Level Security policies to accommodate anonymous users.
              </div>

              <div>
                <strong>Solution:</strong> Created SECURITY DEFINER functions (lookup_booking_by_reference, cancel_booking_by_reference) that bypass RLS while requiring both booking reference AND email verification for security.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestingDocumentation;
