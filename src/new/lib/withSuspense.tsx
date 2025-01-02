import { Suspense } from "react";

export function withSuspense<P extends object>(
  Component: React.ComponentType<P>,
  fallback: JSX.Element
) {
  return function WithSuspenseWrapper(props: P) {
    return (
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    );
  };
}

