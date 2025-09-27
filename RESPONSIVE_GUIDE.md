# Hướng dẫn Responsive Design

## Tổng quan
Ứng dụng đã được cập nhật để hỗ trợ responsive design chuyên nghiệp cho tất cả các thiết bị từ mobile đến desktop.

## Các tính năng đã được cập nhật

### 1. Layout chính (RootComponent)
- **Mobile**: Sidebar ẩn, hiển thị dưới dạng drawer có thể mở/đóng
- **Desktop**: Sidebar cố định bên trái
- **Responsive breakpoints**: xs (< 600px), sm (600px-900px), md (900px+)

### 2. Navigation (NavBarComponent)
- **Mobile**: Menu hamburger button để mở sidebar
- **Desktop**: Hiển thị đầy đủ title và controls
- **Responsive typography**: Font size tự động điều chỉnh theo kích thước màn hình

### 3. Sidebar (SideBarComponent)
- **Mobile**: Drawer overlay với animation mượt mà
- **Desktop**: Sidebar cố định với styling cải tiến
- **Touch-friendly**: Các button có kích thước phù hợp cho touch

### 4. Body Components
- **Grid system**: Sử dụng Material-UI Grid với responsive breakpoints
- **Cards**: Tự động điều chỉnh kích thước và spacing
- **Typography**: Font size responsive cho tất cả text elements
- **Buttons**: Full-width trên mobile, auto-width trên desktop

### 5. CSS Responsive
- **Mobile-first approach**: Thiết kế ưu tiên mobile trước
- **Breakpoint-specific styles**: CSS riêng cho từng kích thước màn hình
- **Touch optimization**: Tối ưu cho touch interface

## Breakpoints sử dụng

```css
/* Mobile */
@media (max-width: 768px) { ... }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { ... }

/* Desktop */
@media (min-width: 1025px) { ... }
```

## Material-UI Breakpoints

```javascript
// Mobile
xs: 0px
sm: 600px
md: 900px
lg: 1200px
xl: 1536px
```

## Cách sử dụng Responsive trong code

### 1. Sử dụng sx prop với breakpoints
```jsx
<Box sx={{
  padding: { xs: 1, sm: 2, md: 3 },
  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }
}}>
  Content
</Box>
```

### 2. Sử dụng useMediaQuery hook
```jsx
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('md'));
```

### 3. Grid responsive
```jsx
<Grid container spacing={{ xs: 2, md: 3 }}>
  <Grid item xs={12} sm={6} md={4}>
    Content
  </Grid>
</Grid>
```

## Components đã được cập nhật

1. **RootComponent**: Layout chính với responsive sidebar
2. **NavBarComponent**: Navigation với mobile menu
3. **SideBarComponent**: Sidebar với mobile drawer
4. **Home**: Dashboard với responsive grid
5. **Inventory**: Product management với responsive layout
6. **Order**: Invoice management với responsive design
7. **InfoCard**: Cards với responsive sizing
8. **DashboardSummary**: Summary cards với responsive grid

## Testing Responsive Design

1. Mở Developer Tools (F12)
2. Chuyển sang Device Toolbar (Ctrl+Shift+M)
3. Test các breakpoints khác nhau:
   - Mobile: 375px, 414px
   - Tablet: 768px, 1024px
   - Desktop: 1200px+

## Best Practices

1. **Mobile-first**: Luôn thiết kế cho mobile trước
2. **Touch targets**: Tối thiểu 44px cho touch elements
3. **Readable text**: Font size tối thiểu 16px trên mobile
4. **Performance**: Sử dụng CSS transforms thay vì thay đổi layout
5. **Testing**: Test trên thiết bị thật khi có thể

## Troubleshooting

### Sidebar không hiển thị trên mobile
- Kiểm tra `onMenuClick` prop được truyền đúng
- Đảm bảo `useMediaQuery` hoạt động chính xác

### Layout bị vỡ trên tablet
- Kiểm tra breakpoints trong Grid components
- Điều chỉnh spacing và padding

### Text quá nhỏ trên mobile
- Kiểm tra typography responsive settings
- Đảm bảo font size tối thiểu 16px

## Tương lai

- [ ] Thêm dark mode responsive
- [ ] Optimize cho tablet landscape
- [ ] Thêm gesture support cho mobile
- [ ] Progressive Web App features
