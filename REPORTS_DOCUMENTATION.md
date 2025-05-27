# Reports Feature Documentation

## Overview
The Reports page provides a comprehensive reporting system for generating and downloading various types of reports for assets and asset items in the system.

## Key Features

### 1. Report Type Selection
- **Assets**: Generate reports for asset types/categories
- **Asset Items**: Generate reports for individual asset inventory items

### 2. Advanced Filtering
- **Search**: Text search across names and descriptions
- **Date Range**: Filter by purchase date or creation date using an interactive date range picker
- **Category**: Filter by asset categories
- **Location**: Filter by asset locations
- **Vendor**: Filter by vendors
- **Status**: Filter by asset item status (Available, Assigned, Maintenance, Broken) - only for Asset Items reports

### 3. Export Formats
- **PDF**: Formatted document reports (implementation placeholder)
- **Excel**: Spreadsheet format with proper headers (implementation placeholder)
- **CSV**: Comma-separated values for data analysis (fully functional)
- **JSON**: Raw data format for system integration (fully functional)

### 4. Real-time Preview
- Live data preview table showing filtered results
- Summary cards displaying total records, date range, and export format
- Interactive table with proper formatting and status badges

### 5. User Experience
- Responsive design that works on desktop and mobile
- Loading states during report generation
- Clear visual feedback and error handling
- Intuitive filter panel with icons and proper labeling

## Implementation Details

### Components Used
- Custom date range picker built with `react-day-picker`
- Shadcn/ui components for consistent styling
- Lucide React icons for visual elements
- Recharts integration ready for future analytics

### Data Sources
- Assets from `/queries/assets`
- Asset Items from `/queries/assetsItems`
- Categories, Locations, Vendors for filter options

### Export Functionality
Currently implemented:
- ✅ CSV export with proper headers and data formatting
- ✅ JSON export with complete report metadata
- 🚧 PDF export (placeholder - requires jsPDF implementation)
- 🚧 Excel export (placeholder - requires xlsx library implementation)

### File Generation
Reports are generated with descriptive filenames:
- Format: `{reportType}-report-{YYYY-MM-DD}.{extension}`
- Example: `assets-report-2025-05-27.csv`

## Future Enhancements

1. **PDF Generation**: Implement with jsPDF for formatted reports
2. **Excel Export**: Add xlsx library for advanced spreadsheet features
3. **Scheduled Reports**: Email delivery of reports on schedule
4. **Report Templates**: Predefined report configurations
5. **Analytics Dashboard**: Visual charts and insights
6. **Bulk Operations**: Mass data export and processing

## Usage Instructions

1. **Select Report Type**: Choose between Assets or Asset Items
2. **Apply Filters**: Use the filter panel to narrow down data
3. **Preview Data**: Review the filtered results in the preview table
4. **Choose Format**: Select your preferred export format
5. **Generate Report**: Click the "Generate Report" button to download

## Technical Notes

- Uses React Query for efficient data fetching
- Proper TypeScript typing for type safety
- Responsive CSS Grid layout
- Accessible UI components with proper ARIA labels
- Optimized performance with React.memo and useMemo hooks
