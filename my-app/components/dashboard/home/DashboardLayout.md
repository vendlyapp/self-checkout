# Dashboard Layout Structure

## Desktop Layout (lg:block)

### 1. Header Section
- **Title**: "Dashboard"
- **Subtitle**: "Willkommen zurück, Peter! Hier ist dein Überblick für heute."
- **Content**: GreetingSection with store toggle

### 2. Quick Actions Bar (Full Width)
- **Title**: "Hauptaktionen"
- **Content**: MainActionCards component
  - Kassieren Card (primary, navigates to /charge)
  - Produkte Card (secondary, navigates to /products_list)
- **Design**: Existing card design with images and hover effects

### 3. Top Row (3 columns)
- **Search Section** (2 columns)
  - Title: "Schnellsuche"
  - Content: SearchInput with filters and recent searches
- **System Status** (1 column)
  - Real-time store status
  - Connection status
  - Active users
  - System health
  - Uptime bar

### 4. Stats Row (Full Width)
- **Today's Stats** (Full width)
  - 4 stat cards with trends
  - Sales, Customers, Average, Revenue/Hour

### 5. Main Content Row (2 columns)
- **Daily Goal** (1 column)
  - Progress chart
  - Goal tracking
  - Additional metrics
- **Quick Metrics** (1 column)
  - Revenue Today
  - Orders
  - New Customers
  - Products Sold
  - Overall Performance

### 6. Bottom Row (2 columns)
- **Tools & Shortcuts** (1 column)
  - Title: "Tools & Shortcuts"
  - Content: Modern grid of tool cards
- **Recent Sales** (1 column)
  - Recent sales list
  - Sales activity

### 7. Search Results (Full Width)
- **Conditional**: Only shows when searching
- **Content**: SearchResultsSection

## Mobile Layout (block lg:hidden)

### Vertical Stack
1. GreetingSection
2. MainActionCards
3. SearchInput
4. TodayStatsCard
5. DailyGoalCard
6. Slider
7. RecentSalesSection
8. SearchResultsSection (conditional)

## Key Improvements

### Interactivity
- **System Status Widget**: Real-time system monitoring
- **Quick Metrics Widget**: Key performance indicators
- **Enhanced Search**: Filters, recent searches, suggestions
- **Modern Tool Cards**: Hover effects, better organization

### Organization
- **Logical Grouping**: Related components grouped together
- **Progressive Disclosure**: Most important info at the top
- **Balanced Layout**: Proper use of grid columns
- **Visual Hierarchy**: Clear section titles and spacing

### Responsiveness
- **Mobile-First**: Maintains original mobile experience
- **Desktop Enhancement**: Rich desktop experience
- **Adaptive Components**: Components adapt to screen size
- **Consistent Spacing**: Uniform gaps and padding
