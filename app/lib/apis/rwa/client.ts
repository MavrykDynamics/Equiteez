import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { rwaApiUrl } from "~/lib/apis/rwa/config";
import { getAuthTokensFromStorage } from "~/providers/AuthProvider/helpers/storage";
import { AuthService } from "~/providers/AuthProvider/helpers/auth.service";

export const refreshUrl = "/auth/refresh";

export const rwaApi = axios.create({
  baseURL: new URL("", rwaApiUrl).href,
});

rwaApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { accessToken } = await getAuthTokensFromStorage();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  }
);

rwaApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown): Promise<unknown> => {
    const axiosError = error as {
      response?: { status?: number };
      config?: InternalAxiosRequestConfig & {
        _retry?: boolean;
      };
    };

    if (
      axiosError.response?.status === 401 &&
      !axiosError.config?.url?.includes(refreshUrl) &&
      !axiosError.config?._retry
    ) {
      const accessToken = await AuthService.refreshAccessToken();
      axiosError.config = axiosError.config ?? ({} as InternalAxiosRequestConfig);
      axiosError.config._retry = true;
      axiosError.config.headers.Authorization = `Bearer ${accessToken}`;

      return Promise.resolve(rwaApi(axiosError.config));
    }

    throw error;
  }
);
