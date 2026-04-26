import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
}

export default function LoadingSpinner({ size = 32, text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 size={size} className="animate-spin text-primary-600" />
      {text && <p className="mt-2 text-gray-500">{text}</p>}
    </div>
  );
}