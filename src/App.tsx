/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Overview from './views/Overview';
import Analysis from './views/Analysis';
import Badcase from './views/Badcase';
import Batches from './views/Batches';
import Assets from './views/Assets';
import Validation from './views/Validation';
import ConfigMetrics from './views/ConfigMetrics';
import { View, Channel } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('overview');
  const [channel, setChannel] = useState<Channel>('all');
  const [date, setDate] = useState('2026-09-08');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedMetricId, setSelectedMetricId] = useState<string>('block');

  // Shared time range filter states
  const [timeRange, setTimeRange] = useState<string>('近7天');
  const [startDate, setStartDate] = useState<string>('2026-09-02');
  const [endDate, setEndDate] = useState<string>('2026-09-08');

  const navigateToAnalysis = useCallback((metricId?: string) => {
    setCurrentView('analysis');
    if (metricId) {
      setSelectedMetricId(metricId);
    }
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return (
          <Overview
            channel={channel}
            date={date}
            onChannelChange={setChannel}
            onDateChange={setDate}
            onNavigateToAnalysis={navigateToAnalysis}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
          />
        );
      case 'analysis':
        return (
          <Analysis
            channel={channel}
            date={date}
            selectedMetricId={selectedMetricId}
            onMetricSelect={setSelectedMetricId}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            onNavigateToBadcase={() => setCurrentView('badcase')}
          />
        );
      case 'badcase':
        return (
          <Badcase
            channel={channel}
            date={date}
          />
        );
      case 'batches':
        return (
          <Batches
            channel={channel}
            date={date}
          />
        );
      case 'assets':
        return (
          <Assets
            channel={channel}
          />
        );
      case 'validation':
        return (
          <Validation
            channel={channel}
          />
        );
      case 'config-metrics':
        return <ConfigMetrics />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 md:ml-[210px] min-w-0">
        <Topbar
          currentView={currentView}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        {renderView()}
      </main>
    </div>
  );
}
