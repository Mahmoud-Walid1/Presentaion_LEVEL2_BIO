export type ActiveTab = 'register' | 'booking' | 'admin';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
