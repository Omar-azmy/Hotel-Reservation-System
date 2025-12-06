import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const testCases = [
  { id: "TC01", name: "Room listing loads", preconditions: "User on homepage", steps: "Navigate to /rooms", expected: "All available rooms display with images, prices, amenities", status: "Pass" },
  { id: "TC02", name: "Quick book modal opens", preconditions: "Room card visible", steps: "Click 'Book Now' on room card", expected: "Modal opens with date picker and guest selector", status: "Pass" },
  { id: "TC03", name: "Date validation", preconditions: "Quick book modal open", steps: "Select check-out before check-in", expected: "Error message shown, booking blocked", status: "Pass" },
  { id: "TC04", name: "Demo checkout flow", preconditions: "Valid booking details", steps: "Complete quick book → checkout", expected: "Redirects to success page with confirmation", status: "Pass" },
  { id: "TC05", name: "Booking lookup by reference", preconditions: "Confirmed booking exists", steps: "Enter reference + email in Manage Booking", expected: "Booking details displayed", status: "Pass" },
  { id: "TC06", name: "Cancel booking", preconditions: "Valid booking found", steps: "Click cancel button", expected: "Booking status changes to cancelled", status: "Pass" },
  { id: "TC07", name: "Admin dashboard access", preconditions: "User has admin role", steps: "Navigate to /admin", expected: "Dashboard loads with stats", status: "Pass" },
  { id: "TC08", name: "Room availability check", preconditions: "Dates selected", steps: "Check overlapping booking dates", expected: "Shows unavailable if conflict", status: "Pass" },
  { id: "TC09", name: "Phone input validation", preconditions: "Booking form open", steps: "Enter invalid phone format", expected: "Validation error displayed", status: "Pass" },
  { id: "TC10", name: "Booking receipt generation", preconditions: "Successful booking", steps: "View booking success page", expected: "Receipt displays with all details", status: "Pass" },
  { id: "TC11", name: "Review submission", preconditions: "Completed booking", steps: "Submit review with rating", expected: "Review saved and displayed", status: "Pass" },
  { id: "TC12", name: "Guest user booking", preconditions: "Not logged in", steps: "Complete demo checkout", expected: "Booking created without auth", status: "Pass" },
];

const testingTypes = [
  { type: "Functional Testing", technique: "Manual exploratory", reason: "Verify booking flows work end-to-end in real browser" },
  { type: "Integration Testing", technique: "API testing via console/network logs", reason: "Ensure frontend-backend-database integration works" },
  { type: "Regression Testing", technique: "Re-test after fixes", reason: "Confirm fixes don't break existing functionality" },
  { type: "Usability Testing", technique: "User flow simulation", reason: "Ensure guests can complete bookings without confusion" },
  { type: "Security Testing", technique: "RLS policy validation", reason: "Verify users can only access their own data" },
];

export default function TestingDocumentation() {
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "Testing_Documentation_Sprint_Report",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header - not printed */}
      <div className="print:hidden sticky top-0 z-10 bg-background border-b p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={() => handlePrint()} className="gap-2">
            <Download className="h-4 w-4" />
            Export as PDF
          </Button>
        </div>
      </div>

      {/* Printable content */}
      <div ref={contentRef} className="container mx-auto py-8 px-4 print:py-0 print:px-8">
        <div className="space-y-8 print:space-y-6">
          {/* Title */}
          <div className="text-center border-b pb-6 print:pb-4">
            <h1 className="text-3xl font-bold text-foreground print:text-2xl">Sprint Testing Documentation</h1>
            <p className="text-muted-foreground mt-2">Hotel Booking System - Quality Assurance Report</p>
            <p className="text-sm text-muted-foreground mt-1">Generated: {new Date().toLocaleDateString()}</p>
          </div>

          {/* Section 6: Testing */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4 print:text-xl">6. Testing</h2>

            {/* Test Cases */}
            <Card className="mb-6 print:shadow-none print:border">
              <CardHeader className="print:pb-2">
                <CardTitle className="text-lg">Test Cases Sheet (12 Records)</CardTitle>
              </CardHeader>
              <CardContent className="print:pt-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">ID</TableHead>
                        <TableHead>Test Case</TableHead>
                        <TableHead className="print:hidden">Preconditions</TableHead>
                        <TableHead>Steps</TableHead>
                        <TableHead>Expected Result</TableHead>
                        <TableHead className="w-20">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testCases.map((tc) => (
                        <TableRow key={tc.id}>
                          <TableCell className="font-mono text-sm">{tc.id}</TableCell>
                          <TableCell className="font-medium">{tc.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground print:hidden">{tc.preconditions}</TableCell>
                          <TableCell className="text-sm">{tc.steps}</TableCell>
                          <TableCell className="text-sm">{tc.expected}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              tc.status === "Pass" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800"
                            }`}>
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

            {/* Bug Report */}
            <Card className="mb-6 print:shadow-none print:border print:break-inside-avoid">
              <CardHeader className="print:pb-2">
                <CardTitle className="text-lg">Bug Report Example</CardTitle>
              </CardHeader>
              <CardContent className="print:pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bug ID</p>
                    <p className="font-mono font-medium">BUG-001</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Severity</p>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">High</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <p className="font-medium">P1</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">2025-12-06</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Title</h4>
                    <p>404 Error After Demo Checkout Despite Successful Booking</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Steps to Reproduce</h4>
                    <ol className="list-decimal list-inside text-sm space-y-1 ml-2">
                      <li>Navigate to Rooms page</li>
                      <li>Click "Book Now" on any room</li>
                      <li>Select dates and guests, click "Book Now"</li>
                      <li>On checkout page, click "Pay Now"</li>
                      <li>Observe the result</li>
                    </ol>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-green-700 dark:text-green-400">Expected Result</h4>
                      <p className="text-sm">User redirected to booking success page with confirmation details</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-700 dark:text-red-400">Actual Result</h4>
                      <p className="text-sm">404 "Page Not Found" error displayed, though booking was actually created in database</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Root Cause</h4>
                    <p className="text-sm">Query parameters were being double-encoded (e.g., ? becoming %3F), causing React Router to fail matching the /booking-success route</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400">Resolution</h4>
                    <p className="text-sm">Changed navigation to use React Router's state object instead of URL query parameters</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testing Types */}
            <Card className="print:shadow-none print:border print:break-inside-avoid">
              <CardHeader className="print:pb-2">
                <CardTitle className="text-lg">Testing Types & Techniques Used</CardTitle>
              </CardHeader>
              <CardContent className="print:pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Technique</TableHead>
                      <TableHead>Why Chosen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testingTypes.map((tt, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{tt.type}</TableCell>
                        <TableCell>{tt.technique}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{tt.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          {/* Section 7: Root Cause Analysis */}
          <section className="print:break-before-page">
            <h2 className="text-2xl font-semibold text-foreground mb-4 print:text-xl">7. Root Cause Analysis</h2>

            <Card className="print:shadow-none print:border">
              <CardHeader className="print:pb-2">
                <CardTitle className="text-lg">5 Whys Technique</CardTitle>
                <p className="text-sm text-muted-foreground">Problem: Manage Booking search returns "No booking found" even with correct reference and email</p>
              </CardHeader>
              <CardContent className="print:pt-0">
                {/* 5 Whys Diagram */}
                <div className="bg-muted/50 rounded-lg p-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm shrink-0">P</div>
                      <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3 flex-1">
                        <p className="font-medium text-red-800 dark:text-red-200">Problem: Booking lookup fails</p>
                      </div>
                    </div>

                    {[
                      { num: 1, text: "Why? Query returns empty result set" },
                      { num: 2, text: "Why? RLS policy blocks the SELECT query" },
                      { num: 3, text: "Why? Anonymous role has no SELECT permission on bookings table" },
                      { num: 4, text: "Why? RLS policy requires auth.uid() to match user_id" },
                      { num: 5, text: "Why? Original database design assumed all users would be authenticated" },
                    ].map((item) => (
                      <div key={item.num} className="flex items-start gap-3 ml-4">
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">{item.num}</div>
                        <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3 flex-1">
                          <p className="text-amber-800 dark:text-amber-200">{item.text}</p>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-start gap-3 ml-8">
                      <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm shrink-0">RC</div>
                      <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-3 flex-1">
                        <p className="font-medium text-orange-800 dark:text-orange-200">Root Cause: Guest booking feature was added without updating RLS policies to accommodate unauthenticated users</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 ml-8">
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm shrink-0">S</div>
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 flex-1">
                        <p className="font-medium text-green-800 dark:text-green-200">Solution: Created SECURITY DEFINER SQL functions that bypass RLS and verify ownership via email match instead of auth.uid()</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Technical Resolution</h4>
                  <div className="text-sm space-y-2">
                    <p><strong>Functions Created:</strong></p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li><code className="bg-muted px-1 rounded">lookup_booking_by_reference(p_booking_reference, p_customer_email)</code></li>
                      <li><code className="bg-muted px-1 rounded">cancel_booking_by_reference(p_booking_reference, p_customer_email)</code></li>
                    </ul>
                    <p className="mt-2"><strong>Key Design Decisions:</strong></p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Used SECURITY DEFINER to bypass RLS while maintaining security</li>
                      <li>Required both booking reference AND email for verification</li>
                      <li>Granted EXECUTE permissions to anon and authenticated roles</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-6 border-t print:pt-4">
            <p>Hotel Booking System - Sprint Documentation</p>
            <p>© {new Date().getFullYear()} All Rights Reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
}
