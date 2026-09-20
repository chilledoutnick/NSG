import { create } from "zustand";
import axios from "axios";

const config = {
  headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
};

export const useStore = create((set) => ({
  clientLogsData: [],
  client_loading: false,
  setClientLogsData: (data) => set(() => ({ clientLogsData: data })),
  setLoading: (isLoading) => set(() => ({ client_loading: isLoading })),
  getClientLog: (isAdminClient) => {
    // const url = "/api/client/get_client_log/";
    const url = "/api/contact/get_contact_log/";
    // const urlTeam = "/api/team_admin/get_team_client_log/";
    const urlTeam = "/api/team_admin/get_team_contact_log";
    const finalPath = isAdminClient ? urlTeam : url;

    // First call with limited data (page_size: 10)
    const initialPayload = { page_size: 10 };

    // Set loading to true when starting the API calls
    set({ client_loading: true });

    // Make both API calls simultaneously
    const initialCall = axios.post(finalPath, initialPayload, config);
    const fullCall = axios.post(finalPath, {}, config);

    // Handle the API calls
    initialCall
      .then((initialRes) => {
        // Set the initial data quickly
        set({ clientLogsData: initialRes.data.clients_data });

        // Set loading to false after the initial call
        set({ client_loading: false });
      })
      .catch(() => {
        console.error("There is no data or try to refresh the page");
        set({ client_loading: false });
      });

    // Handle the full call (this can run independently)
    fullCall
      .then((fullRes) => {
        // Optionally, you can merge full data here or set it as the final data
        set({
          clientLogsData: fullRes.data.clients_data, // Update with full data
        });
      })
      .catch(() => {
        console.error("There is an error fetching the full data");
      });
  },
  addClientLog: (newLog) =>
    set((state) => ({
      clientLogsData: [newLog, ...state.clientLogsData],
    })),
  // New function to update an existing log item
  updateClientLog: (updatedLog) =>
    set((state) => ({
      clientLogsData: state.clientLogsData.map((log) =>
        log.id === updatedLog.id ? { ...log, ...updatedLog } : log
      ),
    })),
}));
