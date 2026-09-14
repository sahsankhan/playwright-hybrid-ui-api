export type EnvironmentName = 'demo' | 'staging';

export type AppConfig = {
  name: EnvironmentName;
  uiBaseUrl: string;
  apiBaseUrl: string;
  customer: {
    email: string;
    password: string;
  };
  timeouts: {
    actionMs: number;
    navigationMs: number;
    healMs: number;
  };
};
