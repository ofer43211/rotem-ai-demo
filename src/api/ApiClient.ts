export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
    if (!baseUrl) {
      throw new Error('Base URL is required');
    }
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
  }

  public async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  public async post<T>(
    endpoint: string,
    data: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, config);
  }

  public async put<T>(
    endpoint: string,
    data: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  public async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = { ...this.defaultHeaders, ...config?.headers };

    // Simulate network delay
    await this.delay(100);

    // Simulate API response (in real implementation, this would use fetch or axios)
    return this.simulateResponse<T>(method, url, data, headers, config?.timeout);
  }

  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseUrl}/${cleanEndpoint}`;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async simulateResponse<T>(
    method: string,
    url: string,
    data: unknown,
    headers: Record<string, string>,
    timeout?: number,
  ): Promise<ApiResponse<T>> {
    // Simulate timeout
    if (timeout && timeout < 100) {
      throw new Error('Request timeout');
    }

    // Simulate different responses based on endpoint
    if (url.includes('/error')) {
      throw new Error('Server error');
    }

    if (url.includes('/not-found')) {
      return {
        data: {} as T,
        status: 404,
        message: 'Not found',
      };
    }

    // Simulate successful response
    return {
      data: (data || { method, url, headers }) as T,
      status: 200,
      message: 'Success',
    };
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  public removeDefaultHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  public getDefaultHeaders(): Record<string, string> {
    return { ...this.defaultHeaders };
  }
}
