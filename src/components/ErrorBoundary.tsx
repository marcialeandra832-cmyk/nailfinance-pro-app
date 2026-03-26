import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './UI';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<any, any> {
  props: any;
  state: any = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-6">
            <AlertTriangle size={40} />
          </div>
          <h1 className="text-2xl font-bold text-brand-navy mb-2">Ops! Algo deu errado.</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Ocorreu um erro inesperado na aplicação. Tente recarregar a página ou entre em contato com o suporte.
          </p>
          <div className="bg-white p-4 rounded-2xl border border-brand-border mb-8 text-left w-full max-w-lg overflow-auto max-h-48">
            <p className="text-xs font-mono text-red-500 break-all">
              {this.state.error?.toString()}
            </p>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Recarregar Aplicativo
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
