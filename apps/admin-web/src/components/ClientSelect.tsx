import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ClientOption {
  id: string;
  name: string;
}

const CLIENT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export interface ClientSelectProps {
  providerId: string | undefined;
  value: string;
  onChange: (clientId: string, client: ClientOption | null) => void;
  /** Show "All clients" as first option (e.g. for filters) */
  allowAll?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  /** Optional: width of the container (default w-full for forms, or use className) */
  width?: string;
}

export function ClientSelect({
  providerId,
  value,
  onChange,
  allowAll = false,
  placeholder,
  searchPlaceholder,
  disabled = false,
  className,
  width = 'w-full',
}: ClientSelectProps) {
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const tId = setTimeout(() => setDebouncedSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(tId);
  }, [searchInput]);

  useEffect(() => {
    if (!value) setSelectedClient(null);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients-search', providerId, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ providerId: providerId!, limit: String(CLIENT_PAGE_SIZE), page: '1' });
      if (debouncedSearch) params.set('search', debouncedSearch);
      const { data } = await api.get<{ items: ClientOption[] }>(`/clients?${params}`);
      return data;
    },
    enabled: !!providerId && dropdownOpen,
  });
  const clientOptions = clientsData?.items ?? [];

  const { data: singleClient } = useQuery({
    queryKey: ['client', value, providerId],
    queryFn: async () => {
      const { data } = await api.get<ClientOption>(`/clients/${value}?providerId=${providerId}`);
      return data;
    },
    enabled: !!providerId && !!value && dropdownOpen === false,
  });

  const displayLabel = selectedClient?.name ?? singleClient?.name ?? '';
  const placeholders = {
    closed: placeholder ?? t('components.clientSelect.selectClient'),
    search: searchPlaceholder ?? t('components.clientSelect.searchPlaceholder'),
    all: t('components.clientSelect.allClients'),
  };

  const selectAll = () => {
    setSelectedClient(null);
    setSearchInput('');
    setDropdownOpen(false);
    onChange('', null);
  };

  const selectClient = (c: ClientOption) => {
    setSelectedClient(c);
    setSearchInput('');
    setDropdownOpen(false);
    onChange(c.id, c);
  };

  const openDropdown = () => {
    if (disabled) return;
    setDropdownOpen(true);
    setSearchInput('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className={cn('relative', width, className)} ref={containerRef}>
      <div
        className={cn(
          'flex items-center rounded-md border bg-transparent shadow-xs transition-[color,box-shadow]',
          'focus-within:ring-[3px] focus-within:border-ring focus-within:ring-ring/50',
          'min-h-9',
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        <Input
          ref={inputRef}
          type="text"
          value={dropdownOpen ? searchInput : (value ? displayLabel : '')}
          placeholder={dropdownOpen ? placeholders.search : (allowAll ? placeholders.all : placeholders.closed)}
          onChange={(e) => setSearchInput(e.target.value)}
          onFocus={openDropdown}
          readOnly={!dropdownOpen}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 min-w-0"
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => (dropdownOpen ? setDropdownOpen(false) : openDropdown())}
          className="p-2 text-muted-foreground hover:text-foreground shrink-0"
          aria-label={dropdownOpen ? 'Close' : 'Open'}
          disabled={disabled}
        >
          <ChevronDown className={cn('size-4 transition-transform', dropdownOpen && 'rotate-180')} />
        </button>
      </div>
      {dropdownOpen && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-[240px] overflow-auto"
          role="listbox"
        >
          {allowAll && (
            <button
              type="button"
              role="option"
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                !value && 'bg-accent/50'
              )}
              onClick={selectAll}
            >
              {placeholders.all}
            </button>
          )}
          {clientsLoading ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">{t('common.loading')}</div>
          ) : clientOptions.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">{t('components.clientSelect.noClientsFound')}</div>
          ) : (
            clientOptions.map((c) => (
              <button
                key={c.id}
                type="button"
                role="option"
                className={cn(
                  'w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                  value === c.id && 'bg-accent/50'
                )}
                onClick={() => selectClient(c)}
              >
                {c.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
