# GIAI ĐOẠN 3: FIX SHIPPING FEE LOGIC - HOÀN TẤT ✅

## 📋 TÓM TẮT

Đã fix logic tính phí vận chuyển để **tính phí ship riêng biệt cho từng sản phẩm** thay vì tính chung cho cả đơn hàng.

---

## ❌ VẤN ĐỀ TRƯỚC ĐÓ

### Logic cũ (SAI):

```typescript
const calculateShipping = () => {
  if (totalPrice > 1000000) return 0;

  const allProductsFreeShip = items.every((item) => item.product.freeShipping);
  if (allProductsFreeShip && items.length > 0) return 0;

  // ❌ Nếu có 1 SP không freeship → charge TOÀN BỘ đơn hàng
  switch (formData.city) {
    case "HCM":
      return 20000;
    case "HN":
      return 35000;
    default:
      return 50000;
  }
};
```

**Vấn đề:**

- ❌ Nếu mua 5 SP có freeShipping + 1 SP không có → phải trả 20k cho cả 6 SP
- ❌ Không công bằng, SP có freeShipping vẫn bị tính phí
- ❌ Không track được phí ship cho từng item

---

## ✅ GIẢI PHÁP MỚI

### 1. **Thêm cột `shippingFee` vào OrderItem**

#### Schema Update - `prisma/schema.prisma`

```prisma
model OrderItem {
  id             String           @id @default(uuid())
  orderId        String
  productId      String
  variantId      String?
  productName    String
  quantity       Int
  unitPrice      Float
  shippingFee    Float            @default(0) // ✅ NEW: Phí ship cho item này
  color          String?
  size           String?
  thumbnailUrl   String?
  isReviewed     Boolean          @default(false)
  reviewInfo     Json?
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  returnStatus   ItemReturnStatus @default(NONE)
  order          Order            @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product        Product          @relation(fields: [productId], references: [id])
  returnRequests ReturnRequest[]

  @@index([orderId])
  @@index([productId])
  @@index([variantId])
}
```

#### TypeScript Interface - `types/index.ts`

```typescript
export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  shippingFee?: number; // ✅ NEW
  thumbnailUrl?: string;
  color?: string;
  size?: string;
  isReviewed?: boolean;
  reviewInfo?: {
    rating: number;
    comment: string;
    createdAt: string;
    images?: string[];
  };
  returnStatus?: ItemReturnStatus;
  returnRequests?: ReturnRequest[];
}
```

---

### 2. **Logic tính phí ship mới - `CheckoutPage.tsx`**

#### Function `calculateShipping()` - Tính tổng phí ship

```typescript
const calculateShipping = () => {
  // Free shipping if total > 1 million
  if (totalPrice > 1000000) return 0;

  // Calculate number of items that need shipping fee
  const itemsNeedShipping = items.filter((item) => !item.product.freeShipping);

  // If no items need shipping, return 0
  if (itemsNeedShipping.length === 0) return 0;

  // Calculate base rate per city
  let baseRate = 0;
  switch (formData.city) {
    case "HCM":
      baseRate = 20000;
      break;
    case "HN":
      baseRate = 35000;
      break;
    default:
      baseRate = 50000;
  }

  // ✅ Calculate total: full for 1st item, 50% for others
  const firstItemFee = baseRate;
  const additionalItemsFee = (itemsNeedShipping.length - 1) * (baseRate * 0.5);
  return firstItemFee + additionalItemsFee;
};
```

#### Function `calculateItemShipping()` - Tính phí cho từng item

```typescript
const calculateItemShipping = (item: any) => {
  // Free if total order > 1 million
  if (totalPrice > 1000000) return 0;

  // Free if product has freeShipping flag
  if (item.product.freeShipping) return 0;

  // Get items needing shipping
  const itemsNeedShipping = items.filter((i) => !i.product.freeShipping);
  const itemIndex = itemsNeedShipping.findIndex(
    (i) => i.variantId === item.variantId
  );

  if (itemIndex === -1) return 0;

  // Calculate base rate
  let baseRate = 0;
  switch (formData.city) {
    case "HCM":
      baseRate = 20000;
      break;
    case "HN":
      baseRate = 35000;
      break;
    default:
      baseRate = 50000;
  }

  // ✅ First item pays full, others pay 50%
  return itemIndex === 0 ? baseRate : baseRate * 0.5;
};
```

---

### 3. **Lưu phí ship vào OrderItem khi tạo đơn**

#### Tạo đơn hàng - `CheckoutPage.tsx`

```typescript
const newOrder: Order = {
  id: Date.now().toString(),
  orderCode: orderCode,
  customerName: formData.fullName,
  customerPhone: formData.phone,
  customerAddress: formData.address,
  customerNotes: formData.note,
  customerType: isAuthenticated ? "member" : "guest",
  totalAmount: finalTotal,
  shippingFee: shippingFee,
  status: initialStatus,
  paymentMethod: formData.paymentMethod as any,
  paymentStatus: "UNPAID",
  createdAt: new Date().toISOString(),
  items: items.map((i) => ({
    productId: i.product.id,
    variantId: i.variantId,
    productName: i.product.name,
    quantity: i.quantity,
    unitPrice: i.product.promotionalPrice || i.product.basePrice,
    shippingFee: calculateItemShipping(i), // ✅ Lưu phí ship cho từng item
    thumbnailUrl: i.product.thumbnailUrl,
    color: i.variant.color,
    size: i.variant.size,
  })),
};
```

---

### 4. **UI hiển thị phí ship cho từng item**

#### Order Summary - `CheckoutPage.tsx`

```tsx
<div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
  {items.map((item) => {
    const itemShipping = calculateItemShipping(item);
    return (
      <div key={item.variantId} className="flex gap-4">
        <img
          src={item.product.thumbnailUrl || "https://via.placeholder.com/64"}
          className="w-16 h-16 rounded-xl object-cover border"
          alt={item.product.name}
        />
        <div className="flex-1">
          <p className="font-black text-gray-800 text-[11px] line-clamp-1 uppercase">
            {item.product.name}
          </p>
          <p className="text-[9px] text-gray-400 font-black uppercase">
            {item.variant.size} • {item.variant.color} x {item.quantity}
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs font-black text-gray-900">
              {(
                item.product.promotionalPrice || item.product.basePrice
              ).toLocaleString()}
              đ
            </p>

            {/* ✅ Hiển thị phí ship nếu > 0 */}
            {itemShipping > 0 && (
              <p className="text-[8px] font-black text-orange-600 uppercase flex items-center gap-1">
                <Truck size={10} /> +{itemShipping.toLocaleString()}đ
              </p>
            )}

            {/* ✅ Badge FREESHIP */}
            {item.product.freeShipping && (
              <p className="text-[8px] font-black text-green-600 uppercase flex items-center gap-1">
                <Truck size={10} /> FREESHIP
              </p>
            )}
          </div>
        </div>
      </div>
    );
  })}
</div>
```

---

## 📊 TÍNH PHÍ SHIP - CASE STUDIES

### Case 1: Đơn hàng > 1 triệu

**Input:**

- Tổng đơn: 1,200,000đ
- 3 SP: 1 có freeShip, 2 không có

**Output:**

- Phí ship: **0đ** (miễn phí vì đơn > 1tr)

---

### Case 2: Tất cả SP có freeShipping

**Input:**

- Tổng đơn: 500,000đ
- 3 SP đều có flag `freeShipping = true`

**Output:**

- Phí ship: **0đ**

---

### Case 3: Mix freeShip và không freeShip

**Input:**

- Khu vực: HCM (20k/item)
- 5 SP:
  - SP1: freeShipping = true
  - SP2: freeShipping = true
  - SP3: freeShipping = false
  - SP4: freeShipping = false
  - SP5: freeShipping = false

**Tính phí:**

- SP1: 0đ (freeShip)
- SP2: 0đ (freeShip)
- SP3: 20,000đ (item đầu tiên không freeShip)
- SP4: 10,000đ (item thứ 2, giảm 50%)
- SP5: 10,000đ (item thứ 3, giảm 50%)

**Tổng phí ship: 40,000đ**

---

### Case 4: Chỉ 1 SP không freeShip

**Input:**

- Khu vực: HN (35k/item)
- 4 SP:
  - SP1, SP2, SP3: freeShipping = true
  - SP4: freeShipping = false

**Tính phí:**

- SP1, SP2, SP3: 0đ
- SP4: 35,000đ (item duy nhất không freeShip)

**Tổng phí ship: 35,000đ**

---

## 🗂️ DATABASE MIGRATION

### Executed Command:

```bash
npx prisma db push
```

### Output:

```
✅ Your database is now in sync with your Prisma schema.
✅ Generated Prisma Client (v6.19.1)
```

**Thay đổi:**

- ✅ Thêm cột `shippingFee FLOAT DEFAULT 0` vào bảng `OrderItem`
- ✅ Tự động set default = 0 cho các bản ghi cũ

---

## 🎯 LỢI ÍCH

1. **Công bằng hơn**: Chỉ tính phí cho SP không có freeShipping
2. **Minh bạch**: User thấy rõ từng item bị tính bao nhiêu
3. **Khuyến khích mua nhiều**: Item thứ 2+ chỉ tính 50% phí
4. **Dễ quản lý**: Track phí ship ở cấp OrderItem, dễ đối soát
5. **Linh hoạt**: Có thể điều chỉnh logic tính phí cho từng nhóm SP

---

## 📁 FILES THAY ĐỔI

### Modified Files:

1. `pages/CheckoutPage.tsx`

   - Thêm function `calculateItemShipping()`
   - Fix logic `calculateShipping()`
   - Update UI hiển thị phí ship per item
   - Thêm `shippingFee` vào order items mapping

2. `prisma/schema.prisma`

   - Thêm field `shippingFee Float @default(0)` vào `OrderItem`

3. `types/index.ts`
   - Thêm field `shippingFee?: number` vào interface `OrderItem`

### New Migration:

- Database push: Added `shippingFee` column to `OrderItem` table

---

## ✅ VERIFICATION CHECKLIST

- [x] Schema updated với field `shippingFee`
- [x] Database synced (prisma db push)
- [x] TypeScript interfaces updated
- [x] Logic tính phí ship per item implemented
- [x] UI hiển thị phí ship cho từng item
- [x] Badge "FREESHIP" cho SP miễn phí ship
- [x] Order creation lưu shippingFee cho từng item
- [x] No TypeScript errors
- [x] Logic test cases documented

---

## 🔄 TIẾP THEO - GIAI ĐOẠN 4

**Phase 4: Realtime Features** 🔴

Thêm tính năng realtime cho:

1. Admin nhận thông báo đơn hàng mới
2. Customer thấy cập nhật trạng thái đơn realtime
3. Toast notifications
4. Badge counter

**Ước tính thời gian:** 2-3 giờ

---

## 📝 NOTES

- Phí ship được tính **tại thời điểm checkout**, lưu vào OrderItem
- Logic: Item đầu tiên 100%, từ item thứ 2 chỉ 50% để khuyến khích mua nhiều
- Nếu tổng đơn > 1tr → miễn phí toàn bộ (override mọi logic khác)
- Flag `freeShipping` ở Product level có priority cao nhất

---

**Hoàn thành:** 10/01/2026  
**Người thực hiện:** AI Assistant + User
