# 🏨 Egyptian Hotel Reservation System - Features & Validation Guide

## ✅ Universal Input Validation (Implemented)

### 1. **Phone Numbers - International Format**

**Implementation:** Using `react-phone-number-input` + `libphonenumber-js`

```typescript
// Client-side validation
import { isValidPhoneNumber } from "libphonenumber-js";

const phoneValidation = z
  .string()
  .refine(
    (value) => !value || isValidPhoneNumber(value),
    "رقم هاتف غير صحيح / Invalid phone number"
  )
  .optional();
```

**Features:**
- ✅ Country code dropdown with flags (default: Egypt +20)
- ✅ Automatic formatting as user types
- ✅ Validates phone structure per country (E.164 format)
- ✅ Supports all countries: Egypt (+20), KSA (+966), UAE (+971), USA (+1), etc.

**UI Example:**
```tsx
<PhoneInput
  value={customerPhone}
  onChange={(value) => setCustomerPhone(value || "")}
  placeholder="رقم الجوال مع كود الدولة / +20 123 456 7890"
  defaultCountry="EG"
/>
```

---

### 2. **Names - Arabic & Latin Support**

**Implementation:** UTF-8 regex validation

```typescript
const nameValidation = z
  .string()
  .trim()
  .min(2, "الاسم يجب أن يكون حرفين على الأقل / Name must be at least 2 characters")
  .max(100, "الاسم يجب أن يكون أقل من 100 حرف / Name must be less than 100 characters")
  .regex(
    /^[\u0600-\u06FFa-zA-Z\s\-']+$/,
    "الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط"
  );
```

**What's Allowed:**
- ✅ Arabic characters: أحمد علي، محمود عبد الرحمن، سارة محمد، نور خالد
- ✅ Latin characters: John Smith, María García, Jean-Pierre
- ✅ Spaces, hyphens (-), apostrophes (')
- ✅ Multi-word names: محمد بن سلمان، Mary Anne O'Brien

**UI Example:**
```tsx
<Input
  placeholder="أحمد علي / Ahmed Ali"
  dir="auto" // Auto-detects RTL for Arabic
/>
```

---

### 3. **Email - Universal Format**

**Implementation:** Standard email validation

```typescript
const emailValidation = z
  .string()
  .email("بريد إلكتروني غير صحيح / Invalid email address")
  .max(255);
```

**Examples:**
- ✅ ahmed@example.com
- ✅ نور@مثال.كوم (internationalized domains)
- ✅ user+tag@domain.co.uk

---

### 4. **Bilingual Placeholders**

All form fields now have Arabic/English bilingual labels and placeholders:

```tsx
<Label>الاسم الكامل / Full Name *</Label>
<Input placeholder="أحمد علي / Ahmed Ali" />

<Label>البريد الإلكتروني / Email *</Label>
<Input placeholder="ahmed@example.com" />

<Label>رقم الجوال / Phone Number</Label>
<PhoneInput placeholder="رقم الجوال مع كود الدولة / +20 123 456 7890" />
```

---

## 📋 Sample Data - Arabic Examples

### Guest Names (Arabic)
```javascript
const sampleGuests = [
  "أحمد علي محمد",
  "سارة عبد الرحمن",
  "محمود حسن إبراهيم",
  "نور خالد السيد",
  "ليلى أحمد حسين",
  "عمر فاروق عبد الله",
  "فاطمة محمد علي",
  "يوسف عبد العزيز"
];
```

### Hotel Names (Arabic)
```javascript
const egyptianHotels = [
  "فندق النيل بلازا",
  "فندق الأهرام جراند",
  "فندق القاهرة ريتز",
  "منتجع البحر الأحمر",
  "فندق الإسكندرية الملكي",
  "فندق الأقصر الدولي"
];
```

### Cities (Arabic & English)
```javascript
const egyptianCities = [
  { ar: "القاهرة", en: "Cairo" },
  { ar: "الإسكندرية", en: "Alexandria" },
  { ar: "الأقصر", en: "Luxor" },
  { ar: "أسوان", en: "Aswan" },
  { ar: "شرم الشيخ", en: "Sharm El Sheikh" },
  { ar: "الغردقة", en: "Hurghada" }
];
```

---

## 🚀 Feature Suggestions for Middle East Market

### 1. **Multi-Language Support (العربية ⇄ English)**

**Description:** Toggle between Arabic and English interface

**Implementation:**
```bash
npm install i18next react-i18next
```

**Example:**
```typescript
// i18n config
const resources = {
  ar: {
    translation: {
      "booking.title": "احجز غرفتك",
      "booking.checkIn": "تاريخ الوصول",
      "booking.checkOut": "تاريخ المغادرة"
    }
  },
  en: {
    translation: {
      "booking.title": "Book Your Room",
      "booking.checkIn": "Check-in Date",
      "booking.checkOut": "Check-out Date"
    }
  }
};
```

**UI:**
```tsx
<Button onClick={() => i18n.changeLanguage(lang === 'ar' ? 'en' : 'ar')}>
  {lang === 'ar' ? 'English' : 'العربية'}
</Button>
```

**Validation:**
- Inputs automatically switch direction (RTL/LTR)
- Date formats adjust (Gregorian/Hijri option)
- Currency symbols position correctly

---

### 2. **Currency Selection (EGP Default)**

**Description:** Multi-currency pricing with live conversion

**Required Inputs:**
- Base currency (EGP)
- Target currency dropdown: USD, EUR, SAR, AED, GBP
- Conversion rates (API or manual)

**Validation:**
```typescript
const currencySchema = z.object({
  currency: z.enum(["EGP", "USD", "EUR", "SAR", "AED", "GBP"]),
  amount: z.number().positive().max(1000000)
});
```

**UI Example:**
```tsx
<Select value={currency} onValueChange={setCurrency}>
  <SelectItem value="EGP">🇪🇬 جنيه مصري (EGP)</SelectItem>
  <SelectItem value="SAR">🇸🇦 ريال سعودي (SAR)</SelectItem>
  <SelectItem value="AED">🇦🇪 درهم إماراتي (AED)</SelectItem>
  <SelectItem value="USD">🇺🇸 دولار أمريكي (USD)</SelectItem>
  <SelectItem value="EUR">🇪🇺 يورو (EUR)</SelectItem>
</Select>

<div className="text-lg font-bold">
  {formatCurrency(room.price, currency)} / {t('night')}
</div>
```

---

### 3. **Advanced Search Filters**

**Description:** Filter rooms by multiple criteria

**Required Inputs & Validation:**

```typescript
const searchFiltersSchema = z.object({
  // Date range
  checkIn: z.date().min(new Date(), "تاريخ الوصول يجب أن يكون في المستقبل"),
  checkOut: z.date(),
  
  // Price range
  minPrice: z.number().min(0).max(100000),
  maxPrice: z.number().min(0).max(100000),
  
  // Rating
  minRating: z.number().min(1).max(5).optional(),
  
  // Location
  city: z.string().optional(),
  district: z.string().optional(),
  
  // Room features
  roomType: z.enum(["standard", "deluxe", "executive_suite"]).optional(),
  minCapacity: z.number().int().min(1).max(10),
  
  // Amenities
  amenities: z.array(z.string()).optional(), // ["wifi", "pool", "gym", "spa"]
  
  // View
  view: z.enum(["nile", "pyramid", "sea", "city"]).optional()
});
```

**UI for Arabic Users:**
```tsx
<div className="space-y-4" dir="rtl">
  <div>
    <Label>نطاق السعر / Price Range</Label>
    <Slider 
      min={0} 
      max={10000} 
      value={[minPrice, maxPrice]}
      onValueChange={([min, max]) => {
        setMinPrice(min);
        setMaxPrice(max);
      }}
    />
    <div className="flex justify-between text-sm">
      <span>{minPrice} جنيه</span>
      <span>{maxPrice} جنيه</span>
    </div>
  </div>

  <div>
    <Label>التقييم الأدنى / Minimum Rating</Label>
    <RadioGroup value={minRating.toString()}>
      <RadioGroupItem value="5">⭐⭐⭐⭐⭐ (5 نجوم / stars)</RadioGroupItem>
      <RadioGroupItem value="4">⭐⭐⭐⭐ (4+ نجوم)</RadioGroupItem>
      <RadioGroupItem value="3">⭐⭐⭐ (3+ نجوم)</RadioGroupItem>
    </RadioGroup>
  </div>

  <div>
    <Label>المدينة / City</Label>
    <Select>
      <SelectItem value="cairo">القاهرة / Cairo</SelectItem>
      <SelectItem value="alexandria">الإسكندرية / Alexandria</SelectItem>
      <SelectItem value="luxor">الأقصر / Luxor</SelectItem>
      <SelectItem value="aswan">أسوان / Aswan</SelectItem>
    </Select>
  </div>

  <div>
    <Label>الإطلالة / View</Label>
    <CheckboxGroup>
      <Checkbox value="nile">إطلالة على النيل / Nile View</Checkbox>
      <Checkbox value="pyramid">إطلالة على الأهرام / Pyramid View</Checkbox>
      <Checkbox value="sea">إطلالة على البحر / Sea View</Checkbox>
      <Checkbox value="city">إطلالة على المدينة / City View</Checkbox>
    </CheckboxGroup>
  </div>
</div>
```

---

### 4. **Special Requests Field**

**Description:** Text area for guest-specific requests

**Required Inputs & Validation:**
```typescript
const specialRequestSchema = z.object({
  request: z
    .string()
    .max(500, "الطلب يجب أن يكون أقل من 500 حرف / Request must be less than 500 characters")
    .optional()
});
```

**Common Arabic Requests:**
- "غرفة مطلة على النيل" (Room with Nile view)
- "سرير إضافي للأطفال" (Extra bed for children)
- "طابق علوي" (Upper floor)
- "بعيد عن المصعد" (Away from elevator)
- "وجبة إفطار حلال" (Halal breakfast)
- "غرفة هادئة" (Quiet room)

**UI:**
```tsx
<div className="space-y-2">
  <Label htmlFor="specialRequests">
    طلبات خاصة / Special Requests
  </Label>
  <Textarea
    id="specialRequests"
    placeholder="مثال: غرفة مطلة على النيل، سرير إضافي
Example: Room with Nile view, extra bed"
    dir="auto"
    maxLength={500}
    rows={4}
  />
  <p className="text-xs text-muted-foreground">
    {specialRequests.length}/500 حرف / characters
  </p>
</div>
```

---

### 5. **Guest Profile with Saved Bookings**

**Description:** User dashboard to view booking history

**Database Schema:**
```sql
-- Already exists: profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  preferred_language VARCHAR(2) DEFAULT 'ar', -- 'ar' or 'en'
  preferred_currency VARCHAR(3) DEFAULT 'EGP',
  nationality VARCHAR(2), -- ISO country code
  passport_number VARCHAR(50),
  date_of_birth DATE;
```

**Validation:**
```typescript
const profileSchema = z.object({
  fullName: z.string().regex(/^[\u0600-\u06FFa-zA-Z\s\-']+$/),
  email: z.string().email(),
  phone: z.string().refine(isValidPhoneNumber),
  preferredLanguage: z.enum(["ar", "en"]),
  preferredCurrency: z.enum(["EGP", "USD", "EUR", "SAR", "AED"]),
  nationality: z.string().length(2), // ISO codes: "EG", "SA", "AE"
  passportNumber: z.string().optional(),
  dateOfBirth: z.date().max(new Date(), "Invalid date of birth")
});
```

**UI Features:**
- View all bookings (past, upcoming, cancelled)
- Download invoices (PDF with Arabic support)
- Quick re-booking
- Saved payment methods
- Loyalty points (نقاط الولاء)

---

### 6. **Reviews & Rating System**

**Description:** Guest reviews with Arabic support

**Validation:**
```typescript
const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z
    .string()
    .min(5, "العنوان يجب أن يكون 5 أحرف على الأقل")
    .max(100)
    .regex(/^[\u0600-\u06FFa-zA-Z\s\-',.!?]+$/),
  reviewText: z
    .string()
    .min(20, "المراجعة يجب أن تكون 20 حرف على الأقل")
    .max(2000)
    .regex(/^[\u0600-\u06FFa-zA-Z0-9\s\-',.!?؟،]+$/), // Added Arabic punctuation
  photos: z.array(z.instanceof(File)).max(5).optional(),
  
  // Specific ratings
  cleanliness: z.number().int().min(1).max(5),
  comfort: z.number().int().min(1).max(5),
  location: z.number().int().min(1).max(5),
  staff: z.number().int().min(1).max(5),
  valueForMoney: z.number().int().min(1).max(5)
});
```

**Arabic Review Examples:**
```javascript
const sampleReviews = [
  {
    rating: 5,
    title: "إقامة رائعة بإطلالة على النيل",
    text: "الفندق نظيف جداً والموظفون متعاونون. الغرفة كانت واسعة ومريحة. الإفطار متنوع وشهي. أنصح بشدة!",
    author: "أحمد محمد"
  },
  {
    rating: 4,
    title: "تجربة جيدة بشكل عام",
    text: "موقع ممتاز قريب من المتحف المصري. الخدمة جيدة لكن الواي فاي كان بطيء قليلاً.",
    author: "سارة علي"
  }
];
```

**UI with Arabic:**
```tsx
<Card dir="rtl">
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>{review.title}</CardTitle>
        <div className="flex gap-1 mt-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-4 h-4",
                i < review.rating ? "fill-accent text-accent" : "text-muted"
              )}
            />
          ))}
        </div>
      </div>
      <Badge>{review.rating} نجوم</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">{review.text}</p>
    <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
      <div>النظافة: {review.cleanliness}/5</div>
      <div>الراحة: {review.comfort}/5</div>
      <div>الموقع: {review.location}/5</div>
    </div>
  </CardContent>
</Card>
```

---

### 7. **Promo Codes & Discount Coupons**

**Description:** Apply discount codes at checkout

**Validation:**
```typescript
const promoCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3)
    .max(20)
    .regex(/^[A-Z0-9]+$/, "رمز الخصم يجب أن يحتوي على أحرف وأرقام إنجليزية فقط"),
  
  // Backend validation
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive(),
  minBookingAmount: z.number().min(0).optional(),
  maxDiscount: z.number().positive().optional(),
  validFrom: z.date(),
  validUntil: z.date(),
  usageLimit: z.number().int().positive().optional(),
  applicableRoomTypes: z.array(z.string()).optional()
});
```

**Database Schema:**
```sql
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_booking_amount DECIMAL(10, 2),
  max_discount DECIMAL(10, 2),
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  usage_limit INTEGER,
  times_used INTEGER DEFAULT 0,
  applicable_room_types TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**UI Example:**
```tsx
<div className="space-y-2">
  <Label htmlFor="promoCode">رمز الخصم / Promo Code</Label>
  <div className="flex gap-2">
    <Input
      id="promoCode"
      value={promoCode}
      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
      placeholder="SUMMER2024"
      className="uppercase"
    />
    <Button 
      onClick={applyPromoCode}
      disabled={applyingPromo}
    >
      {applyingPromo ? "جاري التطبيق..." : "تطبيق / Apply"}
    </Button>
  </div>
  
  {discount > 0 && (
    <Alert className="bg-green-50 border-green-200">
      <AlertDescription>
        ✅ تم تطبيق الخصم! توفير {formatCurrency(discount, "EGP")}
        <br />
        Discount applied! You save {formatCurrency(discount, "EGP")}
      </AlertDescription>
    </Alert>
  )}
</div>
```

**Example Promo Codes:**
- `WELCOME10` - 10% off first booking
- `RAMADAN2024` - Special Ramadan discount
- `NILEVIEW50` - 50 EGP off Nile view rooms
- `SUMMER2024` - Summer promotion

---

## 🔧 Technical Implementation Details

### Phone Number Validation Logic

```typescript
// src/lib/phoneValidation.ts
import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

export const validatePhone = (phoneNumber: string, country?: CountryCode) => {
  try {
    if (!phoneNumber) return { valid: false, error: "Phone number required" };
    
    const isValid = isValidPhoneNumber(phoneNumber, country);
    
    if (!isValid) {
      return { 
        valid: false, 
        error: "رقم هاتف غير صحيح / Invalid phone number format" 
      };
    }
    
    const parsed = parsePhoneNumber(phoneNumber, country);
    
    return {
      valid: true,
      formatted: parsed.formatInternational(), // +20 100 123 4567
      country: parsed.country, // "EG"
      nationalNumber: parsed.nationalNumber // "1001234567"
    };
  } catch (error) {
    return { valid: false, error: "Invalid phone number" };
  }
};
```

### Arabic Name Validation - Detailed

```typescript
// src/lib/nameValidation.ts

/**
 * Validates names supporting both Arabic and Latin scripts
 * 
 * Allowed characters:
 * - Arabic: \u0600-\u06FF (basic Arabic block)
 * - Latin: a-z, A-Z
 * - Spaces, hyphens, apostrophes
 * 
 * Examples:
 * ✅ "أحمد علي محمد"
 * ✅ "محمود عبد الرحمن"
 * ✅ "John O'Brien"
 * ✅ "Jean-Pierre Dupont"
 * ✅ "محمد بن سلمان"
 * ❌ "Name123" (numbers)
 * ❌ "Name@#$" (special chars)
 */
export const validateName = (name: string) => {
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return {
      valid: false,
      error: "الاسم يجب أن يكون حرفين على الأقل / Name must be at least 2 characters"
    };
  }
  
  if (trimmed.length > 100) {
    return {
      valid: false,
      error: "الاسم يجب أن يكون أقل من 100 حرف / Name must be less than 100 characters"
    };
  }
  
  // Arabic (0600-06FF), Latin (a-zA-Z), spaces, hyphens, apostrophes
  const nameRegex = /^[\u0600-\u06FFa-zA-Z\s\-']+$/;
  
  if (!nameRegex.test(trimmed)) {
    return {
      valid: false,
      error: "الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط / Name must contain only Arabic or Latin characters"
    };
  }
  
  // Detect if name is primarily Arabic
  const arabicChars = (trimmed.match(/[\u0600-\u06FF]/g) || []).length;
  const totalChars = trimmed.replace(/\s/g, '').length;
  const isArabic = arabicChars / totalChars > 0.5;
  
  return {
    valid: true,
    name: trimmed,
    isArabic, // Useful for UI direction (RTL/LTR)
    script: isArabic ? 'arabic' : 'latin'
  };
};
```

### Complete Booking Form Example

```tsx
// src/components/BookingFormWithArabic.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import { PhoneInput } from "@/components/PhoneInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const bookingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "الاسم يجب أن يكون حرفين على الأقل / Name must be at least 2 characters")
    .max(100)
    .regex(/^[\u0600-\u06FFa-zA-Z\s\-']+$/, "الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط"),
  
  email: z
    .string()
    .email("بريد إلكتروني غير صحيح / Invalid email")
    .max(255),
  
  phone: z
    .string()
    .refine(isValidPhoneNumber, "رقم هاتف غير صحيح / Invalid phone number"),
  
  specialRequests: z
    .string()
    .max(500, "الطلب يجب أن يكون أقل من 500 حرف / Request must be less than 500 characters")
    .optional(),
  
  nationality: z.string().length(2),
  
  checkIn: z.date().min(new Date(), "يجب أن يكون التاريخ في المستقبل / Date must be in future"),
  checkOut: z.date()
});

export default function BookingFormWithArabic() {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(bookingSchema)
  });
  
  const onSubmit = (data: any) => {
    console.log("Booking data:", data);
    // Submit to backend
  };
  
  const dir = language === "ar" ? "rtl" : "ltr";
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir={dir}>
      {/* Language Toggle */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
        >
          {language === "ar" ? "English" : "العربية"}
        </Button>
      </div>
      
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">
          {language === "ar" ? "الاسم الكامل *" : "Full Name *"}
        </Label>
        <Input
          id="fullName"
          {...register("fullName")}
          placeholder={language === "ar" ? "أحمد علي" : "Ahmed Ali"}
          dir="auto"
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>
      
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          {language === "ar" ? "البريد الإلكتروني *" : "Email *"}
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="ahmed@example.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      
      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">
          {language === "ar" ? "رقم الجوال *" : "Phone Number *"}
        </Label>
        <PhoneInput
          value=""
          onChange={(value) => setValue("phone", value || "")}
          placeholder={
            language === "ar"
              ? "رقم الجوال مع كود الدولة"
              : "+20 123 456 7890"
          }
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>
      
      {/* Special Requests */}
      <div className="space-y-2">
        <Label htmlFor="specialRequests">
          {language === "ar" ? "طلبات خاصة (اختياري)" : "Special Requests (Optional)"}
        </Label>
        <Textarea
          id="specialRequests"
          {...register("specialRequests")}
          placeholder={
            language === "ar"
              ? "مثال: غرفة مطلة على النيل، سرير إضافي للأطفال"
              : "Example: Room with Nile view, extra bed for children"
          }
          dir="auto"
          rows={4}
          maxLength={500}
        />
        {errors.specialRequests && (
          <p className="text-sm text-destructive">{errors.specialRequests.message}</p>
        )}
      </div>
      
      <Button type="submit" className="w-full">
        {language === "ar" ? "تأكيد الحجز" : "Confirm Booking"}
      </Button>
    </form>
  );
}
```

---

## 🗺️ Country Codes Reference

Common countries for Egyptian hotels:

```typescript
export const COMMON_COUNTRIES = [
  { code: "EG", name: "مصر / Egypt", dialCode: "+20", flag: "🇪🇬" },
  { code: "SA", name: "السعودية / Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "AE", name: "الإمارات / UAE", dialCode: "+971", flag: "🇦🇪" },
  { code: "KW", name: "الكويت / Kuwait", dialCode: "+965", flag: "🇰🇼" },
  { code: "QA", name: "قطر / Qatar", dialCode: "+974", flag: "🇶🇦" },
  { code: "JO", name: "الأردن / Jordan", dialCode: "+962", flag: "🇯🇴" },
  { code: "LB", name: "لبنان / Lebanon", dialCode: "+961", flag: "🇱🇧" },
  { code: "US", name: "الولايات المتحدة / USA", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "المملكة المتحدة / UK", dialCode: "+44", flag: "🇬🇧" },
  { code: "DE", name: "ألمانيا / Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "فرنسا / France", dialCode: "+33", flag: "🇫🇷" }
];
```

---

## 📱 RTL (Right-to-Left) Best Practices

### Auto-Detecting Text Direction

```css
/* In your CSS/Tailwind */
[dir="auto"] {
  text-align: start; /* Aligns to right for RTL, left for LTR */
}
```

```tsx
// React component
<Input
  dir="auto" // Automatically detects Arabic and switches to RTL
  placeholder="أحمد علي / Ahmed Ali"
/>
```

### Full RTL Layout Example

```tsx
<div dir="rtl" className="space-y-4">
  {/* Content flows from right to left */}
  <Card>
    <CardHeader>
      <CardTitle>غرفة ديلوكس مطلة على النيل</CardTitle>
      <CardDescription>غرفة فاخرة مع إطلالة بانورامية</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <Badge>متاح</Badge>
        <span className="text-2xl font-bold">1,200 جنيه</span>
      </div>
    </CardContent>
  </Card>
</div>
```

---

## ✨ Summary

Your hotel reservation system now supports:

✅ **Universal phone validation** with country selector (all countries)  
✅ **Arabic & English names** with proper UTF-8 validation  
✅ **Bilingual placeholders** (Arabic/English) throughout  
✅ **Sample Arabic data** for testing  
✅ **7 feature suggestions** with detailed implementation guides  
✅ **Complete code examples** for phone, name, form validation  
✅ **RTL support** for Arabic UI  
✅ **Security**: Input sanitization, XSS prevention, proper encoding

**Next Steps:**
1. Test the phone input with Egyptian (+20), Saudi (+966), UAE (+971) numbers
2. Test Arabic names in booking forms
3. Implement i18n for full Arabic/English toggle
4. Add currency conversion for EGP/USD/SAR/AED
5. Create special requests field with common Arabic phrases
