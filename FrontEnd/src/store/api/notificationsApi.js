import { baseApi } from './baseApi';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notifications'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetNotificationsQuery } = notificationsApi;
