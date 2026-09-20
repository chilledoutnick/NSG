import { create } from "zustand";
import axios from "axios";

const config = {
  headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
};

export const useStore = create((set) => ({
  advisor_data: {},
  profile_percent: undefined,
  profile_percentage_data: {},
  social_links_data: {},
  advisor_loading: false,

  setAdvisorLoading: (isLoading) => set(() => ({ advisor_loading: isLoading })),
  get_advisor_data: (isInitial) => {
    if (useStore.getState().advisor_loading) return;
    if (isInitial) {
      set({ advisor_loading: true });
    }
    const url = "api/user_profile/get_user/";
    axios
      .post(url, {}, config)
      .then((res) => {
        const data = res.data;
        set({
          advisor_data: data,
          advisor_loading: false,
        });
        useStore.getState().get_profile_percentage();
      })
      .catch((err) => {
        console.error("Error fetching advisor data", err);
        set({ advisor_loading: false });
      });
  },

  get_profile_percentage: () => {
    const url = "api/user/profile_percentage/";
    axios
      .post(url, {}, config)
      .then((res) => {
        set({
          profile_percent: res.data.completion_percentage,
          profile_percentage_data: res.data.fields,
        });
      })
      .catch((err) => console.log("err profile_percentage", err));
  },

  // get_social_media: () => {
  //   const url = "api/user_profile/get_user_social_media/";
  //   axios
  //     .post(url, {}, config)
  //     .then((res) => {
  //       set({
  //         social_links_data: res.data,
  //       });
  //     })
  //     .catch((err) => console.log("err get_advisor_social_media", err));
  // },
}));
