export interface IElectronAPI {
  getPrinters: () => Promise<any[]>;
  printSilently: (options: { url: string; deviceName: string }) => Promise<{ success: boolean; error?: string }>;
  isDesktop?: boolean;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
