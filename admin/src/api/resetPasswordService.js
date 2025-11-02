import baseAPI from './axiosConfig';

export const resetPasswordService = {
  requestReset: async (email) => {
    const response = await baseAPI.post("/reset-password/request/", { email });
    return response.data;
  },

  verifyOTP: async (email, otp) => {
    const response = await baseAPI.post("/reset-password/verify/", { email, otp });
    return response.data;
  },

  confirmReset: async (email, otp, newPassword) => {
    const response = await baseAPI.post("/reset-password/confirm/", {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },
};
