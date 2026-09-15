import { SSAPI } from './api';

export const sendEmail = async (emailRequest: Record<string, unknown>) => {
  const response = await SSAPI.post('/notification/v1/notifications/send-email', emailRequest);
  return response.data;
};

export const scheduleEmail = async (scheduleRequest: Record<string, unknown>) => {
  const response = await SSAPI.post('/notification/v1/notifications/schedule', scheduleRequest);
  return response.data;
};