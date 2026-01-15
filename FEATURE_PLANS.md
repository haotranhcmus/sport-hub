# Kế Hoạch Phát Triển Tính Năng

## 1. Thêm Hàng Loạt Sản Phẩm (Bulk Product Import)

### Mục tiêu

Cho phép admin import nhiều sản phẩm cùng lúc từ file Excel/CSV thay vì thêm từng sản phẩm một.

### Giải pháp kỹ thuật

#### 1.1. Dependencies cần cài đặt

```bash
npm install xlsx papaparse
npm install -D @types/papaparse
```

#### 1.2. Cấu trúc file Excel/CSV mẫu

| productCode | name       | description | basePrice | costPrice | promotionalPrice | categorySlug | brandSlug | thumbnailUrl | imageUrls | freeShipping | allowReturn | returnPeriod | status |
| ----------- | ---------- | ----------- | --------- | --------- | ---------------- | ------------ | --------- | ------------ | --------- | ------------ | ----------- | ------------ | ------ |
| SP001       | Áo MU Home | Mô tả...    | 890000    | 600000    | 790000           | ao-dau       | nike      | url1         | url1,url2 | true         | true        | 7            | ACTIVE |

#### 1.3. Cấu trúc file Variants (riêng biệt hoặc sheet 2)

| productCode | sku         | size | color | stockQuantity | priceAdjustment | imageUrl |
| ----------- | ----------- | ---- | ----- | ------------- | --------------- | -------- |
| SP001       | SP001-S-RED | S    | Đỏ    | 50            | 0               | url      |
| SP001       | SP001-M-RED | M    | Đỏ    | 30            | 10000           | url      |

#### 1.4. Components cần tạo

```
components/admin/
  BulkImportWizard.tsx       # Wizard 4 bước
  BulkImportUploader.tsx     # Upload & parse file
  BulkImportPreview.tsx      # Xem trước dữ liệu
  BulkImportValidation.tsx   # Hiển thị lỗi validation
  BulkImportProgress.tsx     # Progress bar khi import
```

#### 1.5. Flow xử lý

```
1. UPLOAD FILE
   ├── Chọn file Excel (.xlsx) hoặc CSV (.csv)
   ├── Parse file với xlsx hoặc papaparse
   └── Chuyển thành array of objects

2. VALIDATE DATA
   ├── Kiểm tra required fields (productCode, name, basePrice, categorySlug, brandSlug)
   ├── Validate format (số, URL, enum values)
   ├── Check duplicate productCode
   ├── Verify categorySlug và brandSlug tồn tại trong DB
   └── Hiển thị danh sách lỗi (nếu có)

3. PREVIEW & CONFIRM
   ├── Hiển thị bảng preview dữ liệu sẽ import
   ├── Cho phép sửa trực tiếp trên bảng
   ├── Highlight rows có lỗi
   └── Nút "Import X sản phẩm"

4. IMPORT TO DATABASE
   ├── Batch insert products (20 products/batch)
   ├── Hiển thị progress bar
   ├── Handle errors per item (không dừng toàn bộ)
   └── Báo cáo kết quả: X thành công, Y thất bại
```

#### 1.6. Service functions

```typescript
// services/product.service.ts

// Parse Excel/CSV file
parseImportFile(file: File): Promise<ProductImportRow[]>

// Validate parsed data
validateImportData(rows: ProductImportRow[]): ValidationResult

// Bulk insert products
bulkCreateProducts(products: ProductImportRow[]): Promise<BulkImportResult>

// Download template
getImportTemplate(): Blob
```

#### 1.7. Database considerations

- Sử dụng Supabase transaction cho batch insert
- Rollback nếu có lỗi trong batch
- Log import history để audit

#### 1.8. UI/UX

- Modal fullscreen với wizard steps
- Drag & drop upload zone
- Real-time validation feedback
- Export template button
- Error report downloadable as CSV

---

## 2. Chat Nhân Viên - Khách Hàng

### Mục tiêu

Hệ thống chat real-time giữa khách hàng và nhân viên hỗ trợ, tích hợp trực tiếp trong app.

### Giải pháp kỹ thuật

#### 2.1. Database Schema (Prisma)

```prisma
model ChatRoom {
  id          String   @id @default(uuid())
  customerId  String
  staffId     String?
  orderCode   String?  // Optional: link to order
  status      ChatStatus @default(WAITING)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  customer    User     @relation("CustomerChats", fields: [customerId], references: [id])
  staff       User?    @relation("StaffChats", fields: [staffId], references: [id])
  messages    ChatMessage[]

  @@index([customerId])
  @@index([staffId])
  @@index([status])
}

model ChatMessage {
  id        String   @id @default(uuid())
  roomId    String
  senderId  String
  content   String
  type      MessageType @default(TEXT)
  imageUrl  String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  room      ChatRoom @relation(fields: [roomId], references: [id])
  sender    User     @relation(fields: [senderId], references: [id])

  @@index([roomId])
  @@index([senderId])
  @@index([createdAt])
}

enum ChatStatus {
  WAITING
  ACTIVE
  RESOLVED
  CLOSED
}

enum MessageType {
  TEXT
  IMAGE
  SYSTEM
  ORDER_INFO
}
```

#### 2.2. Components Structure

```
components/
  chat/
    ChatWidget.tsx           # Floating chat button (customer)
    ChatWindow.tsx           # Chat window popup
    ChatMessageList.tsx      # Messages display
    ChatInput.tsx            # Input + emoji + image
    ChatHeader.tsx           # Room info + close btn

  admin/
    ChatDashboard.tsx        # Admin chat management
    ChatRoomList.tsx         # List of active rooms
    ChatConversation.tsx     # Staff chat view
    ChatQuickReplies.tsx     # Preset responses
```

#### 2.3. Realtime Implementation

```typescript
// lib/realtime-chat.ts

// Subscribe to chat room
subscribeToRoom(roomId: string, onMessage: (msg: ChatMessage) => void)

// Subscribe to new chat requests (for staff)
subscribeToNewChats(onNewChat: (room: ChatRoom) => void)

// Typing indicator
sendTypingStatus(roomId: string, isTyping: boolean)
subscribeToTyping(roomId: string, onTyping: (userId: string, isTyping: boolean) => void)
```

#### 2.4. Service Functions

```typescript
// services/chat.service.ts

// Customer
createChatRoom(customerId: string, orderCode?: string): Promise<ChatRoom>
sendMessage(roomId: string, content: string, type?: MessageType): Promise<ChatMessage>
uploadChatImage(file: File): Promise<string>
closeRoom(roomId: string): Promise<void>

// Staff
getWaitingRooms(): Promise<ChatRoom[]>
acceptRoom(roomId: string, staffId: string): Promise<ChatRoom>
getActiveRooms(staffId: string): Promise<ChatRoom[]>
markAsResolved(roomId: string): Promise<void>

// Shared
getRoomMessages(roomId: string, limit?: number, before?: string): Promise<ChatMessage[]>
markMessagesAsRead(roomId: string, userId: string): Promise<void>
```

#### 2.5. Features

- **Customer side:**

  - Floating chat bubble ở góc phải
  - Có thể attach order để hỏi
  - Upload hình ảnh
  - Notification khi có reply

- **Staff side:**
  - Dashboard với list rooms (Waiting, Active, Resolved)
  - Multi-room handling
  - Quick replies templates
  - Customer info sidebar
  - Order history của customer

#### 2.6. UI/UX

- Bubble chat style giống Messenger
- Typing indicator
- Read receipts
- Sound notification
- Unread badge count

---

## 3. Hệ Thống Thông Báo (Notification System)

### Mục tiêu

Thông báo real-time cho cả khách hàng và admin về các sự kiện quan trọng.

### Giải pháp kỹ thuật

#### 3.1. Database Schema

```prisma
model Notification {
  id          String   @id @default(uuid())
  userId      String
  type        NotificationType
  title       String
  message     String
  data        Json?     // Extra data (orderId, productId, etc.)
  isRead      Boolean   @default(false)
  actionUrl   String?   // Link to navigate
  createdAt   DateTime  @default(now())

  user        User      @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
}

enum NotificationType {
  ORDER_PLACED
  ORDER_CONFIRMED
  ORDER_SHIPPING
  ORDER_DELIVERED
  ORDER_CANCELLED
  RETURN_APPROVED
  RETURN_REJECTED
  PAYMENT_RECEIVED
  PROMOTION
  SYSTEM
  CHAT_MESSAGE
  LOW_STOCK
  NEW_ORDER        // For admin
  NEW_RETURN       // For admin
}
```

#### 3.2. Components

```
components/
  common/
    NotificationBell.tsx       # Bell icon with badge
    NotificationDropdown.tsx   # Dropdown list
    NotificationItem.tsx       # Single notification
    NotificationToast.tsx      # Real-time toast popup

context/
  NotificationContext.tsx      # Global notification state
```

#### 3.3. Notification Triggers

| Event           | Recipient | Title                      | Message                             |
| --------------- | --------- | -------------------------- | ----------------------------------- |
| New Order       | Admin     | Đơn hàng mới               | Đơn {orderCode} từ {customerName}   |
| Order Confirmed | Customer  | Đơn hàng đã xác nhận       | Đơn {orderCode} đang được xử lý     |
| Order Shipped   | Customer  | Đang giao hàng             | Đơn {orderCode} đang trên đường đến |
| Order Delivered | Customer  | Giao hàng thành công       | Đơn {orderCode} đã giao             |
| Return Approved | Customer  | Yêu cầu đổi/trả được duyệt | Yêu cầu {requestCode} đã được duyệt |
| Low Stock       | Admin     | Cảnh báo tồn kho           | {productName} còn {quantity} sp     |
| Chat Message    | Both      | Tin nhắn mới               | {senderName}: {preview}             |

#### 3.4. Service Functions

```typescript
// services/notification.service.ts

// Create notification
createNotification(userId: string, type: NotificationType, title: string, message: string, data?: any): Promise<Notification>

// Batch create (for all admins)
notifyAllAdmins(type: NotificationType, title: string, message: string, data?: any): Promise<void>

// Get notifications
getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>
getUnreadCount(userId: string): Promise<number>

// Mark as read
markAsRead(notificationId: string): Promise<void>
markAllAsRead(userId: string): Promise<void>

// Delete old notifications
deleteOldNotifications(daysOld: number): Promise<void>
```

#### 3.5. Realtime Subscription

```typescript
// lib/realtime-notifications.ts

subscribeToNotifications(userId: string, onNotification: (notif: Notification) => void)
unsubscribeFromNotifications()
```

#### 3.6. Push Notifications (Optional - Phase 2)

- Web Push API với Service Worker
- Firebase Cloud Messaging
- Notification preferences setting

#### 3.7. UI/UX

- Bell icon với badge số
- Dropdown với list notifications
- Click để navigate
- Swipe to dismiss (mobile)
- Toast popup real-time
- Sound effect (optional)

---

## Timeline Gợi Ý

| Phase | Feature             | Estimated Time |
| ----- | ------------------- | -------------- |
| 1     | Bulk Product Import | 3-4 ngày       |
| 2     | Notification System | 2-3 ngày       |
| 3     | Chat System         | 4-5 ngày       |

---

## Notes

- Tất cả features đều sử dụng Supabase Realtime cho live updates
- Cân nhắc rate limiting cho chat và notifications
- Implement proper error handling và retry logic
- Test với multiple concurrent users
