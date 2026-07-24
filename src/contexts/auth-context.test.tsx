import { describe, expect, test, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { AuthProvider } from "@/contexts/auth-context";

let createBrowserClientCallCount = 0;

const mockSession = { user: { id: "test-user" } };

const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
};

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: vi.fn(() => {
    createBrowserClientCallCount++;
    return mockSupabaseClient;
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  })),
}));

describe("AuthProvider", () => {
  beforeEach(() => {
    createBrowserClientCallCount = 0;
    vi.clearAllMocks();
  });

  test("createSupabaseBrowserClient is called only once across re-renders", () => {
    const { rerender } = render(
      <AuthProvider>
        <div>child</div>
      </AuthProvider>
    );

    const afterMount = createBrowserClientCallCount;

    rerender(
      <AuthProvider>
        <div>child</div>
      </AuthProvider>
    );

    expect(createBrowserClientCallCount).toBe(afterMount);
    expect(createBrowserClientCallCount).toBe(1);
  });

  test("renders without crashing when getSession fails", () => {
    mockSupabaseClient.auth.getSession = vi
      .fn()
      .mockRejectedValue(new Error("Failed to fetch"));

    expect(() =>
      render(
        <AuthProvider>
          <div>child</div>
        </AuthProvider>
      )
    ).not.toThrow();
  });
});