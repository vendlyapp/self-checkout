/**
 * @deprecated This file has been refactored and moved to components/dashboard/analytics/
 * Please use the new AnalyticsDashboard from './analytics' instead.
 * 
 * This wrapper is kept for backwards compatibility.
 */

import React from 'react';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';

const Sales: React.FC = () => {
  return <AnalyticsDashboard />;
};

export default Sales;