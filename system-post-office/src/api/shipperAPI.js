import { djangoAPI } from './axiosConfig';

export const getShippersByPostOfficeId = async (
  postOfficeId,
  page = 1,
  page_size = 20
) => {
  if (!postOfficeId) {
    console.error("Post Office ID is required.");
    return null;
  }

  const params = { page, page_size };

  try {
    const response = await djangoAPI.get(
      `/api/v1/post-offices/${postOfficeId}/shippers`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching shippers for post office ${postOfficeId}:`, error);
    return null;
  }
};

export default getShippersByPostOfficeId;