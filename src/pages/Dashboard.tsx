import { useState, useEffect, useCallback, useRef } from "react";
import { useAppSelector } from "../store";
import { agentApi } from "../axios/agentApi";
import type { Agent, AgentFormData, PaginationInfo, AgentCounts } from "../types/agent";
import { toast } from "sonner";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { AgentStats } from "../components/dashboard/AgentStats";
import { AgentCard } from "../components/dashboard/AgentCard";
import { AgentModal } from "../components/dashboard/AgentModal";
import { DeleteConfirmModal } from "../components/dashboard/DeleteConfirmModal";
import { Pagination } from "../components/dashboard/Pagination";
import { Button } from "../components/ui/button";
import {
  Search,
  Plus,
  Bot,
  Filter,
  RefreshCw,
  Loader2,
  X,
} from "lucide-react";

export function Dashboard() {
  const { loggedUser } = useAppSelector((state) => state.user);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Pagination & Counts states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [counts, setCounts] = useState<AgentCounts>({ total: 0, active: 0, inactive: 0 });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingAgent, setDeletingAgent] = useState<Agent | null>(null);

  // Debounce ref for search input
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch agents using /search API when query exists or / API otherwise
  const fetchAgents = useCallback(
    async (page = currentPage, search = searchQuery, status = statusFilter) => {
      try {
        setLoading(true);
        const queryTerm = search.trim();
        const hasQuery = Boolean(queryTerm);

        // Dedicated search endpoint or general listing endpoint
        const endpoint = hasQuery ? "/search" : "/";
        const params: Record<string, any> = {
          page,
          limit: pageSize,
          status: status !== "all" ? status : undefined,
        };

        if (hasQuery) {
          params.query = queryTerm;
        }

        const res = await agentApi.get(endpoint, { params });

        if (res.data?.success) {
          const responseData = res.data.data;

          if (responseData?.agents && responseData?.pagination) {
            setAgents(responseData.agents);
            setPagination(responseData.pagination);
            setCurrentPage(responseData.pagination.currentPage);
            if (responseData.counts) {
              setCounts(responseData.counts);
            }
          } else if (Array.isArray(responseData)) {
            // Fallback for simple array responses
            setAgents(responseData);
            setPagination({
              totalAgents: responseData.length,
              totalPages: 1,
              currentPage: 1,
              limit: responseData.length,
              hasNextPage: false,
              hasPrevPage: false,
            });
            setCounts({
              total: responseData.length,
              active: responseData.filter((a: Agent) => a.isActive).length,
              inactive: responseData.filter((a: Agent) => !a.isActive).length,
            });
          }
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to fetch agents");
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [currentPage, searchQuery, statusFilter]
  );

  // Initial load
  useEffect(() => {
    fetchAgents(1, searchQuery, statusFilter);
  }, []);

  // Handle Search input change with 350ms debounce
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);

    if (val.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchAgents(1, val, statusFilter);
    }, 350);
  };

  // Immediate clear search
  const handleClearSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setSearchQuery("");
    setIsSearching(false);
    setCurrentPage(1);
    fetchAgents(1, "", statusFilter);
  };

  // Handle Status filter change
  const handleStatusChange = (status: "all" | "active" | "inactive") => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchAgents(1, searchQuery, status);
  };

  // Handle Page Change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchAgents(newPage, searchQuery, statusFilter);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Modal Handlers
  const handleOpenCreate = () => {
    setEditingAgent(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (agent: Agent) => {
    setDeletingAgent(agent);
    setIsDeleteOpen(true);
  };

  const handleSaveAgent = async (formData: AgentFormData) => {
    if (editingAgent) {
      // Update
      const res = await agentApi.put(`/${editingAgent._id}`, formData);
      if (res.data?.success && res.data.data) {
        setAgents((prev) =>
          prev.map((a) => (a._id === editingAgent._id ? res.data.data : a))
        );
        toast.success("Agent updated successfully!");
        fetchAgents(currentPage, searchQuery, statusFilter);
      }
    } else {
      // Create
      const res = await agentApi.post("/", formData);
      if (res.data?.success) {
        toast.success("Agent created successfully!");
        // Refresh page 1 to see the new agent at top
        setCurrentPage(1);
        handleClearSearch();
        setStatusFilter("all");
      }
    }
  };

  const handleConfirmDelete = async (agent: Agent) => {
    try {
      const res = await agentApi.delete(`/${agent._id}`);
      if (res.data?.success) {
        toast.success("Agent deleted successfully!");
        // If current page is now empty and page > 1, go back one page
        const newPage = agents.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
        setCurrentPage(newPage);
        fetchAgents(newPage, searchQuery, statusFilter);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete agent");
      throw error;
    }
  };

  const handleToggleStatus = async (agent: Agent) => {
    try {
      const nextStatus = !agent.isActive;
      const res = await agentApi.put(`/${agent._id}`, { isActive: nextStatus });
      if (res.data?.success && res.data.data) {
        setAgents((prev) =>
          prev.map((a) => (a._id === agent._id ? res.data.data : a))
        );
        setCounts((prev) => ({
          ...prev,
          active: nextStatus ? prev.active + 1 : prev.active - 1,
          inactive: nextStatus ? prev.inactive - 1 : prev.inactive + 1,
        }));
        toast.success(nextStatus ? `Agent "${agent.name}" activated` : `Agent "${agent.name}" paused`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0720] text-slate-100 flex flex-col relative selection:bg-purple-500 selection:text-white">
      {/* Background ambient gradient glow */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[400px] bg-purple-700/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <DashboardHeader />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8 relative z-10">
        {/* Welcome & Stats Banner */}
        <AgentStats
          userName={loggedUser?.name}
          total={counts.total}
          active={counts.active}
          onCreateClick={handleOpenCreate}
        />

        {/* Search, Filter & Actions Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#180d34]/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          {/* Search Bar with live search indicator */}
          <div className="relative flex-1 max-w-md">
            {isSearching || (loading && searchQuery.trim()) ? (
              <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 animate-spin" />
            ) : (
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            )}

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search agents by name, instruction, knowledge base, or tool..."
              className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition-colors"
            />

            {searchQuery && (
              <button
                onClick={handleClearSearch}
                title="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Status Filter Buttons & Refresh */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-black/30 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => handleStatusChange("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-white/60 hover:text-white"
                }`}
              >
                All ({counts.total})
              </button>
              <button
                onClick={() => handleStatusChange("active")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === "active"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Active ({counts.active})
              </button>
              <button
                onClick={() => handleStatusChange("inactive")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === "inactive"
                    ? "bg-gray-600 text-white shadow-xs"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Inactive ({counts.inactive})
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAgents(currentPage, searchQuery, statusFilter)}
              title="Refresh Agents List"
              className="h-8 w-8 p-0 bg-white/5 hover:bg-white/10 text-white border-white/10 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Active Search Results Banner */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between gap-3 bg-purple-500/10 border border-purple-400/20 px-4 py-2.5 rounded-xl text-xs text-purple-200">
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">
                Search results for: <strong className="text-white font-semibold">"{searchQuery.trim()}"</strong>
                {pagination && (
                  <span className="text-purple-300 ml-1.5 font-medium">
                    ({pagination.totalAgents} {pagination.totalAgents === 1 ? "result" : "results"} found)
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={handleClearSearch}
              className="text-purple-300 hover:text-white underline text-xs shrink-0 cursor-pointer"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Agents Grid / States */}
        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-[#180d34]/40 border border-white/5 rounded-2xl p-6 h-64 animate-pulse space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/10" />
                  <div className="w-16 h-6 rounded-full bg-white/10" />
                </div>
                <div className="w-3/4 h-5 rounded bg-white/10" />
                <div className="w-full h-16 rounded bg-white/10" />
                <div className="w-1/2 h-4 rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : agents.length > 0 ? (
          /* Agent Cards Grid + Pagination */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <AgentCard
                  key={agent._id}
                  agent={agent}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination && (
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
                loading={loading}
              />
            )}
          </div>
        ) : counts.total === 0 ? (
          /* Zero Agents Empty State */
          <div className="bg-[#180d34]/50 border border-white/10 rounded-2xl p-12 text-center max-w-xl mx-auto backdrop-blur-md shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 mx-auto mb-4 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
              <Bot className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No AI Agents Created Yet</h3>
            <p className="text-sm text-purple-200/70 mb-6 leading-relaxed">
              Create your very first AI agent to start automating your tasks across Gmail, Google Calendar, and more.
            </p>
            <Button
              onClick={handleOpenCreate}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Create Your First Agent
            </Button>
          </div>
        ) : (
          /* Filter/Search No Results */
          <div className="bg-[#180d34]/40 border border-white/10 rounded-2xl p-10 text-center max-w-md mx-auto">
            <Filter className="w-10 h-10 text-purple-300/40 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1">No Matching Agents Found</h4>
            <p className="text-xs text-white/50 mb-4 leading-relaxed">
              {searchQuery.trim()
                ? `No agents matched "${searchQuery.trim()}" with "${statusFilter}" filter.`
                : `No agents found with "${statusFilter}" filter.`}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleClearSearch();
                setStatusFilter("all");
              }}
              className="bg-white/5 text-purple-200 border-white/15 text-xs cursor-pointer"
            >
              Reset All Filters
            </Button>
          </div>
        )}
      </main>

      {/* Modals */}
      <AgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveAgent}
        initialData={editingAgent}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        agent={deletingAgent}
      />
    </div>
  );
}

export default Dashboard;
