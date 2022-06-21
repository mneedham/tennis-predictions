import { useAuth0 } from "@auth0/auth0-react";
import { useEnv } from "../context/env.context";
import axios from "axios";

export const useExternalApi = () => {
    const { apiServerUrl } = useEnv();
    const { getAccessTokenSilently } = useAuth0();
    const makeRequest = async (options) => {
        try {
            if (options.authenticated) {
                const token = await getAccessTokenSilently();

                options.config.headers = {
                    ...options.config.headers,
                    Authorization: `Bearer ${token}`,
                };
            }

            const response = await axios(options.config);

            return response;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return error.response.data;
            }

            return error.message;
        }
    };
    return {
        makeRequest, apiServerUrl
    }
}