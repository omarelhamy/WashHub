import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-5 p-6 bg-gradient-to-b from-primary/5 via-background to-background">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Something went wrong</h2>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              Try again
            </Button>
            <Button variant="default" size="lg" className="rounded-xl" onClick={() => window.location.href = '/'}>
              Go to login
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
