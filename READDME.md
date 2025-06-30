# Pancong Kece - Cafe Management System

## Project Overview
A comprehensive web-based cafe management system for "Pancong Kece" featuring Point of Sales (POS) and Human Resource Management (HRM) capabilities. The application supports dual roles: Cashier and Manager with different access levels.

## System Architecture

### Frontend Structure
- **Single Page Application (SPA)** with vanilla JavaScript
- **Responsive Design** optimized for desktop and tablet views
- **Role-based Access Control** with dynamic UI updates
- **Green Garden Cafe Theme** with professional clean design
- **Indonesian Language Interface** with Rupiah currency formatting

### Key Features

#### Point of Sales (POS)
- Real-time transaction processing
- Multi-payment system support (Cash, QRIS, Card, E-wallet)
- Thermal printer integration for receipt printing
- Shopping cart with item management
- Menu item display with lazy loading images

#### Human Resource Management (HRM)
- Employee attendance tracking
- Payroll management
- Staff scheduling and role management
- Performance monitoring

#### Manager Dashboard
- Product management with CRUD operations
- Inventory management and stock monitoring
- Financial reporting and analytics
- Petty cash management
- Comprehensive reporting system (PDF/Excel export)
- Application logs and audit trails

### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Icons**: Hugeicons library
- **Images**: Unsplash integration via CDN
- **Responsive**: Mobile-first design approach

### Data Management
- **Mock Data Implementation**: All data is currently simulated using JavaScript objects
- **Local State Management**: Uses browser memory for session data
- **Currency**: Indonesian Rupiah (Rp) with proper formatting
- **Price Range**: Products priced between Rp 10,000 - Rp 25,000

### Backend Requirements (Not Implemented)
This application requires backend services for full functionality:

#### Essential Backend Features:
- **Database**: Product catalog, inventory, transactions, employee records
- **Authentication**: User login/logout, role-based permissions
- **Data Persistence**: Save transactions, inventory updates, payroll data
- **Reporting**: Generate PDF/Excel reports
- **Real-time Updates**: Sync data across multiple POS terminals

#### API Endpoints Needed:
- Authentication & User Management
- Product CRUD operations
- Transaction processing
- Inventory management
- Employee & payroll management
- Financial reporting
- System logs and auditing

### File Structure
```
/
├── index.html          # Main application file
├── YOUWARE.md         # This documentation file
└── [CDN Assets]       # External images via Youware CDN
```

### Development Guidelines

#### Code Conventions
- **Naming**: Use camelCase for JavaScript variables and functions
- **Styling**: Use kebab-case for CSS classes
- **Currency**: Always format prices using `toLocaleString('id-ID')`
- **Colors**: Primary green (#2d5016), Secondary green (#4a7c59), Light green (#f0f8f5)

#### Role Management
- **Kasir (Cashier)**: Access to POS and basic settings only
- **Manager**: Full access to all features including management modules
- **Dynamic UI**: Menu items hide/show based on user role

#### Performance Optimizations
- **Lazy Loading**: Images load on demand using Intersection Observer
- **CSS Animations**: Smooth transitions and hover effects
- **Responsive Grid**: Auto-adjusting layouts for different screen sizes

### Future Enhancements
1. **Backend Integration**: Connect to database for data persistence
2. **Real-time Sync**: WebSocket integration for multi-terminal sync
3. **Mobile App**: React Native or Flutter mobile application
4. **Advanced Analytics**: Business intelligence dashboard
5. **Customer Management**: Loyalty program and customer database
6. **Multi-location**: Support for multiple cafe branches

### Testing Considerations
- **Role Switching**: Test manager/cashier role transitions
- **Payment Methods**: Verify all payment method selections work
- **Cart Operations**: Add/remove items, calculate totals correctly
- **Responsive Design**: Test on various tablet and desktop screen sizes
- **Form Validation**: Ensure all forms handle invalid input properly

### Security Notes
- **Input Validation**: All user inputs need server-side validation
- **Authentication**: Implement secure login/session management
- **Access Control**: Enforce role-based permissions on backend
- **Data Encryption**: Secure sensitive financial and employee data
- **Audit Logging**: Track all system operations for accountability

### Browser Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **ES6+ Features**: Uses modern JavaScript (const/let, arrow functions, template literals)
- **CSS Grid**: Requires browser support for CSS Grid and Flexbox
- **Intersection Observer**: For lazy loading functionality