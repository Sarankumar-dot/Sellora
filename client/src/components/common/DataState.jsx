import { Link } from 'react-router-dom';

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
      <p className="font-body-md text-on-surface-variant">{message}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-4">
      <span className="material-symbols-outlined text-4xl text-error">error</span>
      <p className="font-body-md text-on-surface-variant max-w-md">{message || 'Something went wrong. Please try again.'}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="bg-primary text-on-primary px-6 py-2 rounded-DEFAULT font-label-md text-label-md hover:bg-primary-container transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, actionLabel, actionTo }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-4 border border-outline-variant rounded-lg bg-surface-container-lowest">
      <span className="material-symbols-outlined text-5xl text-outline">inventory_2</span>
      <h2 className="font-headline-md text-headline-md text-primary">{title}</h2>
      {description && <p className="font-body-md text-on-surface-variant max-w-md">{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="bg-primary text-on-primary py-3 px-8 rounded-DEFAULT font-label-md text-label-md hover:bg-primary-container transition-colors">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
