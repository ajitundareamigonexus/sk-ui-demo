import { SSAPI } from "./api";


export const sendOtp = async (emailRequest: {
    email: string;
    action: string;
    url: string;
    customTemplateCode: string;
}) => {
    return await SSAPI.post("/security/otp/v1/send", emailRequest);
};

export const verifyOtp = async ({ email, otp }: { email: string, otp: string }) => {
    return await SSAPI.post("/security/otp/v1/verify", null, {
        params: {
            email,
            otp
        }
    });
};

