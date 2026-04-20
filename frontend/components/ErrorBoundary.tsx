"use client";
import { Component, ReactNode } from "react";

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state = { error: null };

  static getDerivedStateFromError(e: Error) {
    return { error: e.message };
  }

  render() {
    if (this.state.error)
      return (
        <div className="p-6 text-sm text-red-600 border border-red-200 rounded">
          {this.state.error}
        </div>
      );
    return this.props.children;
  }
}
