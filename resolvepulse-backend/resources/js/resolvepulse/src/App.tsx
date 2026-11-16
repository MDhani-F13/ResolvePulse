/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Ticket, TicketDetail, DashboardMetrics } from './types/ticket';
import { User } from './types/user';
import { ticketApi } from './api/ticketClient';
import { authClient } from './api/authClient';
import { TopBar } from './components/TopBar';
import { SlaMetricStrip } from './components/SlaMetricStrip';
import { TicketQueueTable } from './components/TicketQueueTable';
import { TicketDetailDrawer } from './components/TicketDetailDrawer';
import { CreateTicketModal } from './components/CreateTicketModal';
import { AuthModal } from './components/AuthModal';
import { ArchitectureExplorer } from './components/ArchitectureExplorer';
import { SlaBreachRadar } from './components/SlaBreachRadar';
import { DocumentationView } from './components/DocumentationView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'queue' | 'radar' | 'architecture' | 'docs'>('queue');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Authentication & Active Persona
  const [currentUser, setCurrentUser] = useState<User | null>(() => authClient.getCurrentUser());

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [slaFilter, setSlaFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial user setup: if none stored, switch to default engineer persona for immediate rich view
  useEffect(() => {
    if (!currentUser) {
      authClient.switchPersona('sarah.c@resolvepulse.internal')
        .then(user => setCurrentUser(user))
        .catch(() => {});
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [ticketList, metricsData] = await Promise.all([
        ticketApi.listTickets({
          status: statusFilter,
          priority: priorityFilter,
          sla_state: slaFilter,
          search: searchQuery,
        }),
        ticketApi.getMetrics(),
      ]);

      setTickets(ticketList);
      setMetrics(metricsData);

      // If a ticket was selected in drawer, refresh its detailed state
      if (selectedTicket) {
        try {
          const refreshed = await ticketApi.getTicket(selectedTicket.id);
          setSelectedTicket(refreshed);
        } catch {
          setSelectedTicket(null); // Deselect if unauthorized after role switch
        }
      }
    } catch (err) {
      console.error('Failed to load tickets/metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, priorityFilter, slaFilter, searchQuery, selectedTicket?.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [statusFilter, priorityFilter, slaFilter, searchQuery, currentUser?.email]);

  // Periodic SLA tick every 30 seconds to update countdowns smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  const handleSelectTicket = async (ticket: Ticket) => {
    try {
      const fullDetail = await ticketApi.getTicket(ticket.id);
      setSelectedTicket(fullDetail);
    } catch (err: any) {
      console.error('Failed to load ticket details:', err);
    }
  };

  const handleCloseDrawer = () => {
    setSelectedTicket(null);
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSlaFilter('all');
    setSearchQuery('');
  };

  const handleMetricCardFilter = (type: string) => {
    setCurrentTab('queue');
    if (type === 'breached') {
      setSlaFilter('breached');
      setStatusFilter('all');
    } else if (type === 'warning') {
      setSlaFilter('warning');
      setStatusFilter('all');
    } else if (type === 'resolved') {
      setStatusFilter('resolved');
      setSlaFilter('all');
    } else {
      handleResetFilters();
    }
  };

  const handleSwitchPersona = async (email: string) => {
    try {
      const user = await authClient.switchPersona(email);
      setCurrentUser(user);
      setSelectedTicket(null);
      fetchDashboardData();
    } catch (err) {
      console.error('Persona switch failed:', err);
    }
  };

  const handleLogout = () => {
    authClient.clearSession();
    setCurrentUser(null);
    fetchDashboardData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar with User Persona Chip & Top Bar Contract */}
      <TopBar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenNewTicket={() => setIsModalOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSwitchPersona={handleSwitchPersona}
        onLogout={handleLogout}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'queue' && (
          <div>
            {/* KPI Metric Strip */}
            <SlaMetricStrip
              metrics={metrics}
              onFilterClick={handleMetricCardFilter}
            />

            {/* High Density Ticket Queue */}
            <TicketQueueTable
              tickets={tickets}
              selectedTicketId={selectedTicket?.id || null}
              onSelectTicket={handleSelectTicket}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              slaFilter={slaFilter}
              setSlaFilter={setSlaFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isLoading={isLoading}
              onResetFilters={handleResetFilters}
              currentUser={currentUser}
            />
          </div>
        )}

        {currentTab === 'radar' && (
          <SlaBreachRadar
            tickets={tickets}
            onSelectTicket={handleSelectTicket}
            onOpenNewTicket={() => setIsModalOpen(true)}
          />
        )}

        {currentTab === 'architecture' && (
          <ArchitectureExplorer />
        )}

        {currentTab === 'docs' && (
          <DocumentationView />
        )}
      </main>

      {/* Ticket Details Slide-over Drawer with Role-Based Action Gating */}
      <TicketDetailDrawer
        ticket={selectedTicket}
        onClose={handleCloseDrawer}
        onRefresh={fetchDashboardData}
        currentUser={currentUser}
      />

      {/* New Ticket FormRequest Modal */}
      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
        }}
        currentUser={currentUser}
      />

      {/* User Authentication & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          fetchDashboardData();
        }}
      />
    </div>
  );
}
