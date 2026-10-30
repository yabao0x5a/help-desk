import { StatsPanel } from "../StatsPanel/StatsPanel";
import { RecentActivity } from "../RecentActivity/RecentActivity";
import { useEffect, useState } from "react";
import type { Ticket } from "../../../tickets/types/ticket.types";
import type { DashboardStats } from "../../types/dashboard.types";
import styles from "./Dashboard.module.css";
import axios from "axios";
import { LoadingSpinner } from "../../../../shared/components/LoadingSpinner/LoadingSpinner";

const API_URL = `http://localhost:4000/api`

export function Dashboard() {
  // done 🔴 TODO:
  // 1. Fetch GET /stats and GET /stats/recent with axios (base URL: http://localhost:4000/api)
  // 2. Display the stats and recent activity data (pass them to StatsPanel and RecentActivity)
  // 3. Handle loading and error states

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadDashBoard = async () => {
      try {
        const [statsResponse, recentResponse] = await Promise.all([
          axios.get(`${API_URL}/stats`, { signal: controller.signal }),
          axios.get(`${API_URL}/stats/recent`, { signal: controller.signal })
        ])

        if (!controller.signal.aborted) {
          setStats(statsResponse.data.data)
          setTickets(recentResponse.data.data)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(axios.isAxiosError(error) ? error.response?.data.message || 'Failed to load' : 'Failed to load')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadDashBoard()

    return () => controller.abort()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className={styles.dashboard}>
      <h1>Dashboard</h1>
      {error ? <div className={styles.error}>{error}</div> : (
        stats ? (
          <>
            <StatsPanel stats={stats} />
            <RecentActivity tickets={tickets} />
          </>
        ) : null
      )}
    </div>
  );
}
