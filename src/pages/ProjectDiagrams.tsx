import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, ArrowLeft, Database, Component, ArrowRightLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ProjectDiagrams = () => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Project_Diagrams_Hotel_Booking_System",
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
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

        <div ref={printRef} className="space-y-12 print:p-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-2">System Architecture Documentation</h1>
            <p className="text-muted-foreground">Hotel Booking System - Technical Diagrams</p>
            <p className="text-sm text-muted-foreground mt-2">Generated: {new Date().toLocaleDateString()}</p>
          </div>

          {/* ERD Diagram */}
          <Card className="print:shadow-none print:border print:break-after-page">
            <CardHeader className="flex flex-row items-center gap-3">
              <Database className="h-6 w-6 text-primary" />
              <CardTitle>Entity Relationship Diagram (ERD)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                This diagram shows the database schema and relationships between entities in the hotel booking system.
              </p>
              
              <div className="bg-muted/30 p-6 rounded-lg overflow-x-auto">
                <svg viewBox="0 0 900 600" className="w-full h-auto min-w-[800px]" style={{ maxHeight: '500px' }}>
                  {/* Rooms Entity */}
                  <g transform="translate(50, 50)">
                    <rect width="200" height="220" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2"/>
                    <rect width="200" height="40" rx="8" fill="hsl(var(--primary))" />
                    <text x="100" y="26" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontWeight="bold" fontSize="14">ROOMS</text>
                    <text x="15" y="60" fill="hsl(var(--foreground))" fontSize="11">🔑 id: UUID (PK)</text>
                    <text x="15" y="80" fill="hsl(var(--foreground))" fontSize="11">name: TEXT</text>
                    <text x="15" y="100" fill="hsl(var(--foreground))" fontSize="11">type: room_type (ENUM)</text>
                    <text x="15" y="120" fill="hsl(var(--foreground))" fontSize="11">description: TEXT</text>
                    <text x="15" y="140" fill="hsl(var(--foreground))" fontSize="11">price_per_night: NUMERIC</text>
                    <text x="15" y="160" fill="hsl(var(--foreground))" fontSize="11">capacity: INTEGER</text>
                    <text x="15" y="180" fill="hsl(var(--foreground))" fontSize="11">amenities: TEXT[]</text>
                    <text x="15" y="200" fill="hsl(var(--foreground))" fontSize="11">is_available: BOOLEAN</text>
                  </g>

                  {/* Bookings Entity */}
                  <g transform="translate(350, 30)">
                    <rect width="220" height="300" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2"/>
                    <rect width="220" height="40" rx="8" fill="hsl(var(--primary))" />
                    <text x="110" y="26" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontWeight="bold" fontSize="14">BOOKINGS</text>
                    <text x="15" y="60" fill="hsl(var(--foreground))" fontSize="11">🔑 id: UUID (PK)</text>
                    <text x="15" y="80" fill="hsl(var(--foreground))" fontSize="11">🔗 room_id: UUID (FK)</text>
                    <text x="15" y="100" fill="hsl(var(--foreground))" fontSize="11">🔗 customer_id: UUID (FK)</text>
                    <text x="15" y="120" fill="hsl(var(--foreground))" fontSize="11">booking_reference: TEXT</text>
                    <text x="15" y="140" fill="hsl(var(--foreground))" fontSize="11">customer_name: TEXT</text>
                    <text x="15" y="160" fill="hsl(var(--foreground))" fontSize="11">customer_email: TEXT</text>
                    <text x="15" y="180" fill="hsl(var(--foreground))" fontSize="11">customer_phone: TEXT</text>
                    <text x="15" y="200" fill="hsl(var(--foreground))" fontSize="11">check_in: DATE</text>
                    <text x="15" y="220" fill="hsl(var(--foreground))" fontSize="11">check_out: DATE</text>
                    <text x="15" y="240" fill="hsl(var(--foreground))" fontSize="11">guests: INTEGER</text>
                    <text x="15" y="260" fill="hsl(var(--foreground))" fontSize="11">total_price: NUMERIC</text>
                    <text x="15" y="280" fill="hsl(var(--foreground))" fontSize="11">status: booking_status</text>
                  </g>

                  {/* Profiles Entity */}
                  <g transform="translate(650, 50)">
                    <rect width="200" height="160" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2"/>
                    <rect width="200" height="40" rx="8" fill="hsl(var(--primary))" />
                    <text x="100" y="26" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontWeight="bold" fontSize="14">PROFILES</text>
                    <text x="15" y="60" fill="hsl(var(--foreground))" fontSize="11">🔑 id: UUID (PK, FK→auth)</text>
                    <text x="15" y="80" fill="hsl(var(--foreground))" fontSize="11">email: TEXT</text>
                    <text x="15" y="100" fill="hsl(var(--foreground))" fontSize="11">full_name: TEXT</text>
                    <text x="15" y="120" fill="hsl(var(--foreground))" fontSize="11">phone: TEXT</text>
                    <text x="15" y="140" fill="hsl(var(--foreground))" fontSize="11">created_at: TIMESTAMPTZ</text>
                  </g>

                  {/* User Roles Entity */}
                  <g transform="translate(650, 250)">
                    <rect width="200" height="120" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2"/>
                    <rect width="200" height="40" rx="8" fill="hsl(var(--primary))" />
                    <text x="100" y="26" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontWeight="bold" fontSize="14">USER_ROLES</text>
                    <text x="15" y="60" fill="hsl(var(--foreground))" fontSize="11">🔑 id: UUID (PK)</text>
                    <text x="15" y="80" fill="hsl(var(--foreground))" fontSize="11">🔗 user_id: UUID (FK)</text>
                    <text x="15" y="100" fill="hsl(var(--foreground))" fontSize="11">role: app_role (ENUM)</text>
                  </g>

                  {/* Reviews Entity */}
                  <g transform="translate(50, 320)">
                    <rect width="200" height="180" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2"/>
                    <rect width="200" height="40" rx="8" fill="hsl(var(--primary))" />
                    <text x="100" y="26" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontWeight="bold" fontSize="14">REVIEWS</text>
                    <text x="15" y="60" fill="hsl(var(--foreground))" fontSize="11">🔑 id: UUID (PK)</text>
                    <text x="15" y="80" fill="hsl(var(--foreground))" fontSize="11">🔗 room_id: UUID (FK)</text>
                    <text x="15" y="100" fill="hsl(var(--foreground))" fontSize="11">🔗 booking_id: UUID (FK)</text>
                    <text x="15" y="120" fill="hsl(var(--foreground))" fontSize="11">🔗 user_id: UUID (FK)</text>
                    <text x="15" y="140" fill="hsl(var(--foreground))" fontSize="11">rating: INTEGER (1-5)</text>
                    <text x="15" y="160" fill="hsl(var(--foreground))" fontSize="11">review_text: TEXT</text>
                  </g>

                  {/* Relationships */}
                  {/* Rooms to Bookings */}
                  <line x1="250" y1="160" x2="350" y2="110" stroke="hsl(var(--primary))" strokeWidth="2"/>
                  <text x="290" y="120" fill="hsl(var(--muted-foreground))" fontSize="10">1:N</text>

                  {/* Rooms to Reviews */}
                  <line x1="150" y1="270" x2="150" y2="320" stroke="hsl(var(--primary))" strokeWidth="2"/>
                  <text x="160" y="295" fill="hsl(var(--muted-foreground))" fontSize="10">1:N</text>

                  {/* Profiles to Bookings */}
                  <line x1="650" y1="130" x2="570" y2="130" stroke="hsl(var(--primary))" strokeWidth="2"/>
                  <text x="600" y="120" fill="hsl(var(--muted-foreground))" fontSize="10">1:N</text>

                  {/* Profiles to User Roles */}
                  <line x1="750" y1="210" x2="750" y2="250" stroke="hsl(var(--primary))" strokeWidth="2"/>
                  <text x="760" y="230" fill="hsl(var(--muted-foreground))" fontSize="10">1:N</text>

                  {/* Bookings to Reviews */}
                  <line x1="350" y1="330" x2="250" y2="400" stroke="hsl(var(--primary))" strokeWidth="2"/>
                  <text x="290" y="370" fill="hsl(var(--muted-foreground))" fontSize="10">1:1</text>

                  {/* Legend */}
                  <g transform="translate(350, 400)">
                    <rect width="220" height="80" rx="4" fill="hsl(var(--muted))" opacity="0.5"/>
                    <text x="110" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontWeight="bold" fontSize="12">Legend</text>
                    <text x="15" y="40" fill="hsl(var(--foreground))" fontSize="10">🔑 Primary Key</text>
                    <text x="15" y="55" fill="hsl(var(--foreground))" fontSize="10">🔗 Foreign Key</text>
                    <text x="120" y="40" fill="hsl(var(--foreground))" fontSize="10">1:N = One to Many</text>
                    <text x="120" y="55" fill="hsl(var(--foreground))" fontSize="10">1:1 = One to One</text>
                  </g>
                </svg>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <strong>Enums:</strong>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• room_type: standard, deluxe, suite, family</li>
                    <li>• booking_status: pending, confirmed, cancelled, completed</li>
                    <li>• app_role: admin, customer</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <strong>Key Constraints:</strong>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• booking_reference is unique</li>
                    <li>• user_id + role is unique in user_roles</li>
                    <li>• profiles.id references auth.users.id</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Component Design Diagram */}
          <Card className="print:shadow-none print:border print:break-after-page">
            <CardHeader className="flex flex-row items-center gap-3">
              <Component className="h-6 w-6 text-primary" />
              <CardTitle>Component Design Diagram</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                This diagram illustrates the React component hierarchy and their relationships in the application.
              </p>
              
              <div className="bg-muted/30 p-6 rounded-lg overflow-x-auto">
                <svg viewBox="0 0 950 700" className="w-full h-auto min-w-[900px]" style={{ maxHeight: '600px' }}>
                  {/* App Root */}
                  <g transform="translate(400, 10)">
                    <rect width="150" height="40" rx="6" fill="hsl(var(--primary))" />
                    <text x="75" y="25" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontWeight="bold" fontSize="13">App.tsx</text>
                  </g>

                  {/* Router Level */}
                  <line x1="475" y1="50" x2="475" y2="80" stroke="hsl(var(--border))" strokeWidth="2"/>
                  
                  {/* Page Components Row */}
                  <g transform="translate(20, 90)">
                    {/* Public Pages */}
                    <rect width="280" height="200" rx="8" fill="hsl(var(--muted))" opacity="0.3" stroke="hsl(var(--border))" strokeDasharray="4"/>
                    <text x="140" y="20" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="11" fontWeight="bold">PUBLIC PAGES</text>
                    
                    <g transform="translate(15, 35)">
                      <rect width="110" height="35" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
                      <text x="55" y="22" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11">Index</text>
                    </g>
                    <g transform="translate(140, 35)">
                      <rect width="110" height="35" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
                      <text x="55" y="22" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11">Rooms</text>
                    </g>
                    <g transform="translate(15, 80)">
                      <rect width="110" height="35" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
                      <text x="55" y="22" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11">RoomDetail</text>
                    </g>
                    <g transform="translate(140, 80)">
                      <rect width="110" height="35" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
                      <text x="55" y="22" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11">Auth</text>
                    </g>
                    <g transform="translate(15, 125)">
                      <rect width="110" height="35" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
                      <text x="55" y="22" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11">ManageBooking</text>
                    </g>
                    <g transform="translate(140, 125)">
                      <rect width="110" height="35" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
                      <text x="55" y="22" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11">Booking</text>
                    </g>
                  </g>

                  {/* Auth Pages */}
                  <g transform="translate(320, 90)">
                    <rect width="200" height="200" rx="8" fill="hsl(var(--muted))" opacity="0.3" stroke="hsl(var(--border))" strokeDasharray="4"/>
                    <text x="100" y="20" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="11" fontWeight="bold">USER PAGES</text>
                    
                    <g transform="translate(15, 35)">
                      <rect width="170" height="35" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
                      <text x="85" y="22" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11">Dashboard</text>
                    </g>
                    <g transform="translate(15, 80)">
                      <rect width="170" height="35" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
                      <text x="85" y="22" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11">BookingSuccess</text>
                    </g>
                    <g transform="translate(15, 125)">
                      <rect width="170" height="35" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
                      <text x="85" y="22" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11">DemoCheckout</text>
                    </g>
                  </g>

                  {/* Admin Pages */}
                  <g transform="translate(540, 90)">
                    <rect width="380" height="200" rx="8" fill="hsl(var(--muted))" opacity="0.3" stroke="hsl(var(--border))" strokeDasharray="4"/>
                    <text x="190" y="20" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="11" fontWeight="bold">ADMIN PAGES (Role Protected)</text>
                    
                    <g transform="translate(15, 35)">
                      <rect width="110" height="35" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--destructive))" strokeWidth="1.5"/>
                      <text x="55" y="22" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11">admin/Dashboard</text>
                    </g>
                    <g transform="translate(135, 35)">
                      <rect width="110" height="35" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--destructive))" strokeWidth="1.5"/>
                      <text x="55" y="22" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11">admin/Rooms</text>
                    </g>
                    <g transform="translate(255, 35)">
                      <rect width="110" height="35" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--destructive))" strokeWidth="1.5"/>
                      <text x="55" y="22" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11">admin/Reservations</text>
                    </g>
                    <g transform="translate(15, 80)">
                      <rect width="110" height="35" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--destructive))" strokeWidth="1.5"/>
                      <text x="55" y="22" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11">admin/Customers</text>
                    </g>
                    <g transform="translate(135, 80)">
                      <rect width="110" height="35" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--destructive))" strokeWidth="1.5"/>
                      <text x="55" y="22" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11">admin/Calendar</text>
                    </g>
                    <g transform="translate(255, 80)">
                      <rect width="110" height="35" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--destructive))" strokeWidth="1.5"/>
                      <text x="55" y="22" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11">admin/Reports</text>
                    </g>
                    <g transform="translate(135, 125)">
                      <rect width="110" height="35" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--destructive))" strokeWidth="1.5"/>
                      <text x="55" y="22" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11">admin/Settings</text>
                    </g>
                  </g>

                  {/* Shared Components */}
                  <g transform="translate(20, 320)">
                    <rect width="420" height="180" rx="8" fill="hsl(var(--accent))" opacity="0.2" stroke="hsl(var(--accent-foreground))" strokeDasharray="4"/>
                    <text x="210" y="20" textAnchor="middle" fill="hsl(var(--accent-foreground))" fontSize="11" fontWeight="bold">SHARED COMPONENTS</text>
                    
                    <g transform="translate(15, 35)">
                      <rect width="90" height="30" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="45" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10">Navbar</text>
                    </g>
                    <g transform="translate(115, 35)">
                      <rect width="90" height="30" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="45" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10">Hero</text>
                    </g>
                    <g transform="translate(215, 35)">
                      <rect width="90" height="30" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="45" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10">RoomCard</text>
                    </g>
                    <g transform="translate(315, 35)">
                      <rect width="90" height="30" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="45" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10">ReviewsList</text>
                    </g>
                    <g transform="translate(15, 75)">
                      <rect width="90" height="30" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="45" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10">ReviewForm</text>
                    </g>
                    <g transform="translate(115, 75)">
                      <rect width="100" height="30" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="50" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10">QuickBookModal</text>
                    </g>
                    <g transform="translate(225, 75)">
                      <rect width="100" height="30" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="50" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10">BookingReceipt</text>
                    </g>
                    <g transform="translate(15, 115)">
                      <rect width="90" height="30" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="45" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10">PhoneInput</text>
                    </g>
                    <g transform="translate(115, 115)">
                      <rect width="90" height="30" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="45" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10">AdminLayout</text>
                    </g>
                  </g>

                  {/* UI Components */}
                  <g transform="translate(460, 320)">
                    <rect width="460" height="180" rx="8" fill="hsl(var(--secondary))" opacity="0.3" stroke="hsl(var(--secondary-foreground))" strokeDasharray="4"/>
                    <text x="230" y="20" textAnchor="middle" fill="hsl(var(--secondary-foreground))" fontSize="11" fontWeight="bold">UI COMPONENTS (shadcn/ui)</text>
                    
                    <g transform="translate(15, 35)">
                      <rect width="70" height="25" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="35" y="17" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9">Button</text>
                    </g>
                    <g transform="translate(95, 35)">
                      <rect width="70" height="25" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="35" y="17" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9">Card</text>
                    </g>
                    <g transform="translate(175, 35)">
                      <rect width="70" height="25" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="35" y="17" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9">Dialog</text>
                    </g>
                    <g transform="translate(255, 35)">
                      <rect width="70" height="25" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="35" y="17" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9">Input</text>
                    </g>
                    <g transform="translate(335, 35)">
                      <rect width="70" height="25" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="35" y="17" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9">Calendar</text>
                    </g>
                    <g transform="translate(15, 70)">
                      <rect width="70" height="25" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="35" y="17" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9">Table</text>
                    </g>
                    <g transform="translate(95, 70)">
                      <rect width="70" height="25" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="35" y="17" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9">Tabs</text>
                    </g>
                    <g transform="translate(175, 70)">
                      <rect width="70" height="25" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="35" y="17" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9">Select</text>
                    </g>
                    <g transform="translate(255, 70)">
                      <rect width="70" height="25" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="35" y="17" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9">Popover</text>
                    </g>
                    <g transform="translate(335, 70)">
                      <rect width="70" height="25" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="35" y="17" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9">Toast</text>
                    </g>
                    <g transform="translate(15, 105)">
                      <rect width="70" height="25" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="35" y="17" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9">Form</text>
                    </g>
                    <g transform="translate(95, 105)">
                      <rect width="70" height="25" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="35" y="17" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9">Badge</text>
                    </g>
                    <g transform="translate(175, 105)">
                      <rect width="70" height="25" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="35" y="17" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9">Skeleton</text>
                    </g>
                    <g transform="translate(255, 105)">
                      <rect width="70" height="25" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="35" y="17" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9">Avatar</text>
                    </g>
                    <g transform="translate(335, 105)">
                      <rect width="70" height="25" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))"/>
                      <text x="35" y="17" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9">+40 more</text>
                    </g>
                  </g>

                  {/* Services/Integrations */}
                  <g transform="translate(20, 520)">
                    <rect width="900" height="70" rx="8" fill="hsl(var(--muted))" opacity="0.2" stroke="hsl(var(--border))"/>
                    <text x="450" y="20" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="11" fontWeight="bold">INTEGRATIONS & SERVICES</text>
                    
                    <g transform="translate(50, 35)">
                      <rect width="140" height="25" rx="4" fill="hsl(var(--primary))" opacity="0.8"/>
                      <text x="70" y="17" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="10">Supabase Client</text>
                    </g>
                    <g transform="translate(210, 35)">
                      <rect width="140" height="25" rx="4" fill="hsl(var(--primary))" opacity="0.8"/>
                      <text x="70" y="17" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="10">React Query</text>
                    </g>
                    <g transform="translate(370, 35)">
                      <rect width="140" height="25" rx="4" fill="hsl(var(--primary))" opacity="0.8"/>
                      <text x="70" y="17" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="10">React Router</text>
                    </g>
                    <g transform="translate(530, 35)">
                      <rect width="140" height="25" rx="4" fill="hsl(var(--primary))" opacity="0.8"/>
                      <text x="70" y="17" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="10">React Hook Form</text>
                    </g>
                    <g transform="translate(690, 35)">
                      <rect width="140" height="25" rx="4" fill="hsl(var(--primary))" opacity="0.8"/>
                      <text x="70" y="17" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="10">Zod Validation</text>
                    </g>
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Context-Level Data Flow Diagram */}
          <Card className="print:shadow-none print:border">
            <CardHeader className="flex flex-row items-center gap-3">
              <ArrowRightLeft className="h-6 w-6 text-primary" />
              <CardTitle>Context-Level Data Flow Diagram (DFD Level 0)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                This diagram shows the high-level data flows between external entities and the hotel booking system.
              </p>
              
              <div className="bg-muted/30 p-6 rounded-lg overflow-x-auto">
                <svg viewBox="0 0 900 550" className="w-full h-auto min-w-[850px]" style={{ maxHeight: '500px' }}>
                  {/* External Entities */}
                  {/* Guest */}
                  <g transform="translate(50, 80)">
                    <rect width="120" height="60" rx="0" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2"/>
                    <text x="60" y="35" textAnchor="middle" fill="hsl(var(--foreground))" fontWeight="bold" fontSize="12">GUEST</text>
                    <text x="60" y="50" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10">(Unauthenticated)</text>
                  </g>

                  {/* Registered User */}
                  <g transform="translate(50, 220)">
                    <rect width="120" height="60" rx="0" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2"/>
                    <text x="60" y="35" textAnchor="middle" fill="hsl(var(--foreground))" fontWeight="bold" fontSize="12">CUSTOMER</text>
                    <text x="60" y="50" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10">(Authenticated)</text>
                  </g>

                  {/* Admin */}
                  <g transform="translate(50, 360)">
                    <rect width="120" height="60" rx="0" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2"/>
                    <text x="60" y="35" textAnchor="middle" fill="hsl(var(--foreground))" fontWeight="bold" fontSize="12">ADMIN</text>
                    <text x="60" y="50" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10">(Staff)</text>
                  </g>

                  {/* Central Process */}
                  <g transform="translate(350, 180)">
                    <circle cx="100" cy="80" r="90" fill="hsl(var(--primary))" opacity="0.9"/>
                    <text x="100" y="70" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontWeight="bold" fontSize="14">HOTEL</text>
                    <text x="100" y="90" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontWeight="bold" fontSize="14">BOOKING</text>
                    <text x="100" y="110" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontWeight="bold" fontSize="14">SYSTEM</text>
                  </g>

                  {/* Data Stores */}
                  {/* Database */}
                  <g transform="translate(700, 100)">
                    <path d="M0,15 L0,55 A60,15 0 0,0 120,55 L120,15 A60,15 0 0,0 0,15 A60,15 0 0,0 120,15" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2"/>
                    <text x="60" y="40" textAnchor="middle" fill="hsl(var(--foreground))" fontWeight="bold" fontSize="11">D1: Database</text>
                    <text x="60" y="55" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="9">(Supabase)</text>
                  </g>

                  {/* File Storage */}
                  <g transform="translate(700, 220)">
                    <path d="M0,15 L0,55 A60,15 0 0,0 120,55 L120,15 A60,15 0 0,0 0,15 A60,15 0 0,0 120,15" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2"/>
                    <text x="60" y="40" textAnchor="middle" fill="hsl(var(--foreground))" fontWeight="bold" fontSize="11">D2: File Storage</text>
                    <text x="60" y="55" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="9">(Photos)</text>
                  </g>

                  {/* External Services */}
                  <g transform="translate(700, 340)">
                    <rect width="120" height="60" rx="0" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2"/>
                    <text x="60" y="30" textAnchor="middle" fill="hsl(var(--foreground))" fontWeight="bold" fontSize="11">STRIPE</text>
                    <text x="60" y="48" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="9">(Payment</text>
                    <text x="60" y="58" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="9">Gateway)</text>
                  </g>

                  {/* Email Service */}
                  <g transform="translate(700, 440)">
                    <rect width="120" height="50" rx="0" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2"/>
                    <text x="60" y="30" textAnchor="middle" fill="hsl(var(--foreground))" fontWeight="bold" fontSize="11">RESEND</text>
                    <text x="60" y="45" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="9">(Email Service)</text>
                  </g>

                  {/* Data Flows */}
                  {/* Guest to System */}
                  <g>
                    <line x1="170" y1="100" x2="280" y2="200" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                    <text x="200" y="140" fill="hsl(var(--foreground))" fontSize="9" transform="rotate(-25 200 140)">Browse rooms, Search booking</text>
                  </g>
                  <g>
                    <line x1="280" y1="220" x2="170" y2="120" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                    <text x="200" y="185" fill="hsl(var(--foreground))" fontSize="9" transform="rotate(-25 200 185)">Room info, Booking status</text>
                  </g>

                  {/* Customer to System */}
                  <g>
                    <line x1="170" y1="245" x2="280" y2="250" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                    <text x="210" y="235" fill="hsl(var(--foreground))" fontSize="9">Booking request, Reviews, Profile</text>
                  </g>
                  <g>
                    <line x1="280" y1="270" x2="170" y2="265" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                    <text x="210" y="290" fill="hsl(var(--foreground))" fontSize="9">Confirmation, Receipt, History</text>
                  </g>

                  {/* Admin to System */}
                  <g>
                    <line x1="170" y1="380" x2="280" y2="300" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                    <text x="190" y="355" fill="hsl(var(--foreground))" fontSize="9" transform="rotate(25 190 355)">Room updates, Settings</text>
                  </g>
                  <g>
                    <line x1="280" y1="320" x2="170" y2="400" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                    <text x="190" y="385" fill="hsl(var(--foreground))" fontSize="9" transform="rotate(25 190 385)">Reports, Analytics</text>
                  </g>

                  {/* System to Database */}
                  <g>
                    <line x1="520" y1="200" x2="700" y2="135" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                    <text x="580" y="150" fill="hsl(var(--foreground))" fontSize="9">CRUD Operations</text>
                  </g>
                  <g>
                    <line x1="700" y1="155" x2="520" y2="220" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                    <text x="580" y="200" fill="hsl(var(--foreground))" fontSize="9">Query Results</text>
                  </g>

                  {/* System to Storage */}
                  <g>
                    <line x1="520" y1="255" x2="700" y2="250" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                    <text x="590" y="240" fill="hsl(var(--foreground))" fontSize="9">Upload photos</text>
                  </g>
                  <g>
                    <line x1="700" y1="270" x2="520" y2="275" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                    <text x="590" y="295" fill="hsl(var(--foreground))" fontSize="9">Photo URLs</text>
                  </g>

                  {/* System to Stripe */}
                  <g>
                    <line x1="520" y1="310" x2="700" y2="365" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                    <text x="580" y="325" fill="hsl(var(--foreground))" fontSize="9">Payment request</text>
                  </g>
                  <g>
                    <line x1="700" y1="385" x2="520" y2="330" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                    <text x="580" y="375" fill="hsl(var(--foreground))" fontSize="9">Payment status</text>
                  </g>

                  {/* System to Email */}
                  <g>
                    <line x1="500" y1="350" x2="700" y2="460" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                    <text x="570" y="420" fill="hsl(var(--foreground))" fontSize="9">Send confirmation</text>
                  </g>

                  {/* Arrow marker definition */}
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
                    </marker>
                  </defs>

                  {/* Legend */}
                  <g transform="translate(50, 480)">
                    <rect width="600" height="60" rx="4" fill="hsl(var(--muted))" opacity="0.5"/>
                    <text x="300" y="18" textAnchor="middle" fill="hsl(var(--foreground))" fontWeight="bold" fontSize="11">Legend</text>
                    <rect x="20" y="30" width="60" height="20" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="1"/>
                    <text x="95" y="44" fill="hsl(var(--foreground))" fontSize="10">External Entity</text>
                    <circle cx="180" cy="40" r="12" fill="hsl(var(--primary))"/>
                    <text x="205" y="44" fill="hsl(var(--foreground))" fontSize="10">Process</text>
                    <path d="M280,30 L280,50 A30,8 0 0,0 340,50 L340,30 A30,8 0 0,0 280,30" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1"/>
                    <text x="355" y="44" fill="hsl(var(--foreground))" fontSize="10">Data Store</text>
                    <line x1="420" y1="40" x2="470" y2="40" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                    <text x="485" y="44" fill="hsl(var(--foreground))" fontSize="10">Data Flow</text>
                  </g>
                </svg>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <strong>External Entities:</strong>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Guest (unauthenticated user)</li>
                    <li>• Customer (registered user)</li>
                    <li>• Admin (staff member)</li>
                    <li>• Stripe (payment processor)</li>
                    <li>• Resend (email service)</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <strong>Data Stores:</strong>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• D1: PostgreSQL Database</li>
                    <li>• D2: File Storage (photos)</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <strong>Key Processes:</strong>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Room browsing & search</li>
                    <li>• Booking management</li>
                    <li>• Payment processing</li>
                    <li>• Review submission</li>
                    <li>• Admin operations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDiagrams;
